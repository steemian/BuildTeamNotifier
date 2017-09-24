var dict = {};
getSavedUsername();

document.addEventListener('DOMContentLoaded', () => {
    chrome.runtime.sendMessage({popupOpen: true}, function(response) {
		fillDict(response);
		makeList(dict);
	  });
});

function fillDict(array)
{
	var instance1 = new Object();
	var key1 = 1;
	instance1.authors = "Ray";
	instance1.link = "link to it";
	instance1.title = "Vote";
	instance1.user = "Ray";
	instance1.numOfAuthors = 20;
	dict[key1] = instance1;

	var instance2 = new Object();
	var key2 = 2;
	instance2.authors = "Ray";
	instance2.link = "link to it";
	instance2.title = "Comment";
	instance2.user = "Ray";
	instance2.numOfAuthors = 6;
	dict[key2] = instance2;

	var instance3 = new Object();
	var key3 = 3;
	instance3.authors = "Ray";
	instance3.link = "link to it";
	instance3.title = "Mention";
	instance3.user = "Ray";
	instance3.numOfAuthors = 5;
	dict[key3] = instance3;


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
					if(dict[key].numOfAuthors < 2)
					{
						dict[key].author = dict[key].author + ", " + instance.author
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
			newInstance.user = instance.user;
			newInstance.numOfAuthors = 1;
			dict[myKey] = newInstance;
		}
	}
}


function getUniqueKey(instance)
{
	return instance.title + instance.link;
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
				i.innerHTML = "<i class='material-icons clear'>clear</i>";
				var instance = dict[key];
				var href = "https://steemit.com/@" + instance.user + "/" + instance.link;
				p.onclick= function() { chrome.tabs.create({url: href}) };
				i.onclick = function() { delete dict[key]; emptyList(); makeList(dict)};
				p.className = "link"

				var authors = getAllAuthors(instance);
				var link = instance.link.substr(0, 40) + "\u2026";

				if(instance.title === "Vote") {
					p.innerHTML = authors + " upvoted: " + link;
					div.className = "upvotes";
				}
				else if(instance.title === "Comment") {
					p.innerHTML = authors + " commented: " + link;
					div.className = "comments"
				}
				else {
					p.innerHTML = authors + " mentioned you in: " + link;
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
			$("#txt").val(name['username'].toString())
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
    var name = $("#txt").val()
	saveUsername(name)
	$("#txt").val(name)
	return false;
});
