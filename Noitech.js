/*jslint node: true */
"use strict";

var fs = require('fs');

// This is Noitech, a collection of audio generating, manipulating, and saving functions. 
// The plan is to expand this into a UI, with simular functionality to Audacity, but better suited for music composition.

// All durations are expressed in samples. The sample rate of 44100 is assumed. 
// Parameters dependent on time measurement and therefore also based in samples. 
// A tone of 400 hertz, for example, must be given as 400/44100

// All audio segments are arrays of numbers, whos elements t are an amplitude at time t within the range
// -32767 and 32767. Arrays can be opened out of wave files with the 'openFile' function, and saved with the 'buildFile'
// function. Amplitude values over 32767 or under -32767 are saved around the radix of 32767.


// ***************************************************
// Tone Making Functions
// ***************************************************

// For many of the tone making functions, there are the arguments 'harmonicCount', 'enharmonicity', and 'harmonicDecay'.
// Only HarmonicCount is a necessaryargument. The others are optional, and do not need to be specified.
// I will explain those below

// *********************
// harmonicCount
// Harmonic sounds, are sounds that consist of a tonic tone ( a frequency ) and harmonics ( a frequency that is the tonic
// tone times  an integer ). The harmoincCount variable is how many harmonics you want to be generated 'on top' of your 
// tonic tone (the argumnent 'tone'). More harmonics mean more computation. I have found 30 to be an adequate value as 
// the harmonicCount argument

// *********************
// enharmonicity
// Enharmonicity generally means 'not harmonic', or the content of a sound that is noisy and not a function of the tonic
// frequency. In my functions, is the degree that the harmonics are imperfect. Physical bodies that produce harmonic 
// sounds (strings, bells, horns) have a tendency to produce harmonics that are actually a little higher in frequency 
// than the integer multiple of their tonic This is because the vibration actually increases the tension of the body, 
// which increases the frequency for harmonics above that tonic

// The argument 'enharmonicity' should be a very very low number. 0.0007 is my medium value.

// *********************
// harmonicDecay
// The argument harmonicDecay contributes a feature to my functions that is also based off a physical phenomenon of sound.
// Many physical bodies that produce harmonic sounds, tend to begin with very loud high harmonics, and end with volume 
// only in the lower harmonics. The energy in higher frequencies physically expresses itself turbulently and 'decays' 
// into lower frequencies.

// The argument 'harmonic decay' is the rate at which high frequencies lower in volume, and the tonic frequency increases
// in volume. All the harmonics decay in proportion to how high they are in frequency relative to the tonic frequency.



// Generates a Sine wave form
var makeSine = function(tone,duration,amplitude){
	var amplitude = amplitude*32767 || 32767;
	var outRay = [];
	for (var sample = 0; sample<duration; sample++){
		outRay.push(amplitude*Math.sin(Math.PI*2*sample*tone));
	}
	return outRay;
};

// Generates a Saw Tooth Wave form
var makeSaw=function(tone,duration,harmonicCount,amplitude,enharmonicity,harmonicDecay){
	var amplitude = amplitude*32767 || 32767;
	var enharmonify= function(enharmonicity,harmonic){
		var value = typeof enharmonicity == 'undefined' ? 1: Math.pow(1+enharmonicity,harmonic);
		return value;
	};
	var decay=function(harmonicDecay,harmonic,moment){
		if (typeof harmonicDecay == 'undefined'){
			return 1;
		}
		else{
			if (harmonic > 1){
				return (1-(Math.pow(moment/Math.pow(Math.pow(moment,2)+1,0.5),harmonicDecay/harmonic)));
			}
			else{
				return ((moment)/(Math.pow(Math.pow(moment,2)+1,0.5)));
			}
		}
	};
	var outRay = [];
	for (var moment =0; moment<duration ; moment++){
		outRay.push(0);
	}
	for (var harmonic=1; harmonic<=harmonicCount; harmonic++){
		for (var moment =0; moment<outRay.length ; moment++){
			outRay[moment]+=decay(harmonicDecay,harmonic,moment)*amplitude*(Math.pow(-1,harmonic)/harmonic)*(Math.sin(moment*Math.PI*2*tone*harmonic*enharmonify(enharmonicity,harmonic)));
		}
	}
	var	numerator = 2*(harmonicCount-1);
	var	denominator = Math.PI*Math.pow(Math.pow(harmonicCount-1,2)+1,0.5);
	for (var sample = 0; sample<outRay.length; sample++){
		outRay[sample]*=(1-(numerator/denominator));
	}
		return outRay;
};

// Generates a triangle wave form
var makeTriangle =function(tone,duration,harmonicCount,amplitude,enharmonicity,harmonicDecay){
	var amplitude = amplitude*32767 || 32767;
	var enharmonify= function(enharmonicity,harmonic){
		var value = typeof enharmonicity == 'undefined' ? 1: Math.pow(1+enharmonicity,harmonic);
		return value;
	};
	var decay = function(harmonicDecay,harmonic,moment){
		if (typeof harmonicDecay == 'undefined'){
			return 1;
		}
		else{
			if (harmonic > 1){
				return (1-(Math.pow(moment/Math.pow(Math.pow(moment,2)+1,0.5),harmonicDecay/harmonic)));
			}
			else{
				return ((moment)/(Math.pow(Math.pow(moment,2)+1,0.5)));
			}
		}
	};
	var outRay = [];
	for (var moment =0; moment<duration ; moment++){
		outRay.push(0);
	}
	for (var harmonic=0; harmonic<harmonicCount; harmonic++){
		for (var moment =0; moment<outRay.length ; moment++){
			outRay[moment]+=decay(harmonicDecay,harmonic,moment)*amplitude*Math.pow(-1,harmonic)*Math.sin(moment*Math.PI*2*tone*((harmonic*2)+1)*enharmonify(enharmonicity,harmonic))/Math.pow((harmonic*2)+1,2);
		}
	}
	var	numerator = 8*(harmonicCount-1);
	var	denominator = (Math.pow(Math.PI,2)*Math.pow(Math.pow(harmonicCount-1,2)+1,0.5));
	for (var sample = 0; sample<outRay.length; sample++){
		outRay[sample]*=(1-(numerator/denominator));
	}
	return outRay;
};

// Generates a square wave form
var makeSquare = function(tone,duration,harmonicCount,amplitude,enharmonicity,harmonicDecay){
	var amplitude = amplitude*32767 || 32767;
	var enharmonify = function(enharmonicity,harmonic){
		var value = typeof enharmonicity == 'undefined' ? 1:(1+(harmonic*enharmonicity));
		return value;
	};
	var decay = function(harmonicDecay,harmonic,moment){
		if (typeof harmonicDecay == 'undefined'){
			return 1;
		}
		else{
			if (harmonic > 1){
				return (1-(Math.pow(moment/Math.pow(Math.pow(moment,2)+1,0.5),harmonicDecay/harmonic)));
			}
			else{
				return ((moment)/(Math.pow(Math.pow(moment,2)+1,0.5)));
			}
		}
	};
	var outRay = [];
	for (var moment =0; moment<duration ; moment++){
		outRay.push(0);
	}
	for (var harmonic=1; harmonic<=harmonicCount; harmonic++){
		for (var moment =0; moment<outRay.length ; moment++){
			outRay[moment]+=decay(harmonicDecay,harmonic,moment)*(amplitude/((harmonic*2)-1))*Math.sin(moment*Math.PI*2*tone*((harmonic*2)-1)*enharmonify(enharmonicity,harmonic));
		}
	}
	var	numerator = 4*(harmonicCount-1);
	var	denominator = Math.PI*Math.pow(Math.pow(harmonicCount-1,2)+1,0.5);
	for (var sample = 0; sample<outRay.length; sample++){
		outRay[sample]*=(1-(numerator/denominator));
	}
	return outRay;
};

// Generates a duration of silence
var makeSilence = function(duration){
	var outRay=[];
	for (var moment =0; moment<duration; moment++){
		outRay.push(0);
	}
	return outRay;
};

// ***************************************************
// Array manipulation functions
// ***************************************************

// These functions manipulate arrays in a great variety of ways

// ***************************
// Merge adds the durRay array to the canvasRay array at sample whereAt, with volume level
var merge = function(durRay,canvasRay,whereAt,level){
	var outRay = [];
	var whereAt = typeof whereAt == 'undefined' ? 0:whereAt;
	var level = typeof level == 'undefined' ? 1:level;
	for (var sample = 0; sample<canvasRay.length; sample++){
		outRay.push(canvasRay[sample]);
	}
	if ((whereAt+durRay.length)>canvasRay.length){
		for (var padding = 0; padding<((whereAt+durRay.length)-canvasRay.length); padding++){
			outRay.push(0);
		}
	}
	for (var sample = 0; sample<durRay.length; sample++){
		outRay[whereAt+sample]+=durRay[sample]*level;
	}
	return outRay;
};

// ***************************
// Substitute is similar to merge, however it also damps the volume of the canvasRay for the duration of durRay to a volume of value subtitutionLevel 
// The reason for this, is to simulate how natural sounds sometimes overwelm each other when in succession, rather than co-exist.
var substitute = function(durRay,canvasRay,whereAt,level,substitutionLevel){
	var outRay=[];
	var whereAt = typeof whereAt == 'undefined' ? 0:whereAt;
	var level = typeof level == 'undefined' ? 1:level;
	var substitutionLevel = typeof substititionLevel == 'undefined' ? 0.1:substitutionLevel;
	for (var sample = 0; sample<canvasRay.length; sample++){
		outRay.push(canvasRay[sample]);
	}
	for (var sample = 0; sample<durRay.length; sample++){
		outRay[sample+whereAt]*=substitutionLevel;
		outRay[sample+whereAt]+=durRay[sample]*level;
	}
	return outRay;
};

// ***************************
// Invert multiplies each amplitude by -1. Any sound and its inverse combined are silence.
var invert = function(durRay){
	var outRay = [];
	for (var sample = 0; sample<durRay.length; sample++){
		outRay.push(durRay[sample]*(-1));
	}
	return outRay;
};

// ***************************
// Add a duration of silences at the beginning of a sound array.
var padBefore = function(durRay,paddingAmount){
	var outRay=[];
	for (var padding = 0; padding<paddingAmount; padding++){
		outRay.push(0);
	}
	outRay=outRay.concat(durRay);
	return outRay;
};

// ***************************
// Add a duration of silence at the end of a sound array
var padAfter = function(durRay,paddingAmount){
	var outRay=[];
	for (var padding = 0; padding<paddingAmount; padding++){
		outRay.push(0);
	}
	outRay=durRay.concat(outRay);
	return outRay;	
};

// ***************************
// Makes low amplitudes lower. 
// Makes a 'computery' sound where noises come in packed bursts.
var quietReducer = function(durRay,degree,amplitude){
	var amplitude = amplitude*32767 || 32767;
	var outRay =[];
	for (var moment = 0; moment<durRay.length; moment++){
		outRay.push(0);
	}
	for (moment=0; moment<durRay.length; moment++){
		if (durRay[moment]>0){
			outRay[moment]=durRay[moment]*Math.pow((durRay[moment]/amplitude),(1+degree));	
		}
		else{
			outRay[moment]=durRay[moment]*Math.pow(((durRay[moment]/amplitude)*(-1)),(1+degree));
		}
	}
	return outRay;
};

// ***************************
// Repeat the sound many times, with a decay, spaced out apart
var delay = function(durRay,howMany,space,decay){
	var outRay=[];
	for (var moment = 0; moment<(durRay.length+(howMany*space)); moment++){
		outRay.push(0);
	}
	for (var sample = 0; sample<durRay.length; sample++){
		for (var iteration = 0; iteration<howMany; iteration++){
			outRay[sample]+=durRay[sample+(iteration*space)]*Math.pow(decay,iteration);
		}
	}
	return outRay;
};

// ***************************
// Reduces the range of increments of an amplitude. 
// For example, an extent value 2, would remove all the odd numbered amplitudes
// The amplitude essentially has a smaller number of bits
var adjustAmplitudeResolution = function(durRay,extent){
	var outRay=[];
	for (var sample = 0; sample < durRay.length; sample++){
		outRay.push(Math.round(durRay[sample]/extent)*extent);
	}
};

// ***************************
// Make sure no amplitude exceeds a certain level.
var clip = function(durRay,threshold){
	var threshold = threshold * 32767;
	var outRay=[];
	for (var sample = 0; sample<durRay.length; sample++){
		if (durRay[sample]>threshold){
			outRay.push(Math.floor(threshold));
		}
		else{
			outRay.push(durRay[sample]);
		}
	}
	return outRay;
};

// ***************************
// Change the every amplitude 
var volumeChange = function(durRay,level){
	var outRay = [];
	for (var sample = 0; sample<durRay.length; sample++){
		outRay.push(durRay[sample]*level);
	}
	return outRay;
};

// ***************************
// Make the volume fade out
// If no value is given for endVolume, it fades out to silence
// If no value is given to whereBegin, or whereEnd, it fades starting at the beginning, and ending at the ending of the array.
var fadeOut=function(durRay,whereBegin,whereEnd,endVolume){
	var whereBegin = whereBegin || 0;
	var whereEnd = whereEnd || durRay.length-1;
	var endVolume = endVolume || 0;
	var outRay=[];
	var rateOfReduction = (1-endVolume)/(whereEnd-whereBegin);
	for (var sample = 0; sample<whereBegin; sample++){
		outRay.push(durRay[sample]);
	}
	for (var sample = 0; sample<(whereEnd-whereBegin); sample++){
		outRay.push(Math.round(durRay[sample]*(1-(sample*rateOfReduction))));
	}
	for (var sample = 0; sample<(durRay.length-whereEnd-1); sample++){
		outRay.push(Math.round(durRay[sample]*endVolume));
	}
	return outRay;
};

// ***************************
// Identical to fade in, but where it begins at the modified volume, and eases into the normal volume.
var fadeIn=function(durRay,whereBegin,whereEnd,startVolume){
	var whereBegin = whereBegin || 0;
	var whereEnd = whereEnd || durRay.length-1;
	var startVolume = startVolume || 0;
	var outRay=[];
	var rateOfIncrease = (1-startVolume)/(whereEnd-whereBegin);
	for (var sample = 0; sample<whereBegin; sample++){
		outRay.push(Math.round(durRay[sample]*startVolume));
	}
	var changeLength = whereEnd-whereBegin;
	for (var sample = 0; sample<changeLength; sample++){
		outRay.push(Math.round(durRay[sample]*(1-((changeLength-sample)*rateOfIncrease))));
	}
	for (var sample = 0; sample<(durRay.length-whereEnd-1); sample++){
		outRay.push(durRay[sample]);
	}
	return outRay;
};

// ***************************
// Reverse the sound
var reverse=function(durRay){
	var outRay =[];
	for (var sample =0; sample<durRay.length; sample++){
		outRay.push(durRay[durRay.length-sample]);
	}
	return outRay;
};

// ***************************
// Change the speed of the sound, altering its frequency.
// The argument change, should be how many times faster or slower you want the sound
// For example '2' would double the speed.
// Fraction values also work
var changeSpeed = function(durRay,change){
	var outRay=[];
	var changes = factorize(change);
	var increases = 0;

	var multiplySpeed = function(durRay,factorIncrease){
		var outRay=[];
		for (var interval = 0; interval<(Math.floor(durRay.length)/factorIncrease); interval++){
			var averageValue = 0;
			for (var sample = 0; sample<factorIncrease; sample++){
				averageValue+=durRay[sample+(interval*factorIncrease)];
			}
			averageValue/=factorIncrease;
			outRay.push(averageValue);
		}
		if ((durRay/factorIncrease)%1 !== 0){
			var amountOfEndSamples = durRay.length - (Math.floor(durRay.length/factorIncrease)*factorIncrease);
			if (!(amountOfEndSamples<(factorIncrease/2))){
				var averageValue = 0;
				for (var sample = 0; sample<amountOfEndSamples; sample++){
					averageValue+=durRay[durRay.length-1-sample];
				}
				averageValue/=amountOfEndSamples;
				outRay.push(averageValue);
			}
		}
		return outRay;
	};

	var divideSpeed = function(durRay,factorDecrease){
		var outRay=[];
		for (var sample = 0; sample<(durRay.length-1); sample++){
			outRay.push(durRay[sample]);
			var distanceToNextSample = (durRay[sample+1]-durRay[sample]);
			var distanceStep = distanceToNextSample/factorDecrease;
			for (var fillIn = 1; fillIn<factorDecrease; fillIn++){
				outRay.push(durRay[sample]+Math.round(fillIn*distanceStep));
			}
		}
		for (var fillIn = 1; fillIn<factorDecrease; fillIn++){
			outRay.push(durRay[durRay.length-1]);
		}
		return outRay;
	};

	for (var sample = 0; sample<durRay.length; sample++){
		outRay.push(durRay[sample]);		
	}
	for (var decrease = 0; decrease<changes[1].length; decrease++){
		outRay=divideSpeed(outRay,changes[1][decrease]);
	}
	for (var increase = 0; increase<changes[0].length; increase++){
		outRay=multiplySpeed(outRay,changes[0][increase]);
	}
	return outRay;
};

// ***************************
// Shift samples tries and recreate the sound, if it happened a fraction of a sample earlier or later
// This function is useful for some esoteric reasons involved with the grainsynth function below
// The simple explaination is that the period of many human-audible tones, happen at a non-integer
// frequency. Rounding to integer values creates human-audible beats that result when sounds are
// out of tune. 

// The shiftSamples function is therefore essential to functions that create non-perceivable
// sound phenamena, that determine the quality of seperate perceivable sound phemonena.

// The argument 'shift' is a number between -1 and 1. 0.5 for example, produces an array
// where every sample is a portion of two succeeding samples in durRay.

// Whether the shift is positive or negative, only serves to decide if it will add one sample
// of amplitude zero to the beginning, or end of the array, which insures the output is the same
// length as the input
var shiftSamples = function(durRay,shift){ // Shift is a number between -1 and 1.
	var outRay = [];
	var wipRay = [];
	if (shift===0 || shift=='undefined'){
		return durRay;
	}
	for (var sample = 0; sample<durRay.length; sample++){
		wipRay.push(durRay[sample]);
	}
	if (shift > 0){
		wipRay = [0].concat(wipRay);
	}
	else{
		wipRay = wipRay.concat([0]);
	}
	var shiftMag = Math.abs(shift);
	for (var sample = 0; sample<durRay.length; sample++){
		outRay.push((wipRay[sample]*(1-shiftMag))+(wipRay[sample]*shiftMag));
	}
	return outRay;
};

// ***************************
// For every segment of sound that falls between two drops in volume
// Cut that segment out as an array, and add that array to an output array
// Which will contain all the 'grains' found in the input array

// Its not perfect, since every sound likely contains sounds below
// certain amplitudes. It therefore is prejudiced against low frequencies.
// That are for any given moment more likely to contain samples of any amplitude
var cutUpEveryGrain = function(durRay,amplitudeThreshold){
	var grains = [];
	var beginning = 0;
	var ending = 0;
	for (var moment = 0; moment<durRay.length; moment++){
		if (durRay[moment]<amplitudeThreshold){
			ending = moment;
			grains.push(durRay.slice(beginning,ending));
			moment = moment;
		}
	}
	return grains;
};

// ***************************
// Basic reverb simulation based off the freeverb algorithm ( I think )
// Basically is delays the sound by the intervals given as elements of an input array
// Then, it takes the sound of the delays, and 'undelays', meaning passes the echo
// forward in time, the same way that we hear an echo after the original sound.

// This partially simulates how reverb actually occurs. We hear a first reflection of
// the sound, quietly, and then we hear an instant later several louder reflections of the
// same sound, which decays into quiet noise.

// The echo is therefore fixed by the decay array. I havent fooled around with the delay values
// But I suspect the number of workable combinations is small, and it will be difficult to find
// Other functional values.
var reverb = function(durRay,decayZE,decayON,delaysZE,delaysON){
	var delaysZE = [1115,1188,1356,1277,1422,1491,1617,1557] || delaysZE;
	var delaysON = [255,556,441,341] || delaysON;
	var reverbBackPass = function(subRay,decay,delays){
		var arrayOfDelayeds = [];
		for (var delay = 0; delay<delays.length; delay++){
			arrayOfDelayeds.push([]);
			for (var padding = 0; padding<delays[delay]; padding++){
				arrayOfDelayeds[arrayOfDelayeds.length-1].push(0);
			}
			for (var sample = 0; sample<subRay.length; sample++){
				arrayOfDelayeds[arrayOfDelayeds.length-1].push(subRay[sample]);
			}
			for (var sample = 0; sample<subRay.length; sample++){
				arrayOfDelayeds[arrayOfDelayeds.length-1][sample]+=arrayOfDelayeds[arrayOfDelayeds.length-1][sample+delays[delay]]*decay;
			}
		}
		var backOutRay=[];
		for (var time = 0; time<(Math.max.apply(null,delays)+subRay.length); time++){
			backOutRay.push(0);
		}
		for (var delayedArray = 0; delayedArray<arrayOfDelayeds.length; delayedArray++){
			for (var sample = 0; sample<arrayOfDelayeds[delayedArray].length; sample++){
				backOutRay[sample]+=arrayOfDelayeds[delayedArray][sample]/arrayOfDelayeds.length;
			}
		}
		return backOutRay;
	};
	var reverbForwardPass = function(subRay,decay,undelays){
		var arrayOfUndelayeds = [];
		for (var undelay = 0; undelay<undelays.length; undelay++){
			arrayOfUndelayeds.push([]);
			for (var time = 0; time<(undelays[undelay]+subRay.length); time++){
				arrayOfUndelayeds[arrayOfUndelayeds.length-1].push(0);
			}
			for (var sample = 0; sample<subRay.length; sample++){
				arrayOfUndelayeds[arrayOfUndelayeds.length-1][sample+undelays[undelay]]+=subRay[sample]*decay;
			}
		}
		var forwardOutRay=[];
		for (var time = 0; time<(Math.max.apply(null,undelays)+subRay.length); time++){
			forwardOutRay.push(0);
		}
		for (var undelayedArray =0; undelayedArray<arrayOfUndelayeds.length; undelayedArray++){
			for (var sample = 0; sample<arrayOfUndelayeds[undelayedArray].length; sample++){
				forwardOutRay[sample]+=arrayOfUndelayeds[undelayedArray][sample]/undelays.length;
			}
		}
		return forwardOutRay;
	};
	return reverbForwardPass(reverbBackPass(durRay,decayZE,delaysZE),decayON,delaysON);
};

// ***************************
// Convolve is a novel way of simulating reverb. Enter another sound array 'convoluteSeed'
// And simular durRay as if convoluteSeed were the profile of an echo.

// For example, if convolute seed were [32767,0,0,17454,0], we would put the value of durRay
// at point N, at n+1,n+2,n+3, and n+4, with the amplitudes corresponding the elements of the 
// of [32767,0,017454,0]

// convoluteSeed shouldnt be an array of a sound, but an array of how how a single 'ping' would
// sound from a fixed point in a room. Any impulse of sound, is heard several times from a listener
// at several volumes as it bounces off the walls in various ways. convoluteSeed should be how any
// sound would sound in a given room.  
var convolve = function(durRay,convoluteSeed,level){
	var level = level || 0.05;
	var outRay = [];
	for (var time = 0; time<(durRay.length+convoluteSeed.length); time++){
		outRay.push(0);
	}
	for (var sample = 0; sample<durRay.length; sample++){
		for (var convolveSample = 0; convolveSample<convoluteSeed.length; convolveSample++){
			outRay[sample+convolveSample]+=durRay[sample]*(convoluteSeed[convolveSample]/32767)*level;
		}
	}
	return outRay;
};

// ***************************
// Declip, not the confused as an antagonist to the clip function

// samples often have values that start at very high amplitudes. This causes speakers
// to 'pop' with the sudden change in amplitude. The declip function makes the sample
// start and end at an amplitude of zero, and quickly (in 30 samples) adjust to the samples
// given volume
var declip = function(durRay,margin){
	var margin = 30 || margin;
	while (durRay.length < margin){
		margin/=2;
		margin=Math.floor(margin);		
	}
	return fadeIn(fadeOut(durRay,durRay.length-margin),0,margin);
};

// ***************************
//  Change the frequency, but not the duration, of a sound file

// Not all combinations of grainLength, and passes will work. Most combinations silence certain
// frequencies.
var grainSynth = function(durRay,freqInc,grainLength,passes,fade){
	var grainRate = grainLength/passes;
	var fade = fade || true;
	var grains = [];
	var sampleSpot=0;
	while (sampleSpot<durRay.length){
		var startingSample = Math.floor(sampleSpot);
		var sampleModulus = sampleSpot%1;
		var thisGrainLength = 0;
		grains.push([]);
		if ((durRay.length-sampleSpot)>grainLength){
			thisGrainLength=grainLength;
		}
		else{
			thisGrainLength=durRay.length-sampleSpot;
		}
		grains.push(shiftSamples(durRay.slice(sampleSpot,sampleSpot+thisGrainLength),sampleModulus));
		sampleSpot+=grainRate;
	}
	if (fade){
		for (var grain = 0; grain<grains.length; grain++){
			grains[grain]=changeSpeed(grains[grain],freqInc);
			if (grains[grain].length>30){
				grains[grain]=fadeIn(fadeOut(grains[grain]));
			}
			else{
				grains[grain]=fadeIn(fadeOut(grains[grain]));
			}
		}
	}
	else{
		for (var grain = 0; grain<grains.length; grain++){
			grains[grain]=changeSpeed(grains[grain],freqInc);
		}
	}
	var outRay = [];
	for (var time = 0; time<durRay.length; time++){
		outRay.push(0);
	}
	for (var grainIndex = 0; grainIndex<grains.length; grainIndex++){
		for (var moment = 0; moment<grains[grainIndex].length; moment++){
			outRay[moment+Math.floor((grainIndex/2)*grainRate)]+=grains[grainIndex][moment];
		}
	}
	return outRay;
};

var glissando = function(durRay,endingFreq,grainLength,passes,fade){
	var grainRate = grainLength/passes;
	var fade = fade || true;
	var grains = [];
	var sampleSpot=0;
	while (sampleSpot<durRay.length){
		var startingSample = Math.floor(sampleSpot);
		var sampleModulus = sampleSpot%1;
		var thisGrainLength = 0;
		grains.push([]);
		if ((durRay.length-sampleSpot)>grainLength){
			thisGrainLength=grainLength;
		}
		else{
			thisGrainLength=durRay.length-sampleSpot;
		}
		grains.push(shiftSamples(durRay.slice(sampleSpot,sampleSpot+thisGrainLength),sampleModulus));
		sampleSpot+=grainRate;
	}
	var gradientLength=grains.length;
	var freqIncrement=((endingFreq-1)/gradientLength);
	if (fade){
		for (var grain = 0; grain<grains.length; grain++){
			grains[grain]=changeSpeed(grains[grain],((freqIncrement*grain)+1).toFixed(2));
			if (grains[grain].length>30){
				grains[grain]=fadeIn(fadeOut(grains[grain]));
			}
			else{
				grains[grain]=fadeIn(fadeOut(grains[grain]));
			}
		}
	}
	else{
		for (var grain = 0; grain<grains.length; grain++){
			grains[grain]=changeSpeed(grains[grain],(freqIncrement*grain)+1);
		}
	}
	var outRay = [];
	for (var time = 0; time<durRay.length; time++){
		outRay.push(0);
	}
	for (var grainIndex = 0; grainIndex<grains.length; grainIndex++){
		for (var moment = 0; moment<grains[grainIndex].length; moment++){
			outRay[moment+Math.floor((grainIndex/2)*grainRate)]+=grains[grainIndex][moment];
		}
	}
	return outRay;
};

var lopass = function(durRay,wing,extent,mix){
	var extent = extent || 2;
	var mix = mix || 1;
	var outRay = [];
	var wipRay = [];
	var breath = (wing*2)+1;
	for (var time = 0; time < wing; time++){
		wipRay.push(durRay[0]);
	}
	for (var sample = 0; sample < durRay.length; sample++){
		wipRay.push(durRay[sample]);
		outRay.push(0);
	}
	for (var time = 0; time < wing; time++){
		wipRay.push(durRay[durRay.length-1]);
	}
	var divisor = Math.pow(extent,wing);
	var summation = 0;
	var leftWing = [];
	for (var iteration = 0; iteration<wing; iteration++){
		summation+=Math.pow(extent,iteration);
		leftWing.push(Math.pow(extent,iteration));
	}
	var rightWing = [];
	for (var element = 0; element<leftWing.length; element++){
		rightWing.push(leftWing[leftWing.length-1-element]);
	}
	var factorRange = (leftWing.concat([Math.pow(2,wing)])).concat(rightWing);	
	summation*=2;
	divisor+=summation;
	if (extent<2){
		divisor=factorRange.length;
		for (var factor = 0; factor<factorRange.length; factor++){
			factorRange[factor]=1;
		}
	}
 	for (var sample = 0; sample<durRay.length; sample++){
 		var value = 0;
 		for (var element = 0; element<factorRange.length; element++){
 			value+=factorRange[element]*wipRay[sample+element];
 		}
 		outRay[sample]=Math.round(value/(divisor));
 	}
 	for (var sample=0; sample<durRay.length; sample++){
 		outRay[sample]=(outRay[sample]*mix)+(durRay[sample]*(1-mix));
 	}
 	return outRay;
};

var hipass = function(durRay,wing,mix){
	return merge(durRay,invert(lowpass(durRay,wing,mix)));
}

// ************************************************************
// Math functions
// ************************************************************

// ***************************
// Return the prime factors found in the numerator and denominator of a number, interpretted as a rational number.
var factorize = function(fraction){
	var numeratorsFactors = [];
	var denominatorsFactors =[];
	var isInteger = function(number){
		if (number%1 === 0){
			return true;
		}
		else{
			return false;
		}
	};
	for (var denominatorCandidate=1; !isInteger(fraction*denominatorCandidate); denominatorCandidate++){}
	var denominator=denominatorCandidate;
	var numerator=fraction*denominator;

	var factoringCandidate=2;
	while (factoringCandidate<=denominator){
		if(isInteger(denominator/factoringCandidate)){
			denominator/=factoringCandidate;
			denominatorsFactors.push(factoringCandidate);
		}
		else{
			factoringCandidate++;
		}
	}

	var factoringCandidate=2;
	while (factoringCandidate<=numerator){
		if(isInteger(numerator/factoringCandidate)){
			numerator/=factoringCandidate;
			numeratorsFactors.push(factoringCandidate);
		}
		else{
			factoringCandidate++;
		}
	}
	return [numeratorsFactors,denominatorsFactors];
};

// ************************************************************
// System Functions
// ************************************************************

// **********************
// openWave will open a wave file, and return an array containing arrays. 
// The array elements of the returned array are the channels of the wave file.

// One channel wave files, and therefore returned as an array, containing a single array, containing the sound samples
var openWave = function(fileName){
	var rawAudio = [];
	var rawWave = fs.readFileSync(fileName);
	var waveNumbers = [];
	for (var datum=0; datum<rawWave.length;datum++){
		waveNumbers.push(rawWave.readUInt8(datum));
	}
	var numberOfChannels=waveNumbers[20];
	for (var sample = 44; sample<waveNumbers.length; sample++){
		if (sample%2===0){
			if (waveNumbers[sample+1]>=128){
				rawAudio.push((-1)*(65536-(waveNumbers[sample]+(waveNumbers[sample+1]*256))));
			}
			else{
				rawAudio.push(waveNumbers[sample]+(waveNumbers[sample+1]*256));
			}
		}
	}
	var channels=[];
	for (var channel = 0; channel<numberOfChannels; channel++){
		channels.push([]);
		for (var sample = 0; sample<(rawAudio.length/numberOfChannels); sample++){
			channels[channels.length-1].push((rawAudio[sample]*numberOfChannels)+channel);
		}
	}
	return channels;
};

// **********************
// The companion function of openWave

// This function will turn an array of sound into a wave file.

// Channels must be an array, containing array elements.
// The array elements are the channels of the wave file.
var buildFile = function(fileName,channels){
	var manipulatedChannels = channels;
	var sameLength = true;
	// The channels all have to be the same lenth, check to see if thats the case before proceeding
	for (var unalteredChannel = 0; unalteredChannel < manipulatedChannels.length; unalteredChannel++){
		for (var relativeChannel = 0; relativeChannel < (manipulatedChannels.length-channel); relativeChannel++){
			if (manipulatedChannels[channel].length !== manipulatedChannels[relativeChannel+channel].length){
				sameLength=false;
			}
		}
	}
	if (!sameLength){
		var longestChannelsLength=0;
		// If the channels are not all the same length, establish what the longest channel is
		for (var channel=0; channel<manipulatedChannels.length; channel++){
			if (manipulatedChannels[channel].length > longestChannelsLength){
				longestChannelsLength=manipulatedChannels[channel].length;
			}
		}
		// Add a duration of "silence" to each channel in the amount necessary to bring it to the length of the longest channel 
		for (var channel=0; channel<manipulatedChannels.length; channel++){
			// The internet told me to do this, but it looks so messy:			manipulatedChannels[channel].concat(Array(manipulatedChannels[channel].length-longestChannelsLength).join('0').split('').map(parseFloat));
			for (var sampleDif=0; sampleDif<(longestChannelsLength-manipulatedChannels[channel].length); channel++){
				manipulatedChannels[channel].push(0);
			}
		}
	}
	// Make an Array, so that the audio samples can be aggregated in the standard way wave files are (For each sample i in channels a, b, and c, the sample order goes a(i),b(i),c(i),a(i+1),b(i+1),c(i+1), ... )
	var channelAudio=[];
	for (var sample=0; sample<manipulatedChannels[0].length; sample++){
		for (var channel=0; channel<manipulatedChannels.length; channel++){
			var valueToAdd = 0;
			if (manipulatedChannels[channel][sample]<0){
				valueToAdd = manipulatedChannels[channel][sample]+65536;
			}
			else{
				valueToAdd = manipulatedChannels[channel][sample];
			}
			channelAudio.push(valueToAdd)%256;
			channelAudio.push(Math.floor(valueToAdd/256));
		}
	}

	// Make an array containing all the header information, like sample rate, the size of the file, the samples themselves etc
	var header = [];

	header=header.concat([82,73,70,70]); // 'RIFF' in decimal

	var thisWavFileSize=(manipulatedChannels[0].length*2*manipulatedChannels.length)+36;
	var wavFileSizeZE=thisWavFileSize%256;
	var wavFileSizeON=Math.floor(thisWavFileSize/256)%256;
	var wavFileSizeTW=Math.floor(thisWavFileSize/65536)%256;
	var wavFileSizeTH=Math.floor(thisWavFileSize/16777216)%256;
	header=header.concat([wavFileSizeZE,wavFileSizeON,wavFileSizeTW,wavFileSizeTH]); // This is the size of the file

	header=header.concat([87,65,86,69]); // 'WAVE' in decimal

	header=header.concat([102,109,116,32]); // 'fmt[SQUARE]' in decimal

	header=header.concat([16,0,0,0]); // The size of the subchunk after this chunk of data

	header=header.concat([1,0,manipulatedChannels.length%256,Math.floor(manipulatedChannels/256)]); // The second half of this datum is the number of channels
	// The maximum number of channels is 65535

	header=header.concat([44100%256,Math.floor(44100/256),0,0]); // Sample Rate 44100.

	var byteRate = 44100*manipulatedChannels.length*2;
	var byteRateZE = byteRate%256;
	var byteRateON = Math.floor(byteRate/256)%256;
	var byteRateTW = Math.floor(byteRate/65536)%256;
	var byteRateTH = Math.floor(byteRate/16777216)%256;
	header=header.concat([byteRateZE,byteRateON,byteRateTW,byteRateTH]);

	header=header.concat([manipulatedChannels.length*2,0,16,0]); // The first half is the block align (2*number of channels), the second half is te bits per sample (16)

	header=header.concat([100,97,116,97]); // 'data' in decimal

	var sampleDataSize = manipulatedChannels.length*manipulatedChannels[0].length*2;
	var sampleDataSizeZE = sampleDataSize%256;
	var sampleDataSizeON = Math.floor(sampleDataSize/256)%256;
	var sampleDataSizeTW = Math.floor(sampleDataSize/65536)%256;
	var sampleDataSizeTH = Math.floor(sampleDataSize/16777216)%256;
	header=header.concat([sampleDataSizeZE,sampleDataSizeON,sampleDataSizeTW,sampleDataSizeTH]);

	var outputArray = header.concat(channelAudio);

	var outputFile = new Buffer(outputArray);

	fs.writeFile(fileName,outputFile);

};

buildFile('lopassMitOne.wav',[lopass(makeSaw(400/44100,44100*3,30),400,1)]);
buildFile('lopassMitOne0.wav',[lopass(makeSaw(400/44100,44100*3,30),800,1)]);
buildFile('lopassMitTwo.wav',[lopass(makeSaw(400/44100,44100*3,30),400,2)]);