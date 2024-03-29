# WebSocketsPractice

##############################################  Server Side  ##############################################

uuid: First in the server side we must install the uuid module wich stands for universally unique identifier.
    npm i --save ws uuid

On the index.js or server.js file where we create the HTTP server we will create the websocket server
    const http = require('http')
    const { WebSocketServer } = require('ws')   // Importing the ws module

    const server = http.createServer()
    const wsServer = new WebSocketServer({ server }) // Then we pass to this constructor an options property where one of the options is server

Add wsServer event
    wsServer.on("connection", (connection, request) => {    // This is a type of event. When this event happens we would please like to call this callback function which passes the connection and the request. The argument connection is the underlying websocket connection which we'll be able to use to call thinks like send, to send message to a user at the other end of that connection (connection.send())
    // connection.send
    })

Just like in the HTTP protocol in WS is possible to pass query parameters
    // ws://localhost:8000?username=Alex

Identify the user before we go any further
Import the url module, this comes directly from node by the way, so there's no need to npm install anything
    const url = require('url')

and then we call url.parse and then it wants to know URL string which is going to be accessible via that HTTP request argument, it's just a case of passing request.url. It asks us if we want to pass the query string, which we do, and if we pass true that gives us access to the query property on the object returned by parse, and on that object is a dictionary that has a key for each query parameter, in this case username.
    url.parse(request.url, true).query.username
However the way we will express this in code is not by calling the dot username, but by doing it like this
    const { username } = url.parse(request.url, true).query
    console.log(username)

We can test so far with postman in the option WebSocket connection, url ws://127.0.0.1:8000?username=Alex

Generate a unique identifier for each connection and use that as their individual key or way to identify them
    const uuidv4 = require("uuid").v4 // First import the module
    
    const uuid = uuidv4()   // then we can call the uuidv4 function inside the wsServer connection function
    console.log(uuid)

To start keeping track of connections is by creating a connections dictionary
    const connections = {}

And then every time a new connection is established we're going to create a new entry by using the uniquely generated identifier as the key just like so
    connections[uuid] = connection

We will also track users, setting the data that interests to us, because each connection has a lot of metadata that we will not be interested in
    const users = {}

    users[uuid] = {
        username,
        state: {
            x: 0,
            y: 0
        }
    }

Now inside the wsServer.on (that is the event handler on the websocket server that says "hey every time there's a new connection we want to run this code") is wire up some event handlers for the connection itself:
On that connection, on a message occurring do this
    connection.on("message", _______ )
And on that connection, if it closess do that
    connection.on("close", ________ )

For the message handler, when we get a message we get pass the message, and we're going to pass that to a function called handleMessage. In addition to passing the message which is available as parameter we're also going to pass the uuid. This is the way of capturing the value of the variable so that every time we get a new message we'll know who it is, and the identifier of both the connection and the user
    connection.on("message", message => handleMessage(message, uuid) )

If the connection is closed we're going to call a function called handleClose, and we're going to pass the unique identifier
    connection.on("close", () => handleClose(uuid))

Outside the wsServer.on connection function we declare message events handler
    const handleMessage = (bytes, uuid) => {
        const message = JSON.parse(bytes.toString())
        console.log(message)
    }

Broadcast (or fan out) is when you send a message to every connection, to every connected user. Is the type of one to many interaction.
First we enumerate a dictionary in JavaScript, so we can run a function for every single connection.
    const broadcast = () => {
        Object.keys(connections).forEach(uuid => {
            const connection = connections[uuid]
            const message = JSON.stringify(users)
            connection.send(message)
        })
    }

Then we add the call of that function broadcast inside the function handleMessage.
    broadcast()
    console.log(`${user.username} updated their state: ${JSON.stringify(user.state)}`)


Again outside the wsServer.on connection function we declare the close events handler
    const handleClose = uuid => {
        console.log(`${users[uuid].username} disconnected`)
        delete connections[uuid]
        delete users[uuid]

        broadcast()
    }

    

##############################################  Client Side  ##############################################

First in the client side we must isntall  the modules react-use-websocket, lodash.throttle and for this case perfect-cursors
    npm i react-use-websocket lodash.throttle perfect-cursors

import the react-use-websocket module in the file that we are going to use websocket
    import useWebSocket from 'react-use-websocket'

Inside of the component we're going to call the websocket hook. The first option used websocket takes is a URL to the websocket server. The second argument is an options object, where we can set all kinds of options. One of those options which you might need in your project is share. The only option we need is the one called queryParams, this enables us to pass the username as a query parameter to the server 
    const WS_URL = import.meta.env.VITE_WS_URL
    const { sendJsonMessage, lastJsonMessage } = useWebSocket(WS_URL, {
        queryParams: { username }
    })

Add in useEffect hook the event listener for the mousemove, using the function throttle from the module lodash.throttle to give an interval of time between each event.
    import throttle from 'lodash.throttle'


    const THROTTLE = 50     // milliseconds for interval
    const sendJsonMessageThrottled = throttle(sendJsonMessage, THROTTLE)

    useEffect(() => {
        window.addEventListener("mousemove", e => {
            sendJsonMessageThrottled({
                x: e.clientX,
                y: e.clientY
            })
        })
    }, [])

Is a small problem here, which is that effectively the function of the component is going to run every single time the component renders, this is every time something changes in the application State and in this case will be literally every millisecond with live cursors because they're moving all the time. And that means is that we'll be calling this throttle function essentially over and over again. And that's a bit of a problem because it's going to affect the internal timer and it's just not going to work as expected. If we want to hold on to a reference between renders and not keep record calling it, that's when we use useRef.
    import { useEffect, useRef } from 'react'


    const sendJsonMessageThrottled = useRef(throttle(sendJsonMessage, THROTTLE))


    sendJsonMessageThrottled.current({    //  Whenever you wrap up a function like so, you can't just return the function, actually returns an object with a property called current that represents the method that is throttled in this case
        x: ...
    })