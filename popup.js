var dict = {};
var globalName = "";
getSavedUsername();
$("#click").hide();
document.addEventListener('DOMContentLoaded', () => {
    chrome.runtime.sendMessage({popupOpen: true}, function(response) {
		fillDict(response);
		makeList(dict);
	  });
});

function fillDict(array)
{
	for(var i = 0; i < array.length; i++)
	{
		var instance = array[i];
		var myKey = getUniqueKey(instance);
		var newInstance = new Object();

		var hadKey = false;
		for (var key in dict) {
    		if (dict.hasOwnProperty(key)) {
        		if(myKey in dict)
				{
					hadKey = true;
					
					if(dict[key].title === "mention")
					{
						dict[key].url = "https://www.minnowbooster.net/users/" + globalName + "/mentions";
						dict[key].link = (dict[key].numOfAuthors + 1) + " locations"
					}
					dict[key].numOfAuthors++;
					break;
				}
    		}
		}

		if(!hadKey)
		{
			newInstance.authors = instance.author;
			newInstance.link = instance.link;
			newInstance.title = instance.title;
			newInstance.url = instance.url;
			newInstance.numOfAuthors = 1;
			dict[myKey] = newInstance;
		}
	}
}


function getUniqueKey(instance)
{
	if(instance.title === "mention")
	{
		return instance.title + instance.authors;
	}
	else if(instance.title === "follow")
	{
		return instance.title;
	}
	return instance.title + instance.link;
}

function clear(key)
{
	chrome.runtime.sendMessage({delete: dict[key]}, function(response) {});
	console.log("deleting: " + key);
	delete dict[key]; 	
	emptyList();
 	makeList(dict);
}

function makeList(ourDict)
{
	//Get the list element
    var list = document.getElementById('list');

    for (var key in dict) {
    		if (dict.hasOwnProperty(key)) {

				var div = document.createElement('div');
				var p = document.createElement('p');
				var i = document.createElement('i');

				i.className = "material-icons icons";
				i.innerHTML = Sanitizer.escapeHTML`<i class='material-icons clear'>clear</i>`;
				var instance = dict[key];
				var href = instance.url;
				p.onclick= (function(href) { return function () { chrome.tabs.create({url: href}) }; })(href);
				i.onclick = (function(key) { return function () { clear(key); }; })(key);
				p.className = "link"

				var authors = getAllAuthors(instance);
				var link = ""
				
				if(instance.title !== "follow") 
				{
					link = instance.link.substr(0, 10) + "\u2026";
				}

				if(instance.title === "upvote") {
					p.innerHTML = Sanitizer.escapeHTML`${authors} upvoted: ${link}`;
					div.className = "upvotes";
				}
				else if(instance.title === "comment") {
					p.innerHTML = Sanitizer.escapeHTML`${authors} commented: ${link}`;
					div.className = "comments"
				}
				else if(instance.title === "follow") {
					p.innerHTML = Sanitizer.escapeHTML`${authors} now follow(s) you`;
					div.className = "follows"
				}
				else if(instance.title === "resteem") {
					p.innerHTML = Sanitizer.escapeHTML`${authors} resteemed: ${link}`;
					div.className = "resteems"
				}
				else {
					p.innerHTML = Sanitizer.escapeHTML`${instance.authors} mentioned you in: ${link}`;
					div.className = "mentions"
				}
				
        		// Add it to the list:
				div.appendChild(p);
				div.appendChild(i);
				list.appendChild(div);
    		}
		}
}

function getAllAuthors(instance)
{
	var authors = instance.authors;

	if(instance.numOfAuthors > 2)
	{
		authors += " and " + instance.numOfAuthors + " others";
	}
	return authors;
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.msg === "add") {
			$("#list").append(chrome.runtime.getBackgroundPage(function(backgroundPage) {
				emptyList();
				fillDict(backgroundPage.list);
				backgroundPage.reset();
				makeList(dict);
			}));
        }
    }
);

function emptyList()
{
	var myNode = document.getElementById("list");
	while (myNode.firstChild) {
		myNode.removeChild(myNode.firstChild);
	}
}

/**
 * Gets the saved username.
 *
 */
function getSavedUsername() {
  chrome.storage.sync.get('username', function(name){
		if(name['username'])
		{
			var result = name['username'].toString();
			globalName = result;
			$("#txt").val(result)
			$("#status").html("Status: Connected as " + result);
			$("#target").hide();
			$("#click").show();
		}
  });
}

function retrieveUsername()
{
	chrome.storage.sync.get('username', function(name){
		if(name['username'])
		{
			return name['username'].toString();
		}
  });
}

/**
 * Sets the given username for the extension..
 *
 * @param {string} The name to be stored.
 */
function saveUsername(name) {
  chrome.storage.sync.set({'username': name});
}

$(document).on('submit','#target',function(){
	var name = $("#txt").val().toLowerCase();
	globalName = name;
	saveUsername(name);
	$("#txt").val(name);
	$("#status").html("Status: Connected as " + name);
	$("#target").hide();
	$("#click").show();
	
	return false;
});

$(document).on('click','#edit',function(){
    $("#target").show();
	return false;
});