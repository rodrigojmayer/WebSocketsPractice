const http = require('http')
const {WebSocketServer} = require('ws')

const url = require('url')
const uuidv4 = require('uuid').v4

const server = http.createServer()
const wsServer = new WebSocketServer({ server })
const port = 8000

const connections = { }
const users = { }

const broadcast = () => {
    Object.keys(connections).forEach(uuid => {
        const connection = connections[uuid]
        const message = JSON.stringify(users)
        connection.send(message)
    })
}

const handleMessage = (bytes, uuid) => {
    const message = JSON.parse(bytes.toString())
    const user = users[uuid]
    user.state = message

    broadcast()

    console.log(`${user.username} updated their state: `, message)
}

const handleClose = uuid =>{

    console.log(`${users[uuid].username} disconnected`)
    delete connections[uuid]
    delete users[uuid]

    // user gone = Alex

    broadcast()
}

wsServer.on("connection", (connection, request) => {
    // ws://localhost:8000?username=Alex

    const { username } = url.parse(request.url, true).query
    const uuid = uuidv4()
    console.log(username)
    console.log(uuid)
    
    connections[uuid] = connection
    
    users[uuid] = {
        username,
        state: { }
    }
    
    connection.on("message", message => handleMessage(message, uuid))
    connection.on("close", () => handleClose(uuid))

    //  JSON.stringify(user)



})

server.listen(8000, () => {
    console.log(`WebSocket server is running on port ${port}`)
})
