var config = require('../../config.js')
var util = require('../../utils/util.js')

//index.js
//获取应用实例
var app = getApp()
Page( {
  data: {
    indicatorDots: true,
    vertical: false,
    autoplay: true,
    interval: 3000,
    duration: 1200,
    page: 0,
    ctype: 0,
    types: ["重要报名", "线上活动", "线下活动", "历史"],
  },
  onReachBottom () {
    this.loadActivities(this.data.ctype, true)
  },
  onPullDownRefresh (){
    this.loadActivities(this.data.ctype)
  },
  loadActivities: function(type, bottom = false) {
    var url = ""
    wx.showNavigationBarLoading()
    var that = this
    if (!bottom) this.data.page = 1
    else this.data.page++
    if (type === 3)
      url = config.service.getActivitiesUrl + '?page=' + that.data.page + '&ctype=2&tt=' + app.globalData.userInfo.titlestr
    else
      url = config.service.getActivitiesUrl + '?running=1&state=0&type=' + type + '&page=' + that.data.page + '&tt=' + app.globalData.userInfo.titlestr
    //playingList
  
    wx.request({
      url: url,
      method: 'GET',
      data: {},
      header: {
        'Accept': 'application/json'
      },
      success: function (res) {
        wx.hideNavigationBarLoading()
        if (res.data.activities) 
          res.data.activities.forEach(e => {
            e.start_time = util.formatTime(e.start_time)
            e.end_time = util.formatTime(e.end_time)
          })
        if (res.data.activities)
          that.setData({activities: bottom?[...that.data.activities, ...res.data.activities]:res.data.activities})
        else
          if (!bottom) that.setData({activities: []})
      },
      complete: function () {
        wx.stopPullDownRefresh()
      }
    })
  },

  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo( {
      url: '../logs/logs'
    })
  },
  bindActivityTap: function(index) {
    wx.navigateTo({
      url: '/pages/acti/index?id=' + index.currentTarget.dataset.id
    })
  },
  bindTypeTap: function(index) {
    if (index.currentTarget.dataset.idx !== this.data.ctype) {
      this.setData({ ctype: index.currentTarget.dataset.idx})
      this.loadActivities(this.data.ctype)
    }
  },
  swiperchange: function(e) {
    
  },

  onLoad: function() {
    wx.setNavigationBarTitle({
      title: '活动'
    })
  },
  go: function(event) {
    wx.navigateTo({
      url: '../list/index?type=' + event.currentTarget.dataset.type
    })
  },
  onReady: function () {
    console.log('match onLoad')
    var that = this
    this.loadActivities(this.data.ctype)
    wx.setNavigationBarTitle({
      title: '活动'
    })
  }
})
