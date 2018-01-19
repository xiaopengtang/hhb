'use strict'

const Application = require('./application')
const _ = require('lodash')

const KEY = Symbol('hhb#KEY')
const ACT_READ = Symbol('hhb#ACT_READ')
const ACT_SET = Symbol('hhb#ACT_SET')

class Config extends Application {
	constructor(){
		super()
		this[KEY] = {}
	}
    // 读取
	[ACT_READ](name, origin){
		if(!name){
			return 
		}
		const r = /\.+/
		const [id, ...rest] = name.split(r)
		const childKey = [...rest].join('.')
		origin = origin || this[KEY]
		const oldValue = origin[id]
		if(oldValue === void 0 || childKey && !_.isObject(oldValue)){
			return 
		}
		if(!childKey){
			return oldValue
		}
		return this[ACT_READ](childKey, oldValue)
	}
	// 修改
	[ACT_SET](name, value, origin){
		if(!name){
			return 
		}
		origin = origin || this[KEY]
		const r = /\.+/
		const [id, ...rest] = name.split(r)
		const childKey = [...rest].join('.')
		let oldValue = origin[id]
		if(!childKey){
			return origin[id] = value === null ? void 0 : value
		}
		oldValue = _.isObject(oldValue) && oldValue || {}
		return this[ACT_SET](childKey, value, oldValue)
	}
	// 文件配置
	config(name, value){
		if(_.isObject(name) && value === void 0){
			return this[KEY] = _.assign(this[KEY], name)
		}else if(_.isString(name) && value !== void 0){
			return this[ACT_SET](name, value)
		}else if(_.isString(name)){
			let oldValue = this[ACT_READ](name)
			const IS_UPDATE = _.isFunction(value)
			const newValue = IS_UPDATE ? value(oldValue) : oldValue
			return IS_UPDATE ? this[ACT_SET](name, newValue) : oldValue
		}
	}
}

const $app = new Config()


exports = module.exports = function(...arg){
	return $app.config(...arg)
}

exports.Config = Config

// exports.$app = $app
