var socket = io();
socket.on('message', function(data) {
    console.log(data);
});

$('#name-input').focus();
  function send_name() {
    var name = $('#name-input').val();
    if (name && name.length < 20) {
      $('#name-prompt-container').empty();
      $('#name-prompt-container').append(
          $('<span>').addClass('fa fa-2x fa-spinner fa-pulse'));
      socket.emit('new-player', {
        name: name
      }, function() {
        $('#name-prompt-overlay').fadeOut(500);
        $('#canvas').focus();
        game.animate();
      });
    } else {
      window.alert('Your name cannot be blank or over 20 characters.');
    }
    //говнокод.
    $('#main-block').css('display', 'block');
    $('#status').css('display', 'block');
    $('#leaderboard').css('display', 'block');
    $('.name').html(name);
    $('#name-form').css('display', 'none');
    return false;
  };
  $('#name-form').submit(send_name);
  $('#name-submit').click(send_name);
