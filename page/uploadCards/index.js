const app = getApp();
import leaseApi from '/api/lease.js';
import mineApi from '/api/mine.js';
Page({
  data: {
    path: '',
    shareData: app.shareData,
    onLoad: false,
    upload: false, 
    driverLicenseInfo: {},
    sfzLicenseInfo: {},
    connectInfo: [],
    userInfoInfo: {},
    cameraType: 'sfzLicense_front', // 当前拍照的证件类型
  },
  onLoad(query) {
    let path = query.url || "";
    this.setData({
      path: path
    })
    this.getUserDataInfo();
    // this.getLocation();
  },
  onShow() {
    this.setData({
      shareData: getApp().shareData
    })
  },
  clear (e) {
    const name = e.target.dataset.name;
    app.shareData[name] = undefined;
    this.setData({
      shareData: getApp().shareData
    })
  },
  async getUserDataInfo () {
    my.showLoading({
      content:'查询结果中...'
    })
    try {
      const res = await mineApi.userDataInfo();
      if (res.code === 200 && res.data) {
        app.shareData = { ...res.data };
        app.shareData.idcardPros = res.data.idCardPros;
        app.shareData.idcardCons = res.data.idCardCons;
        this.setData({
          shareData: getApp().shareData,
          upload: !app.shareData.idcardPros || !app.shareData.idcardCons || !app.shareData.handheldIdCard || !app.shareData.bankCard
        })
      }else {
        this.setData({
          upload: true
        })
        
      }
      setTimeout(() => {
        my.hideLoading()
        this.setData({
          onLoad: true
        })
      }, 500)
    }catch(e){
      setTimeout(() => {
        my.hideLoading()
        this.setData({
          upload: true,
          onLoad: true
        })
      }, 500)
    }
  },
  choosePhoneContact () {
    const connectInfo = this.data.connectInfo;
    if(connectInfo.length>2){
      my.showToast({
        type: 'none',
        content: '已选择三个联系人',
        duration: 3000,
      });
      return;
    }
    my.choosePhoneContact({
      success: (res) => {
        const find = connectInfo.find(item => {
          return item.name === res.name && item.mobile === res.mobile
        })
        if(find){
          my.showToast({
            type: 'fail',
            content: '联系人已选择',
            duration: 3000,
          });
          return;
        }
        connectInfo.push(res);
        this.setData(
          {
            connectInfo
          }
        )
      },
      fail: (res) => {
       
      },
    });
  },
  //  getLocation() {
  //   var that = this;
  //   my.getLocation({
  //     type: 2,
  //     success(res) {
  //       console.log(res)
  //     },
  //     fail() {
  //       my.alert({ title: '定位失败' });
  //     },
  //   })
  // },
  /**
     * 拍照上传证件
     */
  async onUpLoadImageFromCamera(e) {
    const { type } = e.target.dataset;
    let {
      driverLicenseInfo: { owner = '' },
      sfzLicenseInfo: { name = '' },
    } = this.data;
    this.setData({ cameraType: type });
    my.navigateTo({
      url: `../ai-camera/index?cameraType=${type}`,
    });
  },
  async submit () {
    // const connectInfo = this.data.connectInfo;
    // if(connectInfo.length < 3){
    //   my.showToast({
    //     type: 'none',
    //     content: '请先选择其他联系人信息',
    //     duration: 3000,
    //   });
    //   return;
    // }
    try{
      const res = await leaseApi.realSubmit();
      if(res.code === 200){
        my.showToast({
          type: 'success',
          content: '上传成功',
          duration: 2000
        });
        my.redirectTo({
          url: this.data.path
        })
      }else{
        my.showToast({
          type: 'fail',
          content: res.message,
          duration: 3000
        });
      }
    }catch(e){
      my.showToast({
        type: 'fail',
        content: e.message,
        duration: 3000
      });
    }
  }
});
