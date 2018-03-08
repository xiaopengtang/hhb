'use strict'

const LIST = Symbol('hhb#LIST')
const ACT_EMIT = Symbol('hhb#ACT_EMIT')

module.exports = class {
  constructor(){
    this[LIST] = []
  }
  subscrible(fn){
    if(typeof fn !== 'function'){
      return
    }
    const key = this[LIST].push(fn)
    return () => this[LIST] = this[LIST].filter((fn, i) => i !== key)
  }
  async [ACT_EMIT]({list, param}){
    let [action, ...rest] = list
    await action(...param)
    const other = [...rest]
    return other.length ? await this[ACT_EMIT](...param) : void 0
  }
  async emit(...arg){
    return await this[ACT_EMIT]({
      list: this[LIST],
      param: [...arg]
    })
  }
}
