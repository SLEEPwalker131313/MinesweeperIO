// var socket = io();
// socket.on('stats', function(data) {
//   // console.log(data);
//   $('.stats').html(data[3]);
// });

// socket.on('user_list', function(data1) {
//   console.log(data1);
// });
//
// socket.on('socket_log', function(data){
//   console.log(data);
// });
//
// socket.on('wait', function(){
//     $('.connect').append('... Ожидаем соперника...');
// });
//
// socket.on('ready', function(gameId, turn, x, y) {
//   console.log("ready");
//     $('.connect').html('К вам подключился соперник! Игра началась! ' + (turn == 'X' ? 'Сейчас Ваш первый ход' : 'Сейчас ходит соперник') + '!');
//     Game.startGame(gameId, turn, x, y);
//     // $('#stats').append($('<div/>').attr('class', 'turn ui-state-hover ui-corner-all').html('Вы играете: <b>' + (turn=='X'?'Крестиком':'Ноликом') + '</b>'));
//     // $("#board-table td").click(function (e) {
//     //     if(TicTacToe.i) socket.emit('step', TicTacToe.gameId, e.target.id);
//     // }).hover(function(){
//     //     $(this).toggleClass('ui-state-hover');
//     // }, function(){
//     //     $(this).toggleClass('ui-state-hover');
//     // });
//     // _gaq.push(['_trackEvent', 'Game', 'Start', gameId]);
// });


// $('#name-input').focus();
//   function send_name() {
//     var name = $('#name-input').val();
//     if (name && name.length < 20) {
//       $('#name-prompt-container').empty();
//       $('#name-prompt-container').append(
//           $('<span>').addClass('fa fa-2x fa-spinner fa-pulse'));
//       socket.emit('new-player', {
//         name: name
//       }, function() {
//         $('#name-prompt-overlay').fadeOut(500);
//         $('#canvas').focus();
//         game.animate();
//       });
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
//   };
//   $('#name-form').submit(send_name);
//   $('#name-submit').click(send_name);
