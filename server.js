const http = require('http');
const fs = require('fs');

let WebSocketServer = require('websocket').server;
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
                ico: 'image/png'
            };
            let fileType = request.url.split(".").pop();
            if (fileType === 'html' || fileType === 'css' || fileType === 'js' || fileType === 'ico') {
                response.writeHead(200, { 'Content-Type': fileTypes[fileType], 'Content-Length': data.length });
                response.write(data);
            }
        }
        response.end();
    });
});

server.listen(process.env.PORT || 80);


wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

let connections = [];

let arr = []; // 0 is unclicked and not mine, 1 is clicked, 2 is unclicked and mine, 3 is flag, 4 is flagged mine
let width = 32;
let height = 18;
arr.length = width * height;
let mines = arr.length / 5;
reset();
function reset() {
    for (let i = 0; i < arr.length; i++) {
        arr[i] = 0;
    }
    for (let i = 0; i < mines; i++) {
        let f = Math.floor(Math.random() * arr.length);
        if (arr[f] == 2) {
            i--;
            continue;
        }
        arr[f] = 2;
    }
}

function adjacentMines(i, j) {
    let mines = 0;
    for (let k = -1; k <= 1; k++) {
        for (let l = -1; l <= 1; l++) {
            let x = i + k;
            let y = j + l;
            if (x < 0 || y < 0 || x >= width || y >= height) continue;
            let f = (x + (y * width));
            if (arr[f] == 2) mines++;
        }
    }
    return mines;
}

function floodFill(i, j) {
    if (adjacentMines(i, j) == 0) {
        for (let k = -1; k <= 1; k++) {
            for (let l = -1; l <= 1; l++) {
                let x = i + k;
                let y = j + l;
                if (x < 0 || y < 0 || x >= width || y >= height) continue;
                let f = (x + (y * width));
                if (arr[f] == 0) {
                    if (adjacentMines(x, y) == 0) {
                        arr[f] = 1;
                        floodFill(x, y);
                    } else {
                        arr[f] = 1;
                    }
                }
            }
        }
    }
}

function updateClients(message) {
    let lose = false;
    if (message != null) {
        if (message[0] == 'f') {
            message = message.replace('f', '');
            let xy = message.split(':');
            let i = Number(xy[0]);
            let j = Number(xy[1]);
            if (arr[(i + (j * width))] == 0) arr[(i + (j * width))] = 3;
            else if (arr[(i + (j * width))] == 2) arr[(i + (j * width))] = 4;
            else if (arr[(i + (j * width))] == 3) arr[(i + (j * width))] = 0;
            else if (arr[(i + (j * width))] == 4) arr[(i + (j * width))] = 2;
        } else {
            let xy = message.split(':');
            let i = Number(xy[0]);
            let j = Number(xy[1]);
            if (arr[(i + (j * width))] == 2) {
                lose = true;
            } else {
                arr[(i + (j * width))] = 1;
                floodFill(i, j);
            }
        }
    }
    let win = true;
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] == 0 || arr[i] == 3) win = false;
    }
    for (let i = 0; i < connections.length; i++) {
        connections[i].sendUTF(JSON.stringify(arr));
        if (lose) {
            connections[i].send(0);
            reset();
        }
        if (win) {
            connections[i].send(1);
            reset();
        }
    }
}

wsServer.on('request', (request) => {
    let connection = request.accept('', request.origin);

    connections.push(connection);
    connections[connections.length - 1].sendUTF('ID:' + connections.length);

    updateClients();

    console.log((new Date()) + ' Connection accepted.');
    connection.on('message', (message) => {
        if (message.type === 'utf8') {
            updateClients(message.utf8Data);
        }
    });
    
    connection.on('close', (reasonCode, description) => {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});