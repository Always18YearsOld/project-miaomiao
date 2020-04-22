// miniprogram/pages/index/index.js

const app = getApp()
const db = wx.cloud.database()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrls: [],
    //推荐界面用户信息数组
    listData: [],
    //切换推荐和最新
    current: 'links'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.cloud.callFunction({
      name: 'login',
      data: {}
    }).then((res) => {
      // console.log(res)
      db.collection('users').where({
        _openid: res.result.openid
      }).get().then((res) => {
        if (res.data.length) {
          app.userInfo = Object.assign(app.userInfo, res.data[0]),
            this.setData({
              userPhoto: app.userInfo.userPhoto,
              nickName: app.userInfo.nickName,
              logged: true
            })
          this.getMessage()
        }
      })
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.getListData()
    this.getBannerList()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  handleLinks(e) {
    // console.log(e)
    let id = e.target.dataset.id

    wx.cloud.callFunction({
      name: 'update',
      data: {
        collection: 'users',
        doc: id,
        data: "{links: _.inc(1)}"
      }
    }).then((res) => {
      console.log(res)
      let update = res.result.stats.updated
      if (update) {
        let cloneListData = [...this.data.listData]
        for (let i = 0; i < cloneListData.length; i++) {
          if (cloneListData[i]._id == id) {
            cloneListData[i].links++
          }
        }
        this.setData({
          listData: cloneListData
        })
      }
    })
  },
  changeLinks() {
    // console.log(this.data.current)
    this.setData({
      current: "links"
    }, () => {
      this.getListData()
    })
    // console.log(this.data.current)
  },
  changeTime() {
    // console.log(this.data.current)
    this.setData({
      current: "time"
    }, () => {
      this.getListData()
    })
    // console.log(this.data.current)
  },
  getListData() {
    db.collection('users')
      .field({
        userPhoto: true,
        nickName: true,
        links: true
      })
      .orderBy(this.data.current, 'desc')
      .get().then((res) => {
        // console.log(res)
        this.setData({
          listData: res.data
        })
      })
  },
  handleDetail(e) {
    let id = e.target.dataset.id
    wx.navigateTo({
      url: '/pages/detail/detail?userId=' + id,
    })
  },
  getMessage() {
    db.collection('message').where({
      userId: app.userInfo._id
    }).watch({
      onChange: function (snapshot) {
        if (snapshot.docChanges.length) {
          let list = snapshot.docChanges[0].doc.list
          // console.log(list.length)
          if (list.length) {
            wx.showTabBarRedDot({
              index: 2
            })
            app.userMessage = list
          } else {
            wx.hideTabBarRedDot({
              index: 2
            })
            app.userMessage = []
          }
        }
      },
      onError: function (err) {
        console.error('the watch closed because of error', err)
      }
    })
  },
  getBannerList() {
    db.collection('banner').get().then((res) => {
      // console.log(res.data)
      this.setData({
        imgUrls: res.data
      })
    })
  }
})