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

var Minesweeper = require('./models/game.js');
var countGames = 0, countPlayers = [],  Game = new Minesweeper();

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

  socket.on('start', function () {

    Game.users[socket.id] = true;
    Game.start(socket.id.toString(), function(start, gameId, opponent, x, y){
        if(start) {

            // Create game room
            socket.join(gameId);
            io.sockets.sockets[opponent].join(gameId);

            socket.emit('ready', gameId, x, y);
            io.sockets.sockets[opponent].emit('ready', gameId, x, y);
            countGames++;
        } else {
          //wait for another player
            io.sockets.sockets[socket.id].emit('wait');
        }
        gameStats();
    });
  });

  socket.on('step', function (gameId, id, symbol) {
    if(Game.games[gameId] === undefined) return;
    var coordinates = id.split('x');
    console.log(coordinates);
    Game.step(gameId, parseInt(coordinates[0]), parseInt(coordinates[1]),
    socket.id.toString(), symbol, function(win, openFieldPart, mineFlag,
      alreadyChecked, flagIsYours) {
      //If game is not over
        if(win == 'none'){
          //check mine
          if(mineFlag){

            if(socket.id == Game.games[gameId].user){
              io.sockets.sockets[Game.games[gameId].user].emit('findMine',
              openFieldPart, win, Game.games[gameId].user === socket.id,
              alreadyChecked, flagIsYours );
              io.sockets.sockets[Game.games[gameId].opponent].emit('findMine',
              openFieldPart, win, Game.games[gameId].opponent === socket.id,
              alreadyChecked, !flagIsYours );
            } else{
              io.sockets.sockets[Game.games[gameId].user].emit('findMine',
              openFieldPart, win, Game.games[gameId].user === socket.id,
              alreadyChecked, !flagIsYours );
              io.sockets.sockets[Game.games[gameId].opponent].emit('findMine',
              openFieldPart, win, Game.games[gameId].opponent === socket.id,
              alreadyChecked, flagIsYours );
            }
          } else{ //non-mine step
            var sendField = [];
            for(tmp in openFieldPart){
              sendField.push(Game.games[gameId].field[openFieldPart[tmp]]);
            }
            io.sockets.sockets[Game.games[gameId].user].emit('step',
            openFieldPart, sendField, win, Game.games[gameId].user === socket.id);
            io.sockets.sockets[Game.games[gameId].opponent].emit('step',
            openFieldPart, sendField, win, Game.games[gameId].opponent === socket.id);

          }
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
          Game.end(socket.id.toString(), function(gameId, opponent){
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
