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
    types: [
      { simple: '全部', all: '全部', color: '#29cc6d'},
      { simple: '中超', all: '中超联赛', color: '#0041a2' },
      { simple: '亚冠', all: '亚洲冠军联赛', color: '#CC3300' },
      { simple: '杯', all: '中国足协杯', color: '#29cc6d' },
      { simple: '友', all: '俱乐部友谊赛', color: '#FF6600' },
      { simple: '预', all: '中超预备队', color: '#CC0099' },
      { simple: '已结束', all: '已结束', color: '#29cc6d' }
    ]
  },
  onReachBottom () {
    this.loadMatches(this.data.ctype, true)
  },
  onPullDownRefresh (){
    this.loadMatches(this.data.ctype)
  },
  loadMatches: function(type, bottom = false) {
    var url = ""
    wx.showNavigationBarLoading()
    var that = this
    if (!bottom) this.data.page = 1
    else this.data.page++
    if (type === 0)
      url = config.service.getMatchesUrl + '?type=0&page=' + that.data.page
    else
      url = config.service.getMatchesUrl + '?type=' + type + '&page=' + that.data.page
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
        if (res.data.matches) 
          res.data.matches.forEach(e => e.time = util.formatTime(e.time))
        if (res.data.matches)
          that.setData({matches: bottom?[...that.data.matches, ...res.data.matches]:res.data.matches})
        else
          if (!bottom) that.setData({matches: []})
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
  bindTypeTap: function(index) {
    if (index.currentTarget.dataset.idx !== this.data.ctype) {
      this.setData({ ctype: index.currentTarget.dataset.idx})
      this.loadMatches(this.data.ctype)
    }
  },
  swiperchange: function(e) {
    
  },

  onLoad: function() {
    wx.setNavigationBarTitle({
      title: '赛程'
    })
    console.log( 'match onLoad' )
    var that = this
   
    this.loadMatches(this.data.ctype)
  
  },
  go: function(event) {
    wx.navigateTo({
      url: '../list/index?type=' + event.currentTarget.dataset.type
    })
  },
  onShow: function () {
    wx.setNavigationBarTitle({
      title: '赛程'
    })
  },
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
    }
    return {
      title: "上海申花赛程",
      path: '/pages/match/index',
      success: function (res) {
        util.showSuccess("分享成功")
      }
    }
  }
})
