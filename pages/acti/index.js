var config = require('../../config.js')
var util = require('../../utils/util.js')

//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    states: ['', '删除已填内容', '等待结果', '审核通过', '审核拒绝'],
    loaded: 0,
    deleteForm: false,
    bd: false,
    tip: "点击报名",
    isOpen: false,
    btnstate: "primary",
    activity: {
    },
    submit: {}
  },

  checkOpen: function () {
    let dataa = this.data.activity
    console.log("check open")
    wx.showNavigationBarLoading()
    let that = this
    let flag = false
    wx.request({
      url: config.service.getSubmitUrl + '?ac=' + this.data.activity.activity_id + '&mb=' + app.globalData.userInfo.member_id,
      method: 'GET',
      data: {},
      header: {
        'Accept': 'application/json'
      },
      success: function (res) {
        if (res.data.submit_id) {
          res.data.st = JSON.parse(res.data.state_json || '{}')
          if (res.data.state === 1) {
            that.setData({ submit: res.data, isOpen: true, tip: that.data.states[res.data.state], btnstate: "warn", deleteForm: true })
          } else
            that.setData({ submit: res.data, isOpen: false, tip: that.data.states[res.data.state], btnstate: "primary", deleteForm: false })
          flag = true
        }

      },
      complete: function () {
        wx.hideNavigationBarLoading()
        if (flag) return
        let newOpen = that.data.isOpen
        if (dataa.state !== 0) {
          that.setData({
            isOpen: false,
            tip: "名额已满",
            btnstate: "warn",
            deleteForm: false
          })
          return
        } else if (dataa.running === 0) {
          that.setData({
            isOpen: false,
            tip: "不接受报名",
            btnstate: "default",
            deleteForm: false
          })
          return
        }
        let start = new Date(dataa.start_time).getTime()
        let end = new Date(dataa.end_time).getTime()
        let now = new Date().getTime()
        if (start > now) {
          that.setData({
            isOpen: false,
            tip: "尚未开始",
            btnstate: "primary",
            deleteForm: false
          })
          return
        } else if (end < now) {
          that.setData({
            isOpen: false,
            tip: "报名结束",
            btnstate: "warn",
            deleteForm: false
          })
          return
        }
        that.setData({
          isOpen: true,
          tip: "点击报名",
          btnstate: "primary",
          deleteForm: false
        })
        console.log("yes, it is open", start, now, end)
      }
    })

  },
  onShow: function () {
    var that = this
    setTimeout(_=>that.checkOpen(),500)
  },
  onLoad: function (option) {
    wx.showNavigationBarLoading()
    this.loadArticle(option)
    
  },
  loadArticle: function(option) {
    if (!app.globalData.userInfo) {
      setTimeout(_=>this.loadArticle(option), 300)
      return
    }
    var that = this
    wx.request({
      url: config.service.getActivityUrl + '?id=' + option.id + '&tt=' + app.globalData.userInfo.titlestr,
      method: 'GET',
      data: {},
      header: {
        'Accept': 'application/json'
      },
      success: function (res) {
        wx.setNavigationBarTitle({
          title: res.data.activity_name || "申花高校联盟"
        })
        res.data.start_times = util.formatTime(res.data.start_time)
        res.data.end_times = util.formatTime(res.data.end_time)
        if (!res.data.activity_name) {
          util.showModel("访问失败", "您当前无权查看该活动。")
          // setTimeout(_ => wx.navigateBack({
          //   delta: 1
          // }), 2000)
        }
        that.setData({ activity: res.data, loaded: res.data.activity_name ? 2 : 1 })
        that.checkOpen()
      },
      fail: function (res) {
        that.setData({ loaded: 1 })
      },
      complete: function () {
        wx.hideNavigationBarLoading()
      }
    })
  },
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: this.data.activity.activity_name || "申花高校联盟",
      path: '/pages/acti/index?id=' + this.data.activity.activity_id,
      success: function (res) {
        util.showSuccess("分享成功")
      }
    }
  },
  onPullDownRefresh() {
    this.checkOpen(this.data.activity)
    wx.stopPullDownRefresh()
  },
  gotoForm(e) {
    let that = this
    app.postFormid(e.detail.formId)
    
    if (this.data.deleteForm)
      this.deleteForm()
    else
      wx.navigateTo({
        url: '/pages/form/index?id=' + this.data.activity.activity_id,
        success: function (res) { },
        fail: function (res) { },
        complete: function (res) { },
      })
  },
  deleteForm() {
    util.showBusy("正在删除...")
    var that = this
    wx.request({
      url: config.service.postSubmitUrl + '?id=' + this.data.submit.submit_id,
      method: 'DELETE',
      data: {},
      header: {
        'Accept': 'application/json'
      },
      success: function (res) {
        util.showSuccess("删除成功")
        that.checkOpen()
      },
      error: function(res) {
        util.showModel("删除失败", "请联系管理员删除。")
      }
    })
  }
})