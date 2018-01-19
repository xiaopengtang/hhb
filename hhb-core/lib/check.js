'use strict'

const _ = require('lodash')

exports = module.exports = {}
// 判断是否是合法的listener对象
exports.isAllowEventListener = (_class, name, dep) => {
	const oldValue = dep.value
	dep.value = function(name, event){
		if(!_.isString(name) || !_.isFunction(event)){
			return 
		}
		return oldValue.call(this, name, event)
	}
}