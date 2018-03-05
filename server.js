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


server.listen(PORT, function() {
    console.log('Starting server on port 5000');
});


io.on('connection', function(socket) {
  socket.on('new-player', function(data, callback) {
    console.log(data.name + ' user connected');
    });

  socket.on('disconnect', function() {
    console.log(socket.id);
    console.log('disconnect');
  });

});
