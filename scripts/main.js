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

    send(message);
}

function handleLeftClick(event) {
    let x = Math.floor(mX / (width / w));
    let y = Math.floor(mY / (height / h));

    let message = 'f' + x + ':' + y;

    send(message);
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
    send('D' + ID);
});


let HOST = window.origin.replace(/^http/, 'ws')
let ws = new WebSocket(HOST);
ws.onopen = (evt) => {
    console.log('Connected');
};
ws.onclose = (evt) => {
    send(ID);
    console.log('Connection closed');
};
ws.onmessage = (evt) => {
    if (evt.data[0] == 1) {
        console.log("win");
        context.fillStyle = "#000000";
        let size = Math.min(width / 3, height / 3);
        context.font = size + "px Comic Sans MS";
        context.textAlign = 'center';
        context.fillText("You Win!", width / 2, height);
        setTimeout(function () { send('') }, 3000);
    } else if (evt.data[0] == 0) {
        console.log("lose");
        context.fillStyle = "#000000";
        let size = Math.min(width / 3, height / 3);
        context.font = size + "px Comic Sans MS";
        context.textAlign = 'center';
        context.fillText("You Lose!", width / 2, height);
        setTimeout(function () { send('') }, 3000);
    } else if (evt.data[0] == 'c') {
        playercount = event.data.replace('c', '');
        setTimeout(function () { draw(array, playercount, width, height, w, h) }, 50);
    } else if (evt.data[0] + evt.data[1] == 'ID') {
        ID = evt.data.replace('ID', '');
    } else {
        array = JSON.parse(evt.data);
        setTimeout(function () { draw(array, playercount, width, height, w, h) }, 50);
    }
};
ws.onerror = (evt) => { console.log('Connection error'); };

function send(message) {
    ws.send(message);
}

function close() {
    ws.close();
}