'use strict'

const {Application, config} = require('hhb-core')

const AMAP = Symbol('hhb#AMAP')
const MESSAGE = Symbol('hhb#MESSAGE')
const USER = Symbol('hhb#USER')

module.exports = class hhb extends Application{
	constructor(){
		super()
	}

	async start(){
		// 
	}
}