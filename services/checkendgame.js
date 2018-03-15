var io = require('socket.io-client');
var socket = io.connect('http://localhost:5000');

socket.on('connect', function() {

	console.log('Connected to gateway');

	socket.emit('serviceCheckGameEnd');

  socket.on('checkEndGame', function(x, y, field, board, maxx, maxy, cb){
    var end = 'win';
    for(arr in field){
      if (field[arr].toString() != 'true' && board[arr].toString().indexOf('open') != -1){
      } else if (field[arr].toString() != 'true' && board[arr].toString().indexOf('open') == -1){
        end = 'none';
        break;
      }
    }
    cb(end);
  });
});
