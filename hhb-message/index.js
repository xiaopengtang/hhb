/**
* 消息中心
* 基于strophe.js
*/
'use strict'
const {Application, config} = require('hhb-core')
const {Strophe, $pres} = require('strophe.js')

const CONNECT = Symbol('hhb#CONNECT')
const STATE = Symbol('hhb#STATE')
const STATUS = Symbol('hhb#STATUS')
const ACT_CONNECTION = Symbol('hhb#ACT_CONNECTION')
const ACT_MESS = Symbol('hhb#ACT_MESS')
const UID = Symbol('hhb#UID')

class Message extends Application {
	// [UID] = null;
	// 是否可运行
	get [STATE](){
		return typeof window !== 'undefined'
	}
	/**
	* 配置
	*/
	get config(){
		return config('message')
	}

	get $connection(){
		return this[CONNECT]
	}
	// 当前的状态值
	createConnection(){
		if(this[CONNECT]){
			return this[CONNECT]
		}
		return this[CONNECT] = new Strophe.Connection(this.config.host)
	}
	// 接受消息
	async [ACT_CONNECTION](status){
		return await new Promise(async (resolve) => {
			if (status == Strophe.Status.CONNFAIL) {
				await this.emit('CONNFAIL')
		    } else if (status == Strophe.Status.AUTHFAIL) {
		    	await this.emit('AUTHFAIL')
		    } else if (status == Strophe.Status.DISCONNECTED) {
		    	await this.emit('DISCONNECTED')
		    } else if(status == Strophe.Status.CONNECTED){
		    	this[CONNECT].addHandler(this[ACT_MESS].bind(this), null, 'message', null, null, null)
		        this[CONNECT].send($pres().tree())
		        return resolve()
		    }
		})
	}
    // 唤起messgae
	async [ACT_MESS](mess){
		return await this.emit('MESSAGE', {
			to: mess.getAttribute('to'),
			from: mess.getAttribute('from'),
			message: Strophe.getText(mess.getElementsByTagName('body')[0])
		})
	}

	constructor(){
		super()
		// 判断
		if(!this[STATE]){
			return
		}
		this[UID] = null
		const oldOnload = window.onload
		window.onload = (...arg) => {
			typeof oldOnload === 'function' && oldOnload(...arg)
			this.createConnection()
		}
	}
	// 广播
	notify(fn){
		fn = typeof fn === 'function' ? fn : (a => null)
		this.on('MESSAGE', async(mess) => {
			if(!this[UID]){
				return fn(mess)
			}
			const r = new RegExp(`^${this[UID]}@`)
			if(!r.test(mess.from)){
				return
			}
			return fn(mess)
		})
	}
	//
	setCurrentUid(uid){
		this[UID] = uid
	}
	// 发送
	send(...arg){
		return this[CONNECT].send(...arg)
	}
	// 登陆
	async login(name, pw){
		// 如果onload来不及触发的话，率先创建
		this.createConnection()
		return await this[CONNECT].connect(name, pw, this[ACT_CONNECTION].bind(this))
	}
}


exports = module.exports = new Message()

exports.Message = Message