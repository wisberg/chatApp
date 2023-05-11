const path = require('path'); //Joining directories in our app
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, getAllUsers, userLeave } = require('./utils/users');


const botName = "Admin";


const app = express(); 
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Run when a client connects
io.on('connection', socket => {
    socket.on('joinRoom', ({username, room}) => {
    console.log('Join');
    const user = userJoin(socket.id ,username, room);

    socket.join(user.room);

    //Welcome current user
    socket.emit('message', formatMessage(botName,'Welcome to Chat'));

    //Broadcast will emit to everyone except the user connecting.
    //Socket.emit will send to the person connecting 
    //io.emit will emit to everyone 

    //Broadcast when user connects
    socket.broadcast.to(user.room).emit('message', formatMessage(botName,`${user.username} has joined the chat!`));
    
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username, msg));
    })

    //Send users and room info
    io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getAllUsers(user.room)
    })

    //Run when person disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);
        if(user){
            io.to(user.room).emit('message', formatMessage(botName,`${user.username} has left the chat!`));
        }
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getAllUsers(user.room)
        })
    });

    })

})

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));