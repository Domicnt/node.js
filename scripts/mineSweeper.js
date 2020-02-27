//reset the board
exports.reset = function(arr, mines) {
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
    return arr;
}

//find how many mines are adjacent to a tile
exports.adjacentMines = function(i, j, arr, width, height) {
    let mines = 0;
    for (let k = -1; k <= 1; k++) {
        for (let l = -1; l <= 1; l++) {
            let x = i + k;
            let y = j + l;
            if (x < 0 || y < 0 || x >= width || y >= height) continue;
            let f = (x + (y * width));
            if (arr[f] == 2 || arr[f] == 4) mines++;
        }
    }
    return mines;
}

//fill in areas of tiles with no adjacent mines
exports.floodFill = function(i, j, arr, width, height) {
    if (exports.adjacentMines(i, j, arr, width, height) == 0) {
        for (let k = -1; k <= 1; k++) {
            for (let l = -1; l <= 1; l++) {
                let x = i + k;
                let y = j + l;
                if (x < 0 || y < 0 || x >= width || y >= height) continue;
                let f = (x + (y * width));
                if (arr[f] == 0) {
                    if (exports.adjacentMines(x, y, arr, width, height) == 0) {
                        arr[f] = 1;
                        exports.floodFill(x, y, arr, width, height);
                    } else {
                        arr[f] = 1;
                    }
                }
            }
        }
    }
}

//check if the player has won
exports.checkWin = function(arr) {
    let win = true;
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] == 0 || arr[i] == 3) win = false;
    }
    return win;
}

//update the array based on a player's click
exports.updateArr = function(arr, x, y, flagging, width, height) {
    if (flagging) {
        if (arr[(x + (y * width))] == 0) arr[(x + (y * width))] = 3;
        else if (arr[(x + (y * width))] == 2) arr[(x + (y * width))] = 4;
        else if (arr[(x + (y * width))] == 3) arr[(x + (y * width))] = 0;
        else if (arr[(x + (y * width))] == 4) arr[(x + (y * width))] = 2;
    } else {
        if (arr[(x + (y * width))] == 2) {
            arr[0] = -100;
        } else if (arr[(x + (y * width))] != 3 && arr[(x + (y * width))] != 4) {
            arr[(x + (y * width))] = 1;
            exports.floodFill(x, y, arr, width, height);
        }
    }
    if (exports.checkWin(arr)) arr[0] = 100;
    return arr;
}

//return an array of all information that the client should have
exports.returnArr = function(arr, width, height) {
    let returnArr = [];

    for (let i = 0; i < width; i++) {
        for (let j = 0; j < height; j++) {
            let f = (i + (j * width));
            //0-8 is how many adjacent mines, 9 is unclicked tile, 10 is flag
            if (arr[f] == 1) returnArr[f] = exports.adjacentMines(i, j, arr, width, height);
            else if (arr[f] == 3 || arr[f] == 4) returnArr[f] = 10;
            else returnArr[f] = 9;
        }
    }

    return returnArr;
}