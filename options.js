// Saves options to chrome.storage.sync.
function save_options() {
    var wantsVotes = document.getElementById('votes').checked;
    var wantsComments = document.getElementById('comments').checked;
    var wantsMentions = document.getElementById('mentions').checked;
    
    chrome.storage.sync.set({
        wantsVotes: wantsVotes,
        wantsComments: wantsComments,
        wantsMentions: wantsMentions
    }, function() {

      // Update status to let user know options were saved.
      var status = document.getElementById('status');
      status.textContent = 'Options saved.';
      setTimeout(function() {
        status.textContent = '';
      }, 750);
    });
  }
  
  // Restores Checkbox state using the preferences
  // stored in chrome.storage.
  function restore_options() {
    chrome.storage.sync.get({
        wantsVotes: true,
        wantsComments: true,
        wantsMentions: true
    }, function(items) {
      document.getElementById('votes').checked = items.wantsVotes;
      document.getElementById('comments').checked = items.wantsComments;
      document.getElementById('mentions').checked = items.wantsMentions;
      
    });
  }
  document.addEventListener('DOMContentLoaded', restore_options);
  document.getElementById('save').addEventListener('click',
      save_options);