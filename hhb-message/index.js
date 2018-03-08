/**
* 消息中心
* 基于strophe.js
*/
'use strict'
const {Application, config, subscrible} = require('hhb-core')
const {Strophe, $pres, $msg} = require('strophe.js')

const CONNECT = Symbol('hhb#CONNECT')
const STATE = Symbol('hhb#STATE')
const STATUS = Symbol('hhb#STATUS')
const ACT_CONNECTION = Symbol('hhb#ACT_CONNECTION')
const ACT_MESS = Symbol('hhb#ACT_MESS')
const SUB = Symbol('hhb#SUB')
class Message extends Application {
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
		return this[CONNECT] = new Strophe.Connection(this.config.host.ip)
	}
	// 接受消息
	async [ACT_CONNECTION](status){
		if (status == Strophe.Status.CONNFAIL) {
			return await this.emit('CONNFAIL')
	    } else if (status == Strophe.Status.AUTHFAIL) {
	    	return await this.emit('AUTHFAIL')
	    } else if (status == Strophe.Status.DISCONNECTED) {
	    	return await this.emit('DISCONNECTED')
	    }else if(status == Strophe.Status.CONNECTED){
        // console.log(status)
        await this.emit('READY')
        this[CONNECT].addHandler(this[ACT_MESS].bind(this), null, 'message', null, null, null)
        this[CONNECT].send($pres().tree())
      }

	}
    // 唤起messgae
	async [ACT_MESS](message){
		return await this.emit('MESSAGE', message)
	}

  subscrible(name, fn){
    return this[SUB].subscrible(name, fn)
  }

	constructor(){
		super()
		// 判断
		if(!this[STATE]){
			return
		}
		const oldOnload = window.onload
		window.onload = (...arg) => {
			typeof oldOnload === 'function' && oldOnload(...arg)
			this.createConnection()
		}
    this[SUB] = new subscrible()
    this.on('MESSAGE', async (data) => {
      return await this[SUB].emit(data.type, data)
    })
	}
	// 发送
	send(data, message){
    const mess = $msg(data).c('body', null, message)
    return this[CONNECT].send(mess.tree())
	}
	// 登陆
	login(name, pw){
		// 如果onload来不及触发的话，率先创建
		this.createConnection()
		this[CONNECT].connect(name, pw, this[ACT_CONNECTION].bind(this))
	}
}


exports = module.exports = new Message()

exports.Message = Message
