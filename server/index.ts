// const express = require('express');
// const http = require('http');
// const cors = require('cors');
// const { Server } = require('socket.io');
// const { saveMessage, readMessages } = require('./database/services/crud');
import { Server, Socket } from 'socket.io';
import express, { Request, Response } from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
import 'dotenv/config';
import flatten from 'lodash/flatten';

import { IUser, ELangs, IGameStateTable, IGame, TStats, TPlayerData, TTempTiles, TLetterBag } from './interfaces'
import { getGames, createGame, upsertGameState, patchGameState, getGameState } from './database/services/crud';
import { leaveGame, leaveGameBySocketId } from './utils/leave-game';
import errorHandling from './utils/errorHandling';
import { shengTrie, engTrie, swahiliTrie, initShengSwaLetterBag, initEnLetterBag, enLettersScores, swaShengLettersScores } from './utils/tries';

let app = express();

app.use(cors());
app.use(express.json())
// app.use(express.urlencoded({extended: true}))

const server = http.createServer(app);

let ioCorsUrl = process.env.DEBUG ? 'http://localhost:5173' : process.env.SERVER_URL;

// console.log(process.env.DEBUG, ioCorsUrl)

// app.get('/rooms', (req: Request, res: Response) => {
//     res.send({ msg: 'Hello World!' });
// });

app.get('/', (req: Request, res: Response) => {
    // res.send('Hello World!');
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.use('/', express.static(path.join(__dirname, 'public/')))

app.get('/api/games', async (req: Request, res: Response) => {
    const games = await getGames();
    res.send(games)
});

app.get('/api/games/trie', async (req: Request, res: Response) => {
    // TODO: deprecated
    if (req.params['lang'] == 'sheng') {
        res.send(shengTrie)
    }
});

app.post('/api/games/add', async (req: Request, res: Response) => {

    let [status, err] = await createGame(req.body)

    // TODO: implement LRU here - determine a threshhold

    if (status) {
        const games = await getGames();
        res.send({
            games,
            status: 'success'
        })
    } else {
        res.send({
            status: 'fail',
            error: errorHandling(err.code, 'Game')
        })
    }

    // console.log(err)
});

const io = new Server(server, {
    cors: {
        origin: ioCorsUrl,
        methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
});

const CHAT_BOT = 'Gamebot';
// Add this
let players: IUser[] = [];
let tempPlayerTileData: TTempTiles = {};

const getTiles = async (game: IGame, tiles_2_pick: number, incoming_gamestate?: IGameStateTable[]) => {
    let gamestate = incoming_gamestate ?? await getGameState(game.name);

    let lb: string[] | undefined | null;

    if (game.lang == ELangs.sheng || game.lang == ELangs.swa)
        lb = gamestate.length == 0 ? initShengSwaLetterBag() : gamestate[0].letterbag;
    else //if (game.lang == ELangs.en)
        lb = gamestate.length == 0 ? initEnLetterBag() : gamestate[0].letterbag;

    let tiles: string[] | undefined = lb?.splice(0, tiles_2_pick);

    await upsertGameState({
        game: game.name,
        letterbag: lb,
        currentplayer: gamestate[0]?.currentplayer,
        statistics: gamestate[0]?.statistics,
        updatedate: new Date()
    });

    return { tiles, remaining: lb?.length }
}

io.on('connection', (socket: Socket) => {

    socket.on('join_game', async (data) => {
        let { username, game } = data; // Data sent from client when join_room event emitted
        let gameName = game.name;

        // check is username already in game
        if (players.find(user => user.game == gameName && user.username == username)) {
            socket.emit('join_reply', { status: 'fail', message: 'Username already taken' });
            return;
        }

        // check if game is full
        if (players.filter(p => p.game == gameName).length == 4) {
            socket.emit('join_reply', { status: 'fail', message: '- Game imejaa\n- Game is full (max 4 players' });
            return;
        }

        socket.emit('join_reply', { status: 'success' });

        // Join the user to a socket room
        socket.join(gameName);

        let __createdtime__ = Date.now(); // Current timestamp

        // Send message to all users currently in the room, apart from the user that just joined
        socket.to(gameName).emit('receive_message', {
            message: `${username} has joined the chat room`,
            username: CHAT_BOT,
            __createdtime__,
        });

        socket.emit('receive_message', {
            message: `Welcome ${username}`,
            username: CHAT_BOT,
            __createdtime__,
        });

        // Save the new user to the game
        players.push({ id: socket.id, username, game: gameName, score: 0 });
        let gamePlayers = players.filter((user) => user?.game === gameName);

        //set current player
        let currentPlayer, tiledata, wordsdata, history;
        let gs: IGameStateTable[] = await getGameState(game.name);

        if (gamePlayers.length == 1) {
            currentPlayer = username
            tiledata = await getTiles(game, 7, gs);
            await patchGameState(gameName, { currentplayer: currentPlayer })
        } else {
            currentPlayer = gs[0]?.currentplayer;
            tiledata = await getTiles(game, 7, gs);
        }

        let stats = gs[0]?.statistics ? JSON.parse(gs[0].statistics) : {};
        wordsdata = Object.keys(stats).map(k => stats[k].map((s: TPlayerData) => s.words)) ?? [];
        wordsdata = flatten(wordsdata);

        history = Object.keys(stats).map(k => stats[k].map((s: TPlayerData)=>{
                return{
                    player: k,
                    masaa: s.timestamp,
                    wordscore: s.words.map(w => [w[0], w[2]])
                }
            }));

        history = flatten(history);

        // console.log(gamePlayers);
        io.to(gameName).emit('ingame_players', gamePlayers);

        socket.emit('current_player', currentPlayer);

        let lettersScores: TLetterBag = game.lang == ELangs.en ? enLettersScores : swaShengLettersScores;

        socket.emit('init_gamestate', { tiledata, wordsdata, lettersScores, history });

        // console.log(currentPlayer, tiledata, gamePlayers);

        tempPlayerTileData = {
            [`${username}_${gameName}`]: tiledata?.tiles,
        }

        // console.log('joining', username, tempPlayerTileData);
        // console.log(players);

        // (async () => {
        //     let all_msgs = await readMessages(game);
        //     all_msgs = all_msgs.map((msg) => ({ ...msg, __createdtime__: msg.createddate }))
        //     socket.emit('all_msgs', all_msgs);
        // })()

    });

    socket.on('send_message', (data) => {
        const { gameName } = data;

        io.to(gameName).emit('receive_message', { ...data }); // Send to all users in room, including sender

        // harperSaveMessage(message, username, room, __createdtime__) // Save message in db
        //     .then((response) => console.log(response))
        //     .catch((err) => console.log(err));

        // saveMessage(rec)
    });

    socket.on('leave_game', async (data) => {

        const { username, gameName } = data;
        // let cp = players.find((user) => user.game == gameName && user.username);

        // * recover tiles
        // if (cp?.id != socket.id ) {
        let temptiles = tempPlayerTileData[`${username}_${gameName}`];

        // console.log('leaving: ', username, tempPlayerTileData, tempPlayerTileData[username])

        if (temptiles && !data?.recoverTiles) {
            let gs: IGameStateTable[] = await getGameState(gameName);
            let lb = gs[0].letterbag;


            if (lb) {
                // console.log('no recovertile', [...lb, ...temptiles]);

                await patchGameState(gameName, {
                    letterbag: [...lb, ...temptiles]
                });
            }

            delete tempPlayerTileData[`${username}_${gameName}`];

        } else if (data?.recoverTiles) {
            let gs: IGameStateTable[] = await getGameState(gameName);
            let lb = gs[0].letterbag;


            if (lb) {
                // console.log('recovertile', [...lb, ...data.recoverTiles])

                await patchGameState(gameName, {
                    letterbag: [...lb, ...data.recoverTiles]
                });
            }
        }
        // }

        // TODO: if players remaining, assign to next player

        socket.leave(gameName);
        const __createdtime__ = Date.now();
        // Remove user from memory
        players = leaveGame(username, gameName, players);

        socket.to(gameName).emit('ingame_players', players);
        socket.to(gameName).emit('receive_message', {
            username: CHAT_BOT,
            message: `${username} has left the chat`,
            __createdtime__,
        });

        // console.log(`${username} has left the chat`);
        // console.log(players)
    });

    socket.on('disconnect', () => {
        // console.log('User disconnected from the chat');
        const user = players.find((user) => user.id == socket.id);

        if (user?.username) {
            players = leaveGameBySocketId(socket.id, players);
            socket.to(user.game).emit('ingame_players', players);
            socket.to(user.game).emit('receive_message', {
                message: `${user.username} has disconnected from the chat.`,
            });
        }
    });

    socket.on('submit_words', async (data) => {
        // ! ensure words are represent in correct format from frontend - deprecate suffix tree

        let all_verified: boolean[] = [];

        if (data.words[0][0].length == 1)
            all_verified.push(false);

        if (data.game.lang == ELangs.sheng) {
            // https://lughayangu.com/sheng
            // https://kenyanmagazine.co.ke/200-sheng-words-and-their-meanings/
            for (const word of data.words) {
                // console.log(word)

                let isword = shengTrie.search(word[0]);

                if (!isword) {
                    isword = swahiliTrie.search(word[0]);
                }

                if (!isword) {
                    // (async () => {
                    const response = await fetch('https://lughayangu.com/sheng/' + word[0].toLowerCase());
                    const status = await response.status

                    isword = status == 200
                    // })()
                }

                all_verified.push(isword);

            }
        }

        if (data.game.lang == ELangs.en) {
            // if eng, use the api below
            // https://scrabblechecker.collinsdictionary.com/check/api/index.php?key=aa&isFriendly=1&nocache=1723803287116
            for (const word of data.words) {

                // console.log(word, word[0])

                let isword = engTrie.search(word[0]);

                // if (!word && data.game.use_scrabble_dictionary){
                // TODO: mimic chrome browser to get results from this link
                //     (async () => {
                //         const response = await fetch('https://scrabblechecker.collinsdictionary.com/check/api/index.php?key=' + word.toLowerCase());
                //         const status = await response.status

                //         isword = status == 200
                //     })()
                // }

                all_verified.push(isword)
            }
        }

        if (all_verified.length > 0 && all_verified.every(v => v == true)) {
            // change player turn
            let gamestate = await getGameState(data.game.name);
            let cp = gamestate[0]?.currentplayer;
            let prevIdx: number = 0;

            let ingameplayers = players.filter(p => p.game == data.game.name);

            ingameplayers.forEach((p, i) => {
                if (p.username == cp)
                    prevIdx = i
            });

            let nextIdx = ingameplayers.length > 1 ? (prevIdx + 1) : 0;
            nextIdx = nextIdx >= ingameplayers.length ? 0 : nextIdx;

            // console.log(ingameplayers);
            
            let nextplayer = ingameplayers[nextIdx].username;

            //save gamestate to db
            let gstateStr: string | null = gamestate[0].statistics;
            let gstate: TStats = {}
            let le_user = data.username;

            if (gstateStr != null) {
                gstate = JSON.parse(gstateStr);

                if (gstate[le_user]) {
                    gstate = {
                        ...gstate,
                        [le_user]: [
                            ...gstate[le_user],
                            {
                                timestamp: new Date(),
                                words: data.words
                            }
                        ]
                    }
                } else {
                    gstate = {
                        ...gstate,
                        [le_user]: [
                            {
                                timestamp: new Date(),
                                words: data.words
                            }
                        ]
                    }
                }
            } else {
                gstate = {
                    [le_user]: [
                        {
                            timestamp: new Date(),
                            words: data.words
                        }
                    ]
                }
            }

            let history;

            history = Object.keys(gstate).map(k => gstate[k].map((s: TPlayerData)=>{
                    return{
                        player: k,
                        masaa: s.timestamp,
                        wordscore: s.words.map(w => [w[0], w[2]])
                    }
                }));

            history = flatten(history);

            await patchGameState(data.game.name, {
                statistics: JSON.stringify(gstate),
                currentplayer: nextplayer
            });

            //update temp tiles to ensure cannot recover played tiles
            if (data?.recoverTiles) {
                tempPlayerTileData[`${le_user}-${data.game.name}`] = data.recoverTiles;
            }

            io.to(data.game.name).emit('current_player', nextplayer);

            socket.to(data.game.name).emit('words_submitted', {
                nv: data.nv,
                status: 'broadcast',
                history,
            });

        }

        socket.emit('words_submitted', {
            status: all_verified.every(v => v == true) ? 'fiti' : 'chorea',
        });

    });

    socket.on('player_playing', async (data) => {
        socket.to(data.game.name).emit('player_playing', data.nv)
    });

    socket.on('pick_tiles', async (data) => {
        let { game, tiles_2_pick } = data;

        if (tiles_2_pick == 0)
            return

        let tiles = await getTiles(game, tiles_2_pick);

        socket.emit('tiles_picked', tiles);

    });

    socket.on('pass_me', async data => {

        let gamestate = await getGameState(data.game.name);
        let cp = gamestate[0]?.currentplayer;
        let prevIdx: number = 0;
        let ingameplayers = players.filter(p => p.game == data.game.name)

        ingameplayers.forEach((p, i) => {
            if (p.username == cp)
                prevIdx = i
        });

        let nextIdx = ingameplayers.length > 1 ? (prevIdx + 1) : 0;
        nextIdx = nextIdx >= ingameplayers.length ? 0 : nextIdx;

        let nextplayer = ingameplayers[nextIdx].username;

        await patchGameState(data.game.name, {
            currentplayer: nextplayer
        });

        io.to(data.game.name).emit('current_player', nextplayer);

    });

    // socket.on('return_tiles', async (data) => {
    //     // console.log(data)

    //     let gamestate = await getGameState(data.game.name);
    //     let tiles = gamestate[0]?.letterbag;

    //     if (tiles)
    //         tiles = [
    //             ...tiles,
    //             ...data.tiles.map((t: any) => t.letter)
    //         ];
    //     else
    //         tiles = data.tiles.map((t: any) => t.letter);

    //     await patchGameState(data.game.name, {
    //         letterbag: tiles
    //     });

    // });

});

server.listen(process.env.DEBUG ? 4000 : process.env.PROD_PORT, () => 'Server is running on port 4000 | 80');

