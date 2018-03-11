var util = require('util'), EventEmitter = require('events').EventEmitter;

var Minesweeper = module.exports = function() {
    // Инициализируем события
    EventEmitter.call(this);
    // Массив id игры = объект игры
    this.games = [];
    // Массив подключённых пользователей = id игры
    this.users = [];
    // Массив пользователей ожидающих оппонентов для начало игры
    this.free = [];
    // Размеры поля
    this.x = 16;
    this.y = 30;
    // Шагов до победы
    this.numberOfMines = 99;
    // this.stepsToWin = 4;
}
util.inherits(Minesweeper, EventEmitter);

var GameItem = function(user, opponent, x, y, numberOfMines, field1, board) {
    // Инициализируем события
    EventEmitter.call(this);
    // Ячейки игрового поля
    this.board = board;
    this.field = field1;
    // Игроки
    this.user = user; // X
    this.opponent = opponent; // O
    // Размеры поля
    this.x = x;
    this.y = y;
    // Шагов до победы
    // this.stepsToWin = stepsToWin;
    //Число мин
    this.numberOfMines = numberOfMines;
    // Кол-во сделанных ходов
    this.steps = 0;
    // Кто ходит
    this.turn = 'X';

    this.openFieldPart = [];

    this.openUser = 0;
    this.openOpponent = 0;

    this.findUser = 0;
    this.findOpponent = 0;
    // Таймер хода
    // this.timeout = null;
    // Запускаем таймер
    // this.on('timer', function(state, user) {
    //     if(state == 'stop') {
    //         clearTimeout(this.timeout);
    //         this.timeout = null;
    //     } else {
    //         var game = this;
    //         this.timeout = setTimeout(function() {
    //             game.emit('timeout', user);
    //         }, 15000);
    //     }
    // });
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
    // console.log(Minesweeper.games);
    // console.log('this');
    // console.log(this);
    if(this.board[x+'x'+y].toString().indexOf('find') == -1)
      this.openFieldPart.push(x+'x'+y);
    console.log('x: ' + x + ' y: ' + y);
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
        // console.log('elselog');
        // console.log('x: ' + x + ' y: ' + y);
      }
    return;
  }
}

/**
 * Сделан ход
 */
GameItem.prototype.step = function(x, y, user, symbol, cb) {
  console.log('models.step');
    // if(this.board[x + 'x' + y] !== undefined) return;
    console.log('models.step2');
    // console.log(symbol);
    // console.log(this.board);
    if(this.board[x+'x'+y].toString().indexOf('open') != -1){ //Smart oppening
      console.log('smart');
      // if(this.field[x+'x'])
      console.log(this.field[x+'x'+y]);
      if(this.field[x+'x'+y] == 0){
        return;
      } else {
        console.log(this.field[x+'x'+y]);
        console.log(this.nearMinesFind(x, y));
        if(this.nearMinesFind(x, y) == this.field[x+'x'+y]){ //вернуть ли если >=
          console.log('correct');
          this.openFieldPart = [];
          this.logNearSpace(x - 1, y - 1);
          this.logNearSpace(x - 1, y);
          this.logNearSpace(x - 1, y + 1);
          this.logNearSpace(x, y - 1);
          this.logNearSpace(x, y + 1);
          this.logNearSpace(x + 1, y - 1);
          this.logNearSpace(x + 1, y);
          this.logNearSpace(x + 1, y + 1);
          // this.openFieldPart = [(x+1)+'x'+y, (x-1)+'x'+y, x+'x'+(y-1), x+'x'+(y+1)];
          console.log('this.openFieldPart');
          console.log(this.openFieldPart);

          for(arr in this.openFieldPart){
            console.log(this.field[this.openFieldPart[arr]]);
            // console.log('nonmine');
            // console.log(this.board[this.openFieldPart[arr]]);
            if(this.field[this.openFieldPart[arr]].toString() == 'true'){
              console.log('boom at ' + this.openFieldPart[arr]);
              cb('boom', this.openFieldPart, false, false, true);
              return;
              //end!!!!
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
        console.log('mine flag');
        //check  dynamic board
        console.log(this.board[x+'x'+y]);
        this.openFieldPart = [];
        var flagIsYours = true;
        if(this.board[x+'x'+y] == false){
          this.board[x+'x'+y] = user+'findmine';
          this.openFieldPart.push(x+'x'+y);
          cb(this.checkEndGame(x, y), this.openFieldPart, true, false, flagIsYours);
        } else if(this.board[x+'x'+y].indexOf('find') != -1){
          this.openFieldPart.push(x+'x'+y);
          console.log(this.board[x+'x'+y].indexOf(user));
          flagIsYours = (this.board[x+'x'+y].indexOf(user) != -1);
          // console.log('flagIsYours ' + flagIsYours);
          this.board[x+'x'+y] = false;
          cb(this.checkEndGame(x, y), this.openFieldPart, true, true, flagIsYours)
        } else{
          return;
        }
        // if(this.board[x+'x'+y] != false) {
        //   console.log('boarditem');
        //   console.log(this.board[x+'x'+y]);
        //   console.log(this.board[x+'x'+y].indexOf('open'));
        //   console.log(this.board[x+'x'+y].indexOf('find'));
        //   return;
        // }


      } else {  //Open field
        console.log('nonmine');
        console.log(this.board[x+'x'+y]);
        if(this.board[x+'x'+y]!= false){
          if(this.board[x+'x'+y].indexOf('find') != -1 ){
            return;
          }
          if(this.board[x+'x'+y].indexOf('open') != -1){ //изменить, ибо надо обработать штуку быстрого открытия поля
            return;
          }
        }
      // console.log(this);
      // console.log(user);
      // console.log(GameItem);
      // console.log(this.field);
      // console.log('x: ' + x + ' y: ' + y);
      // var openFieldPart = [];
      this.openFieldPart = [];


      console.log(this.field[x + 'x' + y]);
      console.log('field: ' + this.field[x + 'x' + y]);
      if(this.field[x + 'x' + y] === true){
        console.log('boom at ' + x + 'x' + y + ' by user '+ user);
        cb('boom', this.openFieldPart, false, false, true);
        //return with end flag
        return;
      } else{
        // logNearSpace(this.field, x, y, this);
        this.logNearSpace(x, y);
      }

      console.log('user');
      console.log(this.user);
      console.log(this.openFieldPart.length);
      if(user == this.user){
        this.openUser += this.openFieldPart.length;
      } else {
        this.openOpponent += this.openFieldPart.length;
      }

      this.board[x+'x'+y] = user+'openmine';
      for(arr in this.openFieldPart){
        this.board[this.openFieldPart[arr]] = user+'openmine';
      }

      // this.board[x + 'x' + y] = user;
      // this.turn = (user != this.user ? 'X' : 'O');
      // this.steps++;
      console.log(this.openFieldPart);
      // this.emit('timer', 'start', (user == this.user ? this.opponent : this.user));
      cb(this.checkEndGame(x, y), this.openFieldPart, false, false, true);
    }
  }
}

Minesweeper.prototype.step = function(gameId, x, y, user, symbol, cb) {
    //console.info('Step');
    //console.dir(this.games[gameId]);
    this.games[gameId].step(x, y, user, symbol, cb);
}

/**
 * Запускаем игру
 */
Minesweeper.prototype.start = function(user, cb) {
    // Размер игрового поля и кол-во ходов для победы
    // Ищем свободные игры
    if(Object.keys(this.free).length > 0) {
        var opponent = Object.keys(this.free).shift();
        delete this.free[opponent];
        // Если есть ожидающие игру, создаём им игру

        function getRandomInRange(min, max) {
          return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        var field1 = [];
        var board = [];
        console.log('start!!!');
        for (var rows = 1; rows <= this.x; rows++) {
          for (var cols = 1; cols <= this.y; cols++){
            field1[rows+'x'+cols] = board[rows+'x'+cols] = false;
          }
        }

        // console.log(field1[1+'x'+2] == true);

        var mines = 0;
        var irow, icol;
        while(mines < 99) {
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

        console.log(field1);
        // console.log(field1);

        var game = new GameItem(user, opponent, this.x, this.y, this.stepsToWin, field1, board);
        var id = [
            Math.random() * 0xffff | 0
            , Math.random() * 0xffff | 0
            , Math.random() * 0xffff | 0
            , Date.now()
        ].join('-');
        // Добавляем игру в список действующих
        this.games[id] = game;
        this.users[user] = id;
        this.users[opponent] = id;

        //console.dir(this.games[id]);
        // game.emit('timer', 'start', user);
        cb(true, id, opponent, this.x, this.y);
    } else {
        // Пока нет, значит будем ждать
        this.free[user] = true;
        cb(false);
    }
}

/**
 * Выходим из игры
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
 * Проверяем нет ли победителя
 */
GameItem.prototype.checkEndGame = function(x, y) {
    // Проверка на ничью, если нет больше свободных полей
    // console.log('turn ' + turn);
    if(this.field[x+'x'+y].toString() == 'true'){
      console.log('checkwinner boom!');
    }
    console.log('checkwinner');
    var end = 'win';
    for(arr in this.field){
      // if(this.field[arr]!=)
      // console.log(arr+ ': ' +this.board[arr].toString() == false);
      // console.log(this.board[arr].toString() == 'false');
      if (this.field[arr].toString() != 'true' && this.board[arr].toString().indexOf('open') != -1){
        // console.log('nice');
        // console.log('case 1');
      } else if (this.field[arr].toString() != 'true' && this.board[arr].toString().indexOf('open') == -1){
        console.log('arr: ' + arr + ' this.board[arr].toString(): ' + this.board[arr].toString() + ' this.field[arr].toString() ' + this.field[arr].toString());
        end = 'none';
        break;
      }
    }
    console.log('win? ' + end);   //Такая фигня работает, всё ок
    return end;
}
