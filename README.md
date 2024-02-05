# WebSocketsPractice

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


