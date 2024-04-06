import receive from '/api/receive.js';
Page({
  data: {
    disable:true,
    btnText:'立即领取'
  },
  onLoad(query)
  {
    getApp().getUserInfo().then(user => {

      this.userinfo = user;

    }).catch(() => {

    });
  },
  receiveCoupon(){
    if(this.data.disable){
      my.showLoading({
        content:'领取中...'
      });
      let bindStatus = my.getStorageSync({key:"bindStatus"}).data|| null;
      getApp().getUserInfo().then(user => {
        my.hideLoading();
        if (!this.userinfo.bindStatus && !bindStatus) {
          let path = '/page/afterReceive/index';
          my.navigateTo({
              url: "/page/bindingPhone/index?url=" + path
          });
        } else {
          this.receive();
        }
      }).catch((err) => {
        
        my.showToast({

          type: 'fail',

          content: err.message,

          duration: 3000

        });

      });
      
    }else{
      my.reLaunch({
        url: "/page/lease/index"
      })
    }
    
  },
  receive(){
    
    receive.receiveCoupon({activityBtn:'kaigongji',receiveStatus:'CANRECEIVE'}).then(resp => {
      if (resp.code == 200) {
        my.hideLoading();
        my.showToast({
          type: 'success',
          content: '领取成功',
          duration: 2000
        });
        this.setData({
          disable: false,
          btnText:'立即使用'
        })
      } else {
        my.hideLoading();

        if(resp.message == '您已经领取过了'){
          my.showToast({
            type: 'fail',
            content: resp.message+',去使用吧!',
            duration: 3000
          });
          this.setData({
            disable: false,
            btnText:'立即使用'
          })
        }else{
          my.showToast({
            type: 'fail',
            content: resp.message,
            duration: 3000
          });
        }
        
      }
    }).catch(e => {
      my.hideLoading();
      my.showToast({
        type: 'fail',
        content: e.message,
        duration: 3000
      });
    });
  }
});
