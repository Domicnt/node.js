let canvas = document.getElementById('canvas');
let context = document.getElementById('canvas').getContext('2d');

let width = window.innerWidth - 2;
let height = window.innerHeight - 4;

context.canvas.width = width;
context.canvas.height = height;

let w = 32;
let h = 18;

let win = false;
let lose = false;

canvas.addEventListener('click', function () {
    let x = Math.floor(event.clientX / (width / w));
    let y = Math.floor(event.clientY / (height / h));

    let message = x + ':' + y;

    send(message);
}, false);
canvas.addEventListener('contextmenu', function (event) {
    event.preventDefault();
    let x = Math.floor(event.clientX / (width / w));
    let y = Math.floor(event.clientY / (height / h));

    let message = 'f' + x + ':' + y;

    send(message);
    return false;
}, false);

let ws;

function buildwebsocket() {
    let HOST = window.origin.replace(/^http/, 'ws')
    ws = new WebSocket(HOST);
    ws.onopen = (evt) => { console.log('Connected'); };
    ws.onclose = (evt) => { console.log('Connection closed'); };
    ws.onmessage = (evt) => {
        if (evt.data[0] == 1) {
            console.log("win");
            context.fillStyle = "#000000";
            let size = Math.min(width / 3, height / 3);
            context.font = size + "px Comic Sans MS";
            context.fillText("You Win!", 0, height);
            setTimeout(function () { send() }, 3000);
        } else if (evt.data[0] == 0) {
            console.log("lose");
            context.fillStyle = "#000000";
            let size = Math.min(width / 3, height / 3);
            context.font = size + "px Comic Sans MS";
            context.fillText("You Lose!", 0, height);
            setTimeout(function () { send() }, 3000);
        } else {
            let arr = JSON.parse(evt.data);
            draw(arr);
        }
    };
    ws.onerror = (evt) => { console.log('Connection error'); };
}

buildwebsocket();

function send(message) {
    ws.send(message);
}

function close() {
    ws.close();
}

function draw(arr) {
    for (let i = 0; i < w; i++) {
        for (let j = 0; j < h; j++) {
            if (arr[i + (j * w)] == 1) {
                context.fillStyle = "#000000";
                context.fillRect(i * width / w, j * height / h, width / w, height / h);
                let mines = 0;
                for (let k = -1; k <= 1; k++) {
                    for (let l = -1; l <= 1; l++) {
                        let x = i + k;
                        let y = j + l;
                        if (x < 0 || y < 0 || x >= w || y >= h) continue;
                        let f = (x + (y * w));
                        if (arr[f] == 2 || arr[f] == 4) mines++;
                    }
                }
                context.fillStyle = "#FFFFFF";
                let size = Math.min(width / w, height / h);
                context.font = size + "px Comic Sans MS";
                context.fillText(mines, i * width / w + (width/w/5), (j+1) * height / h - (height/h/10));//random jank to align text
            } else if (arr[i + (j * w)] == 3 || arr[i + (j * w)] == 4) {
                context.fillStyle = "#FF0000";
                context.fillRect(i * width / w, j * height / h, width / w, height / h);
            } else {
                context.fillStyle = "#FFFFFF";
                context.fillRect(i * width / w, j * height / h, width / w, height / h);
            }
        }
    }
    for (let i = 0; i < h; i++) {
        //horizontal lines
        context.fillStyle = "#000000";
        context.beginPath();
        context.moveTo(0, i * height / h);
        context.lineTo(width, i * height / h);
        context.stroke();
    }
    for (let i = 0; i < w; i++) {
        //vertical lines
        context.fillStyle = "#000000";
        context.beginPath();
        context.moveTo(i * width / w, 0);
        context.lineTo(i * width / w, height);
        context.stroke();
    }
}