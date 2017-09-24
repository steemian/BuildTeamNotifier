window.App = {}
window.App.cable = ActionCable.createConsumer("ws://minnowbooster.net/cable");
var amount = 0;
var oldChromeVersion = !chrome.runtime;
var list = []

var votes = true;
var comments = true;
var mentions = true;

chrome.storage.sync.get({
	wantsVotes: true,
	wantsComments: true,
	wantsMentions: true
}, function(items) {
	votes = items.wantsVotes;
	comments = items.wantsComments;
	mentions = items.wantsMentions;

});


if (oldChromeVersion) {
  onInit();
} 
else {
  chrome.runtime.onInstalled.addListener(onInit);
}

function addToList(data)
{
	var input = new Object();
	input.title = data["title"];
	input.author = data["author"];
	input.link = data["permlink"];
	input.user = data["user"]
	list.push(input);
}

function onInit()
{
	amount=0;
	chrome.storage.sync.get('username', function(name){
		if(name['username'])
		{
	  		createNewSubscription(name['username']);
		}
  });
}

function reset()
{
	amount = 0;
	chrome.browserAction.setBadgeText({text:""});
	list = [];
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if(message.popupOpen) {
    
		sendResponse(list);
		reset();
  }
});

function createNewSubscription(name)
{
	window.App.cable.subscriptions.create ({channel:"WebNotificationsChannel", name: name}, {received: function(data)
		{
			var title = data["title"];
			if((!votes && title === "Vote") || (!comments && title === "Comment") || (!mentions && title === "Mention"))
			{
				return;
			}

			addToList(data)
			amount++;
			chrome.browserAction.setBadgeText({text: amount + ""});
			chrome.runtime.sendMessage({msg: "add", data: 0});
	    }
	});
}
	
function recieveData(data)
{
	console.log(data["title"] + " " + data["body"]);
	amount++;
	chrome.browserAction.setBadgeText({text: amount + ""});
}

chrome.storage.onChanged.addListener(function(changes, namespace) {
        for (key in changes) {
          var storageChange = changes[key];
          if(key === 'username')
		  		{
			  		createNewSubscription(storageChange.newValue);
					}
					else if(key === 'wantsComments')
					{
						comments = storageChange.newValue;
					}
					else if(key === 'wantsMentions')
					{
						mentions = storageChange.newValue;
					}
					else if(key === 'wantsVotes')
					{
						votes = storageChange.newValue;
					}
				}
});



