app = angular.module('app')
app.factory 'beep', ->
  create: (hertz) ->
    if not webkitAudioContext? and not AudioContext?
      return

    audioContextFunction =
      if AudioContext
        AudioContext
      else
        webkitAudioContext

    window.beepAudioContext = window.beepAudioContext or new audioContextFunction()
    oscillator = window.beepAudioContext.createOscillator()
    oscillator.connect window.beepAudioContext.destination

    oscillator.type = 'square'
    oscillator.frequency.value = hertz
    oscillator.start()

    setTimeout ->
      oscillator.stop()
    , 200