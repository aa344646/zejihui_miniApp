const app = getApp();
Page({
  data: {
    systemInfo: {},
    swiperHeight: '',
    userId: '',
    btnTxt: '立即领取',
    params: [
      {
        activityId: '20220426008260043360152XXXX',
        outBizNo: '20220xxxx',// 导码模式商家券
      },
      {
        activityId: '20220426008260043360152XXXX',
        outBizNo: '20220xxxx',
      },
      {
        activityId: '20220426008260043360152XXXX',
        outBizNo: '20220xxxx',
        voucherCode: '2022xxxxxxx',//非导码模式商家券
      }
    ],
    senderMerchantId: '2021002189690874',
    dialogBtnType: 1,
    dialogBtnStyle: {
      color: '#000',
      borderColor: 'yellowgreen',
      backgroundColor: 'yellowgreen',
    },
  },
  onLoad() {
    this.getSystemInfo();
    const userId = my.getStorageSync({
      key: 'userId',
    }).data || '';
    if (!userId) {
      this.goLogin();
    }
  },


  onGetCouponSuccess(resultList, { extraData }) {
    console.log('触发了 onGetCouponSuccess 事件')
    console.log('成功返回结果: ', resultList)
  },
  onGetCouponFail(result, { extraData }) {
    console.log('触发了 onGetCouponFail 事件')
    console.log('失败返回结果: ', result)
  },
  onUseImmediately(event, { extraData }) {
    console.log('触发了 onUseImmediately 事件')

    // 可以跳转到自定义的页面
    my.navigateTo({
      url: '/pages/goods-detail/index',
    })
  },





  getSystemInfo() {
    const systemInfo = my.getSystemInfoSync();
    const swiperHeight = (systemInfo.titleBarHeight + systemInfo.statusBarHeight + ((systemInfo.windowWidth) / 750) * 280) + 'px';
    this.setData({
      systemInfo,
      swiperHeight
    })
  },
  goLogin() {
    app
      .getUserInfo()
      .then(res => {
        if (res) {
          my.showToast({
            type: 'success',
            content: '登录成功',
            duration: 3000
          });
        }
        this.setData({
          userId: res.userId || ''
        })
      })
      .catch(err => {
      });
  },
  receiveCoupon() {



    my.showToast({
      type: 'success',
      content: '领取成功，可到卡包查看',
      duration: 3000
    });

    if (this.data.btnTxt === '去使用') {
      my.openVoucherList();
    }
    console.log(">>>>>>>>qqq");
    this.setData({
      btnTxt: "去使用"
    })
  },
  goback() {
    my.reLaunch({
      url: `page/lease/index`
    });
  }
});

