const app = require('express')()

const server = require('http').createServer(app)
const PORT = 5001

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
            msg: data.msg,
            username: data.username
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