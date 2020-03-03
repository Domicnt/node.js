//let canvas = document.getElementById('canvas');
//let context = canvas.getContext('2d');

let width = window.innerWidth;
let height = window.innerHeight;

context.canvas.width = width;
context.canvas.height = height;

let w = 32;
let h = 18;

let win = false;
let lose = false;

let playercount;
let scores = [];

let array = [];

let ID = '';

let mX = width;
let mY = height;

function mousePos() {
    let arr = [];
    arr.length = 2;
    arr[0] = mX;
    arr[1] = mY;
    return arr;
}

function handleClick(event) {
    let x = Math.floor(mX / (width / w));
    let y = Math.floor(mY / (height / h));

    let message = x + ':' + y;

    send('c', message);
}

function handleLeftClick(event) {
    let x = Math.floor(mX / (width / w));
    let y = Math.floor(mY / (height / h));

    let message = x + ':' + y;

    send('f', message);
}

canvas.addEventListener('click', function (event) {
    handleClick(event);
}, false);
canvas.addEventListener('contextmenu', function (event) {
    event.preventDefault();
    handleLeftClick(event);
    return false;
}, false);
canvas.addEventListener('mousemove', function (event) {
    mX = event.clientX;
    mY = event.clientY;
}, false);

let sidebar = document.getElementById('sidebar');
sidebar.addEventListener('click', function (event) {
    handleClick(event);
}, false);
sidebar.addEventListener('contextmenu', function (event) {
    event.preventDefault();
    handleLeftClick(event);
    return false;
}, false);
sidebar.addEventListener('mousemove', function (event) {
    mX = event.clientX;
    mY = event.clientY;
}, false);

window.addEventListener("beforeunload", function (event) {
    send('d', '');
});


let HOST = window.origin.replace(/^http/, 'ws')
let ws = new WebSocket(HOST);
ws.onopen = (evt) => {
    console.log('Connected');
};
ws.onclose = (evt) => {
    console.log('Connection closed');
};
ws.onmessage = (evt) => {
    switch (evt.data[0]) {
        case 'l':
            //lose
            //clear screen
            context.fillStyle = "#FFFFFF";
            context.fillRect(0, 0, width, height);
            context.fillStyle = "#000000";
            context.font = Math.min(width / 3, height / 3) + "px Comic Sans MS";
            context.textAlign = 'center';
            context.fillText("You Lose!", width / 2, height / 2 + height / 6);
            setTimeout(function () { send('') }, 3000);
            break;
        case 'w':
            //win
            //clear screen
            context.fillStyle = "#FFFFFF";
            context.fillRect(0, 0, width, height);
            context.fillStyle = "#000000";
            context.font = Math.min(width / 3, height / 3) + "px Comic Sans MS";
            context.textAlign = 'center';
            context.fillText("You Win!", width / 2, height);
            setTimeout(function () { send('') }, 3000);
            break;
        case 'i':
            //identicifation
            ID = evt.data.replace('i', '');
            break;
        case 'c':
            //connection amount
            playercount = event.data.replace('c', '');
            setTimeout(function () { draw(array, playercount, scores, width, height, w, h) }, 50);
            break;
        case 's':
            //scores
            scores = JSON.parse(event.data.replace('s', ''));
            setTimeout(function () { draw(array, playercount, scores, width, height, w, h) }, 50);
            break;
        default:
            //update array
            array = JSON.parse(evt.data);
            setTimeout(function () { draw(array, playercount, scores, width, height, w, h) }, 50);
            break;
    }
};
ws.onerror = (evt) => { console.log('Connection error'); };

function send(value, message) {
    ws.send(ID + value + message);
}

function close() {
    ws.close();
}