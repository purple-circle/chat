app = angular.module('app')
app.factory 'beep', ->

  create: (hertz) ->
    if !webkitAudioContext? and !AudioContext?
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