'use strict'

let i = 0
module.exports = params => new Promise((resolve, reject) => {
	if(typeof document === 'undefined'){
		return reject(new Error('环境不支持document'))
	}
	i++
	let {data, url, timeout} = params
	url = url || ''//window.location.href
	const joinTag = /\?/.test(url) ? '&' : '?'
	const script = document.createElement('script')
	const $header = document.getElementsByTagName('head')[0]
	let callback = 'callback' + i
	let param = [url]
	let arr = []
    Object.prototype.toString.call(data) === '[object Object]'&&Object.keys(data).forEach(name => arr.push(encodeURIComponent(name) + '=' + encodeURIComponent(typeof data[name] == 'object' ? JSON.stringify(data[name]) : data[name])))
	arr.push(`callback=${callback}`)
	param.push(arr.join('&')) 
	script.src = param.join(joinTag)
	$header.appendChild(script)
	window[callback] = json => {
		$header.removeChild(script)
		clearTimeout(script.timer)
		delete window[callback]
		// console.log(json)
		resolve(json) // reason: you can
	}
	if(timeout){
		script.timer = setTimeout(() => {
			delete window[callback]
			$header.removeChild(script)
			reject(new Error('请求超时'))
		}, timeout)
	}
}) 