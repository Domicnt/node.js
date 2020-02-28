//reset the board
exports.reset = function (arr, mines) {
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr[i].length; j++) {
            arr[i][j] = 0;
        }
    }
    for (let i = 0; i < mines; i++) {
        iX = Math.floor(Math.random() * arr.length);
        iY = Math.floor(Math.random() * arr[0].length);
        if (arr[iX][iY] == 2) {
            i--;
        } else {
            arr[iY][iX] = 2;
        }
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
            if (arr[x][y] == 2 || arr[x][y] == 4) mines++;
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
                if (arr[x][y] == 0) {
                    if (exports.adjacentMines(x, y, arr, width, height) == 0) {
                        arr[x][y] = 1;
                        exports.floodFill(x, y, arr, width, height);
                    } else {
                        arr[x][y] = 1;
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
        for (let j = 0; j < arr[i].length; j++) {
            if (arr[i][j] == 0 || arr[i][j] == 3) win = false;
        }
    }
    return win;
}

//update the array based on a player's click
exports.updateArr = function(arr, x, y, flagging, width, height) {
    if (flagging) {
        if (arr[x][y] == 0) arr[x][y] = 3;
        else if (arr[x][y] == 2) arr[x][y] = 4;
        else if (arr[x][y] == 3) arr[x][y] = 0;
        else if (arr[x][y] == 4) arr[x][y] = 2;
    } else {
        if (arr[x][y] == 2) {
            arr[0][0] = -100;
        } else if (arr[x][y] != 3 && arr[x][y] != 4) {
            arr[x][y] = 1;
            exports.floodFill(x, y, arr, width, height);
        }
    }
    if (exports.checkWin(arr)) arr[0][0] = 100;
    return arr;
}

//return an array of all information that the client should have
exports.returnArr = function(arr, width, height) {
    let returnArr = []; // 0 is unclicked and not mine, 1 is clicked, 2 is unclicked and mine, 3 is flag, 4 is flagged mine
    returnArr.length = width;
    for (let i = 0; i < returnArr.length; i++) {
        returnArr[i] = [];
        returnArr[i].length = height;
        for (let j = 0; j < returnArr[i]; j++) {
            returnArr[i][j] = 0;
        }
    }

    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr[i].length; j++) {
            //0-8 is how many adjacent mines, 9 is unclicked tile, 10 is flag
            if (arr[i][j] == 1) returnArr[i][j] = exports.adjacentMines(i, j, arr, width, height);
            else if (arr[i][j] == 3 || arr[i][j] == 4) returnArr[i][j] = 10;
            else returnArr[i][j] = 9;
        }
    }

    return returnArr;
}