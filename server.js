const http = require('http');
const path = require('path');
const fs = require('fs');

let WebSocketServer = require('websocket').server;
let players = [[0, 0, 25, 0]];
let server = http.createServer((request, response) => {
    if (request.url === "/") {
        request.url = "/index.html";
    }
    fs.readFile(__dirname + request.url, (error, data) => {
        if (error) {
            response.writeHead(404);
            response.write('File Not Found');
        } else {
            let fileTypes =
            {
                html: "text/html",
                css: "text/css",
                js: "application/javascript",
                ico: 'image/png'
            };
            let fileType = request.url.split(".").pop();
            if (fileType === 'html' || fileType === 'css' || fileType === 'js' || fileType === 'ico') {
                response.writeHead(200, { 'Content-Type': fileTypes[fileType], 'Content-Length': data.length });
                response.write(data);
            }
            response.end();
        }
    });
});

server.listen(process.env.PORT || 80);


wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

let connections = [];

function updateClients() {
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
}

wsServer.on('request', (request) => {
    let connection = request.accept('', request.origin);

    connections.push(connection);
    connections[connections.length - 1].sendUTF('ID:' + connections.length);

    players.push([0, 0, 25, connections.length]);
    updateClients();

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
        updateClients();
    });
    
    connection.on('close', (reasonCode, description) => {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});