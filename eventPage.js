window.App = {}
window.App.cable = ActionCable.createConsumer("ws://www.minnowbooster.net/cable");
var amount = 0;
var oldChromeVersion = !chrome.runtime;
var list = []

var myAudio = new Audio("littleSound.wav");       

var notificationsStored = 10;
var votes = true;
var comments = true;
var mentions = true;
var sound = true;

chrome.storage.sync.get({
	wantsVotes: true,
	wantsComments: true,
	wantsMentions: true,
	notificationsStored: 10,
	sound: true
}, function(items) {
	votes = items.wantsVotes;
	comments = items.wantsComments;
	mentions = items.wantsMentions;
	notificationsStored = items.notificationsStored;
	sound = items.sound;
});

var mentionChannel;
var commentChannel;
var UpvoteChannel;

onInit();

function addToList(data, title)
{
	var input = new Object();
	input.title = title;
	input.author = data["author"];
	input.link = data["permlink"];
	input.url = data["url"]
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
  restoreList();
}

function reset()
{
	amount = 0;
	chrome.browserAction.setBadgeText({text:""});
	list = list.slice(list.length - notificationsStored, list.length);
	chrome.storage.sync.set({'list': list});
}

function restoreList()
{
	chrome.storage.sync.get('list', function(data){
		if(data['list'])
		{
			list = data['list'];
		}
  });
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if(message.popupOpen) { 
	sendResponse(list);
	reset();
  }
  else if(message.delete)
  {
	  for(i = 0; i < list.length; i++)
	  {
		  if(list[i].title === message.delete.title && list[i].link === message.delete.link)
		  {
			  list.splice(i, 1);
			  break;
		  }
	  }
  }
});

function removeOldSubscription(name)
{
	upvoteChannel.unsubscribe();
	mentionChannel.unsubscribe();
	commentChannel.unsubscribe();	
}

function createNewSubscription(name)
{
	if(votes)
	{
		upvoteChannel = window.App.cable.subscriptions.create ({channel:"UpvoteChannel", name: name}, {received: function(data)
			{
				addToList(data, "upvote");
				amount++;
				chrome.browserAction.setBadgeText({text: amount + ""});
				chrome.runtime.sendMessage({msg: "add", data: 0});

				if(sound)
				{
					myAudio.play();
				}
			}
		});
	}
	else if(upvoteChannel)
	{
		upvoteChannel.unsubscribe();
	}

	if(mentions)
	{
		mentionChannel = window.App.cable.subscriptions.create ({channel:"MentionChannel", name: name}, {received: function(data)
			{
				addToList(data, "mention");
				amount++;
				chrome.browserAction.setBadgeText({text: amount + ""});
				chrome.runtime.sendMessage({msg: "add", data: 0});
				if(sound)
				{
					myAudio.play();
				}			
			}
		});
	}
	else
	{
		mentionChannel.unsubscribe();
	}

	if(comments)
	{
		commentChannel = window.App.cable.subscriptions.create ({channel:"CommentChannel", name: name}, {received: function(data)
			{
				addToList(data, "comment");
				amount++;
				chrome.browserAction.setBadgeText({text: amount + ""});
				chrome.runtime.sendMessage({msg: "add", data: 0});
				if(sound)
				{
					myAudio.play();
				}
			}
		});
	}
	else
	{
		commentChannel.unsubscribe();
	}
	
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
					removeOldSubscription(storageChange.oldValue);
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
				else if(key === 'notificationsStored')
				{
					notificationsStored = storageChange.newValue;
				}
				else if(vote === 'sound')
				{
					sound = storageChange.newValue;
				}
			}
});



