define(["../core/Tone", "../core/Buffer", "../effect/Effect"], function(Tone){

	"use strict";

	/**
	 *  @class  Tone.Convolver is a wrapper around the Native Web Audio
	 *          [ConvolverNode](http://webaudio.github.io/web-audio-api/#the-convolvernode-interface).
	 *          Convolution is useful for reverb and filter emulation. Read more about convolution reverb on
	 *          [Wikipedia](https://en.wikipedia.org/wiki/Convolution_reverb).
	 *
	 *  @constructor
	 *  @extends {Tone.Effect}
	 *  @param {string|Tone.Buffer|Object} [url] The URL of the impulse response or the Tone.Buffer
	 *                                           contianing the impulse response.
	 *  @param {Function=} onload The callback to invoke when the url is loaded.
	 *  @example
	 * //initializing the convolver with an impulse response
	 * var convolver = new Tone.Convolver("./path/to/ir.wav").toMaster();
	 */
	Tone.Convolver = function(){

		var options = Tone.defaults(arguments, ["url", "onload"], Tone.Convolver);
		Tone.Effect.call(this, options);

		/**
		 *  convolver node
		 *  @type {ConvolverNode}
		 *  @private
		 */
		this._convolver = this.context.createConvolver();

		/**
		 *  the convolution buffer
		 *  @type {Tone.Buffer}
		 *  @private
		 */
		this._buffer = new Tone.Buffer(options.url, function(buffer){
			this._convolver.buffer = buffer.get();
			options.onload();
		}.bind(this));

		//initially set normalization
		this.normalize = options.normalize;

		this.connectEffect(this._convolver);
	};

	Tone.extend(Tone.Convolver, Tone.Effect);

	/**
	 *  @static
	 *  @const
	 *  @type  {Object}
	 */
	Tone.Convolver.defaults = {
		"onload" : Tone.noOp,
		"normalize" : true
	};

	/**
	 *  The convolver's buffer
	 *  @memberOf Tone.Convolver#
	 *  @type {AudioBuffer}
	 *  @name buffer
	 */
	Object.defineProperty(Tone.Convolver.prototype, "buffer", {
		"get" : function(){
			return this._buffer.get();
		},
		"set" : function(buffer){
			this._buffer.set(buffer);
			this._convolver.buffer = this._buffer.get();
		}
	});

	/**
	 *  The normalize property of the ConvolverNode interface is a boolean that controls whether the impulse response from the buffer will be scaled by an equal-power normalization when the buffer attribute is set, or not.
	 *  @memberOf Tone.Convolver#
	 *  @type {Boolean}
	 *  @name normalize
	 */
	Object.defineProperty(Tone.Convolver.prototype, "normalize", {
		"get" : function(){
			return this._convolver.normalize;
		},
		"set" : function(norm){
			this._convolver.normalize = norm;
		}
	});

	/**
	 *  Load an impulse response url as an audio buffer.
	 *  Decodes the audio asynchronously and invokes
	 *  the callback once the audio buffer loads.
	 *  @param {string} url The url of the buffer to load.
	 *                      filetype support depends on the
	 *                      browser.
	 *  @param  {function=} callback
	 *  @returns {Promise}
	 */
	Tone.Convolver.prototype.load = function(url, callback){
		return this._buffer.load(url, function(buff){
			this.buffer = buff;
			if (callback){
				callback();
			}
		}.bind(this));
	};

	/**
	 *  Clean up.
	 *  @returns {Tone.Convolver} this
	 */
	Tone.Convolver.prototype.dispose = function(){
		Tone.Effect.prototype.dispose.call(this);
		this._buffer.dispose();
		this._buffer = null;
		this._convolver.disconnect();
		this._convolver = null;
		return this;
	};

	return Tone.Convolver;
});
