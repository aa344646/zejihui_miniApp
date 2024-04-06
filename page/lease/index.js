import leaseApi from '/api/lease.js';
import env from '/util/env.js';
import util from '/util/util.js';
import moment from 'moment';
import { accordGo } from '../../util/common'
import 'umtrack-alipay';
const app = getApp();
Page({
  data: {
    hotList: [],
    newList: [],
    hotListName: '',
    newListName: '',
    app,
    flagRed: false,
    systemInfo: {},
    centerBoxVisible: false,
    centerBoxBounding: {
      left: 0,
      bottom: 0,
    },
    swiperHeight: '',
    canUseLifestyle: my.canIUse('lifestyle'),
    publicId: '2017092108855606', //生活号
    autoplay: true,
    interval: 3000,
    duration: 1000,
    circular: true,
    bannerList: [],
    viewShow: false,
    homeData: {},
    dialogBtnType: 2,
    dialogBtnStyle: {
      color: '#fff',
      borderColor: '#ff2f3f',
      backgroundColor: '#ff2f3f',
    },
    newHomeData: {},
    cube: {},
    recommendList: [],
    tabPage: 0,
    allList: [], // 全部列表
    leftList: [], // 左边列表
    rightList: [], // 右边列表
    mark: 0, // 列表标记
    boxHeight: [], // 下标0和1分别为左列和右列高度
    updateNum: 6,
    wfList: [],
    // 这里之后删除
    tabFirstList: [],
    tabFirstShowList: [],
    tabFirstShowLeft: [],
    tabFirstShowRight: [],
    tabFirstShowListLeftHeight: 0,
    tabFirstShowListRightHeight: 0,
    // 这里之后删除
    collectList: [],
    activityData: {}, // 活动数据
    bannerIndex: 0, // banner 索引
    categorys: [],  // 分类
    categoryIndex: 0, // 分类索引
    fashionBrand: [],  // 品牌店
    opac: 0,
    tabIndex: 0,
    fixTabShow: false,
    liveList: [],
    zjhhsjCurrent: 0,
    activityIds: [], //商家券id
    consultedAcId: [], // 咨询商家券成功后获得的activityIds
    newYearPop: true,// 新年通知弹窗
  },
  onLoad() {
    this.getSystemInfo();
    my.showLoading({ content: '加载中' })
    this.getMiniProgramNewIndex();
    this.getPopularize();
    // this.getListGoods();
    this.getRecommend();

    const steer = my.getStorageSync({
      key: 'newYearPop',
    }).data || '';;
    if (steer) {
      this.setData({
        newYearPop: false
      })
    } else {
      my.setStorageSync({
        key: 'newYearPop',
        data: "疲劳度",
      });
    }

  },
  zjhhsjChange(e) {
    this.setData({
      zjhhsjCurrent: e.detail.current
    })
  },
  handleClose() {
    this.setData({ newYearPop: false });
  },
  tabCLick(e) {
    const index = e.currentTarget.dataset.index;
    const tabIndex = this.data.tabIndex;
    if (index != tabIndex) {
      this.setData({
        tabIndex: index
      })
    };
  },

  onShowCenterBox() {
    this.setData({
      centerBoxVisible: true,
    });

    // 取得 viewportRect 和「居中弹窗」的 bounding 信息
    my.createSelectorQuery()
      .selectAll('.center-box')
      .boundingClientRect()
      .selectViewport()
      .boundingClientRect()
      .exec((result) => {
        const centerBoxRect = result[0][0];
        const viewportRect = result[1];

        this.setData({
          centerBoxBounding: {
            left: centerBoxRect.left,
            // bottom 值为两值相减
            bottom: viewportRect.height - centerBoxRect.bottom,
          },
        });
      });
  },


  async onBeforeGetCoupon(event, { extraData }) {
    console.log('触发了 onBeforeSendCoupon 事件')
    console.log('附加数据 extraData 为：', extraData)

    // 返回值将作为「领券请求」的参数，注意是覆盖 params 的值。
    // 如果没有返回值则使用 params 作为请求参数。
    return this.data.params
  },




  onUseImmediately(event, { extraData }) {
    my.openVoucherList();
    // 可以跳转到自定义的页面
  },
  onClose(event, { extraData }) {
    console.log('触发了 onClose 事件')
  },



  onPageScroll(e) {
    this.setData({
      opac: e.scrollTop / 300
    })
    const systemInfo = this.data.systemInfo;
    const topHeight = systemInfo.titleBarHeight + systemInfo.statusBarHeight;
    my.createSelectorQuery()
      .select("#tabsView")
      .boundingClientRect()
      .exec(ret => {
        let fixTabShow = ret[0].top <= topHeight;
        if (this.data.fixTabShow !== fixTabShow) {
          this.setData({
            "fixTabShow": fixTabShow
          });
        }
      });
  },
  goDouyinLive(e) {
    console.warn({ e })
    const type = e.target.dataset.type;
    const id = e.target.dataset.id;
    const link = e.target.dataset.link;
    console.log(type, ">>>>>>>>");
    if (type === 'h5') {
      my.navigateTo(
        {
          url: `/page/webView/index?url=${link}`
        }
      )
    } else {
      accordGo(type, id);
    }

  },
  getSystemInfo() {
    const systemInfo = my.getSystemInfoSync();
    const swiperHeight = (systemInfo.titleBarHeight + systemInfo.statusBarHeight + ((systemInfo.windowWidth) / 750) * 280) + 'px';
    this.setData({
      systemInfo,
      swiperHeight
    })
  },
  onReachBottom() {
    const tabIndex = this.data.tabIndex;
    const tabPage = this.data.tabPage;
    const tabFirstList = this.data.tabFirstList;
    let tabFirstShowList = this.data.tabFirstShowList;
    if (tabIndex === 0 && tabPage < tabFirstList.length - 1) {
      tabFirstShowList = [...tabFirstList[tabPage + 1]];
      this.setData({
        tabFirstShowList,
        tabPage: tabPage + 1
      }, () => {
        this.handleWaterfallsFlow();
      })
    }
  },
  async onPullDownRefresh() {
    my.showLoading({ content: '加载中' })
    this.getMiniProgramNewIndex();
    this.getPopularize();
    // this.getListGoods();

    this.getRecommend();
    my.stopPullDownRefresh();
  },



  itemClick(e) {
    let id = e.currentTarget.dataset.id;
    if (id) {
      my.navigateTo(
        {
          url: `/page/detail/index?goodsId=${id}`
        }
      )
    }
  },
  goodsClick(e) {
    my.navigateTo({
      url: "/page/detail/index?goodsId=" + e.currentTarget.dataset.id
    })
  },
  getCollectData(ids) {
    let params = {
      id: ids[0],
      pageNum: this.data.pageNum,
      pageSize: 100,
    };
    this.getCollect(params, 'hotList');
    let params1 = {
      id: ids[1],
      pageNum: this.data.pageNum,
      pageSize: 100,
    }
    this.getCollect(params1, 'newList');
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

  // goLogin() {
  //   app
  //     .getUserInfo()
  //     .then(res => {
  //       if (res) {
  //         my.showToast({
  //           type: 'success',
  //           content: '登录成功',
  //           duration: 3000
  //         });
  //       }
  //       this.setData({
  //         userId: res.userId || ''
  //       })
  //     })
  //     .catch(err => {
  //     });
  // },


  onPopupClose() {
    this.setData({
      flagRed: false
    })
  },
  getCollect(params, key) {
    console.warn({
      params
    })
    leaseApi.getCollectGoods(params).then(resp => {
      if (resp.code === 200) {
        let data = resp.data || {};
        let list = data.pageInfo.list || [];
        this.processList(list);
        if (data.notes) {
          data.notes = data.notes.split('#');
        }
        if (data.explanation) {
          data.explanation = data.explanation.split('#');
        }
        this.setData({
          [key + 'Name']: data.gatherPageName,
          [key]: list
        })
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
  bannerChange(e) {
    let index = e.detail.current;
    this.setData({
      bannerIndex: index
    })
  },
  toSearch() {
    my.navigateTo({
      // 跳转订单失败页面
      url: '/page/search/search'
    })
  },
  categoryChange(e) {
    let query = my.createSelectorQuery();
    query.select(".scroll-view-item_H")
      .boundingClientRect()
      .exec(ret => {
        if (ret[0].left < -150) {
          this.setData({
            categoryIndex: 1
          })
        } else {
          this.setData({
            categoryIndex: 0
          })
        }
      });
  },
  categoryClick(e) {
    let id = e.currentTarget.dataset.cid;
    let type = e.currentTarget.dataset.type;
    app.cid = id;
    // accordGo
    console.log(type, "?>????????");
    if (type !== "goods") {
      accordGo(type, id);
      return;
    }
    my.reLaunch({
      url: '/page/category/index'
    });
  },

  toDetail(e) {
    let id = e.currentTarget.dataset.id;
    if (id) {
      my.navigateTo(
        {
          url: `/page/detail/index?goodsId=${id}`
        }
      )
    }
  },
  merchantEntry() {
    const url = encodeURIComponent('https://h5.zejihui.com.cn/#/merchantEntry');
    my.navigateTo(
      {
        url: `/page/webView/index?url=${url}`
      }
    )
  },
  // quickCheck () {
  //   my.navigateTo({
  //     url: '/page/mapArea/index?id=' + 10
  //   });
  // },
  toleaseMethods(e) {
    const id = e.target.dataset.id;
    my.navigateTo({
      url: '/page/mapArea/index?id=' + id
    });
  },
  toMapArea(e) {
    const item = e.target.dataset.item;
    const setting = item.setting;
    const type = setting.type;
    const id = setting.dataId;
    if (!type || !id) {
      return;
    }
    if (type === 'goodsList') {
      if (id) {
        my.navigateTo({
          url: `/page/lease/collect/index?collectId=${id}`
        })
      }
    } else if (type === 'popularize') {
      my.navigateTo({
        url: '/page/mapArea/index?id=' + id
      });
    } else if (type === 'goods') {
      my.navigateTo({
        url: '/page/detail/index?goodsId=' + id
      });
    } else if (type === 'activity') {
      let url = item.linkUrl || '';
      if (url.indexOf('alipays://') === 0) //跳转到app目前也是activity类型
      {
        let appId = util.getQueryString(url, 'appId');
        let page = util.getQueryString(url, 'page') || '';
        let encodeExtraData = util.getQueryString(url, 'query') || '';

        let extraData = {};
        //解析参数，封装成对象
        if (encodeExtraData) {
          let paramStr = decodeURIComponent(encodeExtraData);
          let queryArr = paramStr.split("&") || [];
          queryArr.forEach(item => {
            let key = item.split("=")[0];
            let value = item.split("=")[1];
            extraData[key] = value;
          });
        }
        my.uma.trackEvent('navigateToMiniProgram', {
          _appId_: appId,
          _path_: page,
          _extraData_: JSON.stringify(extraData)
        });
        setTimeout(() => {
          my.navigateToMiniProgram({
            appId: appId,
            path: page,
            extraData: extraData,
            success: (res) => {
            },
          });
        }, 200)
      } else if (url.indexOf('target=self') > -1) {   // 微信小程序要跳转自己的领券页面
        let page = util.getQueryString(url, 'page') || '';
        my.navigateTo({
          url: page
        })
      } else {
        my.navigateTo({
          url: '/page/webView/index?url=' + encodeURIComponent(url)
        });
      }

    } else if (type === 'alipayLink') {
      my.ap.navigateToAlipayPage({
        path: item.linkUrl
      })
    }
  },
  bannerClick(e) {

    let item = e.target.dataset.item;

    let type = item.type;
    if (type === 'popularize') {
      let id = item.dataId || '';
      my.navigateTo({
        url: '/page/mapArea/index?id=' + id
      });
    } else if (type === 'goods') {
      let id = item.dataId || '';
      my.navigateTo({
        url: '/page/detail/index?goodsId=' + id
      });
    } else if (type === 'goodsList') {
      let id = item.dataId;
      if (id) {
        my.navigateTo({
          url: `/page/lease/collect/index?collectId=${id}`
        })
      }
    } else if (type === 'activity') {
      let url = item.linkUrl || '';
      // if(url.indexOf('newUserTemplate')>-1){  // 收藏有礼活动
      //   let path = `pages/index/index?appId=2018122562686742&page=pages/index/index&originAppId=2021002189690874&newUserTemplate=20190107000000104987`;
      //   my.navigateToMiniProgram({
      //     appId: '2018122562686742',
      //     path,
      //   }); 
      // }else 
      if (url.indexOf('alipays://') === 0) //跳转到app目前也是activity类型
      {
        let appId = util.getQueryString(url, 'appId');
        let page = util.getQueryString(url, 'page') || '';
        let encodeExtraData = util.getQueryString(url, 'query') || '';

        let extraData = {};
        //解析参数，封装成对象
        if (encodeExtraData) {
          let paramStr = decodeURIComponent(encodeExtraData);
          let queryArr = paramStr.split("&") || [];
          queryArr.forEach(item => {
            let key = item.split("=")[0];
            let value = item.split("=")[1];
            extraData[key] = value;
          });
        }
        my.uma.trackEvent('navigateToMiniProgram', {
          _appId_: appId,
          _path_: page,
          _extraData_: JSON.stringify(extraData)
        });
        setTimeout(() => {
          my.navigateToMiniProgram({
            appId: appId,
            path: page,
            extraData: extraData,
            success: (res) => {
            },
          });
        }, 200)
      } else if (url.indexOf('target=self') > -1) {   // 微信小程序要跳转自己的领券页面
        let page = util.getQueryString(url, 'page') || '';
        my.navigateTo({
          url: page
        })
      } else {
        my.navigateTo({
          url: '/page/webView/index?url=' + encodeURIComponent(url)
        });
      }

    } else if (type === 'alipayLink') {
      my.ap.navigateToAlipayPage({
        path: item.linkUrl
      })
    }

  },
  toJuhe(e) {
    let { id } = e.currentTarget.dataset;
    if (id) {
      my.navigateTo({
        url: `/page/lease/collect/index?collectId=${id}`
      })
    }
  },
  toJuheIndex(e) {
    let { id } = e.currentTarget.dataset;
    if (id) {
      my.navigateTo({
        url: `/page/lease/collectIndex/index?collectId=${id}`
      })
    }
  },
  async getRecommend() {
    try {
      const resp = await leaseApi.getRecommend();
      const recommendList = resp.data;
      for (let i = 0; i < recommendList.length; i++) {
        const item = recommendList[i];
        if (item.goodsItemVOs) {
          for (let k = 0; k < item.goodsItemVOs.length; k++) {
            const subItem = item.goodsItemVOs[k];
            subItem.imgPro = subItem.imgFull[0].url.indexOf('http') === 0 ? subItem.imgFull[0].url : env.image_host + subItem.imgFull[0].url;
            subItem.imgPro = subItem.imgPro + app.getImageSuffix(3);
          }
        } else {

        }
      }
      const tabFirstList = this.splitArray(6, recommendList[0].goodsItemVOs);
      const wfList = [...tabFirstList[0]];
      this.setData({
        tabFirstList,
        wfList,
        recommendList
      }, () => {
        this.getItemCollect(recommendList);
        this.handleWaterfallsFlow();
      })
    } catch (err) {
      throw new Error(err.message || err);
    }
  },
  async getItemCollect(recommendList) {
    recommendList.forEach((item, index) => {
      if (index != 0 && item.gatherPagesId) {
        leaseApi.getCollectGoods({
          pageSize: 100,
          pageNum: 1,
          id: item.gatherPagesId
        }).then(resp => {
          if (resp.code === 200) {
            let data = resp.data || {};
            let list = data.pageInfo.list || [];
            this.processList(list);
            if (list.length) {
              for (let k = 0; k < list.length; k++) {
                list[k].imgPro = list[k].imgFull[0].url.indexOf('http') === 0 ? list[k].imgFull[0].url : env.image_host + list[k].imgFull[0].url;
                list[k].imgPro = list[k].imgPro + app.getImageSuffix(3);
              }
            }
            if (data.notes) {
              data.notes = data.notes.split('#');
            }
            if (data.explanation) {
              data.explanation = data.explanation.split('#');
            }
            this.setData({
              [`recommendList[${index}].imgFull`]: data.imgFull,
              [`recommendList[${index}].goodsItemVOs`]: list
            })
          }
        })
      }
    })
    this.setData({
      recommendList
    })
    // gatherPagesId
  },
  async handleWaterfallsFlow() {
    const tabFirstShowList = this.data.tabFirstShowList;
    for (let i = 0; i < tabFirstShowList.length; i++) {
      await this.pushEle(tabFirstShowList[i]);
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
        // query.select('.tab-list-left').boundingClientRect(rect=>{
        //   console.log(5)
        //   let height = rect.height;
        //   console.log({height})
        //   tabFirstShowListLeftHeight = height;

        // }).exec();
        // query.select('.list-item-right').boundingClientRect(rect=>{
        //   console.log(6)
        //   let height = rect.height;
        //   console.log({height})
        //   tabFirstShowListRightHeight = height;
        //   _this.setData({
        //     tabFirstShowListRightHeight
        //   },resolve)
        // }).exec();
      })
    })
  },

  // async getListGoods() {
  //   try{
  //     const resp = await leaseApi.getListGoods();
  //     const data = resp.data;
  //     const collectList = data.indexGatherPagesList;
  //     (collectList || []).forEach(item => {
  //       item.imgPro = item.img.indexOf('http') === 0?item.img:env.image_host+item.img;
  //       item.imgPro = item.imgPro + app.getImageSuffix(1);
  //       (item.goodsItemVOs||[]).forEach(subItem => {
  //         subItem.imgPro = subItem.imgFull[0].url.indexOf('http') === 0?subItem.imgFull[0].url:env.image_host+subItem.imgFull[0].url;
  //         subItem.imgPro = subItem.imgPro + app.getImageSuffix(3);
  //       })
  //     })
  //     const topGatherPagesIds = data.topGatherPagesIds.split(',');
  //     this.getCollectData(topGatherPagesIds);
  //     this.setData({
  //       collectList
  //     })
  //   }catch(err){
  //     throw new Error(err.message || err);
  //   }
  // },
  async getPopularize() {
    try {
      const resp = await leaseApi.getPopularize();
      const cube = resp.data;
      this.setData({
        cube
      })
    } catch (err) {
      throw new Error(err.message || err);
    }
  },

  async getMiniProgramNewIndex() {
    try {
      const resp = await leaseApi.newIndex();
      if (resp.code === 200) {
        // 首页接口只处理banner 和分类
        let { data = {} } = resp;
        if (data.topGatherPagesIds && data.topGatherPagesIds.length) this.getCollectData(data.topGatherPagesIds);
        (data.bannerList || []).forEach(item => {
          item.imgPro = item.img.indexOf('http') === 0 ? item.img : env.image_host + item.img;
        });
        let categorys = data.goodsCategoryList;
        categorys.forEach((item, index) => {
          //去除全部分类或者id无效分类
          if (item.id <= 0) {
            categorys.splice(index, 1);
          } else {
            item.src = item.wechatIcon || item.icon; //没有zimaIcon字段则先赋值
            item.src = item.src.indexOf('http') === 0 ? item.src : env.image_host + item.src;
          }
        });
        categorys = this.splitArray(10, categorys);
        my.hideLoading({ page: this });
        console.log(categorys, ">>>>>>>>>>>");
        this.setData({
          categorys,
          newHomeData: data,
          viewShow: true,
          liveList: resp.data.liveList,
        })
      } else {
        throw new Error(resp.message);
      }
    } catch (err) {
      throw new Error(err.message || err);
    }
  },
  splitArray(N, Q) {  // 分隔数组 一页展示五个
    var R = [], F;
    for (F = 0; F < Q.length;) R.push(Q.slice(F, F += N))
    return R
  },
  // async getMiniProgram(){
  //   try{
  //     let resp = await leaseApi.getMiniProgram();
  //     if (resp.code === 200){
  //       let { data = {} } = resp;

  //       let { todayNewShopListBeanList = []} = data.todayNewShopBean; 

  //       (todayNewShopListBeanList||[]).forEach( item => {

  //         if(item.shopLogo){

  //           item.shopLogo = item.shopLogo.indexOf('http') === 0?item.shopLogo:env.image_host+item.shopLogo;

  //           item.shopLogo += app.getImageSuffix();

  //         }

  //         (item.imgJson||[]).forEach(subItem => {

  //           subItem.url = subItem.url.indexOf('http') === 0?subItem.url:env.image_host + subItem.url;

  //           subItem.url+=app.getImageSuffix(4);

  //         })
  //       });
  //       this.setData({
  //         homeData:data
  //       })
  //       my.hideLoading({page: this});
  //     }else{
  //       // my.showToast({
  //       //   type: 'fail',
  //       //   content: JSON.stringify(resp),
  //       //   duration: 3000,
  //       // });
  //       throw new Error(resp.message);
  //     }
  //   }catch(err){
  //     // my.showToast({
  //     //   type: 'fail',
  //     //   content: JSON.stringify(err),
  //     //   duration: 3000,
  //     // });
  //     throw new Error(err.message || err);
  //   }
  // },
});
