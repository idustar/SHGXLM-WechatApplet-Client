var config = require('../../config')
//index.js
//获取应用实例
var app = getApp()
Page( {
  data: {
    userInfo: {},
    source: '申花高校联盟'
  },
  //事件处理函数
  bindViewTap: function() {
    wx.openSetting({
      success: (res) => {}
    })
  },

  onLoad: function() {
    wx.setNavigationBarTitle({
      title: '我的'
    })
    var that = this
    //调用应用实例的方法获取全局数据
    app.getUserInfo( function( userInfo ) {
      //更新数据
      that.setData( {
        userInfo: userInfo,
        source: config.version
      })
    })
  },

  onShow: function () {
    wx.setNavigationBarTitle({
      title: '我的'
    })
  }
})
