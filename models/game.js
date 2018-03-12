var util = require('util'), EventEmitter = require('events').EventEmitter;

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
    EventEmitter.call(this);
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
util.inherits(GameItem, EventEmitter);


GameItem.prototype.mineAt = function (x, y) {
  if(y >= 1 && y <= this.y && x >= 1 && x <= this.x
    && this.board[x+'x'+y].toString().indexOf('find') != -1) {
    return 1;
  } else {
    return 0;
  }
}

GameItem.prototype.nearMinesFind = function(x, y){
  var mines = 0;
  mines += this.mineAt(x - 1, y - 1);
  mines += this.mineAt(x - 1, y);
  mines += this.mineAt(x - 1, y + 1);
  mines += this.mineAt(x, y - 1);
  mines += this.mineAt(x, y + 1);
  mines += this.mineAt(x + 1, y - 1);
  mines += this.mineAt(x + 1, y);
  mines += this.mineAt(x + 1, y + 1);
  return mines;
}

GameItem.prototype.logNearSpace = function (x, y){
  if(y >= 1 && y <= this.y && x >= 1 && x <= this.x
    && this.field[x+'x'+y] === 0 && this.openFieldPart.indexOf(x+'x'+y) == -1
    && this.board[x+'x'+y].toString().indexOf('open') == -1){
    if(this.board[x+'x'+y].toString().indexOf('find') == -1)
      this.openFieldPart.push(x+'x'+y);
    this.logNearSpace(x - 1, y - 1);
    this.logNearSpace(x + 1, y - 1);
    this.logNearSpace(x - 1, y + 1);
    this.logNearSpace(x + 1, y + 1);
    this.logNearSpace(x - 1, y);
    this.logNearSpace(x, y - 1);
    this.logNearSpace(x, y + 1);
    this.logNearSpace(x + 1, y);
  } else {
      if(y >= 1 && y <= this.y && x >= 1 && x <= this.x
        && this.openFieldPart.indexOf(x+'x'+y) == -1
        && this.board[x+'x'+y].toString().indexOf('open') == -1){
        if(this.board[x+'x'+y].toString().indexOf('find') == -1)
          this.openFieldPart.push(x+'x'+y);
      }
    return;
  }
}

/**
 * Step
 */
GameItem.prototype.step = function(x, y, user, symbol, cb) {
    if(this.board[x+'x'+y].toString().indexOf('open') != -1){ //Smart oppening
      if(this.field[x+'x'+y] == 0){
        return;
      } else {
        if(this.nearMinesFind(x, y) == this.field[x+'x'+y]){ // >= maybe
          this.openFieldPart = [];
          this.logNearSpace(x - 1, y - 1);
          this.logNearSpace(x - 1, y);
          this.logNearSpace(x - 1, y + 1);
          this.logNearSpace(x, y - 1);
          this.logNearSpace(x, y + 1);
          this.logNearSpace(x + 1, y - 1);
          this.logNearSpace(x + 1, y);
          this.logNearSpace(x + 1, y + 1);

          for(arr in this.openFieldPart){
            //game over without  additional checking
            if(this.field[this.openFieldPart[arr]].toString() == 'true'){
              cb('boom', this.openFieldPart, false, false, true);
              return;
            }
            this.board[this.openFieldPart[arr]] = user+'openmine';
          }
          cb(this.checkEndGame(x, y), this.openFieldPart, false, false, true);
          return;
        } else {
          return;
        }
      }
    } else {  //Non-smart
      if(symbol == 'Mine Flag'){  //Flag
        this.openFieldPart = [];  //Clear for this step
        var flagIsYours = true;
        if(this.board[x+'x'+y].toString() == 'false'){  //Non-checked
          this.board[x+'x'+y] = user+'findmine';
          this.openFieldPart.push(x+'x'+y);
          cb(this.checkEndGame(x, y), this.openFieldPart, true, false, user);
          return;
        } else if(this.board[x+'x'+y].indexOf('find') != -1){ //Already checked
          this.openFieldPart.push(x+'x'+y);
          flagIsYours = (this.board[x+'x'+y].toString().indexOf(user) != -1);
          this.board[x+'x'+y] = false;
          cb(this.checkEndGame(x, y), this.openFieldPart, true, true, flagIsYours);
          return;
        }

      } else {  //Open field
        if(this.board[x+'x'+y]!= false){
          //Non-checked item
          if(this.board[x+'x'+y].indexOf('find') != -1 ){
            return;
          }
          //Non-oppened item after amsrt oppening
          if(this.board[x+'x'+y].indexOf('open') != -1){
            return;
          }
        }
      this.openFieldPart = [];
      if(this.field[x + 'x' + y] === true){
        this.openFieldPart.push(x+'x'+y);
        //Game over without checking
        cb('boom', this.openFieldPart, false, false, true);
        return;
      } else{
        //Open near
        this.logNearSpace(x, y);
      }
      this.board[x+'x'+y] = user+'openmine';
      for(arr in this.openFieldPart){
        this.board[this.openFieldPart[arr]] = user+'openmine';
      }
      cb(this.checkEndGame(x, y), this.openFieldPart, false, false, true);
      return;
    }
  }
}

Minesweeper.prototype.step = function(gameId, x, y, user, symbol, cb) {
    this.games[gameId].step(x, y, user, symbol, cb);
}

/**
 * Start game
 */
Minesweeper.prototype.start = function(user, cb) {
    if(Object.keys(this.free).length > 0) {
        var opponent = Object.keys(this.free).shift();
        delete this.free[opponent];
        function getRandomInRange(min, max) {
          return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        var field1 = [];
        var board = [];
        for (var rows = 1; rows <= this.x; rows++) {
          for (var cols = 1; cols <= this.y; cols++){
            field1[rows+'x'+cols] = board[rows+'x'+cols] = false;
          }
        }
        var mines = 0;
        var irow, icol;
        while(mines < this.numberOfMines) {
          irow = getRandomInRange(1, this.x);
          icol = getRandomInRange(1, this.y);
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

        for (var rows = 1; rows <= this.x; rows++) {
          for (var cols = 1; cols <= this.y; cols++){
            if(field1[rows+'x'+cols] !== true){
              field1[rows+'x'+cols] = minesNear(rows,cols, this.x, this.y);
            }
          }
        }

        var game = new GameItem(user, opponent, this.x, this.y, this.numberOfMines, field1, board);
        var id = [
            Math.random() * 0xffff | 0
            , Math.random() * 0xffff | 0
            , Math.random() * 0xffff | 0
            , Date.now()
        ].join('-');

        //Add game
        this.games[id] = game;
        this.users[user] = id;
        this.users[opponent] = id;

        cb(true, id, opponent, this.x, this.y);
    } else {
      //wait for game
        this.free[user] = true;
        cb(false);
    }
}

/**
 * Exit game
 */
Minesweeper.prototype.end = function(user, cb) {
    delete this.free[user];
    if(this.users[user] === undefined) return;
    var gameId = this.users[user];
    if(this.games[gameId] === undefined) return;
    var game = this.games[gameId];
    var opponent = (user == game.user ? game.opponent : game.user);
    var turn = game.turn;
    delete this.games[gameId];
    game = null;
    delete this.users[user];
    cb(gameId, opponent, turn);
}

/**
 * Game over check
 */
GameItem.prototype.checkEndGame = function(x, y) {
    var end = 'win';
    for(arr in this.field){
      if (this.field[arr].toString() != 'true' && this.board[arr].toString().indexOf('open') != -1){
      } else if (this.field[arr].toString() != 'true' && this.board[arr].toString().indexOf('open') == -1){
        end = 'none';
        break;
      }
    }
    return end;
}
