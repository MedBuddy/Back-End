const app = require('express')()

const server = require('http').createServer(app)
const PORT = 5001

const mongoose = require('mongoose')
const { db_user, db_password } = require('./shared/credentials')
const connect = mongoose.connect(`mongodb+srv://${db_user}:${db_password}@medbuddy.sd9b2.mongodb.net/Main?retryWrites=true&w=majority`)

connect.then((db) => {
    console.log("\nDatabase connected!")
}, (err) => console.log(err))

const Message = require('./models/message')

const io = require('socket.io')(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
})

io.on('connection', socket => {
    socket.on('connectToRoom', data => {
        socket.join(`room-${data.roomId}`)
        io.sockets.in(`room-${data.roomId}`).emit('roomConnected', `${data.newUser} joined the chat`)
    })

    socket.on('message', data => {
        io.sockets.in(`room-${data.roomId}`).emit('message', {
            message: data.msg,
            sender: data.username,
            createdAt: new Date().toISOString(),
            roomId: data.roomId
        })
        const message = {
            message: data.msg,
            sender: data.username,
            roomId: data.roomId
        }
        Message.create(message)
    })
})

server.listen(PORT, () => console.log(`Server listening on Port ${PORT}`))