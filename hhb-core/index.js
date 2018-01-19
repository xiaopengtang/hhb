'use strict'

exports = module.exports = {
	Application: require('./lib/application')
}


Object.defineProperties(exports, {
	config: {
		configurable: false,
		writable: false,
		get(){
			// 
		}
	},
	init: {
		configurable: false,
		writable: false,
		get(){
			return function(){
				// 
			}
		}
	}
})