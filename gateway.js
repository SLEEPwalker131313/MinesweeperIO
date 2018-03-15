var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var app = express();
var server = http.Server(app);
var io = socketIO(server);
var PORT = 5000;
app.set('port', PORT);
app.use('/static', express.static(__dirname + '/static'));

app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname, 'index.html'));
});

// var Minesweeper = require('./models/game.js');
var util = require('util'), EventEmitter = require('events').EventEmitter;

//Main
var Minesweeper = module.exports = function() {
    // Init
    EventEmitter.call(this);
    // Games collection
    this.games = [];
    // Users array
    this.users = [];
    // Wait users array
    this.free = [];
    // Board size
    this.x = 16;
    this.y = 30;
    // Mines count
    this.numberOfMines = 59; //default 99
}
util.inherits(Minesweeper, EventEmitter);
var GameItem = function(user, opponent, x, y, numberOfMines, field1, board) {
    // EventEmitter.call(this);
    // Users action board
    this.board = board;
    // Real board
    this.field = field1;
    // Players
    this.user = user;
    this.opponent = opponent;
    // Board size
    this.x = x;
    this.y = y;
    //Count of mines
    this.numberOfMines = numberOfMines;
    //Step variable
    this.openFieldPart = [];
}

var countGames = 0, countPlayers = [],  Game = new Minesweeper();
var serviceGameStart, serviceUserMove, serviceCheckGameEnd, serviceEndGame;

setInterval(function() {
    gameStats();
}, 5000);

server.listen(PORT, function() {
    console.log('Starting server on port 5000');
});


io.on('connection', function(socket) {
  gameStats();
  function closeRoom(gameId, opponent) {
    socket.leave(gameId);
    io.sockets.sockets[opponent].leave(gameId);
    // countGames--;
  }

  //services
  socket.on('serviceGameStart', function(){
    console.log('Game service connected');
    serviceGameStart = socket;
  });
  socket.on('serviceUserMove', function(){
    console.log('User move service connected');
    serviceUserMove = socket;
  });
  socket.on('serviceCheckGameEnd', function(){
    console.log('Check end game service connected');
    serviceCheckGameEnd = socket;
  });
  socket.on('serviceEndGame', function(){
    console.log('End game service connected');
    serviceEndGame = socket;
  });

  ///////////////////////////
  socket.on('start', function (startGame, cb) {

    console.log(Object.keys(Game.free));
    if(serviceGameStart){
      serviceGameStart.emit('gameStart', Object.keys(Game.free), Game.x, Game.y, Game.numberOfMines, function(start, gameId, opponent, x, y, numberOfMines, field, board){
        if(start){
          console.log('started');
          delete Game.free[opponent];

          var f = [];
          var b = [];
          var iter = 0;
          for (var rows = 1; rows <= x; rows++) {
            for (var cols = 1; cols <= y; cols++){
              f[rows+'x'+cols] = field[iter];
              b[rows+'x'+cols] = board[iter++];
            }
          }

          var game = new GameItem(socket.id, opponent, x, y, numberOfMines, f, b);
          Game.games[gameId] = game;
          Game.users[socket.id] = gameId;
          Game.users[opponent] = gameId;

          socket.join(gameId);
          io.sockets.sockets[opponent].join(gameId);

          socket.emit('ready', gameId, x, y);
          io.sockets.sockets[opponent].emit('ready', gameId, x, y);
          countGames++;
          cb();
        } else{
          console.log('wait');
          Game.free[socket.id] = true;
          io.sockets.sockets[socket.id].emit('wait');
          cb();
        }
      });
    }
  });

  socket.on('step', function (gameId, id, symbol) {
    if(Game.games[gameId] === undefined) return;
    var coordinates = id.split('x');
    var sendField = Object.keys(Game.games[gameId].field).map(function (key) { return Game.games[gameId].field[key]; });
    var sendBoard = Object.keys(Game.games[gameId].board).map(function (key) { return Game.games[gameId].board[key]; });

    serviceUserMove.emit('userMove', gameId, parseInt(coordinates[0]),
      parseInt(coordinates[1]), socket.id.toString(), symbol, sendField,
      sendBoard, Game.games[gameId].x, Game.games[gameId].y,
      function(win, x, y, openFieldPart, mineFlag, alreadyChecked, flagIsYours, f, b){
        var boardItemCount = 0;
        for(var iter in Game.games[gameId].board){
          Game.games[gameId].board[iter] = b[boardItemCount++];
        }

      //If game is not over
      if(win == 'check'){
        serviceCheckGameEnd.emit('checkEndGame', x, y, f, b, Game.games[gameId].x, Game.games[gameId].y, function(end){
            if(end == 'none'){
              //check mine
              if(mineFlag){

                if(socket.id == Game.games[gameId].user){
                  io.sockets.sockets[Game.games[gameId].user].emit('findMine',
                  openFieldPart, end, Game.games[gameId].user === socket.id,
                  alreadyChecked, flagIsYours );
                  io.sockets.sockets[Game.games[gameId].opponent].emit('findMine',
                  openFieldPart, end, Game.games[gameId].opponent === socket.id,
                  alreadyChecked, !flagIsYours );
                } else{
                  io.sockets.sockets[Game.games[gameId].user].emit('findMine',
                  openFieldPart, end, Game.games[gameId].user === socket.id,
                  alreadyChecked, !flagIsYours );
                  io.sockets.sockets[Game.games[gameId].opponent].emit('findMine',
                  openFieldPart, end, Game.games[gameId].opponent === socket.id,
                  alreadyChecked, flagIsYours );
                }
              } else{ //non-mine step
                var sendField = [];
                for(tmp in openFieldPart){
                  sendField.push(Game.games[gameId].field[openFieldPart[tmp]]);
                }
                io.sockets.sockets[Game.games[gameId].user].emit('step',
                openFieldPart, sendField, end, Game.games[gameId].user === socket.id);
                io.sockets.sockets[Game.games[gameId].opponent].emit('step',
                openFieldPart, sendField, end, Game.games[gameId].opponent === socket.id);

              }
            }


        });
      } else {  //Game is over
        var sendField = Object.keys(Game.games[gameId].field)
        .map(function (key) { return Game.games[gameId].field[key]; });
        var sendBoard = Object.keys(Game.games[gameId].board)
        .map(function (key) { return Game.games[gameId].board[key]; });
        io.sockets.sockets[Game.games[gameId].user].emit('endGame',
        openFieldPart, win, Game.games[gameId].user === socket.id,
        sendField, sendBoard);
        io.sockets.sockets[Game.games[gameId].opponent].emit('endGame',
        openFieldPart, win, Game.games[gameId].opponent === socket.id,
        sendField, sendBoard);

        serviceEndGame.emit('endGame', win, function(data){
          delete Game.free[socket.id];
          if(Game.users[socket.id] === undefined) return;
          var gameId = Game.users[socket.id];
          if(Game.games[gameId] === undefined) return;
          var game = Game.games[gameId];
          var opponent = (socket.id == game.user ? game.opponent : game.user);
          delete Game.games[gameId];
          game = null;
          delete Game.users[socket.id];
          closeRoom(gameId, opponent);
        });
    }
    });
  });

  socket.on('disconnect', function() {
    console.log(socket.id);
    console.log('disconnect');
    delete Game.users[socket.id];
  });

});


function gameStats(){
  io.sockets.emit('stats', Object.keys(Game.games).length, countGames, Object.keys(Game.users).length);
}
