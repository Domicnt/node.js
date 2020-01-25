const http = require('http');
const path = require('path');
const fs = require('fs');

var WebSocketServer = require('websocket').server;

let players = [[0,0,25,0]];

let server = http.createServer((request, response) => {
    if (request.url === "/") {
        request.url = "/index.html";
    }
    fs.readFile(__dirname + request.url, (error, data) => {
        let fileTypes =
        {
            html: "text/html",
            css: "text/css",
            js: "application/javascript"
        };
        let fileType = request.url.split(".").pop();
        response.writeHead(200, { 'Content-Type': fileTypes[fileType] });
        response.write(data);

        response.end();
    });
});

server.listen(80);



//WebSocket
wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production 
    // applications, as it defeats all standard cross-origin protection 
    // facilities built into the protocol and the browser.  You should 
    // *always* verify the connection's origin and decide whether or not 
    // to accept it. 
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
    // put logic here to detect whether the specified origin is allowed. 
    return true;
}

let connections = [];

wsServer.on('request', (request) => {
    if (!originIsAllowed(request.origin)) {
        // Make sure we only accept requests from an allowed origin 
        request.reject();
        console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
        return;
    }
    let connection = request.accept('ws', request.origin);

    //store the new connection in your array of connections and send ID
    connections.push(connection);
    connections[connections.length - 1].sendUTF('ID:' + connections.length);

    players.push([0,0,25, connections.length]);

    console.log((new Date()) + ' Connection accepted.');
    connection.on('message', (message) => {
        if (message.type === 'utf8') {
            console.log('Received Message: ' + message.utf8Data);
            let ID = message.utf8Data.split(':', 1);
            let str = message.utf8Data.split(':', 2)[1];
            if (str === 'W') {
                players[ID - 1][1] -= 5;
            }
            if (str === 'S') {
                players[ID - 1][1] += 5;
            }
            if (str === 'A') {
                players[ID - 1][0] -= 5;
            }
            if (str === 'D') {
                players[ID - 1][0] += 5;
            }
        }
        let str = '';
        for (let i = 0; i < connections.length; i++) {
            if (i > 0) str += '|';
            for (let j = 0; j < 3; j++) {
                if (j > 0) str += ':' + players[i][j];
                else str += players[i][j];
            }
        }
        for (let i = 0; i < connections.length; i++) {
            connections[i].sendUTF(str);
        }
    });
    
    connection.on('close', (reasonCode, description) => {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});