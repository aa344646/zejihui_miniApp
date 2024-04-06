// pages/personal/addressList/addressList.js
// import personalApi from '../../../api/personal.js';
import commonApi from '/api/common.js';
Page({
  data: {
    show:false,
    addressList: [],
    startX: 0, //开始坐标
    startY: 0,
    clientX: 0,
    clientY: 0,
    needRealName:false,
  },
  onLoad: function (options) {
    // this.checkRealName();
  },
  onReady: function () {
  
  },
  onShow()
  {
    this.getListData();
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getListData();
    setTimeout(()=>{
      my.stopPullDownRefresh();
    },800);
  },
  //获取数据
  getListData()
  {
    // wx.showLoading({
    //   title: '加载中',
    // });
    my.showLoading({
      content:'加载中'
    });
    commonApi.getAddress().then(resp => {
      if (resp.code === 200)
      {
        
        let addressList = resp.data || [];
        this.setData({
          addressList
        });
      }
      else if(resp.code===401)
      {
        app.getUserInfo().then(data => {
          this.getListData();
        })
      }
      else
      {
        this.$toast(resp.message);
      }
      this.setData({
        show:true
      });
      my.hideLoading();
    }).catch(err => {
      my.hideLoading();
    });
  },
  selectAdd(e){ //用户选择了某个地址
    let id = e.currentTarget.dataset.id || '';
    const addressList = this.data.addressList;
    const find = addressList.find(item => item.id === id);
    if(find){
      my.setStorageSync({
        key: 'userSelectAdd',
        data: JSON.stringify(find)
      });
      my.navigateBack({
        delta: 1
      });
    }
  },
  edit: function (e) {
    let item = e.currentTarget.dataset.item;
    my.setStorage({
      key: 'editAddress',
      data: item,
      success()
      {
        my.navigateTo({
          url: '/page/addressEdit/index?id=' + item.id
        })
      }
    })
  },
  newAddress(){
    // if(this.data.needRealName)
    // {
    //   this.showRealTip();
    // }
    // else
    // {
      
    // }
    my.navigateTo({
      url: '/page/addressEdit/index'
    });
    my.removeStorage({
      key: 'editAddress'
    })
  },
  //手指触摸动作开始 记录起点X坐标
  touchstart: function (e) {
    //开始触摸时 重置所有删除
    this.data.addressList.forEach(function (v, i) {
      if (v.isTouchMove)//只操作为true的
        v.isTouchMove = false;
    })
    this.setData({
      startX: e.changedTouches[0].clientX,
      startY: e.changedTouches[0].clientY,
      addressList: this.data.addressList
    })
  },
  //滑动事件处理
  touchmove: function (e) {
    var that = this,
      index = e.currentTarget.dataset.index,//当前索引
      startX = that.data.startX,//开始X坐标
      startY = that.data.startY,//开始Y坐标
      touchMoveX = e.changedTouches[0].clientX,//滑动变化坐标
      touchMoveY = e.changedTouches[0].clientY,//滑动变化坐标
      //获取滑动角度
      angle = that.angle({X: startX, Y: startY}, {X: touchMoveX, Y: touchMoveY});
    that.data.addressList.forEach(function (v, i) {
      v.isTouchMove = false
      //滑动超过30度角 return
      if (Math.abs(angle) > 30) return;
      if (i == index)
      {
        if (touchMoveX > startX) //右滑
          v.isTouchMove = false
        else //左滑
          v.isTouchMove = true
      }
    })
    //更新数据
    that.setData({
      addressList: that.data.addressList
    })
  },
  /**
   * 计算滑动角度
   * @param {Object} start 起点坐标
   * @param {Object} end 终点坐标
   */
  angle: function (start, end) {
    var _X = end.X - start.X,
      _Y = end.Y - start.Y
    //返回角度 /Math.atan()返回数字的反正切值
    return 360 * Math.atan(_Y / _X) / (2 * Math.PI);
  },
  //删除事件
  del: function (e) {
    let item = e.currentTarget.dataset.item;
    let index = e.currentTarget.dataset.index;
    let addressList = this.data.addressList;
    let that = this;
    my.confirm({
      title: '提示',
      content: '您确定删除吗？',
      success: (result) => {
        if(result.confirm){
          commonApi.getAddressRemove({
            id: item.id
          }).then(resp => {
            if (resp.code == 200)
            {
              addressList.splice(index, 1);
              that.setData({
                addressList: addressList
              });
              my.removeStorage({
                key: 'editAddress'
              })
            }
          })
        }
      },
    });
  },
  checkRealName()
  {
    // personalApi.getInformation().then(resp=>{
    //   if(resp.code===200)
    //   {
    //     let data = resp.data || {};
    //     if(data.creditStatus<=0)
    //     {
    //       this.setData({
    //         needRealName:true,
    //       });
          
    //       this.showRealTip();
          
    //     }
    //   }
    //   else if(resp.code===401)
    //   {
    //     this.$login().then(()=>{
    //       this.checkRealName();
    //     });
        
    //   }
    //   else
    //   {
      
    //   }
    // }).catch(err=>{
    //   this.$networkErr(err);
    // })
  },
  // showRealTip()
  // {
  //   wx.showModal({
  //     title:'提示',
  //     content:'您还未进行实名认证，暂时不能添加地址',
  //     confirmText:'去认证',
  //     success:(res)=>{
  //       if(res.confirm)
  //       {
  //         wx.navigateTo({
  //           url: '/pages/credit/index/index?url=/pages/personal/addressList/addressList'
  //         });
  //       }
  //     }
  //   });
  // }
});
