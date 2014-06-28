// 'Convenience' Functions

var secondsToSamples = function(duration,sampleRate){
	return duration*sampleRate
}

var frequencyInSamples = function(tone,sampleRate){
	var sampleRate = sampleRate || 44100;
	return tone/44100
}

// Tone Making Functions

var makeSine = function(tone,duration){
	var outRay = [];
	for (sample = 0; sample<duration; sample++){
		outRay.push(Math.sin(Math.PI*sample*tone));
	};
	return outRay;
}

var makeSaw=function(tone,duration,harmonicCount,amplitude,enharmonicity,harmonicDecay){
	var amplitude = amplitude || 32767;
	var enharmonify= function(enharmonicity,harmonic){
		var value = typeof enharmonicity == 'undefined' ? 1:(1+(harmonic*enharmonicity));
		return value;
	};
	var decay=function(harmonicDecay,harmonic,moment){
		if (typeof harmonicDecay == 'undefined'){
			return 1;
		}
		else{
			if (harmonic > 1){
				return (harmonicDecay/((harmonicDecay/20)+(moment*harmonic)));
			}
			else{
				return (1-(harmonicDecay/((harmonicDecay/20)+(moment*harmonic))));
			}
		}
	};
	var outRay = Array(duration);
	for (harmonic=1; harmonic<=harmonicCount; harmonic++){
		for (moment =0; moment<outRay.length ; moment++){
			outRay[moment]=
				decay(harmonicDecay,harmonic,moment)
				*(amplitude/harmonic)
				*Math.pow(-1,harmonic)
				*Math.sin(
					moment
					*Math.PI
					*2
					*tone
					*harmonic
					*enharmonify(enharmonicity,harmonic));
		}
	}
	return outRay;
};

var makeTriangle =function(tone,duration,harmonicCount,amplitude,enharmonicity,harmonicDecay){
	var amplitude = amplitude || 32767;
	var enharmonify= function(enharmonicity,harmonic){
		var value = typeof enharmonicity == 'undefined' ? 1:(1+(harmonic*enharmonicity));
		return value;
	};
	var decay = function(harmonicDecay,harmonic,moment){
		if (typeof harmonicDecay == 'undefined'){
			return 1;
		}
		else{
			if (harmonic > 1){
				return (harmonicDecay/((harmonicDecay/20)+(moment*harmonic)));
			}
			else{
				return (1-(harmonicDecay/((harmonicDecay/20)+(moment*harmonic))));
			}
		}
	};
	var outRay = Array(duration);
	for (harmonic=1; harmonic<=harmonicCount; harmonic++){
		for (moment =0; moment<outRay.length ; moment++){
			outRay[moment]=
				decay(harmonicDecay,harmonic,moment)
				*(amplitude/Math.pow((harmonic*2)+1,2))
				*Math.pow(-1,harmonic)
				*Math.sin(
					moment
					*Math.PI
					*2
					*tone
					*Math.pow((harmonic*2)+1,2)
					*enharmonify(enharmonicity,harmonic));
		}
	}
	return outRay;
};

var makeSquare = function(tone,duration,harmonicCount,amplitude,enharmonicity,harmonicDecay){
	var amplitude = amplitude || 32767;
	var enharmonify = function(enharmonicity,harmonic){
		value = typeof enharmonicity == 'undefined' ? 1:(1+(harmonic*enharmonicity));
		return value;
	};
	var decay = function(harmonicDecay,harmonic,moment){
		if (typeof harmonicDecay == 'undefined'){
			return 1;
		}
		else{
			if (harmonic > 1){
				return (harmonicDecay/((harmonicDecay/20)+(moment*harmonic)));
			}
			else{
				return (1-(harmonicDecay/((harmonicDecay/20)+(moment*harmonic))));
			}
		}
	};
	var outRay = Array(duration);
	for (harmonic=1; harmonic<=harmonicCount; harmonic++){
		for (moment =0; moment<outRay.length ; moment++){
			outRay[moment]=
				decay(harmonicDecay,harmonic,moment)
				*(amplitude/((harmonic*2)-1))
				*Math.sin(
					moment
					*Math.PI
					*2
					*tone
					*((harmonic*2)-1)
					*enharmonify(enharmonicity,harmonic));
		}
	}
	return outRay;
};

var additiveSynth = function(tone,harmonics,duration){ // Harmonics are arrays such that [ harmonic, phase, volume, decay rate ]
	var outRay = [];
	var amplitude = 32767 || amplitude;
	var decay = function(harmonicDecay,harmonic,moment){
		if (typeof harmonicDecay == 'undefined'){
			return 1;
		}
		else{
			if (harmonic > 1){
				return (harmonicDecay/((harmonicDecay/20)+(moment*harmonic)));
			}
			else{
				return (1-(harmonicDecay/((harmonicDecay/20)+(moment*harmonic))));
			}
		}
	};
	for (moment = 0; moment<duration; moment++){
		outRay.push(0);
	}
	for (component = 0; component<harmonics.length; componet++){
		for (moment = 0; moment<duration; moment++){
			outRay+=Math.sin((Math.PI*2*moment*harmonic[component][0])+(harmonics[component][1]))
				*harmonic[component][2]
				*amplitude
				*decay(harmonic[component][3],1,moment);
		}
	}
};

// Array manipulation functions

var merge = function(durRay,canvasRay,whereAt,level){
	var outRay = [];
	whereAt = typeof whereAt == 'undefined' ? 0:whereAt;
	level = typeof level == 'undefined' ? 1000:level;
	for (sample = 0; sample<canvasRay.length; sample++){
		outRay.push(canvasRay[sample]);
	};
	for (sample = 0; sample<durRay.length; sample++){
		outRay[whereAt+sample]+=durRay[sample];
	};
};

var invert = function(durRay){
	var outRay = [];
	for (sample = 0; sample<durRay.length; sample++){
		outRay.push(durRay[sample]*(-1));
	}
	return outRay;
};

// This one I just made up. Hopefully itll work. 
var quietReducer = function(durRay,degree,amplitude){
	var amplitude = amplitude || 32767;
	var outRay =[];
	for (moment = 0; moment<duration; moment++){
		outRay.push(0);
	}
	for (moment=0; moment<durRay.length; moment++){
		if (durRay[moment]>0){
			outRay[moment]=durRay[moment]*Math.pow((durRay[moment]/amplitude),(1+degree));	
		}
		else{
			outRay[moment]=durRay[moment]*(-1)*Math.pow((durRay[moment]/amplitude),(1+degree));
		}
	}
	return outRay;

};

// System Functions

var buildFile = function(fileName,channels){
	var manipulatedChannels = channels
	var sameLength = true
	// The channels all have to be the same lenth, check to see if thats the case before proceeding
	for (channel = 0; channel < manipulatedChannels.length; channel++){
		for (relaChannel = 0; channel < (manipulatedChannels.length-channel); relaChannel++){
			if (channels[channel].length !== manipulatedChannels[relaChannel+channel].length){
				sameLength=false;
			}
	if (!sameLength){
		var longestChannelsLength=0;
		// If the channels are not all the same length, establish what the longest channel is
		for (channel=0; channel<manipulatedChannels.length; channel++){
			if (manipulatedChannels[channel].length > longestChannelLength){
				longestChannelsLength=manipulatedChannels[channel].length;
			}
		}
		// Add a duration of "silence" to each channel in the amount necessary to bring it to the length of the longest channel 
		for (channel=0; channel<manipulatedChannels.length){
			// The internet told me to do this, but it looks so messy:			manipulatedChannels[channel].concat(Array(manipulatedChannels[channel].length-longestChannelsLength).join('0').split('').map(parseFloat));
			for (sampleDif=0; sampleDif<(longestChannelsLength-manipulatedChannels[channel].length); channel++){
				manipulatedChannels[channel].push(0);
			}
		}
	}
	// Set up the header (?) of the wav file
	var header = []

	header.concat([0x4952]); header.concat([0x4646]); // 'RIFF' in hexadecimal
	
	header.concat([]); // I need to figure out how to calculate the file size

	header.concat([0x5751]); header.concat([0x5645]) // 'WAVE' in hexadecimal
	header.concat([0x666d]); header.concat([0x7420]) // Means 'fmt[SQUARE]', I dont know what this means. But its a part of wave files

	header.concat([0x1000]); header.concat([0x0000]) // This means '16', the size of each sample
	
	header.concat([0x0100]); // This indicates that no compression is going on
	if (channels.length>16){
		//  WORK IN PROGRESS
	}
	header.concat([0x0200]); // This is the number of channels
		}
	}
}


