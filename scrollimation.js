class ScrollimationWorker {
	constructor() {
		const instances = []
		this.instances = instances

		const requestAnimationFrame = ScrollimationWorker.requestAnimationFrame
		function frame() {
			instances.forEach(instance => {
				if (instance.mode === 'requestAnimationFrame')
					instance._handler()
			})
			requestAnimationFrame(frame)
		}
		requestAnimationFrame(frame)
	}

	/**
	 * Add new animation instance to worker.
	 * @param {Object} instance - Animation instance.
	 */
	addInstance(instance) {
		const handler = () => {
			if (instance.status === 'play') {
				const scrollTop =
					instance.scrollContainer === window
						? ScrollimationWorker.scrollTop
						: instance.scrollContainer.scrollTop
				const scrollLeft =
					instance.scrollContainer === window
						? ScrollimationWorker.scrollLeft
						: instance.scrollContainer.scrollLeft
				ScrollimationWorker.animate(scrollTop, scrollLeft, instance)
			}
		}

		if (instance.fpsLimit)
			instance._handler = ScrollimationWorker.Throttle(
				handler,
				1000 / instance.fpsLimit
			)
		else instance._handler = handler

		if (instance.mode === 'onscroll') {
			instance.scrollContainer.addEventListener(
				'scroll',
				instance._handler
			)
		}

		this.instances.push(instance)
	}

	// Preparing to run user-defined function
	static animate(scrollTop, scrollLeft, state) {
		state.scrollTop = scrollTop
		state.scrollLeft = scrollLeft
		let scrollPosition = state.direction === 'top' ? scrollTop : scrollLeft

		if (scrollPosition >= state.from && !state.startEmitted) {
			if (state.direction === 'top') {
				state.scrollTop = state.from
			} else {
				state.scrollLeft = state.from
			}

			state.startEmitted = true
			state.start(state)
			state.step(state)
		} else if (scrollPosition <= state.from && state.startEmitted) {
			if (state.direction === 'top') {
				state.scrollTop = state.from
			} else {
				state.scrollLeft = state.from
			}

			state.startEmitted = false
			state.step(state)
			state.reverseEnd(state)
		}

		if (scrollPosition >= state.to && !state.endEmitted) {
			if (state.direction === 'top') {
				state.scrollTop = state.to
			} else {
				state.scrollLeft = state.to
			}

			state.endEmitted = true
			state.step(state)
			state.end(state)
		} else if (scrollPosition <= state.to && state.endEmitted) {
			if (state.direction === 'top') {
				state.scrollTop = state.to
			} else {
				state.scrollLeft = state.to
			}

			state.endEmitted = false
			state.reverseStart(state)
			state.step(state)
		}

		if (scrollPosition > state.from && scrollPosition < state.to) {
			state.step(state)
		}
	}

	static Throttle(func, ms) {
		var isThrottled = false,
			savedArgs,
			savedThis

		function wrapper() {
			if (isThrottled) {
				savedArgs = arguments
				savedThis = this
				return
			}

			func.apply(this, arguments)

			isThrottled = true

			setTimeout(function() {
				isThrottled = false
				if (savedArgs) {
					wrapper.apply(savedThis, savedArgs)
					savedArgs = savedThis = null
				}
			}, ms)
		}

		return wrapper
	}

	static get requestAnimationFrame() {
		return (
			window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.msRequestAnimationFrame ||
			window.oRequestAnimationFrame ||
			function(callback) {
				window.setTimeout(callback, 1000 / 60)
			}
		)
	}

	static get scrollTop() {
		return (
			window.pageYOffset ||
			document.documentElement.scrollTop ||
			document.body.scrollTop
		)
	}

	static get scrollLeft() {
		return (
			window.pageXOffset ||
			document.documentElement.scrollLeft ||
			document.body.scrollLeft
		)
	}
}

let worker = new ScrollimationWorker()

class Scrollimation {
	/**
	 * @param {Object} config
	 * @param {HTMLElement|NodeList|Array|String|JQuery} [config.target] - Animation target.
	 * @param {HTMLElement|String} [config.scrollContainer] - Scroll container (default: window).
	 * @param {Number} config.from - Position where animation begin.
	 * @param {Number} config.to - Position where animation end.
	 * @param {String} [config.direction] - 'top' or 'left'.
	 * @param {String|Function} [config.easing] - Easing function ('linear', 'easeInQuad', ...).
	 * @param {String} [config.mode] - 'requestAnimationFrame' or 'onscroll'.
	 * @param {String} [config.fpsLimit] - Limits the number of animation steps per second.
	 * @param {Function} [config.init] - Initialize animation callback.
	 * @param {Function} config.step - This function is executed every time you need to change the styles of an animated element.
	 * @param {Function} [config.start] - Executed every time when scroll position is config.from.
	 * @param {Function} [config.end] - Executed every time when scroll position is config.to.
	 * @param {Function} [config.reverseStart] - Executed every time when scroll position is config.from.
	 * @param {Function} [config.reverseEnd] - Executed every time when scroll position is config.to.
	 */
	constructor(config) {
		this.id = Math.random()
			.toString(36)
			.substr(2, 9)
		this.scrollContainer =
			typeof config.scrollContainer === 'string'
				? document.querySelector(config.scrollContainer)
				: config.scrollContainer || window
		this.from = config.from || 0
		this.to = config.to || 0
		this.direction = config.direction || 'top'
		this.mode = config.mode || 'requestAnimationFrame'
		this.fpsLimit = config.fpsLimit
		this.init = config.init || (() => {})
		this.step = config.step || (() => {})
		this.start = config.start || (() => {})
		this.end = config.end || (() => {})
		this.reverseStart = config.reverseStart || (() => {})
		this.reverseEnd = config.reverseEnd || (() => {})
		this.startEmitted = false
		this.endEmitted = false

		this.target = window.NodeList.prototype.isPrototypeOf(config.target)
			? [].slice.call(config.target)
			: config.target

		this.target = config.target
		if (window.NodeList.prototype.isPrototypeOf(config.target))
			this.target = [].slice.call(config.target)
		if (
			typeof config.target === 'string' ||
			config.target instanceof String
		)
			this.target = [].slice.call(
				document.querySelectorAll(config.target)
			)

		this.easing = config.easing || 'linear'

		// this.scrollContainer === window ?
		this.scrollTop =
			this.scrollContainer === window
				? ScrollimationWorker.scrollTop
				: this.scrollContainer.scrollTop
		this.scrollLeft =
			this.scrollContainer === window
				? ScrollimationWorker.scrollLeft
				: this.scrollContainer.scrollLeft

		this.status = 'play'

		worker.addInstance(this)

		this.init(this)
	}

	/**
	 * Considers the value for the parameter depending on the scroll.
	 * @param {Number|String} valueFrom - Use String for HEX colors.
	 * @param {Number|String} valueTo - Use String for HEX colors.
	 * @param {String|Function} [easing] - Easing function ('linear', 'easeInQuad', ...).
	 * @returns {Number|String}
	 */
	calc(valueFrom, valueTo, easing = this.easing) {
		const isHex = /(^#[0-9A-F]{3}$)|(^#[0-9A-F]{4}$)|(^#[0-9A-F]{6}$)|(^#[0-9A-F]{8}$)/i
		if (isHex.test(valueFrom) && isHex.test(valueTo)) {
			let res = []
			let resFrom = Scrollimation.HexToNums(valueFrom)
			let resTo = Scrollimation.HexToNums(valueTo)

			resFrom.forEach((val, i) => {
				res.push(
					Scrollimation.Calculate(
						this.direction === 'top'
							? this.scrollTop
							: this.scrollLeft,
						this.from,
						this.to,
						val,
						resTo[i],
						typeof this.easing === 'function'
							? this.easing
							: Scrollimation.Easing[this.easing] ||
									Scrollimation.Easing.linear
					)
				)
			})

			return `rgba(${res[0]}, ${res[1]}, ${res[2]}, ${res[3]})`
		}

		return Scrollimation.Calculate(
			this.direction === 'top' ? this.scrollTop : this.scrollLeft,
			this.from,
			this.to,
			valueFrom,
			valueTo,
			typeof this.easing === 'function'
				? this.easing
				: Scrollimation.Easing[this.easing] ||
						Scrollimation.Easing.linear
		)
	}

	// Stop animation
	stop() {
		this.status = 'pause'
	}

	// Play animation
	play() {
		this.status = 'play'
	}

	// Remove instance
	remove() {
		this.status = 'pause'

		if (this.mode === 'onscroll') {
			this.scrollContainer.removeEventListener('scroll', this._handler)
		}

		worker.instances = worker.instances.filter(
			instance => instance.id !== this.id
		)
	}

	/*
	 * Easing Functions - inspired from http://gizma.com/easing/
	 * only considering the t value for the range [0, 1] => [0, 1]
	 */
	static get Easing() {
		return {
			// no easing, no acceleration
			linear: function(t) {
				return t
			},
			// accelerating from zero velocity
			easeInQuad: function(t) {
				return t * t
			},
			// decelerating to zero velocity
			easeOutQuad: function(t) {
				return t * (2 - t)
			},
			// acceleration until halfway, then deceleration
			easeInOutQuad: function(t) {
				return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
			},
			// accelerating from zero velocity
			easeInCubic: function(t) {
				return t * t * t
			},
			// decelerating to zero velocity
			easeOutCubic: function(t) {
				return --t * t * t + 1
			},
			// acceleration until halfway, then deceleration
			easeInOutCubic: function(t) {
				return t < 0.5
					? 4 * t * t * t
					: (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
			},
			// accelerating from zero velocity
			easeInQuart: function(t) {
				return t * t * t * t
			},
			// decelerating to zero velocity
			easeOutQuart: function(t) {
				/*jshint -W006 */
				return 1 - --t * t * t * t
			},
			// acceleration until halfway, then deceleration
			easeInOutQuart: function(t) {
				return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t
			},
			// accelerating from zero velocity
			easeInQuint: function(t) {
				return t * t * t * t * t
			},
			// decelerating to zero velocity
			easeOutQuint: function(t) {
				return 1 + --t * t * t * t * t
			},
			// acceleration until halfway, then deceleration
			easeInOutQuint: function(t) {
				return t < 0.5
					? 16 * t * t * t * t * t
					: 1 + 16 * --t * t * t * t * t
			}
		}
	}

	static Calculate(
		scroll = 0,
		scrollFrom = 0,
		scrollTo = 0,
		valueFrom = 0,
		valueTo = 0,
		easing = t => t
	) {
		scroll = scroll < scrollFrom ? scrollFrom : scroll
		scroll = scroll > scrollTo ? scrollTo : scroll

		return (
			valueFrom +
			(valueTo - valueFrom) *
				easing((scroll - scrollFrom) / (scrollTo - scrollFrom))
		)
	}

	static HexToNums(hex) {
		let res

		if (hex.length === 4) {
			let r = hex.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i)
			res = r.slice(1, 4).map(function(x) {
				return 0x11 * parseInt(x, 16)
			})
		} else if (hex.length === 5) {
			let r = hex.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])([0-9a-f])$/i)
			res = r.slice(1, 5).map(function(x) {
				return 0x11 * parseInt(x, 16)
			})
		} else if (hex.length === 7) {
			let r = hex.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i)
			res = r.slice(1, 4).map(function(x) {
				return parseInt(x, 16)
			})
		} else if (hex.length === 9) {
			let r = hex.match(
				/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i
			)
			res = r.slice(1, 5).map(function(x) {
				return parseInt(x, 16)
			})
		}

		res[3] = res[3] / 255 || 1

		return res
	}
}

/**
 * @param {Object} config
 * @returns {Object} instance
 */
export default config => new Scrollimation(config)

// Run library as jQuery plugin if available
if (typeof jQuery !== 'undefined' || typeof $ !== 'undefined') {
	let _$ = typeof jQuery !== 'undefined' ? jQuery : $

	_$.fn.scrollimation = function(config) {
		config.target = this
		return new Scrollimation(config)
	}
}
