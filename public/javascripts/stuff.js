
function clearProgressBar() {
  progressBarEndTime = 0;
  $('#question-progress-bar').hide();
  $('#question-progress-bar').width('0%');
  
  enableAnswerButtons();
}

function updateProgressBar() {
  var currentTime = new Date().getTime();
  if (progressBarEndTime != 0) {
    if (currentTime >= progressBarEndTime) {
      stopProgressBar();
      showLoadingAnswer();
    }
    else {
      var w = 100*(currentTime - progressBarStartTime)/(progressBarEndTime - progressBarStartTime);
      $('#question-progress-bar').width(w + '%');
      setTimeout(updateProgressBar, 200);
    }
  }
}

function startProgressBar(ms, from_ms) {
  from_ms = (typeof from_ms == 'undefined' ? 0 : from_ms);
  $('#question-progress-bar').show();
  $('#question-progress-bar-container').addClass('active');
  
  progressBarStartTime = new Date().getTime() - from_ms;
  progressBarEndTime = progressBarStartTime + ms;
  
  updateProgressBar();
}

function stopProgressBar() {
  progressBarEndTime = 0;
  $('#question-progress-bar').show();
  $('#question-progress-bar-container').removeClass('active');
  $('#question-progress-bar').width('100%');
  
  disableAnswerButtons();
}

function enableAnswerButtons() {
  if (typeof answerButtons != 'undefined' && answerButtons !== null) {
    for (var i = 0; i < answerButtons.length; ++i)
      answerButtons[i].disabled = false;
  }
}

function disableAnswerButtons() {
  if (typeof answerButtons != 'undefined' && answerButtons !== null) {
    for (var i = 0; i < answerButtons.length; ++i)
      answerButtons[i].disabled = true;
  }
}

function showLoadingAnswer() {
  $('#loading-answer-message').show();
}

function hideLoadingAnswer() {
  $('#loading-answer-message').hide();
}

function showFeedbackVote() {
  $('#feedback-vote').show();
}

function showFeedbackThanks() {
  $('#feedback-vote').hide();
  $('#feedback-thanks').show();
}

function scrollChatDown() {
  setTimeout(function() { document.getElementById("chat-messages").scrollTop = document.getElementById("chat-messages").scrollHeight; }, 0);
}

function setupChatSound() {
  $("#jplayer-div").jPlayer({
    ready: function (event) {
      $(this).jPlayer("setMedia", { mp3:"/mp3/chat.mp3" });
    },
    swfPath: "/js"
  });
}

function playChatSound() {
  $("#jplayer-div").jPlayer('play');
}

function afterCopyToClipboard() {
  $('#copy-icon').show();
}

function setupLinkToClipboard() {
  $('#copy-button').zclip({
    path:'/js/ZeroClipboard.swf',
    copy:function(){ return $('#copy-link').val();},
    afterCopy:afterCopyToClipboard
  });
}

function setGameIsRunning(x) {
  var_game_is_running = x;
}

function setPlayerIsHost(x) {
  var_player_is_host = x;
}

function trackStartGame(game_id) {
  _gaq.push(['_trackEvent', 'Game', 'Start', game_id]);
}

function trackRestartGame(game_id) {
  _gaq.push(['_trackEvent', 'Game', 'Restart', game_id]);
}
