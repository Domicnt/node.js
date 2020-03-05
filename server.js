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
let mines = width * height / 4;
mine.reset(arr, mines);

//update clients after any change to the board
function updateClients(win, lose) {
    for (let i = 0; i < connections.length; i++) {
        if (lose) {
            connections[i].sendUTF(JSON.stringify(mine.returnArr(arr, width, height, true)));
            connections[i].sendUTF('l');
        } else if (win) {
            connections[i].sendUTF(JSON.stringify(mine.returnArr(arr, width, height, false)));
            connections[i].sendUTF('w');
        } else {
            connections[i].sendUTF(JSON.stringify(mine.returnArr(arr, width, height, false)));
            connections[i].sendUTF('s' + JSON.stringify(connectionScores));
        }
    }
    if (lose || win) {
        arr = mine.reset(arr, mines);
        for (let i = 0; i < connections.length; i++) {
            connectionScores[i] = 0;
        }
    }
}

function parseMessage (message) {
    let ID = message.substring(0, 10);//ID for client
    let value = message.substring(10, 11);//What value is being passed
    message = message.substring(11);//The message passed

    for (let i = 0; i < connectionIDs.length; i++) {
        if (connectionIDs[i] == ID) {
            //client that sent the message
            switch (value) {
                case 'c':
                    //click position
                    let output = mine.updateArr(arr, Number(message.split(':')[0]), Number(message.split(':')[1]), false, width, height);
                    let win = false;
                    let lose = false;
                    if (output[0][0] == 100) win = true;
                    else if (output[0][0] == -100) lose = true;
                    else {
                        arr = output;
                    }
                    if (!lose) {
                        connectionScores[i]++;
                    }
                    updateClients(win, lose);
                    break;
                case 'f':
                    //flagging position
                    arr = mine.updateArr(arr, Number(message.split(':')[0]), Number(message.split(':')[1]), true, width, height);
                    updateClients(false, false);
                    break;
                case 'd':
                    //disconnect
                    connections.splice(i, 1);
                    connectionIDs.splice(i, 1);
                    connectionScores.splice(i, 1);
                    for (let i = 0; i < connections.length; i++) {
                        connections[i].sendUTF('c' + connections.length);
                        for (let j = 0; j < connections.length; j++) {
                            if (connectionIDs[i] == connectionIDs[j]) {
                                connections[i].sendUTF('n' + (i + 1));
                            }
                        }
                    }
                    break;
            }
        }
    }
}

wss.on('request', (request) => {
    let connection = request.accept('', request.origin);
    let ID = scripts.createID();

    connections.push(connection);
    connectionIDs.push(ID);
    connectionScores.push(0);

    connection.sendUTF('i' + ID);
    connection.sendUTF('n' + connections.length);
    connection.sendUTF('s' + JSON.stringify(connectionScores));
    connection.sendUTF(JSON.stringify(mine.returnArr(arr, width, height)));

    for (let i = 0; i < connections.length; i++) {
        connections[i].sendUTF('c' + connections.length);
    }

    console.log('Connection accepted at ' + (new Date()));
    connection.on('message', (message) => {
        if (message.type === 'utf8') {
            parseMessage(message.utf8Data);
        }
    });

    connection.on('close', (reasonCode, description) => {
        console.log('Player' + connection.remoteAddress + ' disconnected at ' + (new Date()));
    });
});