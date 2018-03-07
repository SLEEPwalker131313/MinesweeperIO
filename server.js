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

var players = [];

var Minesweeper = require('./models/game.js');
var countGames = 0, countPlayers = [],  Game = new Minesweeper();

setInterval(function() {
    gameStats();
    // console.log(Game.users);
    // console.log(Game.users[0]);
    // io.sockets.emit('user_list', 'hi');
    // console.log(Game);
    // console.log(typeof(Game.users));
    // console.log(Object.keys(Game.users));
    // io.sockets.emit('user_list', Object.keys(Game.users))
}, 5000);

server.listen(PORT, function() {
    console.log('Starting server on port 5000');
    console.log(Minesweeper);
    console.log(Game);
    // Game.start();
});


io.on('connection', function(socket) {
  gameStats();
  // socket.on('new-player', function(data, callback) {
  //   console.log(data.name + ' user connected');
  //   Game.users[socket.id] = data.name;
  //
  //   // socket.emit('socket_log', io.sockets);
  //   console.log(io.sockets.sockets[socket.id].id);
  // });

  function closeRoom(gameId, opponent) {
    socket.leave(gameId);
    io.sockets.sockets[opponent].leave(gameId);
    countGames--;
  }

  // setInterval(function() {
  //   console.log(Game);
  // }, 5000);

  socket.on('start', function () {
    console.log('start');
    console.log('start');
    console.log('start');
    console.log('start');
    console.log('User with md5 ' + socket.id + ' expects the opponent to start the match');
    Game.users[socket.id] = true;
    // if(Game.users[socket.id] !== undefined) {
    //   console.log('if(Game.users[socket.id] !== undefined)');
    //   return;
    // }
    Game.start(socket.id.toString(), function(start, gameId, opponent, x, y){
      console.log('start? ' + start);
        if(start) {
            // Game.games[gameId].on('timeout', function(user) {
            //     Game.end(user, function(gameId, opponent, turn) {
            //         io.sockets.in(gameId).emit('timeout', turn);
            //         closeRoom(gameId, opponent);
            //     });
            // });

            // Подключем к игре соперников в отдельную комнату
            console.log(opponent);
            socket.join(gameId);
            io.sockets.sockets[opponent].join(gameId);
            console.log('ready gameId: ' + gameId + ' x: ' +x + ' y: ' + y);
            socket.emit('ready', gameId, 'X', x, y);
            io.sockets.sockets[opponent].emit('ready', gameId, 'O', x, y);
            countGames++;
        } else {
            // ожидает аппонента
            console.log('wait');
            io.sockets.sockets[socket.id].emit('wait');

        }
        gameStats();
        console.log(Game);
    });

    // if(Game.users[socket.id] !== undefined) return;
    // Game.start(socket.id.toString(), function(start, gameId, opponent, x, y){
    //     if(start) {
    //         Game.games[gameId].on('timeout', function(user) {
    //             Game.end(user, function(gameId, opponent, turn) {
    //                 io.sockets.in(gameId).emit('timeout', turn);
    //                 closeRoom(gameId, opponent);
    //             });
    //         });
    //
    //         // Подключем к игре соперников в отдельную комнату
    //         socket.join(gameId);
    //         io.sockets.socket(opponent).join(gameId);
    //         socket.emit('ready', gameId, 'X', x, y);
    //         io.sockets.socket(opponent).emit('ready', gameId, 'O', x, y);
    //         countGames++;
    //     } else {
    //         // ожидает аппонента
    //         io.sockets.socket(socket.id).emit('wait');
    //     }
    // });
    // console.log("start");
    // console.log(Game);
  });

  socket.on('step', function (gameId, id) {
    console.log('stepp gameId: ' + gameId + ' id: ' + id);
    // console.log('Game.games[gameId] === undefined' + Game.games[gameId] === undefined + '');
    if(Game.games[gameId] === undefined) return;
    // Парсим из ID элемента координаты XxY
    console.log('serverstep2');
    var coordinates = id.split('x');
    Game.step(gameId, parseInt(coordinates[0]), parseInt(coordinates[1]), socket.id.toString(), function(win, turn) {
      console.log('io.sockets.in(gameId)');
      console.log(io.sockets.in(gameId));
        io.sockets.in(gameId).emit('step', id, turn, win);
        if(win) {
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
  io.sockets.emit('stats', [
      'Всего игр: ' + countGames,
      'Уникальных игроков: ' + Object.keys(countPlayers).length,
      'Сейчас игр: ' + Object.keys(Game.games).length,
      'Сейчас игроков: ' + Object.keys(Game.users).length
  ]);
}
