let canvas = document.getElementById('canvas');
let context = canvas.getContext('2d');

//load images
let empty = new Image();
empty.src = 'images/empty.png';
let blank = new Image();
blank.src = 'images/blank.png';
let flag = new Image();
flag.src = 'images/flag.png';
let one = new Image();
one.src = 'images/1.png';
let two = new Image();
two.src = 'images/2.png';
let three = new Image();
three.src = 'images/3.png';
let four = new Image();
four.src = 'images/4.png';
let five = new Image();
five.src = 'images/5.png';
let six = new Image();
six.src = 'images/6.png';
let seven = new Image();
seven.src = 'images/7.png';
let eight = new Image();
eight.src = 'images/8.png';

//draw the board
function draw(arr, playercount, scores, num, width, height, w, h) {
    if (arr.length != w || arr[0].length != h) {
        return;
    }

    //clear screen
    context.fillStyle = "#FFFFFF";
    context.fillRect(0, 0, width, height);

    //draw squares
    for (let i = 0; i < w; i++) {
        for (let j = 0; j < h; j++) {
            switch (arr[i][j]) {
                case 0:
                    context.drawImage(empty, i * width / w, j * height / h, width / w, height / h);
                    break;
                case 1:
                    context.drawImage(one, i * width / w, j * height / h, width / w, height / h);
                    break;
                case 2:
                    context.drawImage(two, i * width / w, j * height / h, width / w, height / h);
                    break;
                case 3:
                    context.drawImage(three, i * width / w, j * height / h, width / w, height / h);
                    break;
                case 4:
                    context.drawImage(four, i * width / w, j * height / h, width / w, height / h);
                    break;
                case 5:
                    context.drawImage(five, i * width / w, j * height / h, width / w, height / h);
                    break;
                case 6:
                    context.drawImage(six, i * width / w, j * height / h, width / w, height / h);
                    break;
                case 7:
                    context.drawImage(seven, i * width / w, j * height / h, width / w, height / h);
                    break;
                case 8:
                    context.drawImage(eight, i * width / w, j * height / h, width / w, height / h);
                    break;
                case 9:
                    context.drawImage(blank, i * width / w, j * height / h, width / w, height / h);
                    break;
                case 10:
                    context.drawImage(flag, i * width / w, j * height / h, width / w, height / h);
                    break;
                default:
                    context.drawImage(blank, i * width / w, j * height / h, width / w, height / h);
                    break;
            }
        }
    }

    lines(width, height, w, h);

    info(playercount, scores, num);
}

//draw lines between squares
function lines(width, height, w, h) {
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

//draw info about the game - amount of players etc
function info(playercount, scores, num) {
    let sidebarText = document.getElementById('sidebarText');
    sidebarText.innerHTML = "You are player #" + num + "<br>";
    if (playercount == 1) {
        sidebarText.innerHTML += playercount + " Player Connected.";    
    } else {
        sidebarText.innerHTML += playercount + " Players Connected.";    
    }
    for (let i = 0; i < Math.min(scores.length, 10); i++) {
        sidebarText.innerHTML += "<br> Player " + (i + 1) + "'s score: " + scores[i];
    }
}