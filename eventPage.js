window.App = {}
window.App.cable = ActionCable.createConsumer("ws://www.minnowbooster.net/cable");
var amount = 0;
var oldChromeVersion = !chrome.runtime;
var list = []


var notificationsStored = 10;
var votes = true;
var comments = true;
var mentions = true;
var follows = true;
var resteems = true;
var sound = true;
var soundType = 'tick';

chrome.storage.sync.get({
	wantsVotes: true,
	wantsComments: true,
	wantsMentions: true,
	wantsFollows: true,
	wantsResteems: true,
	notificationsStored: 10,
	sound: true,
	soundType: 'tick'
}, function(items) {
	votes = items.wantsVotes;
	comments = items.wantsComments;
	mentions = items.wantsMentions;
	follows = items.wantsFollows;
	resteems = items.wantsResteems;	
	notificationsStored = items.notificationsStored;
	sound = items.sound;
	soundType = items.soundType;
});

var myAudio = new Audio(soundType + ".wav");       


var mentionChannel;
var commentChannel;
var upvoteChannel;
var followChannel;
var resteemChannel;


var username;

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
			username = name['username'];
	  		createNewSubscription(username);
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
			  console.log("deleting + " + list[i].link + " " + list[i].title)
			  list.splice(i, 1);
		  }
	  }
  }
});

function removeAllOldSubscription()
{
	window.App.cable.subscriptions.remove(upvoteChannel);
	window.App.cable.subscriptions.remove(mentionChannel);
	window.App.cable.subscriptions.remove(commentChannel);
	window.App.cable.subscriptions.remove(followChannel);	
	window.App.cable.subscriptions.remove(resteemChannel);		
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
		window.App.cable.subscriptions.remove(upvoteChannel);
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
		window.App.cable.subscriptions.remove(mentionChannel);
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
		window.App.cable.subscriptions.remove(commentChannel);
	}

	if(follows)
	{
		followChannel = window.App.cable.subscriptions.create ({channel:"FollowChannel", name: name}, {received: function(data)
			{
				addToList(data, "follow");
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
		window.App.cable.subscriptions.remove(followChannel);
	}

	if(resteems)
	{
		resteemChannel = window.App.cable.subscriptions.create ({channel:"ResteemChannel", name: name}, {received: function(data)
			{
				addToList(data, "resteem");
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
		window.App.cable.subscriptions.remove(resteemChannel);
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
		  removeAllOldSubscription();
          if(key === 'username')
		  	{
				username = storageChange.newValue;				
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
			else if(key === 'wantsFollows')
			{
				follows = storageChange.newValue;
			}
			else if(key === 'wantsResteems')
			{
				resteems = storageChange.newValue;
			}
			else if(key === 'notificationsStored')
			{
				notificationsStored = storageChange.newValue;
			}
			else if(key === 'sound')
			{
				sound = storageChange.newValue;
			}
			else if(key === 'soundType')
			{
				soundType = storageChange.newValue;
				myAudio = new Audio(storageChange.newValue + ".wav");       
			}
			createNewSubscription(username);			
		}
});



