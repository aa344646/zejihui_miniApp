import util from "/util/util.js";
import mineApi from "/api/mine.js";
import leaseApi from '/api/lease.js';
import order from '/api/order.js';
import HttpApi from "/api/lease";
import env from '/util/env.js';
import moment from 'moment';
const app = getApp();
Page({
  data: {
    uploadInfo: "uploadInfo",
    uinfo: {},
    hotList: [],
    recommendList: [],
    tabFirstShowLeft: [],
    tabFirstShowRight: [],
    tabFirstShowListLeftHeight: 0,
    tabFirstShowListRightHeight: 0,
    scParams: [], // 领取券数据
    storeData: [],  // 商家券数据
    acId: [],
    // redNum: 0, // 红点数量
  },
  onLoad() {
    this.getCollectData();
    // this.getRedNum();
  },
  onShow() {
    this.userinfo = {};
    app
      .getUserInfo()
      .then(user => {
        this.userinfo = user;
        mineApi
          .userinfo()
          .then(res => {
            if (res.code === 200) {
              this.setData({
                "uinfo": res.data
              });
            }
          })
          .catch(e => { });
      })
      .catch(err => { });
  },
  uploadInfo() {
    let url = "/page/mine/index"; // 为了能跳转回来
    my.navigateTo({
      url: "/page/uploadCards/index?url=" + url
    });
  },

  // getRedNum() {
  //   order.getOrderList("all").then(res => {
  //     if (res.code === 200) {
  //       this.setData({
  //         redNum: res.data.list.length
  //       })
  //     }
  //   })
  // },
  showServer() {
    this.server.showModal();
  },
  hideServer() {
    this.server.hideModal();
  },
  server(ref) {
    this.server = ref;
  },
  confirm(ref) {
    this.confirm = ref;
  },
  onAuthError() {
    this.confirm.hideModal();
    // 未授权 去短信绑定页面
    let url = "/page/mine/index"; // 为了能跳转回来
    my.navigateTo({
      // 跳往绑定手机号
      url: "/page/bindingPhone/index?url=" + url
    });
  },
  onGetAuthorize() {
    // 授权
    const channel = getApp().globalQuery.channel || null;
    this.confirm.hideModal();
    my.getPhoneNumber({
      success: res => {
        let encryptedData = JSON.parse(res.response);
        HttpApi.bindAuthUser({ encryptedData: encryptedData.response, channel })
          .then(result => {
            if (result.code === 200) {
              const userinfo = this.userinfo;
              userinfo.bindStatus = true;
              this.userinfo = userinfo;
              my.setStorageSync({
                key: "bindStatus",
                data: true
              });
              my.showToast({
                type: "success",
                content: "手机号已绑定",
                duration: 3000
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
  async getValidationReceiveCoupon(acId) {
    let { storeData = [] } = this.data;
    const userId = my.getStorageSync({
      key: 'userId',
    }).data || '';
    const params = {
      appId: '2021002189690874',
      uid: userId,
      activityIds: acId,
    }
    try {
      const resp = await leaseApi.getValidationReceive(params);
      if (resp.code === 200) {
        let couponParams = [];
        let scParams = [];
        resp.data.map(item => {
          if (item.resultCode === "SUCCESS") {
            couponParams.push(item.activityId);
            scParams.push({
              activityId: item.activityId || "",
              outBizNo: item.data.outBizNo || "",
            })
          };
        })
        storeData.filter(item => {
          !couponParams.includes(item.activityId)
        })

        storeData.forEach(item => {
          item.publishStartTime = moment(item.publishStartTime).format("YYYY-MM-DD HH:mm");
          item.publishEndTime = moment(item.publishEndTime).format("YYYY-MM-DD HH:mm")
        })        // const scParams = resp.data;


        console.log(scParams, ">>>>>>>>>>>>>scParams");
        if(!scParams.length){ my.showToast({
          type: 'none',
          content: '暂无优惠券可领',
          duration: 2000,
        });}
        this.setData({
          storeData,
          scParams
        })
      }
    } catch (err) {
      my.showToast({
        type: 'none',
        content: '暂无优惠券可领',
        duration: 2000,
      });
    }
  },


  async getRedCoupon() {
    const userId = my.getStorageSync({
      key: 'userId',
    }).data || '';
    if (!userId) { return app.getUserInfo() }
    const params = {
      appId: '2021002189690874',
      uid: userId,
    }
    try {
      const resp = await leaseApi.getRedCouponData(params);
      const { records = [] } = resp.data || {};
      this.setData({
        storeData: records
      })
      const acId = [];
      records.map(item => {
        acId.push(item.activityId)
      })
      this.getValidationReceiveCoupon(acId);
      this.setData({
        acId
      })
    } catch (err) {
      throw new Error(err.message || err);
    }
  },
  goodsClick(e) {
    my.navigateTo({
      url: "/page/detail/index?goodsId=" + e.currentTarget.dataset.id
    })
  },
  getCollectData() {
    let params = {
      id: 121,
      pageNum: this.data.pageNum,
      pageSize: 100,
    };
    let recommendParams = {
      id: 110,
      pageNum: this.data.pageNum,
      pageSize: 100
    }
    this.getCollect(params, 'hotList');
    this.getCollect(recommendParams, 'recommendList');
  },
  noStart() {
    my.showToast({
      type: 'none',
      content: '功能暂未开放',
      duration: 2000,
    });
  },

  // 商家券
  async onBeforeGetCoupon(event, { extraData }) {

    // 返回值将作为「领券请求」的参数，注意是覆盖 params 的值。
    // 如果没有返回值则使用 params 作为请求参数。
    return this.data.params
  },
  handleGetCoup() {
    this.getRedCoupon();
  },

  onGetCouponSuccess(resultList, { extraData }) {
    console.log(this.data.scParams, ">>>>>>>>>>>>>>");
  },

  onGetCouponFail(result, { extraData }) {
    console.log('触发了 onGetCouponFail 事件')
    console.log('失败返回结果: ', result)
  },

  onUseImmediately(event, { extraData }) {
    my.openVoucherList();
    // 可以跳转到自定义的页面
  },


  onClose(event, { extraData }) {
    console.log('触发了 onClose 事件')
  },




  async handleWaterfallsFlow() {
    const recommendList = this.data.recommendList;
    console.warn({
      recommendList
    })
    for (let i = 0; i < recommendList.length; i++) {
      await this.pushEle(recommendList[i]);
    }
  },
  pushEle(v) {
    const _this = this;
    let tabFirstShowLeft = this.data.tabFirstShowLeft;
    let tabFirstShowRight = this.data.tabFirstShowRight;
    let tabFirstShowListLeftHeight = this.data.tabFirstShowListLeftHeight;
    let tabFirstShowListRightHeight = this.data.tabFirstShowListRightHeight;
    return new Promise(resolve => {
      if (tabFirstShowListLeftHeight > tabFirstShowListRightHeight) {
        tabFirstShowRight.push(v)
      } else {
        tabFirstShowLeft.push(v)
      }
      this.setData({
        tabFirstShowRight,
        tabFirstShowLeft
      }, () => {
        let query = my.createSelectorQuery();
        query.select(".tab-list-left")
          .boundingClientRect()
          .exec(ret => {
            let height = ret[0].height;
            _this.setData({
              tabFirstShowListLeftHeight: height
            }, resolve)
          });
        let query1 = my.createSelectorQuery();
        query1.select(".tab-list-right")
          .boundingClientRect()
          .exec(ret => {
            let height = ret[0].height;
            _this.setData({
              tabFirstShowListRightHeight: height
            }, resolve)
          });
      })
    })
  },
  processList(list) {
    if (!list) {
      return;
    }

    list.forEach(item => {
      let src = [];
      let imgs = item.imgFull || [];

      imgs.forEach((img) => {
        if (img.url.indexOf('http') === 0) {
          src.push(img.url);
        }
        else {
          src.push(env.image_host + img.url);
        }
      });
      item.src = src;
    });

  },
  getCollect(params, key) {
    // const collectId = [120, 122];

    leaseApi.getCollectGoods(params).then(resp => {
      if (resp.code === 200) {
        let data = resp.data || {};

        if (!data.id) {
          my.showToast({
            type: 'fail',
            content: '商品列表不存在',
            duration: 3000,
          });
        }
        let list = data.pageInfo.list || [];
        this.processList(list);
        if (data.notes) {
          data.notes = data.notes.split('#');
        }
        if (data.explanation) {
          data.explanation = data.explanation.split('#');
        }
        this.setData({
          [key]: list
        }, () => {
          if (key === 'recommendList') {
            this.handleWaterfallsFlow();
          }
        })
        console.warn({
          [key]: list
        });
      }
      else {
        my.showToast({
          type: 'fail',
          content: resp.message,
          duration: 3000,
        });
      }

      my.hideLoading();

    }).catch(err => {
      my.showToast({
        type: 'fail',
        content: err,
        duration: 3000,
      });
    })
  },
  listNavigateTo(e) {
    let { link, type, index } = e.currentTarget.dataset;
    if (link || type) {
      let bindStatus = my.getStorageSync({ key: "bindStatus" }).data || null;
      if (link && link.indexOf("help") > -1) {
        my.navigateTo({
          url: link
        });
        return;
      }
      if (!app.userInfo || !app.userInfo.token) {
        my.confirm({
          title: "温馨提示",
          content:
            "如需正常使用小程序功能，请在服务授权窗口中同意《用户授权协议》并点击授权确定按钮。",
          confirmButtonText: "立即授权",
          cancelButtonText: "暂不授权",
          success: result => {
            if (result.confirm) {
              app
                .getUserInfo()
                .then(user => {
                  this.userinfo = user;
                  mineApi
                    .userinfo()
                    .then(res => {
                      if (res.code === 200) {
                        this.setData({
                          "uinfo": res.data
                        });
                      }
                    })
                    .catch(e => { });
                })
                .catch(err => { });
            }
          }
        });
        return;
      }
      //
      if (!this.userinfo.bindStatus && !bindStatus) {
        // 未登陆  去登陆   但是客服电话和帮助是不需要登陆的
        this.confirm.showModal();
        return;
      }

      if (type) {
        console.log(type, ">>>>>>>>>");
        // 跳转不同的订单
        my.reLaunch({
          url: '/page/order/orderList/orderList?type=' + type + '&index=' + index
        });
        return;
      }

      if (link.indexOf("tip") > -1) {
        // 跳转续租或者买断
        let status = util.getQueryString(link, "status");

        let result =
          status == 0
            ? my.getStorageSync({ key: "hideRenewalTip" })
            : my.getStorageSync({ key: "hideBuyoutTip" });

        if (result.data) {
          // 跳过tip
          my.navigateTo({
            url: `/page/order/reletBuyOut/list/index?status=${status}`
          });
          return;
        }
      }
      my.navigateTo({
        url: link
      });
    } else {
      //联系客服
      this.callComplaint();
    }
  },
  callAdvise() {
    // 拨打客服电话
    my.confirm({
      title: "拨打客服电话？",
      content: "18185907733",
      confirmButtonText: "拨打",
      cancelButtonText: "取消",
      success: result => {
        if (result.confirm) {
          my.makePhoneCall({ number: "18185907733" });
        }
      }
    });
  },

  callComplaint() {
    // 拨打客服电话
    my.confirm({
      title: "拨打客服电话？",
      content: "0755-84505716",
      confirmButtonText: "拨打",
      cancelButtonText: "取消",
      success: result => {
        if (result.confirm) {
          my.makePhoneCall({ number: "0755-84505716" });
        }
      }
    });
  },
  merchantBuy() {
    const url = encodeURIComponent('https://h5.zejihui.com.cn/#/merchantEntry');
    my.navigateTo(
      {
        url: `/page/webView/index?url=${url}`
      }
    )
  },
  // merchantBuy() {
  //   const url = encodeURIComponent('https://h5.zejihui.com.cn/#/buymini?appId=2021002189690874');
  //   my.navigateTo(
  //     {
  //       url: `/page/webView/index?url=${url}`
  //     }
  //   )
  // },
  to5G() {
    my.showToast({
      type: 'none',
      content: '建设中',
      duration: 2000,
    });
    // my.navigateTo({
    //   url: `/page/5g/index`
    // });
  }
});
