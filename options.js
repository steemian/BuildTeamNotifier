// Saves options to chrome.storage.sync.
function save_options() {
    var wantsVotes = document.getElementById('votes').checked;
    var wantsComments = document.getElementById('comments').checked;
    var wantsMentions = document.getElementById('mentions').checked;
    var wantsFollows = document.getElementById('followers').checked;
    var wantsResteems = document.getElementById('resteems').checked;    
    var notificationsStored = document.getElementById('amount').value;
    var sound = document.getElementById('mute').checked;
    var soundType = document.getElementById('tick').checked ? document.getElementById('tick').value : document.getElementById('tock').value;

    chrome.storage.sync.set({
        wantsVotes: wantsVotes,
        wantsComments: wantsComments,
        wantsMentions: wantsMentions,
        wantsFollows: wantsFollows,
        wantsResteems: wantsResteems,
        notificationsStored: notificationsStored,
        sound: sound,
        soundType: soundType
    }, function() {

      // Update status to let user know options were saved.
      var status = document.getElementById('status');
      status.textContent = 'Options saved.';
      setTimeout(function() {
        status.textContent = '';
      }, 750);
    });
  }
  
  document.getElementById('tick').onclick = function(){
    new Audio("tick.wav").play();
};

document.getElementById('tock').onclick = function(){
  new Audio("tock.wav").play();
};
  
  // Restores Checkbox state using the preferences
  // stored in chrome.storage.
  function restore_options() {
    chrome.storage.sync.get({
        wantsVotes: true,
        wantsComments: true,
        wantsMentions: true,
        wantsFollows: true,
        wantsResteems: true,
        notificationsStored: 100,
        sound: true,
        soundType: 'tick'
    }, function(items) {
      document.getElementById('votes').checked = items.wantsVotes;
      document.getElementById('comments').checked = items.wantsComments;
      document.getElementById('mentions').checked = items.wantsMentions;
      document.getElementById('followers').checked = items.wantsFollows;
      document.getElementById('resteems').checked = items.wantsResteems;
      document.getElementById('amount').value = items.notificationsStored;
      document.getElementById('mute').checked = items.sound;
      document.getElementById(items.soundType).checked = true;
    });
  }
  document.addEventListener('DOMContentLoaded', restore_options);
  document.getElementById('save').addEventListener('click',
      save_options);