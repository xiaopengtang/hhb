'use strict'

const {config, jsonp, Application} = require('hhb-core')

const AMAP = Symbol('hhb#AMAP')
const LOADER = Symbol('hhb#LOADER')
const MAP = Symbol('hhb#MAP')
const GEO = Symbol('hhb#GEO')

class Amap extends Application{
	constructor(){
		super()
		// 添加当前用户的位置
		this.on('COMPLETE', info => this.addMark(info.position))
		// 定位失败
		this.on('ERROR', e => this.report(e))
	}
	// 获取配置
	get config(){
		return config('amap')
	}
	// 加载控件
	async loader(){
		if(this[LOADER]){
			return this[LOADER]
		}
		let url = '//webapi.amap.com/maps'
		let v = '1.4.3'
		const key = this.config.key
		let plugin = this.config.plugin
		plugin = Array.isArray(plugin) ? plugin.join(',') : plugin
		const data = {key, v}
		plugin && (data.plugin = plugin) ;
		const loader = await jsonp({
			url,
			data
		})
		if(loader){
			return this[LOADER] = loader
		}
		return this[LOADER] = 'AMap' in window && window['AMap']
	}
    // 创建一个应用
	async create(){
		const amap = await this.loader()
		this[MAP] = amap.Map(this.config.container, this.config.option)
		this[MAP].plugin('AMap.Geolocation', () => {
			this[GEO] = new amap.Geolocation({
	            enableHighAccuracy: true,//是否使用高精度定位，默认:true
	            timeout: 10000,          //超过10秒后停止定位，默认：无穷大
	            maximumAge: 0,           //定位结果缓存0毫秒，默认：0
	            convert: true,           //自动偏移坐标，偏移后的坐标为高德坐标，默认：true
	            showButton: true,        //显示定位按钮，默认：true
	            buttonPosition: 'LB',    //定位按钮停靠位置，默认：'LB'，左下角
	            // buttonOffset: new AMap.Pixel(10, 20),//定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
	            showMarker: true,        //定位成功后在定位到的位置显示点标记，默认：true
	            showCircle: true,        //定位成功后用圆圈表示定位精度范围，默认：true
	            panToLocation: true,     //定位成功后将定位到的位置作为地图中心点，默认：true
	            zoomToAccuracy:true      //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
	        })
	        // 添加面板
	        this[MAP].addControl(this[GEO])
	        // 获取当前位置
	        this[GEO].getCurrentPosition()
	        // 添加事件监听
	        amap.event.addListener(this[GEO], 'complete', (...arg) => this.emit('COMPLETE', ...arg))
	        amap.event.addListener(this[GEO], 'error', (...arg) => this.emit('ERROR', ...arg))
		})
	}
	// 添加mark
	addMark(position){
		const mark = new this[LOADER].Marker({position})
		mark.setMap(this[MAP])
		return mark
	}
}



exports = module.exports = {
	// 获取扩展的插件
	get loader(){
		if(exports[AMAP]){
			return exports[AMAP]
		}
		exports[AMAP] = new Amap()
		return exports[AMAP]
	}
}