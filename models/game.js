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

/**
 * Сделан ход
 */
GameItem.prototype.step = function(x, y, user, symbol, cb) {
  console.log('models.step');
    // if(this.board[x + 'x' + y] !== undefined) return;
    console.log('models.step2');
    console.log(symbol);
    if(symbol == 'Mine Flag'){
      console.log('mine flag');
      //check  dynamic board
      console.log(this.board[x+'x'+y]);
      if(this.board[x+'x'+y] == false){
        this.board[x+'x'+y] = user+'findmine';
        cb(this.checkWinner(x, y, this.getTurn(user)), this.getTurn(user), x+'x'+y, true);
      } else if(this.board[x+'x'+y].indexOf('find') != -1){
        this.board[x+'x'+y] = false;
        cb(this.checkWinner(x, y, this.getTurn(user)), this.getTurn(user), x+'x'+y, true)
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


    } else {
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
    var openFieldPart = [];

    function logNearSpace(field1, x, y, maxx, maxy){
      if(y >= 1 && y <= maxy && x >= 1 && x <= maxx && field1[x+'x'+y] === 0 && openFieldPart.indexOf(x+'x'+y) == -1){
        openFieldPart.push(x+'x'+y);
        console.log('x: ' + x + ' y: ' + y);
        logNearSpace(field1, x - 1, y, maxx, maxy);
        logNearSpace(field1, x, y - 1, maxx, maxy);
        logNearSpace(field1, x, y + 1, maxx, maxy);
        logNearSpace(field1, x + 1, y, maxx, maxy);
      } else {
          if(y >= 1 && y <= maxy && x >= 1 && x <= maxx && openFieldPart.indexOf(x+'x'+y) == -1){
            openFieldPart.push(x+'x'+y);
            console.log('elselog');
            console.log('x: ' + x + ' y: ' + y);
          }

        return;
      }
    }
    console.log(this.field[x + 'x' + y]);
    console.log('field: ' + this.field[x + 'x' + y]);
    if(this.field[x + 'x' + y] === true){
      console.log('boom! ' + user);
    } else{
      logNearSpace(this.field, x, y, this.x, this.y);
    }

    console.log('user');
    console.log(this.user);
    console.log(openFieldPart.length);
    if(user == this.user){
      this.openUser += openFieldPart.length;
    } else {
      this.openOpponent += openFieldPart.length;
    }

    this.board[x+'x'+y] = user+'openmine';
    for(arr in openFieldPart){
      this.board[openFieldPart[arr]] = user+'openmine';
    }

    // this.board[x + 'x' + y] = user;
    this.turn = (user != this.user ? 'X' : 'O');
    this.steps++;
    console.log(openFieldPart);
    // this.emit('timer', 'start', (user == this.user ? this.opponent : this.user));
    cb(this.checkWinner(x, y, this.getTurn(user)), this.getTurn(user), openFieldPart, false);
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
 * Получаем чем ходит игрок
 */
GameItem.prototype.getTurn = function(user) {
    return (user == this.user ? 'X' : 'O');
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
GameItem.prototype.checkWinner = function(x, y, turn) {
    // Проверка на ничью, если нет больше свободных полей
    if(this.steps == (this.x * this.y)) {
        // Ничья
        return 'none';
        // Проверка на победителя
    } else if(
        this.checkWinnerDynamic('-', x, y, turn)
            || this.checkWinnerDynamic('|', x, y, turn)
            || this.checkWinnerDynamic('\\', x , y, turn)
            || this.checkWinnerDynamic('/', x, y, turn)
        ) {
        // есть победитель
        return true;
    } else {
        // нет победителя
        return false;
    }
}

/**
 * Алгоритм для поля XxY с выиграшем в N полей
 * a - каким алгоритмом ищем
 * now - номер поля куда был сделан ход
 * turn - крестик или нолик ходили
 */
GameItem.prototype.checkWinnerDynamic = function(a, x, y, turn) {
    // будем проверять динамически 4 комбинации: горизонталь, вертикаль и 2 диагонали
    // при этом мы не знаем на какой позиции текущий ход,, проверять будем во всех 4 направлениях
    var win = 1;
    switch(a) {

        // поиск по горизонтали
        case '-':
            var toLeft = toRight = true,
                min = x - this.stepsToWin, max = x + this.stepsToWin;
            min = (min < 1) ? 1 : min;
            max = (max > this.x) ? this.x : max;
            for(var i = 1; i <= this.stepsToWin; i++) {
                if(win >= this.stepsToWin) return true;
                if(!toLeft && !toRight) return false;
                if(toLeft && min <= (x-i) && this.board[(x-i) + 'x' + y] == turn) { win++; } else { toLeft = false; }
                if(toRight && (x+i) <= max && this.board[(x+i) + 'x' + y] == turn) { win++; } else { toRight = false; }
            }
            break;

        // поиск по вертикали
        case '|':
            var toUp = toDown = true,
                min = y - this.stepsToWin, max = y + this.stepsToWin;
            min = (min < 1) ? 1 : min;
            max = (max > this.y) ? this.y : max;
            for(var i = 1; i <= this.stepsToWin; i++) {
               if(win >= this.stepsToWin) return true;
               if(!toUp && !toDown) return false;
               if(toUp && min <= (y-i) && this.board[x + 'x' + (y-i)] == turn) { win++; } else { toUp = false; }
               if(toDown && (y+i) <= max && this.board[x + 'x' + (y+i)] == turn) { win++; } else { toDown = false; }
            }
        break;

        // поиск по диагонали сверху вниз
        case '\\':
            var toUpLeft = toDownRight = true,
                minX = x - this.stepsToWin, maxX = x + this.stepsToWin,
                minY = y - this.stepsToWin, maxY = y + this.stepsToWin;
            minX = (minX < 1) ? 1 : minX;
            maxX = (maxX > this.x) ? this.x : maxX;
            minY = (minY < 1) ? 1 : minY;
            maxY = (maxY > this.y) ? this.y : maxY;
            for(var i = 1; i <= this.stepsToWin; i++) {
               if(win >= this.stepsToWin) return true;
               if(!toUpLeft && !toDownRight) return false;
               if(toUpLeft && minX <= (x-i) && minY <= (y-i) && this.board[(x-i) + 'x' + (y-i)] == turn) { win++; } else { toUpLeft = false; }
               if(toDownRight && (x+i) <= maxX && (y+i) <= maxY && this.board[(x+i) + 'x' + (y+i)] == turn) { win++; } else { toDownRight = false; }
            }
        break;

        // поиск по диагонали снизу вверх
        case '/':
            var toDownLeft = toUpRight = true,
                minX = x - this.stepsToWin, maxX = x + this.stepsToWin,
                minY = y - this.stepsToWin, maxY = y + this.stepsToWin;
            minX = (minX < 1) ? 1 : minX;
            maxX = (maxX > this.x) ? this.x : maxX;
            minY = (minY < 1) ? 1 : minY;
            maxY = (maxY > this.y) ? this.y : maxY;
            for(var i = 1; i <= this.stepsToWin; i++) {
                if(win >= this.stepsToWin) return true;
                if(!toDownLeft && !toUpRight) return false;
                if(toDownLeft && minX <= (x-i) && (y+i) <= maxY && this.board[(x-i) + 'x' + (y+i)] == turn) { win++; } else { toDownLeft = false; }
                if(toUpRight && (x+i) <= maxX && (y-i) <= maxY && this.board[(x+i) + 'x' + (y-i)] == turn) { win++; } else { toUpRight = false; }
            }
        break;

        default: return false; break;
    }
    return(win >= this.stepsToWin);
}
