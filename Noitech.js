/*jslint node: true */
"use strict";

var fs = require('fs');

// Tone Making Functions

var makeSine = function(tone,duration,amplitude){
	var amplitude = amplitude || 32767;
	var outRay = [];
	for (var sample = 0; sample<duration; sample++){
		outRay.push(amplitude*Math.sin(Math.PI*2*sample*tone));
	}
	return outRay;
};

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
	console.log(harmonicCount);
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

var makeSilence = function(duration){
	var outRay=[];
	for (var moment =0; moment<duration; moment++){
		outRay.push(0);
	}
	return outRay;
};

// Array manipulation functions

var merge = function(durRay,canvasRay,whereAt,level){
	var outRay = [];
	var whereAt = typeof whereAt == 'undefined' ? 0:whereAt;
	var level = typeof level == 'undefined' ? 1:level;
	console.log('LENGTH',canvasRay.length);
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

var invert = function(durRay){
	var outRay = [];
	for (var sample = 0; sample<durRay.length; sample++){
		outRay.push(durRay[sample]*(-1));
	}
	return outRay;
};

var padBefore = function(durRay,paddingAmount){
	var outRay=[];
	for (var padding = 0; padding<paddingAmount; padding++){
		outRay.push(0);
	}
	outRay=outRay.concat(durRay);
	return outRay;
};

var padAfter = function(durRay,paddingAmount){
	var outRay=[];
	for (var padding = 0; padding<paddingAmount; padding++){
		outRay.push(0);
	}
	outRay=durRay.concat(outRay);
	return outRay;	
};

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

var adjustAmplitudeResolution = function(durRay,extent){
	var outRay=[];
	for (var sample = 0; sample < durRay.length; sample++){
		outRay.push(Math.round(durRay[sample]/extent)*extent);
	}
};

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

var volumeChange = function(durRay,level){
	var outRay = [];
	for (var sample = 0; sample<durRay.length; sample++){
		outRay.push(durRay[sample]*level);
	}
	return outRay;
};

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
		outRay.push(durRay[sample]*endVolume);
	}
	return outRay;
};

var reverse=function(durRay){
	var outRay =[];
	for (var sample =0; sample<durRay.length; sample++){
		outRay.push(durRay[durRay.length-sample]);
	}
	return outRay;
};

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
				for (var sample = 0; sample <amountOfEndSamples; sample++){
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
		};
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
	var shiftMag = Math.abs(shift)
	for (var sample = 0; sample<durRay.length; sample++){
		outRay.push((wipRay[sample]*(1-shiftMag))+(wipRay[sample]*shiftMag));
	}
	return outRay;
};

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

var reverb = function(durRay,decayZE,decayON,delaysZE,delaysON){
	var delaysZE = [1115,1188,1356,1277,1422,1491,1617,1557] || delaysZE;
	var delaysON = [255,556,441,341] || delaysON;
	var reverbBackPass = function(subRay,decay,delays){
		var arrayOfDelayeds = [];
		for (var delay = 0; delay<delays.length; delay++){
			arrayOfDelayeds.push([]);
			for (var time = 0; time<subRay.length; sample++){
				arrayOfDelayeds[arrayOfDelayeds.length-1].push(0);
			}
			for (var padding = 0; padding<delays[delay]; padding++){
				arrayOfDelayeds[arrayOfDelayeds.length-1].push(0);
			}
			for (var sample = 0; sample<arrayOfDelayeds[delay].length; sample++){
				arrayOfDelayeds[arrayOfDelayeds.length-1][sample+delays[delay]]+=arrayOfDelayeds[delay][sample]*decay;
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
			for (var time = 0; time<(undelays[undelay].length+subRay.length); time++){
				arrayOfUndelayeds[arrayOfUndelayeds.length-1].push(0);
			}
			for (var sample = 0; sample<subRay.length; sample++){
				arrayOfUndelayeds[arrayOfUndelayeds.length-1][sample]+=subRay[sample+undelays[undelay]]*decay;
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

var convolve = function(durRay,convoluteSeed,level){
	var outRay = 0;
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

var declip = function(durRay,margin){
	if (durRay.length > 30){
		var margin = margin || 30;		
	}
	return fadeIn(fadeOut(durRay,durRay.length-margin),0,margin);
};

// Math functions

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

// System Functions

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

buildFile('partiaIncreaseTEST.wav',[shiftSamples(openWave('MCRide_metadataclean.wav')[0],0.5)]);