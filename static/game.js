var Minesweeper = {
    gameId: null,
    turn: null,
    i: false,
    interval: null,
    init: function() {
        $(function() {
            var socket = io.connect(window.location.hostname + ':5000', {resource: 'api'});
            // $('#name-form').submit(send_name);
            $('#start-game').click(function() {
              $('#start-game,#github').hide();
              socket.emit('start');
            });

            socket.on('connect', function () {
                $('#status').html('Successfully connected to the game server');
                $('#reload').show();
            });
            socket.on('reconnect', function () {
                $('#reload').show();
                $('#connect-status').html('Reconnected, you can continue the game');
            });
            socket.on('reconnecting', function () {
                $('#reload').hide();
                $('#status').html('Connection to the server is lost, reconnect...');
            });
            socket.on('error', function (e) {
                $('#status').html('Error: ' + (e ? e : 'unknown error'));
            });

            //Wait for another player
            socket.on('wait', function(){
                $('#status').append('... Expect the second player...');
            });
            // disconnect
            socket.on('exit', function(){
                Minesweeper.endGame(Minesweeper.turn, 'exit');
            });

            // Lets start
            socket.on('ready', function(gameId, x, y) {
                $('#status').html('The second player connected to you! The game has begun!');
                Minesweeper.startGame(gameId, x, y);
                var tmp = 'Open';
                $('#open').click(function(){
                  if($('#open').text().toString() == '🏱'){
                    tmp = 'Mine Flag';
                    $('#open').html('💣');
                  }
                  else {
                    tmp = 'Open';
                    $('#open').html('🏱');
                  }
                });
                $("#board-table td").click(function (e) {
                    socket.emit('step', Minesweeper.gameId, e.target.id, tmp);
                }).hover(function(){
                    $(this).toggleClass('ui-state-hover');
                }, function(){
                    $(this).toggleClass('ui-state-hover');
                });
            });
            // Get turn
            socket.on('step', function(id, field, win, myChange) {
                Minesweeper.move(id, field, win, myChange);
            });

            socket.on('findMine', function(id, win, myChange,
              alreadyChecked, flagIsYours) {
                Minesweeper.findMine(id, win, myChange,
                  alreadyChecked, flagIsYours);
            });

            socket.on('endGame', function(id, win, myChange, field, board) {
                Minesweeper.endGame(id, win, myChange, field, board);
            });

            // Game stats
            socket.on('stats', function (countGames, countTotalGames,
              countUsers) {
                var stats = $('#stats');
                stats.html('Total games: ' + countTotalGames + ' Games online: '
                + countGames + ' Players online: ' + countUsers);
            });
        });
    },

    startGame: function (gameId, x, y) {
        this.gameId = gameId;
        var table = $('#board-table').empty();
        for(var i = 1; i <= x; i++) {
            var tr = $('<tr/>');
            for(var j = 1; j <= y; j++) {
                tr.append($('<td/>').attr('id', i + 'x' + j)
                .addClass('table-elem ui-state-default').html(''));
            }
            table.append(tr);
        }
        $("#board,#timerpanel,#result,#symbols").show();
        $('#current-symbol').html('ds');
    },

    move: function (id, field, win, myChange) {
        function drowChange(id, changeClass){
          for(arr in id){
            if(field[arr] == 0){
              $("#" + id[arr]).attr('class', changeClass).html(' ');
            } else
              $("#" + id[arr]).attr('class', changeClass).html(field[arr]);
          }
        }

        var changeClass = (myChange) ? 'ui-state-user' : 'ui-state-opponent';
        drowChange(id, changeClass);
        var openUserVal = parseInt($('#openUser').text());
        var openOpponentVal = parseInt($('#openOpponent').text());
        if(myChange) {
          $('#openUser').html(openUserVal + id.length);
        } else {
          $('#openOpponent').html(openOpponentVal + id.length);
        }
    },

    findMine: function (id, win, myChange, alreadyChecked, flagIsYours) {
        function drowChangeFindMine(id, changeClass){
          if($("#" + id).text() == '🏱'){
            $("#" + id).attr('class','ui-state-default-2').html('');
          } else {
            $("#" + id).attr('class', changeClass).html('<b style="color:red">🏱</b>');
          }
        }
        var changeClass = (myChange) ? 'ui-state-user' : 'ui-state-opponent';
        drowChangeFindMine(id, changeClass);

        var findUserVal = parseInt($('#findUser').text());
        var findOpponentVal = parseInt($('#findOpponent').text());

        var valChange = (alreadyChecked) ? -1:1;
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
    },

    endGame: function (id, win, myChange, field, board) {
        clearInterval(this.interval);
        var text = '';
        switch(win) {
          case 'boom' : text = 'Boom! Game is over'; break;
          case 'win' : text = 'Congratulations!'; break;
        }
        $('#game-result').html(text);
        $('#result').addClass('end-game');
        $('#find-new-game,#game-result').show();
        var count = 0;
        for(var i = 1; i <= 16; i++) {
            for(var j = 1; j <= 30; j++) {
              if(field[count] == 0){
                $("#" + i + "x" + j).html(' ');
              } else if(field[count].toString() == 'true'){
                $("#" + i + "x" + j).html('💣');
              } else {
                $("#" + i + "x" + j).html(field[count]);
              }
              if(board[count].toString().indexOf('find') != -1 && field[count].toString() != 'true'){
                $("#" + i + "x" + j).addClass('fail-mine').html('💣');
              }
              ++count;
            }
        }

        for(i in id){
          if($('#'+id[i]).text().toString() == '💣')
            $('#'+id[i]).addClass('last-bomb');
        }

        $('#find-new-game').click(function(){
          window.location.reload();
        });
    }
};
