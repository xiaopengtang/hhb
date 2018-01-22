'use strict'

const {Application, config} = require('hhb-core')
const Message = require('hhb-message')
const http = require('hhb-http')

const USER_KEY = Symbol('hhb#USER_KEY')

class User extends Application{
	//
	get config(){
		return config('user')
	}
	constructor(){
		super()
		this[USER_KEY] = {}
		this.$message = new Message() 
	}
	// 
	async update(data){
		this[USER_KEY] = data
		return await this.emit('LOGIN', Object.create(data))
	}

	get UserInfo(){
		return Object.create(this[USER_KEY])
	}
	// 
	async login(name, pw){
		const info = await http.send({url: this.config.url.login, data: {name, pw}, methods: 'post'})
		if(!info.success){
			return await this.emit('LOGIN_ERROR', info)
		}
		this.update(info)
		return this.$message.login(name, pw, info.id)
	}
}

exports = module.exports = new User

exports.User = User