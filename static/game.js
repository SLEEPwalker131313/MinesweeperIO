var Minesweeper = {
    gameId: null,
    turn: null,
    i: false,
    interval: null,
    init: function() {
        $(function() {
            // Подключаемся к серверу nodejs с socket.io
            console.log('check');
            var socket = io.connect(window.location.hostname + ':5000', {resource: 'api'});
            // $('#reload').hide().button({icons:{primary:'ui-icon-refresh'}}).click(function() {
            //     $('#reload').off('click').click(function(){window.location.reload();});
            //     socket.emit('start');
            // });

            //реакция на нажатие кнопки ввода имени
            // $('#name-input').focus();
            //   function send_name() {
            //     var name = $('#name-input').val();
            //     if (name && name.length < 20) {
            //       socket.emit('new-player', {
            //         name: name
            //       });
            //       //START
            //       socket.emit('start');
            //
            //     } else {
            //       window.alert('Your name cannot be blank or over 20 characters.');
            //     }
            //     //говнокод.
            //     $('#main-block').css('display', 'block');
            //     // $('#status').css('display', 'block');
            //     $('#leaderboard').css('display', 'block');
            //     $('.name').html(name);
            //     $('#name-form').css('display', 'none');
            //     //run after btn press
            //     // socket.emit('start');
            //     return false;
            // };
            // $('#name-form').submit(send_name);
            $('#start-game').click(function() {
              $('#start-game').hide();
              socket.emit('start');
            });

              ////////////////////////////////////////////


            socket.on('stats', function(data) {
              // console.log(data);
              // $('.stats').html(data[3]);
              // console.log(data);
            });

            socket.on('connect', function () {
                $('#status').html('Успешно подключились к игровому серверу');
                $('#reload').show();
                // _gaq.push(['_trackEvent', 'WebSocket', 'Success']);
            });
            socket.on('reconnect', function () {
                $('#reload').show();
                $('#connect-status').html('Переподключились, продолжайте игру');
                // _gaq.push(['_trackEvent', 'WebSocket', 'Reconnect']);
            });
            socket.on('reconnecting', function () {
                $('#reload').hide();
                $('#status').html('Соединение с сервером потеряно, переподключаемся...');
                // _gaq.push(['_trackEvent', 'WebSocket', 'Reconnecting']);
            });
            socket.on('error', function (e) {
                $('#status').html('Ошибка: ' + (e ? e : 'неизвестная ошибка'));
                // _gaq.push(['_trackEvent', 'WebSocket', 'Error', (e ? e : 'неизвестная ошибка')]);
            });

            // socket.on('ww', function(data){
            //   console.log(data);
            // });
            // Ожидаем соперника
            socket.on('wait', function(){
              console.log('waitttt');
                $('#status').append('... Ожидаем соперника...');
                // _gaq.push(['_trackEvent', 'Game', 'Wait']);
            });
            // Соперник отлючился
            socket.on('exit', function(){
                Minesweeper.endGame(Minesweeper.turn, 'exit');
                // _gaq.push(['_trackEvent', 'Game', 'Exit']);
            });
            // Время на ход вышло
            socket.on('timeout', function(turn) {
                Minesweeper.endGame(turn, 'timeout');
                // _gaq.push(['_trackEvent', 'Game', 'Timeout']);
            });

            // К нам подключился соперник, начинаем игру
            socket.on('ready', function(gameId, x, y, field) {
              console.log('ready!!! field');
              console.log(field);
              console.log("ready " + gameId);
              // console.log(io);
                $('#status').html('К вам подключился соперник! Игра началась!');
                // console.log('gameId ' + gameId);
                // console.log('field1 ' + field1);
                Minesweeper.startGame(gameId, x, y, field);
                // console.log(turn);
                // $('#stats').append($('<div/>').attr('class', 'turn ui-state-hover ui-corner-all').html('Вы играете: <b>' + (turn=='X'?'Крестиком':'Ноликом') + '</b>'));

                // Обязательно зарефакторить
                var tmp = 'Open';
                // $('#mine-flag').click(function(){
                //   tmp = $('#mine-flag').text();
                //   $('#current-symbol').html(tmp);
                //   $('#mine-flag').css('background-color', 'red');
                //   $('#open').css('background-color', 'white');
                // });
                $('#open').click(function(){
                  if($('#open').text().toString() == 'Open'){
                    tmp = 'Mine Flag';
                    $('#open').html('Mine FLag');
                  }
                  else {
                    tmp = 'Open';
                    $('#open').html('Open');
                  }
                  // $('#current-symbol').html(tmp);
                  // $('#open').css('background-color', 'red');
                  // $('#mine-flag').css('background-color', 'white');
                });
                // console.log(socket.id);
                // var socket.id('ls') = 1;
                // console.log(socket.id[tmp]);
                // console.log($('#current-symbol').text());
                // var tmp = $('#current-symbol').text();
                // console.log(tmp);
                $("#board-table td").click(function (e) {
                  // console.log('tmp2 ' + tmp2);
                  // console.log('tmp ' + tmp);
                  // console.log('$("#current-symbol").text() ' + $('#current-symbol').text());
                  // console.log(Minesweeper);
                  // console.log(GameItem);
                  // console.log('socket.id');
                  // console.log(socket.id);
                    // console.log('i');
                    // console.log(Minesweeper.i);
                    // console.log('click');
                    // console.log(Minesweeper.i);
                    socket.emit('step', Minesweeper.gameId, e.target.id, tmp);      //за начальными символами сюда.
                }).hover(function(){
                    $(this).toggleClass('ui-state-hover');
                }, function(){
                    $(this).toggleClass('ui-state-hover');
                });
                // _gaq.push(['_trackEvent', 'Game', 'Start', gameId]);
            });
            // Получаем ход
            socket.on('step', function(id, win, myChange) {
                //console.info('step', id, turn, win);
                console.log(myChange);
                Minesweeper.move(id, win, myChange);
                // _gaq.push(['_trackEvent', 'Game', 'Step', id + ' / ' + turn + ' / ' + win]);
            });

            socket.on('findMine', function(id, win, myChange, alreadyChecked, flagIsYours) {
                //console.info('step', id, turn, win);
                console.log(myChange);
                Minesweeper.findMine(id, win, myChange, alreadyChecked, flagIsYours);
                // _gaq.push(['_trackEvent', 'Game', 'Step', id + ' / ' + turn + ' / ' + win]);
            });

            socket.on('endGame', function(id, win, myChange, field, board) {
                //console.info('step', id, turn, win);
                console.log('check change');
                console.log(myChange);
                Minesweeper.endGame(id, win, myChange, field, board);
                // _gaq.push(['_trackEvent', 'Game', 'Step', id + ' / ' + turn + ' / ' + win]);
            });

            // Статистика
            socket.on('stats', function (arr) {
                var stats = $('#stats');
                stats.find('div').not('.turn').remove();
                for(val in arr) {
                    stats.prepend($('<div/>').attr('class', 'ui-state-hover ui-corner-all').html(arr[val]));
                }
            });
        });
    },

    startGame: function (gameId, x, y, field) {
        this.gameId = gameId;
        // this.turn = turn;
        // this.i = (turn == 'X');
        console.log('field in start');
        console.log(field);
        console.log(field[3]);
        // console.log("start!!");
        // console.log(field);
        var count = 0;
        var table = $('#board-table').empty();
        for(var i = 1; i <= x; i++) {
            var tr = $('<tr/>');
            for(var j = 1; j <= y; j++) {
                tr.append($('<td/>').attr('id', i + 'x' + j).addClass('ui-state-default').html(field[count++]));
            }
            table.append(tr);
        }
        $("#board,#timerpanel,#result,#symbols").show();
        $('#current-symbol').html('ds');
        // this.mask(!this.i);
    },

    // mask: function(state) {
    //     var mask = $('#masked'), board = $('#board-table');
    //     clearInterval(this.interval);
    //     $('#timer').html(15);
    //     this.interval = setInterval(function(){
    //         var i = parseInt($('#timer').html()); i--;
    //         $('#timer').html(i);
    //     }, 1000);
    //     if(state) {
    //         mask.show();
    //         var p = board.position();
    //         mask.css({
    //             width: board.width(),
    //             height: board.height(),
    //             // left: p.left,
    //             // top: p.top
    //         });
    //     } else {
    //         mask.hide();
    //     }
    // },

    move: function (id, win, myChange) {
        console.log('move');
        console.log(id);
        function drowChange(id, changeClass){
          for(arr in id){
            $("#" + id[arr]).attr('class', changeClass);
          }
        }

        var changeClass = (myChange) ? 'ui-state-user' : 'ui-state-opponent';
        drowChange(id, changeClass);
        var openUserVal = parseInt($('#openUser').text());
        var openOpponentVal = parseInt($('#openOpponent').text());
        // console.log('openUserVal' + openUserVal);
        if(myChange) {
          $('#openUser').html(openUserVal + id.length);
        } else {
          $('#openOpponent').html(openOpponentVal + id.length);
        }

        // this.i = (turn != this.turn);
        // $("#" + id).attr('class', 'ui-state-hover').html(turn);
        // if (!win) {
        //     // this.mask(!this.i);
        //     $('#status').html('Сейчас ' + (this.i ? 'ваш ход' : 'ходит соперник'));
        // } else {
        //     this.endGame(turn, win);
        // }
    },

    findMine: function (id, win, myChange, alreadyChecked, flagIsYours) {
        // console.log('move');
        console.log(id);
        // console.log(turn);
        function drowChangeFindMine(id, changeClass){
          console.log('foo');
          if($("#" + id).text() == 'flag'){
            console.log('already');
            $("#" + id).attr('class','ui-state-default').html('');    //На текст пофиг, в конце ведь не будет, а стиль дефолтный.

          } else {
            $("#" + id).attr('class', changeClass).html('flag');
          }
        }
        console.log(id);
        console.log(id.length);

        var changeClass = (myChange) ? 'ui-state-user' : 'ui-state-opponent';
        drowChangeFindMine(id, changeClass);

        var findUserVal = parseInt($('#findUser').text());
        var findOpponentVal = parseInt($('#findOpponent').text());
        // console.log('openUserVal' + openUserVal);

        var valChange = (alreadyChecked) ? -1:1;
        // var valChange = 1;
        if(alreadyChecked){
          if(flagIsYours){
            $('#findUser').html(findUserVal + valChange);

          } else {
            $('#findOpponent').html(findOpponentVal + valChange);

          }
        } else {
          if(myChange) {
            $('#findUser').html(findUserVal + valChange);
          } else {
            $('#findOpponent').html(findOpponentVal + valChange);
          }
        }

        // this.i = (turn != this.turn);
        // $("#" + id).attr('class', 'ui-state-hover').html(turn);
        // if (!win) {
        //     // this.mask(!this.i);
        //     $('#status').html('Сейчас ' + (this.i ? 'ваш ход' : 'ходит соперник'));
        // } else {
        //     this.endGame(turn, win);
        // }
    },

    endGame: function (id, win, myChange, field, board) {
        clearInterval(this.interval);
        console.log('endGame! id: ' + id + ' win: ' + win + ' myChange ' + myChange);

        var text = '';
        switch(win) {
          case 'boom' : text = 'Boom! Game is over'; break;
          case 'win' : text = 'Congradulation!'; break;
            // case 'none1': text = 'Ничья!'; break;
            // case 'timeout': text = (turn == this.turn ? 'Слишком долго думали! Вы проиграли!' : 'Соперник так и не смог решить как ему ходить! Вы победили!'); break;
            // case 'exit': text = 'Соперник сбежал с поля боя! Игра закончена'; break;
            // default: text = 'Вы ' + (this.i ? 'проиграли! =(' : 'выиграли! =)');
        }
        $('#game-result').html(text);
        $('#result').addClass('end-game');
        $('#find-new-game,#game-result').show();
        console.log(field);

        var count = 0;
        for(var i = 1; i <= 16; i++) {
            // var tr = $('<tr/>');
            for(var j = 1; j <= 30; j++) {

              if(field[count] == 0){
                $("#" + i + "x" + j).html(' ');
              } else if(field[count].toString() == 'true'){
                $("#" + i + "x" + j).html('truuu');
              } else {
                $("#" + i + "x" + j).html(field[count]);
              }
              if(board[count].toString().indexOf('find') != -1 && field[count].toString() == 'true'){
                $("#" + i + "x" + j).html('failmine');
              }
              ++count;
            }
        }

        for(i in id){
          // console.log(id[i]);
          // console.log($('#'+id[i]).text().toString() == 'truuu');
          if($('#'+id[i]).text().toString() == 'truuu')
            $('#'+id[i]).addClass('last-bomb');
        }

        $('#find-new-game').click(function(){
          window.location.reload();
        });
        // $("<div/>").html(text).dialog({
        //     title: 'Конец игры',
        //     modal: true,
        //     closeOnEscape: false,
        //     resizable: false,
        //     buttons: { "Играть по новой": function() {
        //         $(this).dialog("close");
        //         window.location.reload();
        //     }},
        //     close: function() {
        //         window.location.reload();
        //     }
        // });
    }
};
