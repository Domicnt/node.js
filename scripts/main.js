let canvas = document.getElementById('pong');
let context = document.getElementById('pong').getContext('2d');

let width = window.innerWidth - 2;
let height = window.innerHeight - 4;

context.canvas.width = width;
context.canvas.height = height;

let ID = 0;

let ws;

buildwebsocket();
function buildwebsocket() {
    ws = new WebSocket(location.origin.replace(/^http/, 'ws'));
    ws.onopen = (evt) => { console.log('Connected'); };
    ws.onclose = (evt) => { console.log('Connection closed'); };
    ws.onmessage = (evt) => {
        if (evt.data.slice(0, 3) == 'ID:') {
            ID = evt.data.split(':', 2)[1];
        }
        else {
            context.clearRect(0, 0, width, height);
            let playersData = evt.data.split('|');
            for (let i = 0; i < playersData.length; i++) {
                let playerData = playersData[i].split(':');
                context.beginPath();
                context.arc(playerData[0], playerData[1], playerData[2], 0, 2 * Math.PI);
                context.stroke();
            }
        }

        console.log('Message: ' + evt.data);
    };
    ws.onerror = (evt) => { console.log('Connection error'); };
}

function send(message) {
    console.log("SENT: " + message); 
    ws.send(ID + ':' + message);
}

var keyArr = [];
document.onkeydown = (event) => {
    event = event || window.event;
    let charCode = event.keyCode || event.which;
    keyArr[charCode] = true;
}
document.onkeyup = (event) => {
    event = event || window.event;
    let charCode = event.keyCode || event.which;
    keyArr[charCode] = false;
}


function sendKeys() {
    for (let i = 0; i < keyArr.length; i++) {
        if (keyArr[i] === true) {
            send(String.fromCharCode(i));
        }
    }
}

setInterval(sendKeys, 50);

function close() {
    ws.close();
}