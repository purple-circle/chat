app = angular.module("app")
app.factory "messageHistory", ->

  getMessageHistory = ->
    history = localStorage.getItem("message-history")
    if !history
      return []

    JSON.parse history

  globalHistory = getMessageHistory()
  historyLocation = globalHistory.length

  saveMessageHistory = (message) ->
    if !localStorage
      return

    history = localStorage.getItem("message-history") || "[]"
    history = JSON.parse(history)

    history.push(message)
    globalHistory = history

    historyLocation = history.length

    localStorage.setItem("message-history", JSON.stringify(history))

  up = (room_id) ->
    if historyLocation < 0
      return false

    historyLocation--

    if historyLocation < 0
      historyLocation = 0

    ga('send', 'event', 'browseHistory', 'Up', room_id)

    globalHistory[historyLocation]

  down = (room_id) ->
    if historyLocation + 1 > globalHistory.length
      return ''

    historyLocation++

    ga('send', 'event', 'browseHistory', 'Down', room_id)

    globalHistory[historyLocation]

  {
    saveMessageHistory
    up
    down
  }
