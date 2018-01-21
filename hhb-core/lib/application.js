'use strict'

const _ = require('lodash')
const check = require('./check')

const EVT_KEY = Symbol('hhb#EVT_KEY')
const EVT_EMIT = Symbol('hhb#EVT_EMIT')
const EVT_LISTEN = Symbol('hhb#EVT_LISTEN')

class Application {
	constructor(){
		this[EVT_KEY] = {}
	}
	@check.isAllowEventListener
	on(name, event){
		this[EVT_KEY][name] = this[EVT_KEY][name] || []
		return this[EVT_KEY][name].push({
			type: 'on',
			event
		})
	}
	@check.isAllowEventListener
	once(name, event){
		this[EVT_KEY][name] = this[EVT_KEY][name] || []
		return this[EVT_KEY][name].push({
			type: 'once',
			event
		})
	}
	async [EVT_EMIT](listeners, ...rest){
		if(listeners.length === 0){
			return 
		}
		const [listener, ...other] = listeners
		const res = _.isFunction(listener) ? await listener(...rest) : void 0
		const restListener = [...other]
		if(restListener.length === 0){
			return res
		}
		const otherResult = await this[EVT_EMIT](restListener, ...rest)
		return res || otherResult
	}
	[EVT_LISTEN](name, once = false){
		const listeners = this[EVT_KEY][name]
		if(!listeners){
			return
		}
		if(once === true){
			this[EVT_KEY][name] = listeners.filter(info => info.type === 'on')
		}
		return listeners.map(info => info.event)
	}
	removeListener(name){
		let listeners = this[EVT_KEY][name]
		if(!listeners){
			return 
		}
		return this[EVT_KEY][name] = listeners.filter(info => info.type !== 'on')
	}
	removeAllListener(){
		return delete this[EVT_KEY][name]
	}
	listeners(name){
		return this[EVT_LISTEN](name)
	}
	async emit(name, ...rest){
		const listeners = this[EVT_LISTEN](name, true) || []
		return await this[EVT_EMIT](listeners, ...rest)
	}
}