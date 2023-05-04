const express = require('express')
const path = require('path')
const http = require('http')
const socketIO = require('socket.io')
const cors = require('cors')
require('dotenv').config()


const app = express()
app.use(cors())
const server = http.createServer(app)
const io = socketIO(server)

const port = process.env.PORT || 3000

server.listen(port)

// Lendo pasta public para rodar o server.
app.use(express.static(path.join(__dirname, 'public')))

let connectedUsers = [];


io.on('connection',(socket)=>{

    socket.on('join-request', (username)=>{
        socket.username = username;
        connectedUsers.push(username);

        socket.emit('user-ok', connectedUsers);
        socket.broadcast.emit('list-update',{
            joined:username,
            list: connectedUsers
        });
    });

    socket.on('disconnect',()=>{
        connectedUsers = connectedUsers.filter(u => u != socket.username);

        socket.broadcast.emit('list-update',{
            left: socket.username,
            list: connectedUsers
        })
    });
    
    socket.on('send-msg', (e)=>{
        let obj = {
            username: socket.username,
            message: e
        }

        socket.emit('show-msg', obj)
        socket.broadcast.emit('show-msg', obj)
    })
});

