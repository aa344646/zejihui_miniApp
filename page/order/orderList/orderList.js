import HttpApi from '/api/lease.js';
import order from '/api/order.js';
import {dateFormat,skuFormat} from '/util/format.js';
import env from '/util/env.js';
const app = getApp();
Page({
  data: { 
    showCon:false,  // 是否显示页面内容
    pageNum: 1,
    pageSize: 10,
    orderList: [],
    hasMore:true,
    scrollTop: 1,
    tabIndex: 0,
    orderType: '',
    requestRun: false,
    open: false,
    totalRent: 0, // 期数
    systemInfo: {},
    swiperHeight: '',
  },
  backHome(e) {
    my.reLaunch({ 
      url: '/page/lease/index',
    }); 
  },
  onLoad (options) {
    my.hideBackHome();
    my.setCanPullDown({
      canPullDown:false
      })
    this.setData({
      orderType: options.type || 'all',
      tabIndex: +options.index || 0
    }, () => {
      this.getList();
    });
    this.getSystemInfo();

  },
  changeOrderType (e) {
    let {type, index} = e.target.dataset;
    index = +index;
    if (type === this.data.orderType) return;
    if (this.data.requestRun) return;
    this.setData({
      orderType: type,
      tabIndex: index,
      pageNum: 1,
      hasMore: true
    }, () => {
      this.getList();
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
  // onReady() {
  //   this.getList();
  // },
  onPullDownRefresh() {    //   下拉刷新，获取前10条数据
    this.setData({
      pageNum: 1,
      hasMore: true
    }); 
    this.getList();
    setTimeout(()=>{
       my.stopPullDownRefresh();
    },800);
  },  
  loadMore() {
    this.getList();
  },
  getList() {
    if(!this.data.hasMore) {
      return;
    }
    this.setData({
      requestRun: true
    })
    my.showLoading({
      content:'加载中'
    })
    let data = {
      pageNum: this.data.pageNum,
      pageSize: this.data.pageSize,
      orderType: this.data.orderType
    }
    order.getOrderList(data).then(resp => {
      if(resp.code==200)
      {
        let data = resp.data || {};
        let datalist = data.list || [];
        let listLen = datalist.length;
        let list = this.data.pageNum == 1 ? this.formatList(datalist):this.data.orderList.concat(this.formatList(datalist));
        this.setData({
          orderList:list
        });
        if(listLen < this.data.pageSize) { // 没有更多了
          this.setData({
             hasMore:false,
          });
        } else {                          // 还有多余列表数据
          this.setData({
            pageNum: this.data.pageNum + 1
          });
        }
      } else {
        my.showToast({
          type: 'fail',
          content: resp.message,
          duration: 3000
        });
      }
  
      this.setData({showCon: true});
      my.hideLoading();
      this.setData({
        requestRun: false
      })
    }).catch(e=>{
      my.hideLoading();
      this.setData({showCon: true});
      this.setData({
        requestRun: false
      })
    });
  },
  goMine(){
    my.switchTab({ 
      url: '/page/mine/index'
    }); 
  },
  formatList(list)
  {
    let sysInfo = my.getSystemInfoSync();
    let iw = Math.round(sysInfo.windowWidth * (sysInfo.pixelRatio || 1)/3);
    let oss_process = '?x-oss-process=image/resize,m_lfit,w_' + iw + ',limit_1/format,jpg/sharpen,100/interlace,1/quality,q_95';
  
    for(let i in list) {
      list[i].createTime = dateFormat(list[i].createTime);
      list[i].processTime = dateFormat(list[i].processTime) || dateFormat(list[i].createTime);
      list[i].goodsImage = env.image_host+list[i].goodsImage + oss_process;
      list[i].standard = skuFormat(list[i].standard);
      list[i].totalRent = this.formatPrice(list[i].totalRent);
      list[i].nextPayTime = dateFormat(list[i].nextPayTime)?dateFormat(list[i].nextPayTime).slice(0,10):null; // 下期支付租金时间
      list[i].backTime    = dateFormat(list[i].backTime)?dateFormat(list[i].backTime).slice(0,10):null;     // 归还时间
    }
    return list;
  },
  goOrderDetail(e) {
    let id = e.target.dataset.id;
    my.navigateTo({
      url: '../orderDetail/orderDetail?id='+id
    });
  },
  goReturnBack(e) {
    let goodsId = e.target.dataset.id;
    my.navigateTo({
      url: '/page/order/returnBack/returnBack?id=' + goodsId
    })
  },
  goLogistics(e) {
    let goodsId = e.target.dataset.id;
    let state = e.target.dataset.state;
    let str = '';
    if(state=='returning'||state=='returned_unreceived'||state=='returned_received'||state=='after_sales_retruning'||state=='return_goods'||state=='after_sales_retruned_unreceived'||state=='after_sales_returned_received') {
      str = '&type=merchant';
    } else {
      str = '&type=user';
    }
    my.navigateTo({
      url: '/page/order/orderLogistics/orderLogistics?id='+ goodsId + str
    })
  },
  formatPrice(price) {
    return (price/100).toFixed(2);
  },
  nextSubmit (e) {
    const item = e.target.dataset.item;
    const orderNumber = item.orderNumber;
    HttpApi.deductionSign(orderNumber).then(res => {
      if (res.code === 200) {
        const data = res.data;
        console.warn(data);
        my.paySignCenter({
          signStr: data,
          success (res) {
            console.warn(res, 'success');
            // 返回码	含义
            // 7000	协议签约成功
            // 7001	签约结果未知（有可能已经签约成功），请根据外部签约号查询签约状态
            // 7002	协议签约失败
            // 6001	用户中途取消
            // 6002	网络连接错误
          },
          fail (res) {
            console.warn(res, 'fail');
            my.showToast({
              type: "fail",
              content: res,
              duration: 3000
            });
          }
        })
      }
    }).catch(err => {
      console.warn(err);
    });
  },
  sign (e) {
    // my.confirm({
    //   title: '提示',
    //   content: '即将为您下载合同，签署成功后请等待后台处理，可等待5-10分钟后尝试刷新查看订单状态，若订单长时间未变化，请联系客服。',
    //   success: (result) => {
    //     if (result.confirm) {
    //       const id = e.target.dataset.id;
    //       if (id) {
    //         my.showLoading({
    //           content:'加载中...'
    //         })
    //         order.orderSign({id}).then(resp => {
    //           if(resp.code==200)
    //           {
    //             const aliSchema = resp.data;
    //             function getSignUrl(aliSchema) {
    //               if(!aliSchema){return  ''}
    //               const querys = aliSchema.split('?')[1].split('&');
    //               const signUrlKeyValue = querys.find((item) => item.includes('query=')).replace('query=', '');
    //               const encodedSignUrl = decodeURIComponent(signUrlKeyValue).replace('signUrl=', '');
    //               return encodedSignUrl
    //             }
    //             const signUrl = getSignUrl(aliSchema)
    //             my.navigateToMiniProgram({
    //               appId: '2021001152620480',
    //               path:`pages/signH5/index?signUrl=${signUrl}`
    //           });
    //           } else {
    //             my.showToast({
    //               type: 'fail',
    //               content: resp.message,
    //               duration: 3000
    //             });
    //           }
    //           my.hideLoading();
    //         }).catch(e=>{
    //           my.hideLoading();
    //         });
    //       }
    //     }
    //   }
    // });
    my.navigateTo({
      url: 'signupPages/signupPages'
    });
  },
  confirmReceipt(e) {  // 确认收货
    let _this = this;
    my.confirm({
      title: '确认收货？',
      content: '是否确认收货？',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      success: (result) => {
        if(result.confirm) {
          let goodsId = e.target.dataset.id;
          order.confirmReceipt(goodsId).then(resp => {
            if(resp.code == 200) {
              my.showToast({
                type: 'success',
                content: '操作成功',
                duration: 3000
              });
              // 刷新数据
              _this.setData({
                pageNum: 1,
                hasMore: true,
                scrollTop: 0 
              }); 
              this.getList();
            } else {
              my.showToast({
                type: 'fail',
                content: resp.message,
                duration: 3000
              });
            }
          }).catch(e => {
            console.log(e)
          })
        }
      },
    });
  },
  goOverduePay(e) //逾期支付
  {
    let dataset = e.currentTarget.dataset || {};
    let id = dataset.id;
    my.navigateTo({
      url: "/page/order/orderPay/index?orderId=" + id + '&payType=bill'
    });
  },
});
