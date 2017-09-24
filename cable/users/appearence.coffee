App.cable.users.create "WebNotificationsChannel",
  received: (data) ->
    new Notification data["title"], body: data["body"]