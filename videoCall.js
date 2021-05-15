const app = require('express')()

const server = require('http').createServer(app)
const PORT = 5000

const io = require('socket.io')(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
})

io.on('connection', socket => {
    socket.emit('myId', socket.id)

    socket.on('disconnect', () => {
        socket.broadcast.emit('callEnded')
    })

    socket.on('call-user', data => {
        io.to(data.userToCall).emit('call-user', {
            signal: data.signalData,
            from: data.from,
            name: data.name
        })
    })

    socket.on('answer-call', data => {
        io.to(data.to).emit('callAccepted', data.signal)
    })
})

server.listen(PORT, () => console.log(`Server listening on Port ${PORT}`))