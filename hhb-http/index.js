'use strict'

const {config} = require('hhb-core')

const axios = require('axios')
const _ = require('lodash')

const INSTANCE = Symbol('HHB#INSTANCE')

class $http {
	constructor(setting){
		setting = setting || config('requestConfig.setting') || {}
		this[INSTANCE] = axios.create(_.assign({
			withCredentials: true,
			baseURL: this.config.host,
		}, setting))
	}
	get $instance(){
		return this[INSTANCE]
	}
	get config(){
		return config('requestConfig')
	}
	//
	curl(requestUrl, data){
		return new Promise(resolve => {
      const r = /^(([^:]+):)?(.+)$/
      let url = '', method = 'post'
      const settingUrl = this.config.map[requestUrl]
      if(r.test(settingUrl)){
        url = RegExp.$3
        method = RegExp.$2
      }else{
        url = requestUrl
      }
      console.log(this.config.host, url, this.config.map['QUERY:USER:NEAR_LIST'])
      const IS_GET = /get/.test(method)
      let action = this.$instance[method]
      action = _.isFunction(action) ? action : this.$instance.post
      let params = IS_GET ? {params: data} : data
      return action(url, params || {}).then(res => resolve(res.data)).catch(e => resolve(null))
    })
	}
}

module.exports = config => new $http(config)
