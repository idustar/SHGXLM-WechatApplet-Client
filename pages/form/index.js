var config = require('../../config.js')
var util = require('../../utils/util.js')

//index.js
//获取应用实例
var app = getApp()
Page( {
  data: {
    imgUrl: '',
    loaded: 0,
    bd: false,
    tip: "点击报名",
    isOpen: false,
    btnstate: "primary",
    activity: {
    }
  },
  formSubmit: function(ee) {
    app.postFormid(ee.detail.formId)
    
    let flag = false
    let activity = this.data.activity
    activity.content.items.forEach(e => {
      if (e.important && (e.value === null || e.value === '')) {
        e.tip = "此项为必填项"
        flag = true
      } else {
        e.tip = ""
      }
    })
    this.setData({activity: activity})
    if (flag) {
      wx.pageScrollTo({
        scrollTop: 200
      })
      return;
    }
    console.log("form submit")
    let dt = activity.content.items.map(e => e.value)
    let that = this
    dt = JSON.stringify({form: dt})
    wx.request({
      url: config.service.postSubmitUrl,
      method: 'POST',
      data: {
        owner: app.globalData.userInfo.member_id,
        activity_id: that.data.activity.activity_id,
        content: dt
      },
      header: {
        'Accept': 'application/json'
      },
    
      success: function (res) {
        if (res.data.submit_id > 0)
          wx.navigateTo({
            url: '/pages/success/index?id=' + res.data.submit_id + '&text=' + activity.content.success,
          })
        else
          util.showModel("提交失败", "出现了一点小问题。")
      },
      fail: function (res) {
        wx.pageScrollTo({
          scrollTop: 200
        })
        util.showModel("提交失败","出现了一点小问题。")
      }
    })
  },
  bindSelector: function(e) {
    let re = parseInt(e.detail.value)
    let so = parseInt(this.data.activity.content.items[e.currentTarget.dataset.idx].value)
    let gr = this.data.activity.content.items[e.currentTarget.dataset.idx].range
    let pa = []
    for (let k = 0; k < gr.length; k++) {
      if (gr[k].trigger && (k === re || k === so)) {
        pa = gr[k].trigger.split(',')
        pa.forEach(f => {
          let find = this.data.activity.content.items.findIndex(m => m.id === f)
          
          if (find>=0) {
            let param = {};
            let str = "activity.content.items[" + find + "].show"
            param[str] = re === k;
            this.setData(param);
          }
        })
      }
    }
    this.bindInput(e)
  },

  bindInput: function(e) {
    let param = {};
    let str = "activity.content.items[" + e.currentTarget.dataset.idx+"].value"
    param[str] = e.detail.value;
    this.setData(param);

  },
  onLoad: function(option) {
    wx.showNavigationBarLoading()
    var that = this
    wx.request({
      url: config.service.getActivityUrl + '?id=' + option.id + '&ctype=3&tt=' + app.globalData.userInfo.titlestr,
      method: 'GET',
      data: {},
      header: {
        'Accept': 'application/json'
      },
      success: function (res) {
        wx.hideNavigationBarLoading()
        wx.setNavigationBarTitle({
          title: res.data.activity_name || "申花高校联盟"
        })
        res.data.content = JSON.parse(res.data.content)
        if (!res.data.activity_name) {
          util.showModel("访问失败", "您当前无权查看该活动。")
        }
        that.setData({ activity: res.data, loaded: res.data.activity_name?2:1 })
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
    var that = this
    return {
      title: this.data.activity.activity_name || "申花高校联盟",
      path: '/pages/acti/index?id='+this.data.activity.activity_id,
      success: function (res) {
        util.showSuccess("分享成功")
      }
    }
  },



  _chooseImgAndUpload(url, beforUpload, success, fail) {
    var that = this

    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        util.showBusy('正在上传...')
        var filePath = res.tempFilePaths[0]

        beforUpload(filePath)

        // 上传图片
        wx.uploadFile({
          url,
          filePath: filePath,
          name: 'file',
          success: success,
          fail: fail
        })
      },
      fail: fail
    })
  },

  chooseImageTap: function (e) {
    var that = this

    // 选择图片和上传图片
    this._chooseImgAndUpload(
      config.service.uploadUrl,
      // 上传图片之前
      function (filePath) {
        that.setData({
          imgUrl: filePath
        })
      },
      // 调用成功
      function (res) {
        wx.hideToast();
        util.showSuccess('上传成功')
        var data = JSON.parse(res.data)
        console.log('upload to the server')

        if (data.code !== 0) {
          util.showModel('上传失败', '系统出现了一些小问题。')
          return
        }

        var info = data.data
        let param = {};
        let str = "activity.content.items[" + e.currentTarget.dataset.idx + "].value"
        param[str] = config.service.cosUrl + info.name;
        that.setData(param);

        // that.setData({
        //   showResult: true,
        //   idCardInfo: info.data
        // })
      },
      // 调用失败
      function (e) {
        util.showModel('上传失败' + e.message || '系统出了一点小问题!')
      }
    )
  }



})