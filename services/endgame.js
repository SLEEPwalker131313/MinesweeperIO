var io = require('socket.io-client');
var socket = io.connect('http://localhost:5000');

socket.on('connect', function() {

	console.log('Connected to gateway');

	socket.emit('serviceEndGame');

  socket.on('endGame', function(data, cb){
    cb();
  })
});
