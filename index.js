const httpServer = require('http').createServer()
const io = require("socket.io")(httpServer, {
    cors: {
        // The origin is the same as the Vue app domain. Change if necessary
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
    }
})
httpServer.listen(8080, () =>{
    console.log('listening on *:8080')
})
io.on('connection', (socket) => {
    console.log(`client ${socket.id} has connected`)

    socket.on('loggedIn', function (user) {
        socket.join(user.id)
        if (user.type == 'A') {
            socket.join('administrator')
        }
    })
    socket.on('loggedOut', function (user) {
        socket.leave(user.id)
        socket.leave('administrator')
    })
    socket.on('insertedUser', function (user) {
        socket.in('administrator').emit('insertedUser', user)
    })
    socket.on('updatedUser', function (user) {
        socket.in('administrator').except(user.id).emit('updatedUser', user)
        socket.in(user.id).emit('updatedUser', user)
    })
})
