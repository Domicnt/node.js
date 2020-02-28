const http = require('http');
const WebSocketServer = require('websocket').server;
const fs = require('fs');

const mine = require('./scripts/mineSweeper.js');
const scripts = require('./scripts/serverScripts.js');

//create server
let server = http.createServer((request, response) => {
    if (request.url === "/") {
        request.url = "/index.html";
    }
    fs.readFile(__dirname + request.url, (error, data) => {
        if (error) {
            response.writeHead(404);
            response.write('File at url: ' + request.url + ' Not Found');
        } else {
            let fileTypes =
            {
                html: "text/html",
                css: "text/css",
                js: "application/javascript",
                ico: 'image/png',
                png: 'image/png'
            };
            let fileType = request.url.split(".").pop();
            if (fileType === 'html' || fileType === 'css' || fileType === 'js' || fileType === 'ico' || fileType === 'png') {
                response.writeHead(200, { 'Content-Type': fileTypes[fileType], 'Content-Length': data.length });
                response.write(data);
            }
        }
        response.end();
    });
});

server.listen(process.env.PORT || 80);

//create webSocket server with server
wss = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

//array for connections
let connections = [];
let connectionIDs = [];
let connectionScores = [];

let width = 32;
let height = 18;
let arr = []; // 0 is unclicked and not mine, 1 is clicked, 2 is unclicked and mine, 3 is flag, 4 is flagged mine
arr.length = width;
for (let i = 0; i < arr.length; i++) {
    arr[i] = [];
    arr[i].length = height;
}
let mines = width * height / 5;
mine.reset(arr, mines);

//update clients after any change to the board
function updateClients(message) {
    if (connections.length == 0) return;
    let lose = false;
    let win = false;

    let flagging = false;
    if (message != null) {
        if (message[0] == 'D') {
            //disconnect
            for (let i = 0; i < connections.length; i++) {
                if (message.replace('D', '') == connectionIDs[i]) {
                    connections.splice(i, 1);
                    connectionIDs.splice(i, 1);
                    connectionScores.splice(i, 1);
                }
            }
            for (let i = 0; i < connections.length; i++) {
                connections[i].sendUTF('c' + connections.length);
            }
        } else {
            if (message[0] == 'f') {
                message = message.replace('f', '');
                flagging = true
            }
            let xy = message.split(':');
            let output = mine.updateArr(arr, Number(xy[0]), Number(xy[1]), flagging, width, height);
            if (output[0][0] == 100) win = true;
            else if (output[0][0] == -100) lose = true;
            else {
                arr = output;
            }
        }
    }
    for (let i = 0; i < connections.length; i++) {
        if (lose) {
            connections[i].send(0);
            arr = mine.reset(arr, mines);
        } else if (win) {
            connections[i].send(1);
            arr = mine.reset(arr, mines);
        } else {
            connections[i].sendUTF(JSON.stringify(mine.returnArr(arr, width, height)));
        }
    }
}

wss.on('request', (request) => {
    let connection = request.accept('', request.origin);
    let ID = scripts.createID();

    connections.push(connection);
    connectionIDs.push(ID);
    connectionScores.push(0);

    connection.sendUTF('ID' + ID);
    connection.sendUTF(JSON.stringify(mine.returnArr(arr, width, height)));

    for (let i = 0; i < connections.length; i++) {
        connections[i].sendUTF('c' + connections.length);
    }

    console.log('Connection accepted at ' + (new Date()));
    connection.on('message', (message) => {
        if (message.type === 'utf8') {
            updateClients(message.utf8Data);
        }
    });

    connection.on('close', (reasonCode, description) => {
        console.log('Player' + connection.remoteAddress + ' disconnected at ' + (new Date()));
    });
});