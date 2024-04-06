import HttpApi from "/api/lease"; // 租赁API
import receiveApi from "/api/receive"; // 租赁API
import env from '/util/env.js';
import commonApi from '/api/common';
Page({
  data: {
    id: 160,
    list: [],
    name: '',
    img: '',
    isIos:false,
  },
  onLoad() {
    my.showLoading({
      content: '加载中...'
    });
    const id = 160;
    // const id = 41;
    // if (id == 44) {
    //   my.navigateToMiniProgram({
    //     appId: '2021003114689211',
    //     path: '/pages/index/index',
    //     extraData: {},
    //     success: (res) => {
    //       console.log({
    //         res
    //       })
    //     },
    //     fail: (e) => {
    //       console.log({
    //         e
    //       })
    //     }
    //   });
    // }
    // if (id == 114) {
    //   my.navigateToMiniProgram({
    //     appId: '2021002140680544',
    //     path: '/pages/index/index',
    //     extraData: {
    //       channelNo: 'CH3037297363121602560'
    //     },
    //     success: (res) => {
    //       console.log({
    //         res
    //       })
    //     },
    //     fail: (e) => {
    //       console.log({
    //         e
    //       })
    //     }
    //   });
    // }
    this.getSystemInfo();
    this.getMapArea(id);
    this.getConfig(id);
    this.setData({
      id
    });
    let sysInfo = my.getSystemInfoSync();
    if(sysInfo.platform === 'iOS'){
      console.log(sysInfo.platform,">>>>>>>>>>>>>>");
      this.setData({
        isIos:true
      })
      }
  },
  async getConfig (id) {
    const res = await commonApi.getConfig(id);
    if (res.code === 200 && res.data) {
      my.uma.trackEvent('navigateToMiniProgram',{
        _appId_: res.data.appId,
        _path_: res.data.path,
        _extraData_:JSON.stringify(res.data.extraData)
      });
      my.navigateToMiniProgram({
        appId: res.data.appId,
        path: res.data.path,
        extraData: res.data.extraData,
        success: (res) => {
          console.log({
            res
          })
        },
        fail: (e) => {
          console.log({
            e
          })
        }
      });
    }
  },
  async getMapArea (id) {
    const res = await HttpApi.popularize({
      id
    })
    if (res.code !== 200) {
      my.showToast(
        {
          type: 'fail',
          content: res.message,
          duration: 2000,
        }
      );
      my.hideLoading();
      return;
    } 
    if (!res.data) {
      my.showToast(
        {
          type: 'fail',
          content: '系统开小差了',
          duration: 2000,
        }
      );
      my.hideLoading();
      setTimeout(() => {
        my.navigateBack();
      }, 2000)
      return;
    }
    const data = res.data;
    const settingsList = data.settingsList;
    settingsList.forEach(item => {
      const settings = item.settings;
      settings.left = this.px2minipx(settings.left);
      settings.right = this.px2minipx(settings.right);
      settings.top = this.px2minipx(settings.top);
      settings.bottom = this.px2minipx(settings.bottom);
      settings.width = this.px2minipx(settings.width);
      settings.height = this.px2minipx(settings.height);
    })
    this.setData({
      list: settingsList,
      name: data.name,
      img: env.image_host + data.img
    }, () => {
      my.hideLoading();
    })
    // console.warn({
    //   list: settingsList,
    //   name: data.name,
    //   img: env.image_host + data.img
    // })
  },
  getSystemInfo() {
    const systemInfo = my.getSystemInfoSync();
    this.systemInfo = systemInfo;
  },
  px2minipx (v) {
    const id = this.data.id;
    if (!v) return v;
    const n = id < 149?750:1080;
    return v / (  n / this.systemInfo.windowWidth);
  },
  confirm(ref) {
    this.confirm = ref;
  },
  onAuthError() {
    this.confirm.hideModal();
    // 未授权 去短信绑定页面
    let url = "/page/mapArea/index?id=" + this.data.id; // 为了能跳转回来
    my.navigateTo({
      // 跳往绑定手机号
      url: "/page/bindingPhone/index?url=" + url
    });
  },
  onGetAuthorize() {
    // 授权
    let channel = getApp().globalQuery.channel || null;
    if (!channel) {
      channel = my.getStorageSync({
        key: 'channel',
      }).data||'';
    };
    console.log(channel,">>>>>>>>授权");
    this.confirm.hideModal();
    my.getPhoneNumber({
      success: res => {
        let encryptedData = JSON.parse(res.response);
        HttpApi.bindAuthUser({ encryptedData: encryptedData.response, channel })
          .then(result => {
            if (result.code === 200) {
              my.setStorageSync({
                key: "bindStatus",
                data: true
              });
            } else {
              my.showToast({
                type: "fail",
                content: result.message,
                duration: 3000
              });
            }
          })
          .catch(e => {
            my.showToast({
              type: "fail",
              content: e,
              duration: 3000
            });
          });
        // 调用接口进行绑定即可
        // my.request({
        //     url: '你的后端服务端',
        //     data: encryptedData,
        // });
      },
      fail: e => {
        my.showToast({
          type: "fail",
          content: e,
          duration: 3000
        });
        // console.log(res);
        // console.log('getPhoneNumber_fail');
      }
    });
  },
  areaTap (e) {
    const index = e.currentTarget.dataset.index;
    const mapArea = this.data.list[index];
    const page = mapArea.settings.page;
    const params = mapArea.settings.params;
    const query = this.serialize(params);
    console.warn(`${page}?${query}`);
    console.warn(decodeURIComponent(query));
    if ('reviceCoupon' === page) {
      my.showLoading({
        content: "领取中..."
      });
      setTimeout(() => {
        my.hideLoading();
      }, 2000)
      getApp()
        .getUserInfo().then(
          res => {
            if (!res.bindStatus) {
              my.hideLoading();
              this.confirm.showModal();
              return;
            } 
            const couponId = decodeURIComponent(query).split('=')[1];
            receiveApi.receiveCouponGroup({
              id: couponId
            }).then(res => {
              my.hideLoading();
              if (res.code===200) {
                my.showToast({
                  type: 'success',
                  content: res.data?res.data.msg:res.message,
                  duration: 3000,
                });
              } else {
                my.showToast({
                  type: 'fail',
                  content: res.data?res.data.msg:res.message,
                  duration: 3000,
                });
              }
              if (res.data) {
                const scrollBar = res.data.scrollBar;
                const size = this.px2minipx(res.data.size);
                if (scrollBar && size && size > 0) {
                  my.pageScrollTo({
                    scrollTop: parseInt(size),
                    duration: 300
                  });
                }
              }
            }).catch(res => {
              my.hideLoading();
              my.showToast({
                type: 'fail',
                content: res.message,
                duration: 3000,
              });
            })
            // 这里拿去做请求领券
          }
        ).catch(res => {
          my.hideLoading();
        })
    } else {
      my.navigateTo({
        url:`${page}?${query}`
      })
    }
  },  
  serialize (obj) {
    var str = [];
    for (var p in obj)
     if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
     }
    return str.join("&");
   }
});
