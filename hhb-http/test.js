'use strict'

const axios = require('axios')
const {Application, config} = require('hhb-core')

class http extends Application {
	get config(){
		return config('http')
	}
	constructor(){
		super()
	}
	send({url, data, method}){
		return new Promise(resolve => {
			const intance = axios.create(Object.assign(this.config || {}, {
				transformResponse: [data => {
					data = data || {}
				    let arr = []
				    for (let it in data) {
				    	let val = data[it]
				    	val = _.isObject(val) ? JSON.stringify(val) : val
				    	arr.push(`${encodeURIComponent(it)}=${encodeURIComponent(val)}`)
				    }
				    return arr.join('&')
				}],
				headers: {'Content-Type': 'application/x-www-form-urlencoded'}
			}))
			method = method || this.config.method || 'get'
			data = /get/.test(method) ? {params: data} : data
			const axiosRequest = intance[method](url, data)
			return axiosRequest.then(resolve).catch(e => {
				this.emit('ERROR', e)
				return resolve()
			})
		})
	}
}

exports = module.exports = new http()