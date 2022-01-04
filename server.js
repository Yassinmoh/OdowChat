const express = require('express');
const app = express()
const port = process.env.PORT || 3000;
const path = require('path')
const http = require('http')
const server = http.createServer(app)
const socketio = require('socket.io')
const io = socketio(server)
const formatMessage = require('./utils/messages')
const { userjoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users')



//Create Static Folder:
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'Odow Chat Bot'



//Run When Client is Connected:
io.on('connection', (socket) => {
    socket.on('joinRoom', ({ username, room }) => {
        const user = userjoin(socket.id, username, room)
        socket.join(user.room)


        //Welcome Current User:
        socket.emit('message', formatMessage(botName, 'Welcome to ChatCord'))

        //Brodcast When User Connect:
        socket.broadcast
            .to(user.room)
            .emit('message', formatMessage(botName, `${user.username} has joined chat`))

        //Send users and room info:
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })

    })



    //Listen For chat messages:
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id)

        io.to(user.room).emit('message', formatMessage(user.username, msg))
    })

    //Run When Client Disconnected:
    socket.on('disconnect', () => {
        const user = userLeave(socket.id)
        if (user) {
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat`));

            
        }
    })

})



server.listen(port, () => {
    console.log(`Server is listening on port:${port}`)
})