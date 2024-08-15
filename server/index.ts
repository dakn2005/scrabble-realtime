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

import { IUser } from './interfaces'
import { saveMessage, readMessages, getGames, createGame } from './database/services/crud';
import leaveGame from './utils/leave-game';
import errorHandling from './utils/errorHandling';

let app = express();

app.use(cors());
app.use(express.json())
// app.use(express.urlencoded({extended: true}))

const server = http.createServer(app);

let ioCorsUrl = process.env.DEBUG ? 'http://localhost:5173' : 'https://lesdaw-ip-105-163-0-0.tunnelmole.net';

// console.log(process.env.DEBUG, ioCorsUrl)

// app.get('/rooms', (req: Request, res: Response) => {
//     res.send({ msg: 'Hello World!' });
// });

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!');
});

app.get('/api/games', async (req: Request, res: Response) => {
    const games = await getGames();
    // console.log(games)
    res.send(games)
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
            error: errorHandling(err.code, 'game')
        })
    }

    console.log(err)
});


const io = new Server(server, {
    cors: {
        origin: ioCorsUrl,
        methods: ['GET', 'POST'],
    },
});

const CHAT_BOT = 'KBot';
// Add this
let chatRoom = ''; // E.g. javascript, node,...
let allUsers: IUser[] = []; // All users in current chat room

io.on('connection', (socket: Socket) => {
    // console.log(`User connected ${socket.id}`);

    socket.on('join_game', (data) => {
        const { username, game } = data; // Data sent from client when join_room event emitted
        socket.join(game); // Join the user to a socket room

        // console.log('joining: ', username, game)

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

        // Save the new user to the room
        chatRoom = game;
        allUsers.push({ id: socket.id, username, game: game });
        let chatRoomUsers = allUsers.filter((user) => user?.game === game);

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
        allUsers = leaveGame(socket.id, allUsers);
        // console.log(allUsers)
        socket.to(game).emit('chatroom_users', allUsers);
        socket.to(game).emit('receive_message', {
            username: CHAT_BOT,
            message: `${username} has left the chat`,
            __createdtime__,
        });
        // console.log(`${username} has left the chat`);
    });

    socket.on('disconnect', () => {
        // console.log('User disconnected from the chat');
        const user = allUsers.find((user) => user.id == socket.id);
        if (user?.username) {
            allUsers = leaveGame(socket.id, allUsers);
            socket.to(chatRoom).emit('chatroom_users', allUsers);
            socket.to(chatRoom).emit('receive_message', {
                message: `${user.username} has disconnected from the chat.`,
            });
        }
    });


});

server.listen(4000, () => 'Server is running on port 4000');

