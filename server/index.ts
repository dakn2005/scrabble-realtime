// const express = require('express');
// const http = require('http');
// const cors = require('cors');
// const { Server } = require('socket.io');
// const { saveMessage, readMessages } = require('./database/services/crud');
import { Server, Socket } from 'socket.io';
import express, { Request, Response } from 'express';
import http from 'http';
import cors from 'cors';
import 'dotenv/config';
import fs from 'fs';

import { IUser, TLetterBag, ELangs, IGameStateTable } from './interfaces'
import { getGames, createGame, upsertGameState, getGameState } from './database/services/crud';
import leaveGame from './utils/leave-game';
import errorHandling from './utils/errorHandling';
import Trie from './utils/tries';
import shuffle from './utils/shuffle';

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

let shengTrie = new Trie()
let enTrie = new Trie()
let shengLetters: Set<string> = new Set();
let shengLetterSetter = (wrd: string) => {
    const isAlpha =(str: string) => /^[a-zA-Z]*$/gi.test(str)
    wrd.split('').forEach((element: string) => {
        if (isAlpha(element)) {
            shengLetters.add(element.toUpperCase())
        }
    });
}

// load tries
fs.readFileSync('./utils/dictionaries/sheng.txt', 'utf8')
    .split('\n')
    .forEach(line => {
        let word = line.split('-')[0]
        word = word.trim()

        if (word.includes('/')) {
            word.split('/').forEach(wrd => {
                shengTrie.insert(wrd)
                shengLetterSetter(wrd)
            })
        } else {
            shengTrie.insert(word);
            shengLetterSetter(word)
        }
    });

fs.readFileSync('./utils/dictionaries/en.txt', 'utf8')
    .split('\n')
    .forEach(word => {
        if (word.split('').length > 1) {
            enTrie.insert(word)
        }
    });

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!');
});

app.get('/api/games', async (req: Request, res: Response) => {
    const games = await getGames();
    res.send(games)
});

app.get('/api/games/trie', async (req: Request, res: Response) => {
    if (req.params['lang'] == 'sheng') {
        res.send(shengTrie)
    }
});

app.post('/api/games/add', async (req: Request, res: Response) => {

    let [status, err] = await createGame(req.body)

    // TODO: implement LRU here

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
});

const CHAT_BOT = 'Gamebot';
// Add this
let chatRoom = ''; // E.g. javascript, node,...
let players: IUser[] = []; // All users in current chat room

const initEnLetterBag = (restart?: boolean): string[] => {
    let letterBag: string[] = [];

    let lettersDistribution: TLetterBag = {
        1: ['J', 'K', 'Q', 'X', 'Z'],
        2: ['B', 'C', 'F', 'H', 'M', 'P', 'V', 'W', 'Y'],
        3: ['G'],
        4: ['D', 'L', 'S', 'U'],
        6: ['N', 'R', 'T'],
        8: ['O'],
        9: ['A', 'I'],
        12: ['E'],
    }

    if (players.length == 1 || restart) {

        Object.keys(lettersDistribution).forEach(key => {
            lettersDistribution[parseInt(key)].forEach(letter => {
                let cnter = parseInt(key)

                while (cnter > 0) {
                    letterBag.push(letter)
                    cnter--
                }
            });
        });

    }

    //random picking
    return shuffle(letterBag);
}

io.on('connection', (socket: Socket) => {
    // console.log(`User connected ${socket.id}`);

    socket.on('join_game', (data) => {
        let { username, gameName } = data; // Data sent from client when join_room event emitted

        username = username.toLowerCase()
        username = username.charAt(0).toUpperCase() + username.slice(1);

        // check is username already in game
        if (players.find(user => user.game == gameName && user.username == username)) {
            socket.emit('join_reply', { status: 'fail', message: 'Username already taken' });
            return;
        }

        // check if game is full
        if (players.filter(p => p.game == gameName).length == 4) {
            socket.emit('join_reply', { status: 'fail', message: 'Game is full (max 4 players' });
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

        // socket.emit('receive_message', {
        //     message: `Welcome ${username}`,
        //     username: CHAT_BOT,
        //     __createdtime__,
        // });

        // Save the new user to the game
        chatRoom = gameName;
        players.push({ id: socket.id, username, game: gameName });
        let chatRoomUsers = players.filter((user) => user?.game === gameName);

        socket.to(gameName).emit('chatroom_users', chatRoomUsers);
        socket.emit('chatroom_users', chatRoomUsers);

        // (async () => {
        //     let all_msgs = await readMessages(game);
        //     all_msgs = all_msgs.map((msg) => ({ ...msg, __createdtime__: msg.createddate }))
        //     socket.emit('all_msgs', all_msgs);
        // })()

    });

    socket.on('send_message', (data) => {
        const { gameName } = data;
        const datum = {...data}

        socket.to(gameName).emit('receive_message', datum); // Send to all users in room, including sender

        // console.log(data)

        // harperSaveMessage(message, username, room, __createdtime__) // Save message in db
        //     .then((response) => console.log(response))
        //     .catch((err) => console.log(err));

        // saveMessage(rec)
    });

    socket.on('leave_game', (data) => {
        const { username, gameName } = data;
        // console.log(username, game)

        socket.leave(gameName);
        const __createdtime__ = Date.now();
        // Remove user from memory
        players = leaveGame(socket.id, players);
        // console.log(allUsers)
        socket.to(gameName).emit('chatroom_users', players);
        socket.to(gameName).emit('receive_message', {
            username: CHAT_BOT,
            message: `${username} has left the chat`,
            __createdtime__,
        });
        // console.log(`${username} has left the chat`);
    });

    socket.on('disconnect', () => {
        // console.log('User disconnected from the chat');
        const user = players.find((user) => user.id == socket.id);
        if (user?.username) {
            players = leaveGame(socket.id, players);
            socket.to(chatRoom).emit('chatroom_users', players);
            socket.to(chatRoom).emit('receive_message', {
                message: `${user.username} has disconnected from the chat.`,
            });
        }
    });

    socket.on('submit_words', (data) => {
        // TODO: check for word validity
        // TODO: ensure words are represent in correct format from frontend - deprecate suffix tree

        let all_verified: boolean[] = [];

        if (data.game.lang == ELangs.sheng) {
            // https://lughayangu.com/sheng
            // https://kenyanmagazine.co.ke/200-sheng-words-and-their-meanings/
            for (const word of data.words) {
                let isword = shengTrie.search(data.word);
                
                if (!isword) {
                    (async () => {
                        const response = await fetch('https://lughayangu.com/' + data.word.toLowerCase());
                        const status = await response.status
                        
                        isword = status == 200
                    })()
                }
                
                all_verified.push(isword)
            }
        }

        if (data.game.lang == ELangs.en) {
            // if eng, use the api below
            // https://scrabblechecker.collinsdictionary.com/check/api/index.php?key=aa&isFriendly=1&nocache=1723803287116
        }

        socket.to(data.game.name).emit('words_submitted', {
            newlyVisited: data.newlyVisited,
            status: 'broadcast',
        });

        socket.emit('words_submitted', {
            status: all_verified.every(v => v == true) ? 'fiti' : 'chorea',
        });

    });

    socket.on('player_playing', (data) => {
        socket.to(data.game).emit('player_playing', data.nv)
    });

    socket.on('pick_tiles', (data) => {
        let { game, tiles_2_pick } = data;

        if (tiles_2_pick == 0)
            return

        (async () => {
            let gamestate = await getGameState(game.name);

            let lb: string[];

            if (game.lang == ELangs.sheng)
                lb = gamestate.length == 0 ? shuffle([...shengLetters.values()]) : gamestate[0].letterbag;
            else //if (game.lang == ELangs.en)
                lb = gamestate.length == 0 ? initEnLetterBag(true) : gamestate[0].letterbag;

            let tiles = lb.splice(0, tiles_2_pick);

            socket.emit('tiles_picked', tiles);

            await upsertGameState({
                game: game.name,
                letterbag: lb,
                statistics: (gamestate[0]?.statistics ?? {}) as JSON,
                updatedate: new Date()
            });

        })();

    });

});

server.listen(process.env.DEBUG ? 4000 : process.env.PROD_PORT, () => 'Server is running on port 4000 | 80');

