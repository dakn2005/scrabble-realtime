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

import { IUser, TLetterBag } from './interfaces'
import { saveMessage, readMessages, getGames, createGame, upsertGameState } from './database/services/crud';
import leaveGame from './utils/leave-game';
import errorHandling from './utils/errorHandling';
import Trie from './utils/tries';

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

// load tries
fs.readFileSync('./utils/dictionaries/sheng.txt', 'utf8')
    .split('\n')
    .forEach(line => {
        let word = line.split('-')[0]
        word = word.trim()

        if (word.includes('/')) {
            word.split('/').forEach(wrd => {
                shengTrie.insert(wrd)
            })
        } else {
            shengTrie.insert(word);
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




const calculateGameState = (players: IUser[], restart?: boolean) => {
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
            let cnter = parseInt(key)

            lettersDistribution[cnter].forEach(letter => {
                while (cnter > 0){
                    letterBag.push(letter)
                    cnter--
                }
            });
        });

    }


    // await upsertGameState({
    //     name: chatRoom,
    //     state: {
    //         letterBag,
    //         tiles,
    //         playerScores
    //     },
    //     updatedate: new Date()
    // });
}

io.on('connection', (socket: Socket) => {
    // console.log(`User connected ${socket.id}`);

    socket.on('join_game', (data) => {
        let { username, game } = data; // Data sent from client when join_room event emitted

        username = username.toLowerCase()
        username = username.charAt(0).toUpperCase() + username.slice(1);

        // check is username already in game
        if (players.find(user => user.game == game && user.username == username)) {
            socket.emit('join_reply', { status: 'fail', message: 'Username already taken' });
            return;
        }

        // check if game is full
        if (players.filter(p => p.game == game).length == 4) {
            socket.emit('join_reply', { status: 'fail', message: 'Game is full (max 4 players' });
            return;
        }

        socket.emit('join_reply', { status: 'success' });

        // Join the user to a socket room
        socket.join(game);


        let __createdtime__ = Date.now(); // Current timestamp

        // Send message to all users currently in the room, apart from the user that just joined
        socket.to(game).emit('receive_message', {
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
        chatRoom = game;
        players.push({ id: socket.id, username, game });
        let chatRoomUsers = players.filter((user) => user?.game === game);

        socket.to(game).emit('chatroom_users', chatRoomUsers);
        socket.emit('chatroom_users', chatRoomUsers);



        // (async () => {
        //     let all_msgs = await readMessages(game);
        //     all_msgs = all_msgs.map((msg) => ({ ...msg, __createdtime__: msg.createddate }))
        //     socket.emit('all_msgs', all_msgs);
        // })()

    });

    socket.on('send_message', (data) => {
        const { message, username, game, __createdtime__: createddate } = data;
        const rec = { message, username, game, createddate: new Date(createddate) }

        io.in(game).emit('receive_message', data); // Send to all users in room, including sender

        // harperSaveMessage(message, username, room, __createdtime__) // Save message in db
        //     .then((response) => console.log(response))
        //     .catch((err) => console.log(err));

        // console.log(rec)

        // saveMessage(rec)
    });

    socket.on('leave_game', (data) => {
        const { username, game } = data;
        // console.log(username, game)

        socket.leave(game);
        const __createdtime__ = Date.now();
        // Remove user from memory
        players = leaveGame(socket.id, players);
        // console.log(allUsers)
        socket.to(game).emit('chatroom_users', players);
        socket.to(game).emit('receive_message', {
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
        
        console.log(data)

        if (data.userdetails.game.lang == 'English') {
            // if eng, use the api below
            // https://scrabblechecker.collinsdictionary.com/check/api/index.php?key=aa&isFriendly=1&nocache=1723803287116
        }
        else if (data.userdetails.game.lang == 'Sheng') {
            // https://lughayangu.com/sheng
            // https://kenyanmagazine.co.ke/200-sheng-words-and-their-meanings/
            let isword = shengTrie.search(data.word);

            if (!isword) {
                (async () => {
                    const response = await fetch('https://lughayangu.com/' + data.word.toLowerCase());
                    const status = await response.status

                    isword = status == 200
                })()
            }

            if (isword) {
                // socket.emit('word_valid', true)
            }
            else {
                // socket.emit('word_valid', false)
            }
        }

    })

});

server.listen(process.env.DEBUG ? 4000 : process.env.PROD_PORT, () => 'Server is running on port 4000 | 80');

