let assert = require('assert')
let { JSDOM } = require('jsdom')

// Wait until DOM changes take effect
function wait(time = 0) {
	return new Promise(resolve => {
		setTimeout(() => {
			resolve()
		}, time)
	})
}

before(function() {
	global.window = new JSDOM('<!doctype html><html><body></body></html>', {
		pretendToBeVisual: true
	}).window
	global.document = window.document
	global.$ = require('jquery')
	global.Scrollimation = require('../dist/scrollimation.js')
})

describe('Single element', function() {
	let div, instance

	before(function() {
		div = document.createElement('div')
	})

	it('should create animation instance', function() {
		instance = Scrollimation({
			target: div,
			from: 0,
			to: 100,
			step: function(state) {
				let value = state.calc(0, 360)
				state.target.style.transform = `rotate(${value}deg)`
			}
		})

		assert.equal(typeof instance, 'object')
		assert.equal(instance.from, 0)
		assert.equal(instance.to, 100)
		assert.equal(instance.direction, 'top')
		assert.equal(instance.mode, 'requestAnimationFrame')
		assert.equal(typeof instance.step, 'function')
		assert.equal(typeof instance.start, 'function')
		assert.equal(typeof instance.end, 'function')
		assert.equal(typeof instance.easing, 'string')
		assert.equal(instance.status, 'play')
	})

	it('should change element style on scroll', function(done) {
		document.body.scrollTop = 0

		wait(20)
			.then(() => {
				assert.equal(div.style.transform, 'rotate(0deg)')
				document.body.scrollTop = instance.to / 2

				return wait(20)
			})
			.then(() => {
				assert.equal(div.style.transform, 'rotate(180deg)')
				document.body.scrollTop = instance.to

				return wait(20)
			})
			.then(() => {
				assert.equal(div.style.transform, 'rotate(360deg)')
				done()
			})
	})

	it('should stop animation and play again', function(done) {
		document.body.scrollTop = instance.to / 2
		wait(20)
			.then(() => {
				assert.equal(div.style.transform, 'rotate(180deg)')
				instance.stop()
				document.body.scrollTop = 0

				return wait(20)
			})
			.then(() => {
				assert.equal(div.style.transform, 'rotate(180deg)')
				instance.play()
				document.body.scrollTop = instance.to

				return wait(20)
			})
			.then(() => {
				assert.equal(div.style.transform, 'rotate(360deg)')
				done()
			})
	})

	it('should change animation params', function(done) {
		instance.to = 200
		instance.step = function(state) {
			let value = state.calc(0, 500)
			state.target.style.top = value + 'px'
		}

		document.body.scrollTop = 0

		wait(20)
			.then(() => {
				assert.equal(div.style.top, '0px')
				document.body.scrollTop = 100
				return wait(20)
			})
			.then(() => {
				assert.equal(div.style.top, '250px')
				document.body.scrollTop = 200
				return wait(20)
			})
			.then(() => {
				assert.equal(div.style.top, '500px')
				done()
			})
	})

	it('should change start callback', function(done) {
		instance.start = function(state) {
			done()
			instance.start = () => {}
		}

		document.body.scrollTop = 0
	})

	it('should change end callback', function(done) {
		instance.end = function(state) {
			done()
			instance.end = () => {}
		}

		document.body.scrollTop = instance.to
	})
})

describe('Multiple elements', function() {
	let div1, div2, instance

	before(function() {
		div1 = document.createElement('div')
		div2 = document.createElement('div')

		document.documentElement.appendChild(div1)
		document.documentElement.appendChild(div2)
	})

	it('should create animation instance', function() {
		instance = Scrollimation({
			target: document.querySelectorAll('div'),
			from: 0,
			to: 100,
			step: function(state) {
				let value = state.calc(0, 360)
				state.target.forEach(function(target) {
					target.style.transform = `rotate(${value}deg)`
				})
			}
		})

		assert.equal(typeof instance, 'object')
		assert.equal(instance.from, 0)
		assert.equal(instance.to, 100)
		assert.equal(instance.direction, 'top')
		assert.equal(instance.mode, 'requestAnimationFrame')
		assert.equal(typeof instance.step, 'function')
		assert.equal(typeof instance.start, 'function')
		assert.equal(typeof instance.end, 'function')
		assert.equal(typeof instance.easing, 'string')
		assert.equal(instance.status, 'play')
	})

	it('should change elements style on scroll', function(done) {
		document.body.scrollTop = 0

		wait(20)
			.then(() => {
				assert.equal(div1.style.transform, 'rotate(0deg)')
				assert.equal(div2.style.transform, 'rotate(0deg)')
				document.body.scrollTop = instance.to / 2

				return wait(20)
			})
			.then(() => {
				assert.equal(div1.style.transform, 'rotate(180deg)')
				assert.equal(div2.style.transform, 'rotate(180deg)')
				document.body.scrollTop = instance.to

				return wait(20)
			})
			.then(() => {
				assert.equal(div1.style.transform, 'rotate(360deg)')
				assert.equal(div2.style.transform, 'rotate(360deg)')
				done()
			})
	})
})

describe('jQuery element', function() {
	let div, instance

	before(function() {
		div = document.createElement('div')
	})

	it('should create animation instance', function() {
		instance = $(div).scrollimation({
			from: 0,
			to: 100,
			step: function(state) {
				let value = state.calc(0, 360)
				state.target.css({
					transform: `rotate(${value}deg)`
				})
			}
		})

		assert.equal(typeof instance, 'object')
		assert.equal(instance.from, 0)
		assert.equal(instance.to, 100)
		assert.equal(instance.direction, 'top')
		assert.equal(instance.mode, 'requestAnimationFrame')
		assert.equal(typeof instance.step, 'function')
		assert.equal(typeof instance.start, 'function')
		assert.equal(typeof instance.end, 'function')
		assert.equal(typeof instance.easing, 'string')
		assert.equal(instance.status, 'play')
	})

	it('should change element style on scroll', function(done) {
		document.body.scrollTop = 0

		wait(20)
			.then(() => {
				assert.equal(div.style.transform, 'rotate(0deg)')
				document.body.scrollTop = instance.to / 2

				return wait(20)
			})
			.then(() => {
				assert.equal(div.style.transform, 'rotate(180deg)')
				document.body.scrollTop = instance.to

				return wait(20)
			})
			.then(() => {
				assert.equal(div.style.transform, 'rotate(360deg)')
				done()
			})
	})
})