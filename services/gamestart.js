var io = require('socket.io-client');
var socket = io.connect('http://localhost:5000');

socket.on('connect', function() {

	console.log('Connected to gateway');

	socket.emit('serviceGameStart');

  socket.on('gameStart', function(free, x, y, numberOfMines, cb){
    if(free.length > 0) {
        var opponent = free.shift();
        function getRandomInRange(min, max) {
          return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        var field1 = [];
        var board = [];
        for (var rows = 1; rows <= x; rows++) {
          for (var cols = 1; cols <= y; cols++){
            field1[rows+'x'+cols] = board[rows+'x'+cols] = false;
          }
        }
        var mines = 0;
        var irow, icol;
        while(mines < numberOfMines) {
          irow = getRandomInRange(1, x);
          icol = getRandomInRange(1, y);
          if(field1[irow+'x'+icol] == false){
            field1[irow+'x'+icol] = true;
            ++mines;
          }
        }

        function mineAt(x, y, maxx, maxy) {
          if(y >= 1 && y <= maxy && x >= 1 && x <= maxx && field1[x+'x'+y] === true) {
            return 1;
          } else {
            return 0;
          }
        }

        function minesNear(x, y, maxx, maxy){
          var mines = 0;
          mines += mineAt(x - 1, y - 1, maxx, maxy);
          mines += mineAt(x - 1, y, maxx, maxy);
          mines += mineAt(x - 1, y + 1, maxx, maxy);
          mines += mineAt(x, y - 1, maxx, maxy);
          mines += mineAt(x, y + 1, maxx, maxy);
          mines += mineAt(x + 1, y - 1, maxx, maxy);
          mines += mineAt(x + 1, y, maxx, maxy);
          mines += mineAt(x + 1, y + 1, maxx, maxy);
          return mines;
        }

        for (var rows = 1; rows <= x; rows++) {
          for (var cols = 1; cols <= y; cols++){
            if(field1[rows+'x'+cols] !== true){
              field1[rows+'x'+cols] = minesNear(rows,cols, x, y);
            }
          }
        }

        // var game = new GameItem(user, opponent, x, y, numberOfMines, field1, board);
        var id = [
            Math.random() * 0xffff | 0
            , Math.random() * 0xffff | 0
            , Math.random() * 0xffff | 0
            , Date.now()
        ].join('-');

        var sendField = Object.keys(field1).map(function (key) { return field1[key]; });
        var sendBoard = Object.keys(board).map(function (key) { return board[key]; });

        cb(true, id, opponent, x, y, numberOfMines, sendField, sendBoard);
    } else {
      //wait for game
        cb(false);
    }

  });

});
