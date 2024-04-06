import api from '/api/mine.js';
import { upLoadImg } from '/util/upload.js';
import 'umtrack-alipay';
import { compareVersions } from 'compare-versions'
const { version } = my.getSystemInfoSync()
if (compareVersions(version, '10.1.85') < 0) {
  my.ap && my.ap.updateAlipayClient && my.ap.updateAlipayClient();
}

App({
  umengConfig: {
    appKey: '6239b980424cf47c54a64d34', //由友盟分配的APP_KEY
    debug: false, //是否打开调试模式
    uploadUserInfo: false // 自动上传用户信息，设为false取消上传，默认为false
  },
  upLoadImg,
  globalQuery: {},
  globalChannel: '',
  merchantId: '',
  sysInfo: '',
  cid: '',
  shareData: {},
  userInfo: null,
  selectPhoneObj: {
    selectPhoneNumber: '',
    time: '',
  },
  onLaunch(options) {
    if (options.query) {
      this.globalQuery = options.query || {};
      this.merchantId = options.query.merchantId || '';
    }
  },
  onShow(options) {
    if (options) {
      this.globalQuery = options.query || {};
      if (options.merchantId) {
        this.merchantId = options.merchantId || '';
      }
    }
  },
  onHide() {
    //console.log('App Hide');
  },
  getUserInfo() {
    return new Promise((resolve, reject) => {
      my.getAuthCode({
        scopes: ['auth_user', 'auth_life_msg'],
        success: (auth) => {
          my.getAuthUserInfo({ // 用户信息
            success: (info) => {
              console.log(info, ">>>>>>>>");
              api.login({
                authCode: auth.authCode
              }).then(resp => {
                if (resp.code == 200) {
                  let userInfo = info;
                  console.log(resp, ">>>>>>>>");
                  userInfo.token = resp.data.token;
                  userInfo.userId = resp.data.zfbUserId;
                  userInfo.bindStatus = resp.data.bindStatus;
                  my.setStorageSync({
                    key: 'token',
                    data: resp.data.token,
                  });
                  my.setStorageSync({
                    key: 'bindStatus',
                    data: resp.data.bindStatus,
                  });
                  my.setStorageSync({
                    key: 'userId',
                    data: resp.data.zfbUserId,
                  });
                  this.userInfo = userInfo;
                  resolve(this.userInfo);
                }
                else {
                  my.showToast({
                    type: 'fail',
                    content: '授权登录失败:' + resp.message,
                    duration: 3000,
                  });
                  this.userInfo = null;
                  reject({});
                }
              }).catch(err => {
                this.userInfo = null;
                reject({});
              });
            },
            fail: (e) => {
              this.userInfo = null;
              reject({});
            },
          });
        },
        fail: (e) => {
          my.alert({
            title: '用户未授权',
            content: '如需正常使用小程序功能，请在服务授权窗口中同意《用户授权协议》并点击授权确定按钮。',
            buttonText: '我知道了',
            success: () => {
            },
            complete: () => {
              my.navigateBack();
            }
          });
          reject({});
        },
      });
    });
  },
  getImageSuffix(num = 1) {

    const sysInfo = my.getSystemInfoSync();

    let iw = Math.round(sysInfo.windowWidth * (sysInfo.pixelRatio || 1));

    const suffix = '?x-oss-process=image/resize,m_lfit,w_' + Math.ceil(iw / num) + ',limit_1/format,jpg/sharpen,100/interlace,1/quality,q_95';

    return suffix;

  },
});