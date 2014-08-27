fs = require("fs")

# This is Noitech, a collection of audio generating, manipulating, and saving functions. 
# The plan is to expand this into a UI, with simular functionality to Audacity, but better suited for music composition.

# All durations are expressed in samples. The sample rate of 44100 is assumed. 
# Parameters dependent on time measurement and therefore also based in samples. 
# A tone of 400 hertz, for example, must be given as 400/44100

# All audio segments are arrays of numbers, whos elements t are an amplitude at time t within the range
# -32767 and 32767. Arrays can be opened out of wave files with the 'openFile' function, and saved with the 'buildFile'
# function. Amplitude values over 32767 or under -32767 are saved around the radix of 32767.

# ***************************************************
# Tone Making Functions
# ***************************************************

# For many of the tone making functions, there are the arguments 'harmonicCount', 'enharmonicity', and 'harmonicDecay'.
# Only HarmonicCount is a necessaryargument. The others are optional, and do not need to be specified.
# I will explain those below

# *********************
# harmonicCount
# Harmonic sounds, are sounds that consist of a tonic tone ( a frequency ) and harmonics ( a frequency that is the tonic
# tone times  an integer ). The harmoincCount variable is how many harmonics you want to be generated 'on top' of your 
# tonic tone (the argumnent 'tone'). More harmonics mean more computation. I have found 30 to be an adequate value as 
# the harmonicCount argument

# *********************
# enharmonicity
# Enharmonicity generally means 'not harmonic', or the content of a sound that is noisy and not a function of the tonic
# frequency. In my functions, is the degree that the harmonics are imperfect. Physical bodies that produce harmonic 
# sounds (strings, bells, horns) have a tendency to produce harmonics that are actually a little higher in frequency 
# than the integer multiple of their tonic This is because the vibration actually increases the tension of the body, 
# which increases the frequency for harmonics above that tonic

# The argument 'enharmonicity' should be a very very low number. 0.0007 is my medium value.

# *********************
# harmonicDecay
# The argument harmonicDecay contributes a feature to my functions that is also based off a physical phenomenon of sound.
# Many physical bodies that produce harmonic sounds, tend to begin with very loud high harmonics, and end with volume 
# only in the lower harmonics. The energy in higher frequencies physically expresses itself turbulently and 'decays' 
# into lower frequencies.

# The argument 'harmonic decay' is the rate at which high frequencies lower in volume, and the tonic frequency increases
# in volume. All the harmonics decay in proportion to how high they are in frequency relative to the tonic frequency.

# Generates a Sine wave form
makeSine = (voiceParameters) ->
  amplitude = voiceParameters.amplitude * 32767 or 32767
  tone = voiceParameters.tone/44100
  outRay = []
  sample = 0
  while sample < voiceParameters.duration
    outRay.push amplitude * Math.sin(Math.PI * 2 * sample * tone)
    sample++
  return outRay


# Generates a Saw Tooth Wave form
makeSaw = (tone, duration, harmonicCount, amplitude, enharmonicity, harmonicDecay) ->
  amplitude = amplitude * 32767 or 32767
  enharmonify = (enharmonicity, harmonic) ->
    value = (if typeof enharmonicity is "undefined" then 1 else Math.pow(1 + enharmonicity, harmonic))
    value

  decay = (harmonicDecay, harmonic, moment) ->
    if typeof harmonicDecay is "undefined"
      1
    else
      if harmonic > 1
        1 - (Math.pow(moment / Math.pow(Math.pow(moment, 2) + 1, 0.5), harmonicDecay / harmonic))
      else
        (moment) / (Math.pow(Math.pow(moment, 2) + 1, 0.5))

  outRay = []
  moment = 0

  while moment < duration
    outRay.push 0
    moment++
  harmonic = 1

  while harmonic <= harmonicCount
    moment = 0

    while moment < outRay.length
      outRay[moment] += decay(harmonicDecay, harmonic, moment) * amplitude * (Math.pow(-1, harmonic) / harmonic) * (Math.sin(moment * Math.PI * 2 * tone * harmonic * enharmonify(enharmonicity, harmonic)))
      moment++
    harmonic++
  numerator = 2 * (harmonicCount - 1)
  denominator = Math.PI * Math.pow(Math.pow(harmonicCount - 1, 2) + 1, 0.5)
  sample = 0

  while sample < outRay.length
    outRay[sample] *= (1 - (numerator / denominator))
    sample++
  outRay


# Generates a triangle wave form
makeTriangle = (tone, duration, harmonicCount, amplitude, enharmonicity, harmonicDecay) ->
  amplitude = amplitude * 32767 or 32767
  enharmonify = (enharmonicity, harmonic) ->
    value = (if typeof enharmonicity is "undefined" then 1 else Math.pow(1 + enharmonicity, harmonic))
    value

  decay = (harmonicDecay, harmonic, moment) ->
    if typeof harmonicDecay is "undefined"
      1
    else
      if harmonic > 1
        1 - (Math.pow(moment / Math.pow(Math.pow(moment, 2) + 1, 0.5), harmonicDecay / harmonic))
      else
        (moment) / (Math.pow(Math.pow(moment, 2) + 1, 0.5))

  outRay = []
  moment = 0

  while moment < duration
    outRay.push 0
    moment++
  harmonic = 0

  while harmonic < harmonicCount
    moment = 0

    while moment < outRay.length
      outRay[moment] += decay(harmonicDecay, harmonic, moment) * amplitude * Math.pow(-1, harmonic) * Math.sin(moment * Math.PI * 2 * tone * ((harmonic * 2) + 1) * enharmonify(enharmonicity, harmonic)) / Math.pow((harmonic * 2) + 1, 2)
      moment++
    harmonic++
  numerator = 8 * (harmonicCount - 1)
  denominator = (Math.pow(Math.PI, 2) * Math.pow(Math.pow(harmonicCount - 1, 2) + 1, 0.5))
  sample = 0

  while sample < outRay.length
    outRay[sample] *= (1 - (numerator / denominator))
    sample++
  outRay


# Generates a square wave form
makeSquare = (tone, duration, harmonicCount, amplitude, enharmonicity, harmonicDecay) ->
  amplitude = amplitude * 32767 or 32767
  enharmonify = (enharmonicity, harmonic) ->
    value = (if typeof enharmonicity is "undefined" then 1 else (1 + (harmonic * enharmonicity)))
    value

  decay = (harmonicDecay, harmonic, moment) ->
    if typeof harmonicDecay is "undefined"
      1
    else
      if harmonic > 1
        1 - (Math.pow(moment / Math.pow(Math.pow(moment, 2) + 1, 0.5), harmonicDecay / harmonic))
      else
        (moment) / (Math.pow(Math.pow(moment, 2) + 1, 0.5))

  outRay = []
  moment = 0

  while moment < duration
    outRay.push 0
    moment++
  harmonic = 1

  while harmonic <= harmonicCount
    moment = 0

    while moment < outRay.length
      outRay[moment] += decay(harmonicDecay, harmonic, moment) * (amplitude / ((harmonic * 2) - 1)) * Math.sin(moment * Math.PI * 2 * tone * ((harmonic * 2) - 1) * enharmonify(enharmonicity, harmonic))
      moment++
    harmonic++
  numerator = 4 * (harmonicCount - 1)
  denominator = Math.PI * Math.pow(Math.pow(harmonicCount - 1, 2) + 1, 0.5)
  sample = 0

  while sample < outRay.length
    outRay[sample] *= (1 - (numerator / denominator))
    sample++
  outRay


# Generates a duration of silence
makeSilence = (duration) ->
  outRay = []
  moment = 0

  while moment < duration
    outRay.push 0
    moment++
  outRay


# ***************************************************
# Array manipulation functions
# ***************************************************

# These functions manipulate arrays in a great variety of ways

# ***************************
# Merge adds the durRay array to the canvasRay array at sample whereAt, with volume level
merge = (durRay, canvasRay, whereAt, level) ->
  outRay = []
  whereAt = (if typeof whereAt is "undefined" then 0 else whereAt)
  level = (if typeof level is "undefined" then 1 else level)
  sample = 0

  while sample < canvasRay.length
    outRay.push canvasRay[sample]
    sample++
  if (whereAt + durRay.length) > canvasRay.length
    padding = 0

    while padding < ((whereAt + durRay.length) - canvasRay.length)
      outRay.push 0
      padding++
  sample = 0

  while sample < durRay.length
    outRay[whereAt + sample] += durRay[sample] * level
    sample++
  outRay


# ***************************
# Substitute is similar to merge, however it also damps the volume of the canvasRay for the duration of durRay to a volume of value subtitutionLevel 
# The reason for this, is to simulate how natural sounds sometimes overwelm each other when in succession, rather than co-exist.
substitute = (durRay, canvasRay, whereAt, level, substitutionLevel) ->
  outRay = []
  whereAt = (if typeof whereAt is "undefined" then 0 else whereAt)
  level = (if typeof level is "undefined" then 1 else level)
  substitutionLevel = (if typeof substititionLevel is "undefined" then 0.1 else substitutionLevel)
  sample = 0

  while sample < canvasRay.length
    outRay.push canvasRay[sample]
    sample++
  sample = 0

  while sample < durRay.length
    outRay[sample + whereAt] *= substitutionLevel
    outRay[sample + whereAt] += durRay[sample] * level
    sample++
  outRay


# ***************************
# Invert multiplies each amplitude by -1. Any sound and its inverse combined are silence.
invert = (durRay) ->
  outRay = []
  sample = 0

  while sample < durRay.length
    outRay.push durRay[sample] * (-1)
    sample++
  outRay


# ***************************
# Add a duration of silences at the beginning of a sound array.
padBefore = (durRay, paddingAmount) ->
  outRay = []
  padding = 0

  while padding < paddingAmount
    outRay.push 0
    padding++
  outRay = outRay.concat(durRay)
  outRay


# ***************************
# Add a duration of silence at the end of a sound array
padAfter = (durRay, paddingAmount) ->
  outRay = []
  padding = 0

  while padding < paddingAmount
    outRay.push 0
    padding++
  outRay = durRay.concat(outRay)
  outRay


# ***************************
# Makes low amplitudes lower. 
# Makes a 'computery' sound where noises come in packed bursts.
quietReducer = (durRay, degree, amplitude) ->
  amplitude = amplitude * 32767 or 32767
  outRay = []
  moment = 0

  while moment < durRay.length
    outRay.push 0
    moment++
  moment = 0
  while moment < durRay.length
    if durRay[moment] > 0
      outRay[moment] = durRay[moment] * Math.pow((durRay[moment] / amplitude), (1 + degree))
    else
      outRay[moment] = durRay[moment] * Math.pow(((durRay[moment] / amplitude) * (-1)), (1 + degree))
    moment++
  outRay


# ***************************
# Repeat the sound many times, with a decay, spaced out apart
delay = (durRay, howMany, space, decay) ->
  outRay = []
  moment = 0

  while moment < (durRay.length + (howMany * space))
    outRay.push 0
    moment++
  sample = 0

  while sample < durRay.length
    iteration = 0

    while iteration < howMany
      outRay[sample] += durRay[sample + (iteration * space)] * Math.pow(decay, iteration)
      iteration++
    sample++
  outRay


# ***************************
# Reduces the range of increments of an amplitude. 
# For example, an extent value 2, would remove all the odd numbered amplitudes
# The amplitude essentially has a smaller number of bits
adjustAmplitudeResolution = (durRay, extent) ->
  outRay = []
  sample = 0

  while sample < durRay.length
    outRay.push Math.round(durRay[sample] / extent) * extent
    sample++
  return


# ***************************
# Make sure no amplitude exceeds a certain level.
clip = (durRay, threshold) ->
  threshold = threshold * 32767
  outRay = []
  sample = 0

  while sample < durRay.length
    if durRay[sample] > threshold
      outRay.push Math.floor(threshold)
    else
      outRay.push durRay[sample]
    sample++
  outRay


# ***************************
# Change the every amplitude 
volumeChange = (durRay, level) ->
  outRay = []
  sample = 0

  while sample < durRay.length
    outRay.push durRay[sample] * level
    sample++
  outRay


# ***************************
# Make the volume fade out
# If no value is given for endVolume, it fades out to silence
# If no value is given to whereBegin, or whereEnd, it fades starting at the beginning, and ending at the ending of the array.
fadeOut = (durRay, whereBegin, whereEnd, endVolume) ->
  whereBegin = whereBegin or 0
  whereEnd = whereEnd or durRay.length - 1
  endVolume = endVolume or 0
  outRay = []
  rateOfReduction = (1 - endVolume) / (whereEnd - whereBegin)
  sample = 0

  while sample < whereBegin
    outRay.push durRay[sample]
    sample++
  sample = 0

  while sample < (whereEnd - whereBegin)
    outRay.push Math.round(durRay[sample] * (1 - (sample * rateOfReduction)))
    sample++
  sample = 0

  while sample < (durRay.length - whereEnd - 1)
    outRay.push Math.round(durRay[sample] * endVolume)
    sample++
  outRay


# ***************************
# Identical to fade in, but where it begins at the modified volume, and eases into the normal volume.
fadeIn = (durRay, whereBegin, whereEnd, startVolume) ->
  whereBegin = whereBegin or 0
  whereEnd = whereEnd or durRay.length - 1
  startVolume = startVolume or 0
  outRay = []
  rateOfIncrease = (1 - startVolume) / (whereEnd - whereBegin)
  sample = 0

  while sample < whereBegin
    outRay.push Math.round(durRay[sample] * startVolume)
    sample++
  changeLength = whereEnd - whereBegin
  sample = 0

  while sample < changeLength
    outRay.push Math.round(durRay[sample] * (1 - ((changeLength - sample) * rateOfIncrease)))
    sample++
  sample = 0

  while sample < (durRay.length - whereEnd - 1)
    outRay.push durRay[sample]
    sample++
  outRay


# ***************************
# Reverse the sound
reverse = (durRay) ->
  outRay = []
  sample = 0

  while sample < durRay.length
    outRay.push durRay[durRay.length - sample]
    sample++
  outRay


# ***************************
# Change the speed of the sound, altering its frequency.
# The argument change, should be how many times faster or slower you want the sound
# For example '2' would double the speed.
# Fraction values also work
changeSpeed = (durRay, change) ->
  outRay = []
  changes = factorize(change)
  increases = 0
  multiplySpeed = (durRay, factorIncrease) ->
    outRay = []
    interval = 0

    while interval < (Math.floor(durRay.length) / factorIncrease)
      averageValue = 0
      sample = 0

      while sample < factorIncrease
        averageValue += durRay[sample + (interval * factorIncrease)]
        sample++
      averageValue /= factorIncrease
      outRay.push averageValue
      interval++
    if (durRay / factorIncrease) % 1 isnt 0
      amountOfEndSamples = durRay.length - (Math.floor(durRay.length / factorIncrease) * factorIncrease)
      unless amountOfEndSamples < (factorIncrease / 2)
        averageValue = 0
        sample = 0

        while sample < amountOfEndSamples
          averageValue += durRay[durRay.length - 1 - sample]
          sample++
        averageValue /= amountOfEndSamples
        outRay.push averageValue
    outRay

  divideSpeed = (durRay, factorDecrease) ->
    outRay = []
    sample = 0

    while sample < (durRay.length - 1)
      outRay.push durRay[sample]
      distanceToNextSample = (durRay[sample + 1] - durRay[sample])
      distanceStep = distanceToNextSample / factorDecrease
      fillIn = 1

      while fillIn < factorDecrease
        outRay.push durRay[sample] + Math.round(fillIn * distanceStep)
        fillIn++
      sample++
    fillIn = 1

    while fillIn < factorDecrease
      outRay.push durRay[durRay.length - 1]
      fillIn++
    outRay

  sample = 0

  while sample < durRay.length
    outRay.push durRay[sample]
    sample++
  decrease = 0

  while decrease < changes[1].length
    outRay = divideSpeed(outRay, changes[1][decrease])
    decrease++
  increase = 0

  while increase < changes[0].length
    outRay = multiplySpeed(outRay, changes[0][increase])
    increase++
  outRay


# ***************************
# Shift samples tries and recreate the sound, if it happened a fraction of a sample earlier or later
# This function is useful for some esoteric reasons involved with the grainsynth function below
# The simple explaination is that the period of many human-audible tones, happen at a non-integer
# frequency. Rounding to integer values creates human-audible beats that result when sounds are
# out of tune. 

# The shiftSamples function is therefore essential to functions that create non-perceivable
# sound phenamena, that determine the quality of seperate perceivable sound phemonena.

# The argument 'shift' is a number between -1 and 1. 0.5 for example, produces an array
# where every sample is a portion of two succeeding samples in durRay.

# Whether the shift is positive or negative, only serves to decide if it will add one sample
# of amplitude zero to the beginning, or end of the array, which insures the output is the same
# length as the input
shiftSamples = (durRay, shift) -> # Shift is a number between -1 and 1.
  outRay = []
  wipRay = []
  return durRay  if shift is 0 or shift is "undefined"
  sample = 0

  while sample < durRay.length
    wipRay.push durRay[sample]
    sample++
  if shift > 0
    wipRay = [0].concat(wipRay)
  else
    wipRay = wipRay.concat([0])
  shiftMag = Math.abs(shift)
  sample = 0

  while sample < durRay.length
    outRay.push (wipRay[sample] * (1 - shiftMag)) + (wipRay[sample] * shiftMag)
    sample++
  outRay


# ***************************
# For every segment of sound that falls between two drops in volume
# Cut that segment out as an array, and add that array to an output array
# Which will contain all the 'grains' found in the input array

# Its not perfect, since every sound likely contains sounds below
# certain amplitudes. It therefore is prejudiced against low frequencies.
# That are for any given moment more likely to contain samples of any amplitude
cutUpEveryGrain = (durRay, amplitudeThreshold) ->
  grains = []
  beginning = 0
  ending = 0
  moment = 0

  while moment < durRay.length
    if durRay[moment] < amplitudeThreshold
      ending = moment
      grains.push durRay.slice(beginning, ending)
      moment = moment
    moment++
  grains


# ***************************
# Basic reverb simulation based off the freeverb algorithm ( I think )
# Basically is delays the sound by the intervals given as elements of an input array
# Then, it takes the sound of the delays, and 'undelays', meaning passes the echo
# forward in time, the same way that we hear an echo after the original sound.

# This partially simulates how reverb actually occurs. We hear a first reflection of
# the sound, quietly, and then we hear an instant later several louder reflections of the
# same sound, which decays into quiet noise.

# The echo is therefore fixed by the decay array. I havent fooled around with the delay values
# But I suspect the number of workable combinations is small, and it will be difficult to find
# Other functional values.
reverb = (durRay, decayZE, decayON, delaysZE, delaysON) ->
  delaysZE = [
    1115
    1188
    1356
    1277
    1422
    1491
    1617
    1557
  ] or delaysZE
  delaysON = [
    255
    556
    441
    341
  ] or delaysON
  reverbBackPass = (subRay, decay, delays) ->
    arrayOfDelayeds = []
    delay = 0

    while delay < delays.length
      arrayOfDelayeds.push []
      padding = 0

      while padding < delays[delay]
        arrayOfDelayeds[arrayOfDelayeds.length - 1].push 0
        padding++
      sample = 0

      while sample < subRay.length
        arrayOfDelayeds[arrayOfDelayeds.length - 1].push subRay[sample]
        sample++
      sample = 0

      while sample < subRay.length
        arrayOfDelayeds[arrayOfDelayeds.length - 1][sample] += arrayOfDelayeds[arrayOfDelayeds.length - 1][sample + delays[delay]] * decay
        sample++
      delay++
    backOutRay = []
    time = 0

    while time < (Math.max.apply(null, delays) + subRay.length)
      backOutRay.push 0
      time++
    delayedArray = 0

    while delayedArray < arrayOfDelayeds.length
      sample = 0

      while sample < arrayOfDelayeds[delayedArray].length
        backOutRay[sample] += arrayOfDelayeds[delayedArray][sample] / arrayOfDelayeds.length
        sample++
      delayedArray++
    backOutRay

  reverbForwardPass = (subRay, decay, undelays) ->
    arrayOfUndelayeds = []
    undelay = 0

    while undelay < undelays.length
      arrayOfUndelayeds.push []
      time = 0

      while time < (undelays[undelay] + subRay.length)
        arrayOfUndelayeds[arrayOfUndelayeds.length - 1].push 0
        time++
      sample = 0

      while sample < subRay.length
        arrayOfUndelayeds[arrayOfUndelayeds.length - 1][sample + undelays[undelay]] += subRay[sample] * decay
        sample++
      undelay++
    forwardOutRay = []
    time = 0

    while time < (Math.max.apply(null, undelays) + subRay.length)
      forwardOutRay.push 0
      time++
    undelayedArray = 0

    while undelayedArray < arrayOfUndelayeds.length
      sample = 0

      while sample < arrayOfUndelayeds[undelayedArray].length
        forwardOutRay[sample] += arrayOfUndelayeds[undelayedArray][sample] / undelays.length
        sample++
      undelayedArray++
    forwardOutRay

  reverbForwardPass reverbBackPass(durRay, decayZE, delaysZE), decayON, delaysON


# ***************************
# Convolve is a novel way of simulating reverb. Enter another sound array 'convoluteSeed'
# And simular durRay as if convoluteSeed were the profile of an echo.

# For example, if convolute seed were [32767,0,0,17454,0], we would put the value of durRay
# at point N, at n+1,n+2,n+3, and n+4, with the amplitudes corresponding the elements of the 
# of [32767,0,017454,0]

# convoluteSeed shouldnt be an array of a sound, but an array of how how a single 'ping' would
# sound from a fixed point in a room. Any impulse of sound, is heard several times from a listener
# at several volumes as it bounces off the walls in various ways. convoluteSeed should be how any
# sound would sound in a given room.  
convolve = (durRay, convoluteSeed, level) ->
  level = level or 0.05
  outRay = []
  time = 0

  while time < (durRay.length + convoluteSeed.length)
    outRay.push 0
    time++
  sample = 0

  while sample < durRay.length
    convolveSample = 0

    while convolveSample < convoluteSeed.length
      outRay[sample + convolveSample] += durRay[sample] * (convoluteSeed[convolveSample] / 32767) * level
      convolveSample++
    sample++
  outRay


# ***************************
# Declip, not the confused as an antagonist to the clip function

# samples often have values that start at very high amplitudes. This causes speakers
# to 'pop' with the sudden change in amplitude. The declip function makes the sample
# start and end at an amplitude of zero, and quickly (in 30 samples) adjust to the samples
# given volume
declip = (durRay, margin) ->
  margin = 30 or margin
  while durRay.length < margin
    margin /= 2
    margin = Math.floor(margin)
  fadeIn fadeOut(durRay, durRay.length - margin), 0, margin


# ***************************
#  Change the frequency, but not the duration, of a sound file

# Not all combinations of grainLength, and passes will work. Most combinations silence certain
# frequencies.
grainSynth = (durRay, freqInc, grainLength, passes, fade) ->
  grainRate = grainLength / passes
  fade = fade or true
  grains = []
  sampleSpot = 0
  while sampleSpot < durRay.length
    startingSample = Math.floor(sampleSpot)
    sampleModulus = sampleSpot % 1
    thisGrainLength = 0
    grains.push []
    if (durRay.length - sampleSpot) > grainLength
      thisGrainLength = grainLength
    else
      thisGrainLength = durRay.length - sampleSpot
    grains.push shiftSamples(durRay.slice(sampleSpot, sampleSpot + thisGrainLength), sampleModulus)
    sampleSpot += grainRate
  if fade
    grain = 0

    while grain < grains.length
      grains[grain] = changeSpeed(grains[grain], freqInc)
      if grains[grain].length > 30
        grains[grain] = fadeIn(fadeOut(grains[grain]))
      else
        grains[grain] = fadeIn(fadeOut(grains[grain]))
      grain++
  else
    grain = 0

    while grain < grains.length
      grains[grain] = changeSpeed(grains[grain], freqInc)
      grain++
  outRay = []
  time = 0

  while time < durRay.length
    outRay.push 0
    time++
  grainIndex = 0

  while grainIndex < grains.length
    moment = 0

    while moment < grains[grainIndex].length
      outRay[moment + Math.floor((grainIndex / 2) * grainRate)] += grains[grainIndex][moment]
      moment++
    grainIndex++
  outRay

glissando = (durRay, endingFreq, grainLength, passes, fade) ->
  grainRate = grainLength / passes
  fade = fade or true
  grains = []
  sampleSpot = 0
  while sampleSpot < durRay.length
    startingSample = Math.floor(sampleSpot)
    sampleModulus = sampleSpot % 1
    thisGrainLength = 0
    grains.push []
    if (durRay.length - sampleSpot) > grainLength
      thisGrainLength = grainLength
    else
      thisGrainLength = durRay.length - sampleSpot
    grains.push shiftSamples(durRay.slice(sampleSpot, sampleSpot + thisGrainLength), sampleModulus)
    sampleSpot += grainRate
  gradientLength = grains.length
  freqIncrement = ((endingFreq - 1) / gradientLength)
  if fade
    grain = 0

    while grain < grains.length
      grains[grain] = changeSpeed(grains[grain], ((freqIncrement * grain) + 1).toFixed(2))
      if grains[grain].length > 30
        grains[grain] = fadeIn(fadeOut(grains[grain]))
      else
        grains[grain] = fadeIn(fadeOut(grains[grain]))
      grain++
  else
    grain = 0

    while grain < grains.length
      grains[grain] = changeSpeed(grains[grain], (freqIncrement * grain) + 1)
      grain++
  outRay = []
  time = 0

  while time < durRay.length
    outRay.push 0
    time++
  grainIndex = 0

  while grainIndex < grains.length
    moment = 0

    while moment < grains[grainIndex].length
      outRay[moment + Math.floor((grainIndex / 2) * grainRate)] += grains[grainIndex][moment]
      moment++
    grainIndex++
  outRay

lopass = (durRay, wing, extent, mix) ->
  extent = extent or 2
  mix = mix or 1
  outRay = []
  wipRay = []
  time = 0

  while time < wing
    wipRay.push durRay[0]
    time++
  sample = 0

  while sample < durRay.length
    wipRay.push durRay[sample]
    outRay.push 0
    sample++
  time = 0

  while time < wing
    wipRay.push durRay[durRay.length - 1]
    time++
  divisor = Math.pow(extent, wing)
  summation = 0
  leftWing = []
  iteration = 0

  while iteration < wing
    summation += Math.pow(extent, iteration)
    leftWing.push Math.pow(extent, iteration)
    iteration++
  rightWing = []
  element = 0

  while element < leftWing.length
    rightWing.push leftWing[leftWing.length - 1 - element]
    element++
  factorRange = (leftWing.concat([Math.pow(2, wing)])).concat(rightWing)
  summation *= 2
  divisor += summation
  if extent < 2
    divisor = factorRange.length
    factor = 0

    while factor < factorRange.length
      factorRange[factor] = 1
      factor++
  sample = 0

  while sample < durRay.length
    value = 0
    element = 0

    while element < factorRange.length
      value += factorRange[element] * wipRay[sample + element]
      element++
    outRay[sample] = Math.round(value / (divisor))
    sample++
  sample = 0

  while sample < durRay.length
    outRay[sample] = (outRay[sample] * mix) + (durRay[sample] * (1 - mix))
    sample++
  outRay

hipass = (durRay, wing, mix) ->
  merge durRay, invert(lowpass(durRay, wing, mix))


# ************************************************************
# Math functions
# ************************************************************

# ***************************
# Return the prime factors found in the numerator and denominator of a number, interpretted as a rational number.
factorize = (fraction) ->
  numeratorsFactors = []
  denominatorsFactors = []
  isInteger = (number) ->
    if number % 1 is 0
      true
    else
      false

  denominatorCandidate = 1

  while not isInteger(fraction * denominatorCandidate)
    denominatorCandidate++
  denominator = denominatorCandidate
  numerator = fraction * denominator
  factoringCandidate = 2
  while factoringCandidate <= denominator
    if isInteger(denominator / factoringCandidate)
      denominator /= factoringCandidate
      denominatorsFactors.push factoringCandidate
    else
      factoringCandidate++
  factoringCandidate = 2
  while factoringCandidate <= numerator
    if isInteger(numerator / factoringCandidate)
      numerator /= factoringCandidate
      numeratorsFactors.push factoringCandidate
    else
      factoringCandidate++
  [
    numeratorsFactors
    denominatorsFactors
  ]


# ************************************************************
# System Functions
# ************************************************************

# **********************
# openWave will open a wave file, and return an array containing arrays. 
# The array elements of the returned array are the channels of the wave file.

# One channel wave files, and therefore returned as an array, containing a single array, containing the sound samples
openWave = (fileName) ->
  rawAudio = []
  rawWave = fs.readFileSync(fileName)
  waveNumbers = []
  datum = 0

  while datum < rawWave.length
    waveNumbers.push rawWave.readUInt8(datum)
    datum++
  numberOfChannels = waveNumbers[20]
  sample = 44

  while sample < waveNumbers.length
    if sample % 2 is 0
      if waveNumbers[sample + 1] >= 128
        rawAudio.push (-1) * (65536 - (waveNumbers[sample] + (waveNumbers[sample + 1] * 256)))
      else
        rawAudio.push waveNumbers[sample] + (waveNumbers[sample + 1] * 256)
    sample++
  channels = []
  channel = 0

  while channel < numberOfChannels
    channels.push []
    sample = 0

    while sample < (rawAudio.length / numberOfChannels)
      channels[channels.length - 1].push (rawAudio[sample] * numberOfChannels) + channel
      sample++
    channel++
  channels


# **********************
# The companion function of openWave

# This function will turn an array of sound into a wave file.

# Channels must be an array, containing array elements.
# The array elements are the channels of the wave file.
buildFile = (fileName, channels) ->
  manipulatedChannels = channels
  sameLength = true
  
  # The channels all have to be the same lenth, check to see if thats the case before proceeding
  unalteredChannel = 0

  while unalteredChannel < manipulatedChannels.length
    relativeChannel = 0

    while relativeChannel < (manipulatedChannels.length - channel)
      sameLength = false  if manipulatedChannels[channel].length isnt manipulatedChannels[relativeChannel + channel].length
      relativeChannel++
    unalteredChannel++
  unless sameLength
    longestChannelsLength = 0
    
    # If the channels are not all the same length, establish what the longest channel is
    channel = 0

    while channel < manipulatedChannels.length
      longestChannelsLength = manipulatedChannels[channel].length  if manipulatedChannels[channel].length > longestChannelsLength
      channel++
    
    # Add a duration of "silence" to each channel in the amount necessary to bring it to the length of the longest channel 
    channel = 0

    while channel < manipulatedChannels.length
      
      # The internet told me to do this, but it looks so messy:     manipulatedChannels[channel].concat(Array(manipulatedChannels[channel].length-longestChannelsLength).join('0').split('').map(parseFloat));
      sampleDif = 0

      while sampleDif < (longestChannelsLength - manipulatedChannels[channel].length)
        manipulatedChannels[channel].push 0
        channel++
      channel++
  
  # Make an Array, so that the audio samples can be aggregated in the standard way wave files are (For each sample i in channels a, b, and c, the sample order goes a(i),b(i),c(i),a(i+1),b(i+1),c(i+1), ... )
  channelAudio = []
  sample = 0

  while sample < manipulatedChannels[0].length
    channel = 0

    while channel < manipulatedChannels.length
      valueToAdd = 0
      if manipulatedChannels[channel][sample] < 0
        valueToAdd = manipulatedChannels[channel][sample] + 65536
      else
        valueToAdd = manipulatedChannels[channel][sample]
      channelAudio.push(valueToAdd) % 256
      channelAudio.push Math.floor(valueToAdd / 256)
      channel++
    sample++
  
  # Make an array containing all the header information, like sample rate, the size of the file, the samples themselves etc
  header = []
  header = header.concat([ # 'RIFF' in decimal
    82
    73
    70
    70
  ])
  thisWavFileSize = (manipulatedChannels[0].length * 2 * manipulatedChannels.length) + 36
  wavFileSizeZE = thisWavFileSize % 256
  wavFileSizeON = Math.floor(thisWavFileSize / 256) % 256
  wavFileSizeTW = Math.floor(thisWavFileSize / 65536) % 256
  wavFileSizeTH = Math.floor(thisWavFileSize / 16777216) % 256
  header = header.concat([ # This is the size of the file
    wavFileSizeZE
    wavFileSizeON
    wavFileSizeTW
    wavFileSizeTH
  ])
  header = header.concat([ # 'WAVE' in decimal
    87
    65
    86
    69
  ])
  header = header.concat([ # 'fmt[SQUARE]' in decimal
    102
    109
    116
    32
  ])
  header = header.concat([ # The size of the subchunk after this chunk of data
    16
    0
    0
    0
  ])
  header = header.concat([ # The second half of this datum is the number of channels
    1
    0
    manipulatedChannels.length % 256
    Math.floor(manipulatedChannels / 256)
  ])
  # The maximum number of channels is 65535
  header = header.concat([ # Sample Rate 44100.
    44100 % 256
    Math.floor(44100 / 256)
    0
    0
  ])
  byteRate = 44100 * manipulatedChannels.length * 2
  byteRateZE = byteRate % 256
  byteRateON = Math.floor(byteRate / 256) % 256
  byteRateTW = Math.floor(byteRate / 65536) % 256
  byteRateTH = Math.floor(byteRate / 16777216) % 256
  header = header.concat([
    byteRateZE
    byteRateON
    byteRateTW
    byteRateTH
  ])
  header = header.concat([ # The first half is the block align (2*number of channels), the second half is te bits per sample (16)
    manipulatedChannels.length * 2
    0
    16
    0
  ])
  header = header.concat([ # 'data' in decimal
    100
    97
    116
    97
  ])
  sampleDataSize = manipulatedChannels.length * manipulatedChannels[0].length * 2
  sampleDataSizeZE = sampleDataSize % 256
  sampleDataSizeON = Math.floor(sampleDataSize / 256) % 256
  sampleDataSizeTW = Math.floor(sampleDataSize / 65536) % 256
  sampleDataSizeTH = Math.floor(sampleDataSize / 16777216) % 256
  header = header.concat([
    sampleDataSizeZE
    sampleDataSizeON
    sampleDataSizeTW
    sampleDataSizeTH
  ])
  outputArray = header.concat(channelAudio)
  outputFile = new Buffer(outputArray)
  fs.writeFile fileName, outputFile
  return