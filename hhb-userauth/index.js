'use strict'

const {Application} = require('hhb-core')

const USER_KEY = Symbol('hhb#USER_KEY')

class User extends Application{
	constructor(){
		super()
		this[USER_KEY] = {}
	}
	// 
	async update(data){
		this[USER_KEY] = data
		return await this.emit('update', Object.create(data))
	}

	get UserInfo(){
		return Object.create(this[USER_KEY])
	}
}

exports = module.exports = new User

exports.User = User