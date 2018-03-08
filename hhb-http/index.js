'use strict'

const {config} = require('hhb-core')

const axios = require('axios')
const _ = require('lodash')

const INSTANCE = Symbol('HHB#INSTANCE')

class $http {
	constructor(config){
		config = config || config('requestConfig.setting') || {}
		this[INSTANCE] = axios.create(_.assign({
			withCredentials: true,
			baseURL: this.config.host,
		}, config))
	}
	get $instance(){
		return this[INSTANCE]
	}
	get config(){
		return config('requestConfig')
	}
	//
	curl(requestUrl, data){
		const r = /^([^:]+)?:(.+)$/
		let url = '', method = 'post'
		if(r.test(requestUrl)){
			url = RegExp.$2
			method = RegExp.$1
		}else{
			url = requestUrl
		}
		const IS_GET = /get/.test(method)
		let action = this.$instance[method]
		action = _.isFunction(action) ? action : this.$instance.post
		let params = IS_GET ? {params: data} : data
		return action(url, params || {})
	}
}

module.exports = config => new $http(config)
