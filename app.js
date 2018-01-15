//app.js
var qcloud = require('./vendor/wafer2-client-sdk/index')
var config = require('./config')
var util = require('./utils/util.js')

App({
  onLaunch: function () {
    qcloud.setLoginUrl(config.service.loginUrl)
    console.log('App Launch')
    //调用API从本地缓存中获取数据
    this.getUserInfo()
  },
  postFormid: function(formid) {
    if (!formid) return
    var that = this
    wx.request({
      url: config.service.postFormidUrl,
      method: 'POST',
      data: {
        formid: formid,
        member_id: that.globalData.userInfo.member_id,
        openId: that.globalData.userInfo.openId
      },
      header: {
        'Accept': 'application/json'
      },
      success(result) {
      },
      fail(error) {
      }
    })
  },
  getUserInfo: function(cb){
    var that = this
    if(this.globalData.userInfo.member_id){
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
            qcloud.request({
              url: config.service.getUserInfoUrl,
              login: true,
              success(result) {
                that.globalData.userInfo = result.data
                
                typeof cb == "function" && cb(that.globalData.userInfo)
              },
              fail(error) {
                // util.showModel('请求失败', error)
                util.showModel('登录失败', error.message+'.若您未授权小程序使用您的登录信息，可进入“我的”页面修改。')
                console.log('登录失败', error)
              }
            })
    
    }
  },
  onShow: function () {
    console.log('App Show')
  },
  onHide: function () {
    console.log('App Hide')
  },
  globalData:{
    userInfo:{
      titlestr: ""
    }
  }
})