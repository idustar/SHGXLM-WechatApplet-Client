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
    types: ['官方公告', '球迷必读', '球迷志'],
    banners: [],
    articles: []
  },
  onReachBottom () {
    this.loadArticles(this.data.ctype, true)
  },
  onPullDownRefresh (){
    this.loadArticles(this.data.ctype)
  },
  loadArticles: function(type, bottom = false) {
    wx.showNavigationBarLoading()
    var that = this
    if (!bottom) this.data.page = 1
    else this.data.page++
    let ttu = ""
    if (app.globalData.userInfo)
      ttu = '&tt=' + app.globalData.userInfo.titlestr
    else
      ttu = ""
    //playingList
    wx.request({
      url: config.service.getArticleListsUrl + '?type=' + type + '&page=' + that.data.page + ttu,
      method: 'GET',
      data: {},
      header: {
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log(res.data)
        wx.hideNavigationBarLoading()
        if (res.data.articles) 
          res.data.articles.forEach(e => e.create_at = util.dateStr(e.created_at))
        if (res.data.articles)
          that.setData({articles: bottom?[...that.data.articles, ...res.data.articles]:res.data.articles})
        else
          if (!bottom) that.setData({articles: []})
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
  bindArticleTap: function(index) {
    wx.navigateTo({
      url: '/pages/article/index?id='+index.currentTarget.dataset.id
    })
  },
  bindBannerTap: function (index) {
    wx.navigateTo({
      url: index.currentTarget.dataset.id
    })
  },
  bindTypeTap: function(index) {
    if (index.currentTarget.dataset.idx !== this.data.ctype) {
      this.setData({ ctype: index.currentTarget.dataset.idx})
      this.loadArticles(this.data.ctype)
    }
  },
  swiperchange: function(e) {
    //FIXME: 当前页码
    //console.log(e.detail.current)
  },

  onShow: function() {
    wx.setNavigationBarTitle({
      title: '申花高校联盟'
    })
    console.log( 'home onLoad' )
    var that = this
   
    this.loadArticles(this.data.ctype)
    

    wx.request({
      url: config.service.getBannersUrl,
      method: 'GET',
      data: {},
      header: {
        'Accept': 'application/json'
      },
      success: function (res) {
        that.setData({ banners: res.data.banners })
      }
    })
  },
  go: function(event) {
    wx.navigateTo({
      url: '../list/index?type=' + event.currentTarget.dataset.type
    })
  }
})
