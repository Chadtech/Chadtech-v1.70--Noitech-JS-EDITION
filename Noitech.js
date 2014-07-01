/*jslint node: true */
"use strict";

var fs = require('fs');

// Tone Making Functions

var makeSine = function(tone,duration){
	var outRay = [];
	for (var sample = 0; sample<duration; sample++){
		outRay.push(Math.sin(Math.PI*sample*tone));
	}
	return outRay;
};

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
	var outRay = [];
	for (var moment =0; moment<duration ; moment++){
		outRay.push(0);
	}
	for (var harmonic=1; harmonic<=harmonicCount; harmonic++){
		for (var moment =0; moment<outRay.length ; moment++){
			outRay[moment]+=decay(harmonicDecay,harmonic,moment)*(amplitude/harmonic)*Math.pow(-1,harmonic)*Math.sin(moment*Math.PI*2*tone*harmonic*enharmonify(enharmonicity,harmonic));
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
	var outRay = [];
	for (var moment =0; moment<duration ; moment++){
		outRay.push(0);
	}
	for (var harmonic=1; harmonic<=harmonicCount; harmonic++){
		for (moment =0; moment<outRay.length ; moment++){
			outRay[moment]+=decay(harmonicDecay,harmonic,moment)*(amplitude/Math.pow((harmonic*2)+1,2))*Math.pow(-1,harmonic)*Math.sin(moment*Math.PI*2*tone*Math.pow((harmonic*2)+1,2)*enharmonify(enharmonicity,harmonic));
		}
	}
	return outRay;
};

var makeSquare = function(tone,duration,harmonicCount,amplitude,enharmonicity,harmonicDecay){
	var amplitude = amplitude || 32767;
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
				return (harmonicDecay/((harmonicDecay/20)+(moment*harmonic)));
			}
			else{
				return (1-(harmonicDecay/((harmonicDecay/20)+(moment*harmonic))));
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
	for (var moment = 0; moment<duration; moment++){
		outRay.push(0);
	}
	for (var component = 0; component<harmonics.length; component++){
		for (moment = 0; moment<duration; moment++){
			outRay+=Math.sin((Math.PI*2*moment*harmonics[component][0])+(harmonics[component][1]))*harmonics[component][2]*amplitude*decay(harmonics[component][3],1,moment);
		}
	}
};

// Array manipulation functions

var merge = function(durRay,canvasRay,whereAt,level){
	var outRay = [];
	whereAt = typeof whereAt == 'undefined' ? 0:whereAt;
	level = typeof level == 'undefined' ? 1000:level;
	for (var sample = 0; sample<canvasRay.length; sample++){
		outRay.push(canvasRay[sample]);
	};
	for (var sample = 0; sample<durRay.length; sample++){
		outRay[whereAt+sample]+=durRay[sample];
	}
};

var invert = function(durRay){
	var outRay = [];
	for (var sample = 0; sample<durRay.length; sample++){
		outRay.push(durRay[sample]*(-1));
	}
	return outRay;
};

// This one I just made up. Hopefully itll work. 
var quietReducer = function(durRay,degree,amplitude){
	var amplitude = amplitude || 32767;
	var outRay =[];
	for (var moment = 0; moment<durRay.length; moment++){
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
	console.log('OPENED FILE');
	fs.writeFile('testOutput.txt',channels.toString());
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
	console.log('FINISHED MANIPULATED CHANNELS');
	// Make an Array, so that the audio samples can be aggregated in the standard way wave files are (For each sample i in channels a, b, and c, the sample order goes a(i),b(i),c(i),a(i+1),b(i+1),c(i+1), ... )
	var channelAudio=[];
	for (var sample=0; sample<manipulatedChannels[0].length; sample++){
		for (var channel=0; channel<manipulatedChannels.length; channel++){
			channelAudio.push(manipulatedChannels[channel][sample]);
		}
	}

	console.log('NOW BEGINNING HEADER');

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


buildFile('RECONSTRUCTEDRIDE.wav',openWave('MCRide_1.wav'));