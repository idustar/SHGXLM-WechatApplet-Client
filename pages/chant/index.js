var config = require('../../config.js')
var util = require('../../utils/util.js')

//index.js
//获取应用实例
var app = getApp()
Page( {
  data: {
    cindex: -1,
    chants: [],
    isPlaying: false,
    page: 0,
    ctype: 0,
    types: ["看台助威", "高校专属", "优秀助威歌"],
  },
  onReachBottom () {
    this.loadChants(this.data.ctype, true)
  },
  loadChants: function(type, bottom = false, loadfor = null) {
    var url = ""
    wx.showNavigationBarLoading()
    var that = this
    if (!bottom) this.data.page = 1
    else this.data.page++
    url = config.service.getChantsUrl + '?type=' + type + '&page=' + that.data.page + '&tt=' + app.globalData.userInfo.titlestr
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
        if (res.data.chants)
          that.setData({chants: bottom?[...that.data.chants, ...res.data.chants]:res.data.chants})
        else
          if (!bottom) that.setData({chants: []})
        if (loadfor) {
          that.setData({ cindex: loadfor })
          that.playAudio()
          util.showModel(that.data.chants[that.data.cindex].name, that.data.chants[that.data.cindex].description)

        }
      },
      complete: function () {
        wx.stopPullDownRefresh()
      }
    })
  },
  bindChantInfo: function (index) {
    var that = this
    this.setData({ cindex: index.currentTarget.dataset.ind })
    
          util.showModel(that.data.chants[that.data.cindex].name, that.data.chants[that.data.cindex].description)
        
  
  },
  bindChantTap: function(index) {
    if (index.currentTarget.dataset.ind !== this.data.cindex || !this.data.isPlaying) {
      this.setData({ cindex: index.currentTarget.dataset.ind })
      this.playAudio()
    } else {
      wx.pauseBackgroundAudio()
    }
  },
  bindTypeTap: function(index) {
    if (index.target.dataset.idx !== this.data.ctype) {
      this.setData({ctype: index.target.dataset.idx, cindex: -1})
      this.loadChants(this.data.ctype)
    }
  },
  swiperchange: function(e) {
    
  },
  onLoad: function(option) {
    var that = this
   
    wx.onBackgroundAudioPlay(function () {
      that.setData({ isPlaying: true })
     
    })
    wx.onBackgroundAudioPause(function () {
      that.setData({ isPlaying: false })
    
    })
    wx.onBackgroundAudioStop(function () {
      that.setData({ isPlaying: false })
  
    })
    if (option.type)
      this.setData({ctype: option.type})

    console.log('chant onLoad')
    var that = this
    this.loadChants(this.data.ctype, false, option.id)
    wx.setNavigationBarTitle({
      title: '曲库'
    })
    // wx.getBackgroundAudioManager().onPrev = function ()  {
    //   that.setData({ cindex: that.data.cindex - 1 })
    //   that.playAudio()
    // }
    // wx.getBackgroundAudioManager().onNext = function ()  {
    //   that.setData({ cindex: that.data.cindex + 1 })
    //   that.playAudio()
    // }
  },
  playAudio: function() {
    var that = this
    if (this.data.cindex < 0 || this.data.cindex >= this.data.chants.length)
      return
  
    wx.playBackgroundAudio({
      dataUrl: that.data.chants[that.data.cindex].url,
      title: that.data.chants[that.data.cindex].name,
      coverImgUrl: that.data.chants[that.data.cindex].icon,
      success: function() {
        that.setData({ isPlaying: true })
      }
    })
  },
  onReady: function () {
  },
  onPullDownRefresh() {
    this.loadChants(this.data.ctype)
    wx.stopPullDownRefresh()
  },
  onShareAppMessage(options) {
    if (this.data.cindex < 0 || !this.data.isPlaying) return {
      title: '助威曲库',
      path: '/pages/chant/index',
    }
    return {
      title: this.data.chants[this.data.cindex].name,
      imageUrl: this.data.chants[this.data.cindex].icon,
      path: '/pages/chant/index?type=' + this.data.ctype + '&id=' + this.data.cindex,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
})
