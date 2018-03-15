var io = require('socket.io-client');
var socket = io.connect('http://localhost:5000');

socket.on('connect', function() {

	console.log('Connected to gateway');

	socket.emit('serviceUserMove');

  socket.on('userMove', function(gameId, x, y, user, symbol, f, b, maxx, maxy, cb){

      var field = [];
      var board = [];
      var iter = 0;
      for (var rows = 1; rows <= maxx; rows++) {
        for (var cols = 1; cols <= maxy; cols++){
          field[rows+'x'+cols] = f[iter];
          board[rows+'x'+cols] = b[iter++];
        }
      }
      
        if(board[x+'x'+y].toString().indexOf('open') != -1){ //Smart oppening
          if(field[x+'x'+y] == 0){
            return;
          } else {
            if(nearMinesFind(x, y, maxx, maxy, b) == field[x+'x'+y]){ // >= maybe
              openFieldPart = [];  //???
              logNearSpace(x - 1, y - 1, maxx, maxy, f, b, openFieldPart);
              logNearSpace(x - 1, y, maxx, maxy, f, b, openFieldPart);
              logNearSpace(x - 1, y + 1, maxx, maxy, f, b, openFieldPart);
              logNearSpace(x, y - 1, maxx, maxy, f, b, openFieldPart);
              logNearSpace(x, y + 1, maxx, maxy, f, b, openFieldPart);
              logNearSpace(x + 1, y - 1, maxx, maxy, f, b, openFieldPart);
              logNearSpace(x + 1, y, maxx, maxy, f, b, openFieldPart);
              logNearSpace(x + 1, y + 1, maxx, maxy, f, b, openFieldPart);

              for(arr in openFieldPart){
                //game over without  additional checking
                if(field[openFieldPart[arr]].toString() == 'true'){
                  // console.log('openFieldPart: ' + openFieldPart);
                  var sendField = Object.keys(field).map(function (key) { return field[key]; });
                  var sendBoard = Object.keys(board).map(function (key) { return board[key]; });
                  cb('boom', x, y, openFieldPart, false, false, true, sendField, sendBoard);
                  return;
                }
                board[openFieldPart[arr]] = user+'openmine';
              }
              var sendField = Object.keys(field).map(function (key) { return field[key]; });
              var sendBoard = Object.keys(board).map(function (key) { return board[key]; });
              // console.log('openFieldPart: ' + openFieldPart);
              cb('check', x, y, openFieldPart, false, false, true, sendField, sendBoard);   //checkEndGame(x, y)
              return;
            } else {
              return;
            }
          }
        } else {  //Non-smart
          if(symbol == 'Mine Flag'){  //Flag
            openFieldPart = [];  //Clear for this step
            var flagIsYours = true;
            if(board[x+'x'+y].toString() == 'false'){  //Non-checked
              board[x+'x'+y] = user+'findmine';
              openFieldPart.push(x+'x'+y);
              var sendField = Object.keys(field).map(function (key) { return field[key]; });
              var sendBoard = Object.keys(board).map(function (key) { return board[key]; });
              // console.log('openFieldPart: ' + openFieldPart);
              cb('check', x, y, openFieldPart, true, false, user, sendField, sendBoard);   //checkEndGame(x, y)
              return;
            } else if(board[x+'x'+y].indexOf('find') != -1){ //Already checked
              openFieldPart.push(x+'x'+y);
              flagIsYours = (board[x+'x'+y].toString().indexOf(user) != -1);
              board[x+'x'+y] = false;
              var sendField = Object.keys(field).map(function (key) { return field[key]; });
              var sendBoard = Object.keys(board).map(function (key) { return board[key]; });
              // console.log('openFieldPart: ' + openFieldPart);
              cb('check', x, y, openFieldPart, true, true, flagIsYours, sendField, sendBoard);   //checkEndGame(x, y)
              return;
            }

          } else {  //Open field
            if(board[x+'x'+y]!= false){
              //Non-checked item
              if(board[x+'x'+y].indexOf('find') != -1 ){
                return;
              }
              //Non-oppened item after amsrt oppening
              if(board[x+'x'+y].indexOf('open') != -1){
                return;
              }
            }
          openFieldPart = [];
          if(field[x + 'x' + y] === true){
            openFieldPart.push(x+'x'+y);
            //Game over without checking
            // console.log('non-smart boom openFieldPart: ' + openFieldPart);
            var sendField = Object.keys(field).map(function (key) { return field[key]; });
            var sendBoard = Object.keys(board).map(function (key) { return board[key]; });
            cb('boom', x, y, openFieldPart, false, false, true, sendField, sendBoard);
            return;
          } else{
            //Open near
            // console.log('log near');
            // console.log('openFieldPart before log near: ' + openFieldPart);
            logNearSpace(x, y, maxx, maxy, f, b, openFieldPart);
            // console.log('openFieldPart after log near: ' + openFieldPart);
          }
          board[x+'x'+y] = user+'openmine';
          for(arr in openFieldPart){
            board[openFieldPart[arr]] = user+'openmine';
          }
          var sendField = Object.keys(field).map(function (key) { return field[key]; });
          var sendBoard = Object.keys(board).map(function (key) { return board[key]; });
          // console.log('openFieldPart: ' + openFieldPart);
          cb('check', x, y, openFieldPart, false, false, true, sendField, sendBoard);   //checkEndGame(x, y)
          return;
        }
      }
    // }

  });

});


function mineAt(x, y, maxx, maxy, b) {
  var board = [];
  var iter = 0;
  for (var rows = 1; rows <= maxx; rows++) {
    for (var cols = 1; cols <= maxy; cols++){
      board[rows+'x'+cols] = b[iter++];
    }
  }

  if(y >= 1 && y <= maxy && x >= 1 && x <= maxx
    && board[x+'x'+y].toString().indexOf('find') != -1) {
    return 1;
  } else {
    return 0;
  }
}

function nearMinesFind(x, y, maxx, maxy, b){
  var mines = 0;
  mines += mineAt(x - 1, y - 1, maxx, maxy, b);
  mines += mineAt(x - 1, y, maxx, maxy, b);
  mines += mineAt(x - 1, y + 1, maxx, maxy, b);
  mines += mineAt(x, y - 1, maxx, maxy, b);
  mines += mineAt(x, y + 1, maxx, maxy, b);
  mines += mineAt(x + 1, y - 1, maxx, maxy, b);
  mines += mineAt(x + 1, y, maxx, maxy, b);
  mines += mineAt(x + 1, y + 1, maxx, maxy, b);
  return mines;
}

function logNearSpace(x, y, maxx, maxy, f, b, openFieldPart){
  var field = [];
  var board = [];
  var iter = 0;
  for (var rows = 1; rows <= maxx; rows++) {
    for (var cols = 1; cols <= maxy; cols++){
      field[rows+'x'+cols] = f[iter];
      board[rows+'x'+cols] = b[iter++];
    }
  }

  if(y >= 1 && y <= maxy && x >= 1 && x <= maxx
    && field[x+'x'+y] === 0 && openFieldPart.indexOf(x+'x'+y) == -1
    && board[x+'x'+y].toString().indexOf('open') == -1){
    if(board[x+'x'+y].toString().indexOf('find') == -1)
      openFieldPart.push(x+'x'+y);
    logNearSpace(x - 1, y - 1, maxx, maxy, f, b, openFieldPart);
    logNearSpace(x + 1, y - 1, maxx, maxy, f, b, openFieldPart);
    logNearSpace(x - 1, y + 1, maxx, maxy, f, b, openFieldPart);
    logNearSpace(x + 1, y + 1, maxx, maxy, f, b, openFieldPart);
    logNearSpace(x - 1, y, maxx, maxy, f, b, openFieldPart);
    logNearSpace(x, y - 1, maxx, maxy, f, b, openFieldPart);
    logNearSpace(x, y + 1, maxx, maxy, f, b, openFieldPart);
    logNearSpace(x + 1, y, maxx, maxy, f, b, openFieldPart);
  } else {
      if(y >= 1 && y <= maxy && x >= 1 && x <= maxx
        && openFieldPart.indexOf(x+'x'+y) == -1
        && board[x+'x'+y].toString().indexOf('open') == -1){
        if(board[x+'x'+y].toString().indexOf('find') == -1)
          openFieldPart.push(x+'x'+y);
      }
    return;
  }
}
