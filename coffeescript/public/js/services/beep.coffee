app = angular.module('app')
app.factory 'beep', ->

  create: (hertz) ->
    if typeof webkitAudioContext is "undefined" and typeof AudioContext is "undefined"
      return

    if AudioContext
      audioContextFunction = AudioContext
    else
      audioContextFunction = webkitAudioContext

    window.beepAudioContext = window.beepAudioContext or new audioContextFunction()
    oscillator = window.beepAudioContext.createOscillator()
    oscillator.connect window.beepAudioContext.destination

    oscillator.type = 'square'
    oscillator.frequency.value = hertz
    oscillator.start()

    setTimeout ->
      oscillator.stop()
    , 200