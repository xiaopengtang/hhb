/**
* 消息中心
* 基于strophe.js
*/
'use strict'
const {Application} = require('hhb-core')
const {Strophe} = require('strophe.js')


const CONNECT = Symbol('hhb#CONNECT')

class Message extends Application {
	constructor(){
		super()
	}
	// 
	login(){
		// 
	}
	//
}


module.exports = new Message()