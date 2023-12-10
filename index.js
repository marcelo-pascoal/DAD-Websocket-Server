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
        socket.join(user.id.toString())
        if (user.user_type == 'A') {
            socket.join('administrator')
            console.log("admin logged in")
        }else console.log(user.id)
    })
    socket.on('loggedOut', function (user) {
        socket.leave(user.id)
        socket.leave('administrator')
        console.log("admin logged out")
    })
    socket.on('newCategory', (category) => {
        if (socket.rooms.has('administrator')) {
            socket.in('administrator').emit('newCategory', category);
        }
    })
    socket.on('updateCategory', (category) => {
        if (socket.rooms.has('administrator')) {
            socket.in('administrator').emit('updateCategory', category)
        }
    })
    socket.on('deleteCategory', (category) => {
        if (socket.rooms.has('administrator')) {
            socket.in('administrator').emit('deleteCategory', category)
        }
    })
    socket.on('insertedAdmin', function () {
        socket.in('administrator').emit('adminsUpdated')
    })
    socket.on('updatedAdmin', function (user) {
        socket.in('administrator').except(user.id).emit('adminsUpdated')
        socket.in(user.id).emit('updatedAdmin', user)
    })
    socket.on('deletedAdmin', function (user) {
        socket.in('administrator').except(user.id).emit('adminsUpdated')
        socket.in(user.id).emit('accountDeleted')
    })
    socket.on('insertedVcard', function (user) {
        socket.in('administrator').emit('insertedVcard', user)
    })
    socket.on('updatedVcard', function (vcard) {
        socket.in('administrator').emit('updatedVcard', vcard)
        socket.in(vcard.phone_number).emit('updatedVcard', vcard)
    })
    socket.on('deletedVcard', function (vcard) {
        socket.in('administrator').emit('deletedVcard', vcard)
        socket.in(vcard.phone_number).emit('accountDeleted')
    })
})
