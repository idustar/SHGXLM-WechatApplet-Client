var config = require('../../config.js')
var util = require('../../utils/util.js')

//index.js
//获取应用实例
var app = getApp()
Page( {
  data: {
    loaded: 0,
    article: {
    }
  },

  

  onLoad: function(option) {
    wx.showNavigationBarLoading()

    var that = this
    wx.request({
      url: config.service.getArticleUrl + '?id=' + option.id + '&tt=' + app.globalData.userInfo.titlestr,
      method: 'GET',
      data: {},
      header: {
        'Accept': 'application/json'
      },
      success: function (res) {
        wx.hideNavigationBarLoading()
        res.data.create_at = util.dateStr(res.data.create_at)
  
        wx.setNavigationBarTitle({
          title: res.data.title || "申花高校联盟"
        })
        if (!res.data.title) {
          util.showModel("访问失败", "您当前无权阅读该文章。")
          setTimeout(_ => wx.navigateBack({
            delta: 1
          }), 2000)
        }
        res.data.content = res.data.content.replace(/<img/g, "<img style='width: 100%;'");
   
        that.setData({ article: res.data, loaded: res.data.title?2:1 })
      },
      fail: function(res) {
        that.setData({ loaded: 1 })
      }
    })
  },
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
    }
    return {
      title: this.data.article.title || "申花高校联盟",
      path: '/pages/article/index?id='+this.data.article.article_id,
      success: function (res) {
        util.showSuccess("分享成功")
      }
    }
  }

})