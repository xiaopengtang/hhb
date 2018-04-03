'use strict'

const {config, jsonp, Application} = require('hhb-core')

const AMAP = Symbol('hhb#AMAP')
const LOADER = Symbol('hhb#LOADER')
const MAP = Symbol('hhb#MAP')
const GEO = Symbol('hhb#GEO')
const TIMER = Symbol('hhb#TIMER')
const POSITION = Symbol('hhb#POSITION')
const TIME_KEY = Symbol('hhb#TIME_KEY')
const MARKERLIST = Symbol('hhb#MARKERLIST')
const UI = Symbol('hhb#UI')

// const {subscrible} = require('hhb-core')

class Amap extends Application{
  constructor(){
    super()

    // 添加当前用户的位置
    // this.on('COMPLETE', info => console.log({info}))//this.addMark(info.position))
    // 定位失败
    this.on('ERROR', e => this.report(e))
    this[MARKERLIST] = {}
  }

  // 获取配置
  get config(){
    return config('amap')
  }
  // 获取amap
  get map(){
    return this[MAP]
  }
  get amap(){
    return this[LOADER]
  }
  // 获取插件
  get geo(){
    return this[GEO]
  }
  /**
  * @param data "distance": 0.1724,         //具体 单位 米
          "fromUserId": "0000000002",   // 附近的人
          "latitude": 32.08809086743,     //纬度
          "longitude": 118.887114822,     //经度
          "online": 1,            //是否在线 1在线
          "toUserId": "0000000001"      //当前用户
  *
  *
  */
  // 渲染marker
  renderMark(data){
    let position = [data.latitude, data.longitude]
    // 清除对应的mark
    if(!data.online){
      return this[MARKERLIST][data.fromUserId] && this[MARKERLIST][data.fromUserId].setMap(null)
    }
    if(!this[MARKERLIST][data.fromUserId]){
      this[MARKERLIST][data.fromUserId] = new this[LOADER].Marker({
              position//: [data.latitude, data.longitude]
          });
      this[MARKERLIST][data.fromUserId].setMap(this[MAP])
      this.amap.event.clearListeners(this[MARKERLIST][data.fromUserId], 'click')
      this.amap.event.addListener(this[MARKERLIST][data.fromUserId], 'click', e => this.emit('CLICK:MARKER', data))
    }else{
      this[MARKERLIST][data.fromUserId].setPosition(position)
    }
  }
  // 粗暴
  clearMarker(){
    this[MARKERLIST] = {}
  }
  renderMarkList(list){
    const status = Array.isArray(list) && list.length
    if(!status){
      return
    }
    return list.forEach(it => this.renderMark(it))
  }
  // 清除缓存
  removeMapListener(){
    //
  }
  get UI(){
    return this[UI]
  }
  // UI控件
  async loaderUI(){
    const url = 'http://webapi.amap.com/ui/1.0/main.js?v=1.0.11'
    // const data = {v: '1.0.11'}
    const loader = await jsonp({
      url,
      // data
    })
    this[UI] = window.AMapUI
  }
  // 加载控件
  async loader(){
    if(this[LOADER]){
      return this[LOADER]
    }
    const checkAmap = () => 'AMap' in window && window['AMap']
    this[LOADER] = checkAmap()
    if(!this[LOADER]){
      let url = 'http://webapi.amap.com/maps'
      const key = this.config.key
      const v = this.config.v || '1.4.3'
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
      this[LOADER] = checkAmap()
      // console.log({loader})
      this.emit('READY', this[LOADER])
    }
    
    //let ret = this[LOADER] = 'AMap' in window && window['AMap']
    /*if(!this[UI]){
      await this.loaderUI()
    }*/
    return this[LOADER]
  }
  render(container){
    // const amap = await this.loader()
    const $map = new this[LOADER].Map(container/*, this.config.option*/)
    // 添加控制器
    // $map.addControl(this[GEO])
    return $map
  }
  [POSITION](){
    return new Promise(resolve => {
      this.once('COMPLETE', info => resolve(info))
      this[GEO].getCurrentPosition()
    })
  }
  async [TIMER](){
    const info = await this[POSITION]()
    this[TIME_KEY] && clearTimeout(this[TIME_KEY])
    this[TIME_KEY] = setTimeout(() => this[TIMER](), this.config.time || 5*1000)
    return info
  }

    // 创建一个应用
  async listen(){
    const amap = await this.loader()
    this[MAP] = new amap.Map('iCenter') //new amap.Map(this.config.container, this.config.option)
    // console.log(this[MAP], amap, this)
    this[MAP].plugin('AMap.Geolocation', () => {
      this[GEO] = new amap.Geolocation({
            enableHighAccuracy: true,//是否使用高精度定位，默认:true
            timeout: 10000,          //超过10秒后停止定位，默认：无穷大
            maximumAge: 0,           //定位结果缓存0毫秒，默认：0
            convert: true,           //自动偏移坐标，偏移后的坐标为高德坐标，默认：true
            showButton: false,        //显示定位按钮，默认：true
            GeoLocationFirst: true,
            noIpLocate: 3,
            useNative: true,
            buttonPosition: 'LB',    //定位按钮停靠位置，默认：'LB'，左下角
            // buttonOffset: new AMap.Pixel(10, 20),//定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
            showMarker: false, //true,        //定位成功后在定位到的位置显示点标记，默认：true
            showCircle: true,        //定位成功后用圆圈表示定位精度范围，默认：true
            panToLocation: false, //true,     //定位成功后将定位到的位置作为地图中心点，默认：true
            zoomToAccuracy: false //true      //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
          })
          // 添加面板
          this[MAP].addControl(this[GEO])
          // 获取当前位置
          this[TIMER]()
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



exports = module.exports = new Amap()
/*{
  // 获取扩展的插件
  get loader(){
    if(exports[AMAP]){
      return exports[AMAP]
    }
    exports[AMAP] = new Amap()
    return exports[AMAP]
  },
  async listen(){
    if(exports[AMAP]){
      return exports[AMAP]
    }
    exports[AMAP] = new Amap()
  }
}*/
