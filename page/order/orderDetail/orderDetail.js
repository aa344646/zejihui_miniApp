import order from "/api/order.js";
import { dateFormat, skuFormat, priceFormat } from "/util/format.js";
import env from "/util/env.js";
const app = getApp();
Page({
  data: {
    orderId: "",
    orderInfo: {},
    tipShow: false,
    orderCompensateInfo: {}, //赔偿信息
    damageSituation: [], // 赔偿列表
    dataList: {
      orderLeaseInfo: "",
      xinyongzuDepositBean: {} // 押金信息
    },
    showUserCompensate: true,
    goodsInfo: {}, //模板传递的信息
    commented: false,
    modelFlag: false,
    customAlert: false, //alert弹出框不显示
    customAlertData: "",
    hideModal: true,
    hideDetailModal: true,
    hideProgress: true,
    animationData: {}, // 动画Data
    compensateS: [], // 赔偿进度
    payData: {
      title: "支付宝免密支付",
      con: "服务完结进行结算时，实际费用由商户发起向用户支付宝账户扣款"
    },
    authorizeData: {
      title: "支付宝资金授权",
      con:
        "用户使用服务时，通过支付宝账户资金渠道做相应金额的授权，并不产生实际消费"
    },
    cancelReasonList: [
      {
        value: "想挑个新的宝贝",
        text: "想挑个新的宝贝"
      },
      {
        value: "手滑啦，下错了单",
        text: "手滑啦，下错了单"
      },
      {
        value: "着急用，等不及发货啦",
        text: "着急用，等不及发货啦"
      },
      {
        value: "过两天再租，提前熟悉下流程",
        text: "过两天再租，提前熟悉下流程"
      },
      {
        value: "感觉租金有点超预算",
        text: "感觉租金有点超预算"
      },
      {
        value: "跟商家协商后取消",
        text: "跟商家协商后取消"
      },
      {
        value: "商家未按时发货",
        text: "商家未按时发货"
      }
    ],
    proof: {},
    cancelReasonValue: "",
    getSuccess: false, //获取数据完成
    getMessage: "",
    shopPhone: "",
    shopName: "",
    buyoutMoney: 0 //买断尾款
  },
  onLoad(query) {
    // let orderId = query.id || 48774;
    let orderId = query.id;
    this.setData({
      orderId
    });
    app
      .getUserInfo()
      .then(user => {
        // 登录后获取订单详情
        this.renderPage(orderId);
      })
      .catch(err => {
        my.showToast({
          type: 'fail',
          content: err.message || err,
          duration: 3000,
        });
        my.reLaunch({
          url: '/page/mine/index',
        });
      });
  },
  onPullDownRefresh() {
    let orderId = this.data.orderId;
    this.renderPage(orderId);
    setTimeout(() => {
      my.stopPullDownRefresh();
    }, 800);
  },
  showServer() {
    this.server.showModal();
  },
  hideServer() {
    this.server.hideModal();
  },
  server(ref) {
    console.log(123);
    this.server = ref;
  },
  helpAgreement() {
    my.showLoading({
      content: "合同加载中..."
    });
    my.downloadFile({
      // 示例 url，并非真实存在
      url: this.data.orderInfo.orderLeaseInfo.ismtAgmtUrl,
      success({ apFilePath }) {
        my.hideLoading();
        my.openDocument({
          filePath: apFilePath,
          fileType: "pdf",
          success: res => { },
          fail: e => {
            my.showToast({
              content: "系统异常，请稍后再试",
              duration: 2000
            });
          }
        });
      }
    });
  },
  tipShow() {
    this.setData({
      tipShow: !this.data.tipShow
    });
  },
  // nextSubmit () {

  // },
  sign(e) {
    my.confirm({
      title: '提示',
      content: '即将为您下载合同，签署成功后请等待后台处理，可等待5-10分钟后尝试刷新查看订单状态，若订单长时间未变化，请联系客服。',
      success: (result) => {
        if (result.confirm) {
          const id = this.data.orderId;
          if (id) {
            my.showLoading({
              content: '加载中...'
            })
            order.orderSign({ id }).then(resp => {
              if (resp.code == 200) {
                const aliSchema = resp.data;
                function getSignUrl(aliSchema) {
                  if (!aliSchema) { return '' }
                  const querys = aliSchema.split('?')[1].split('&');
                  const signUrlKeyValue = querys.find((item) => item.includes('query=')).replace('query=', '');
                  const encodedSignUrl = decodeURIComponent(signUrlKeyValue).replace('signUrl=', '');
                  return encodedSignUrl
                }
                const signUrl = getSignUrl(aliSchema)
                my.navigateToMiniProgram({
                  appId: '2021001152620480',
                  path: `pages/signH5/index?signUrl=${signUrl}`
                });
              } else {
                my.showToast({
                  type: 'fail',
                  content: resp.message,
                  duration: 3000
                });
              }
              my.hideLoading();
            }).catch(e => {
              my.hideLoading();
            });
          }
        }
      }
    });
  },
  toPay(e) {
    let type = e.currentTarget.dataset.type || "";
    my.navigateTo({
      url:
        "/page/order/orderPay/index?orderId=" +
        this.data.orderInfo.id +
        "&payType=" +
        type +
        "&goodsId=" +
        this.data.orderInfo.goodsId
    });
  },
  goBuyGoods() {
    my.navigateTo({
      url: "/page/order/reletBuyOut/tip/index?status=1"
    })
  },
  renderPage(orderId) {
    order
      .getOrderDetail(orderId)
      .then(resp => {
        // 0 待审核 1 待支付  2 待发货 待收货 3 租赁中  4 租金逾期  5 到期待还 6 到期待还逾期  7 还机中  8 赔偿 相关 9 租赁完成 10 取消租赁 11 续租待审核 12 续租待支付  13 续租待开始  14 买断待审核  15 买断待支付 // 16 维修  // 17  换货
        if (resp.code == 200) {
          this.setData({
            orderInfo: resp.data
          });
          let AllPayprice = 0; //总租金在优惠券折减之后的值
          let couponPrice = 0; //优惠券的价格
          let firstPaymoney = 0; //首期要支付的 租金
          let createTime = resp.data.orderLeaseInfo.createTime;
          let processTime = resp.data.processTime;
          let phone = resp.data.orderLeaseInfo.phone;
          let specification = skuFormat(resp.data.specification);
          let accidentInsurance = priceFormat(resp.data.accidentInsurance);
          let accessoriesAmount = priceFormat(resp.data.accessoriesAmount);
          let price = priceFormat(resp.data.price);
          let dailyRent = priceFormat(resp.data.orderLeaseInfo.dailyRent);
          let voucherDiscount = priceFormat(
            resp.data.orderLeaseInfo.voucherDiscount
          ); // 优惠券
          let firstRentDays =
            resp.data.orderLeaseInfo.leaseTerm >= 30
              ? 30
              : resp.data.orderLeaseInfo.leaseTerm;
          firstPaymoney = dailyRent * firstRentDays;
          firstPaymoney =
            new Number(firstPaymoney) + new Number(accidentInsurance) + new Number(accessoriesAmount);

          var data = resp.data || {};
          let image = data.image;
          if (data.image.indexOf("http") == -1) {
            // 图片路径
            data.image = env.image_host + image;
          }
          let goodsInfo = {
            orderId: data.id,
            goodsName: data.goodsName,
            specification: data.specification,
            goodsImage: data.image,
            leaseNum: data.orderLeaseInfo.leaseTerm,
            originalPrice: data.price,
            shopName: data.orderMerchantInfoBean.merchantName,
            shopContactNumber: data.orderMerchantInfoBean.contactNumber
          };
          let standard = "";
          goodsInfo.specification.forEach((item, index) => {
            if (index == goodsInfo.specification.length - 1) {
              standard += item.name;
            } else {
              standard += item.name + " | ";
            }
          });
          goodsInfo.standard = standard;
          if (voucherDiscount >= firstPaymoney) {
            voucherDiscount = ((firstPaymoney * 100 - 100) / 100).toFixed(2);

            price =
              new Number(resp.data.orderLeaseInfo.leaseTerm - firstRentDays) *
              new Number(dailyRent) +
              1;
          } else {
            price = this.Subtr(price, voucherDiscount);
          }
          // dataList.orderLeaseInfo.voucherDiscount 优惠券的值

          let sysInfo = my.getSystemInfoSync();
          let iw = Math.round(
            (sysInfo.windowWidth * (sysInfo.pixelRatio || 1)) / 3
          );
          let oss_process =
            "?x-oss-process=image/resize,m_lfit,w_" +
            iw +
            ",limit_1/format,jpg/sharpen,100/interlace,1/quality,q_95";

          this.setData({
            dataList: resp.data,
            "dataList.orderLeaseInfo.createTime": dateFormat(createTime, 1),
            "dataList.processTime":
              dateFormat(processTime, 1) || dateFormat(createTime, 1),
            "dataList.orderLeaseInfo.phone":
              phone.slice(0, 3) + "****" + phone.slice(-4),
            "dataList.specification": specification,
            "dataList.orderLeaseInfo.dailyRent": dailyRent,
            "dataList.image": env.image_host + image + oss_process,
            "dataList.accidentInsurance": accidentInsurance,
            "dataList.accessoriesAmount": accessoriesAmount,
            couponPrice: voucherDiscount,
            AllPayprice: price,
            commented: resp.data.orderLeaseInfo.commented, // 商品是否已评价
            goodsInfo, // 评价页面传递的参数
            shopPhone: (data.shopPhone || "").split(",")[0] || "",
            shopName: data.merchantName || "",
            buyoutMoney: ((data.buyoutMoney || 0) / 100).toFixed(2)
          });
          if (resp.data.orderLeaseInfo.merchantDeliveryTime) {
            // 发货时间
            let merchantDeliveryTime =
              resp.data.orderLeaseInfo.merchantDeliveryTime;
            this.setData({
              "dataList.orderLeaseInfo.merchantDeliveryTime": dateFormat(
                merchantDeliveryTime,
                1
              )
            });
          }
          if (resp.data.orderLeaseInfo.userReceivedTime) {
            // 收货时间
            let userReceivedTime = resp.data.orderLeaseInfo.userReceivedTime;
            this.setData({
              "dataList.orderLeaseInfo.userReceivedTime": dateFormat(
                userReceivedTime,
                1
              )
            });
          }
          if (resp.data.canceledTime) {
            // 取消时间
            let canceledTime = resp.data.canceledTime;
            this.setData({
              "dataList.canceledTime": dateFormat(canceledTime, 1)
            });
          }
          if (resp.data.xinyongzuDepositBean) {
            // 押金信息
            let deposit = resp.data.xinyongzuDepositBean.deposit;
            let freezingDeposit =
              resp.data.xinyongzuDepositBean.freezingDeposit;
            let creditAmount = resp.data.xinyongzuDepositBean.creditAmount;
            this.setData({
              "dataList.xinyongzuDepositBean.deposit": priceFormat(deposit),
              "dataList.xinyongzuDepositBean.freezingDeposit": priceFormat(
                freezingDeposit
              ),
              "dataList.xinyongzuDepositBean.creditAmount": priceFormat(
                creditAmount
              )
            });
          }
          // pending_user_compensate
          if (
            data.state == "pending_user_compensate" ||
            data.state == "pending_compensate_check"
          ) {
            // 商品赔偿信息
            this.getCompensate();
            this.setData({
              damageSituation:
                data.orderCompensateInfoBean.damageSituation || []
            });
            data.orderCompensateInfoBean.image =
              data.orderCompensateInfoBean.image || [];
            data.orderCompensateInfoBean.image.forEach(item => {
              if (item.url.indexOf("http") == -1) {
                item.url = env.image_host + item.url;
              }
            });
          }
          this.setData({
            orderCompensateInfo: data.orderCompensateInfoBean || {}
          });
          this.initAnimation();
          this.setData({
            // 初始化动画
            getSuccess: true
          });
        } else {
          my.showToast({
            type: "fail",
            content: resp.message,
            duration: 3000
          });

          this.setData({
            getSuccess: false,
            getMessage: resp.message
          });
        }
      })
      .catch(e => {
        this.setData({
          getSuccess: false,
          getMessage: "网络错误"
        });
      });
  },
  toComment(e) {
    let { commented: finish } = this.data;
    let url = `/page/order/comment/index?id=${this.data.orderId
      }&finish=${finish}&goodsInfo=${JSON.stringify(this.data.goodsInfo)}`;
    // console.log(url);
    my.navigateTo({
      url: url
    });
  },
  closeCustomAlert() {
    // 关闭alert弹窗
    this.setData({
      customAlert: false
    });
  },
  openCustomAlert(e) {
    // 触发alert弹窗
    if (e.target.dataset.name == "pay") {
      this.setData({
        customAlert: true,
        customAlertData: this.data.payData
      });
    } else if (e.target.dataset.name == "authorize") {
      this.setData({
        customAlert: true,
        customAlertData: this.data.authorizeData
      });
    }
  },
  cancelOrder() {
    // 取消订单，弹出弹窗
    this.setData({
      modelFlag: true
    });
  },
  goBillDetail() {
    //  查看账单
    let id = this.data.orderId;
    my.navigateTo({
      url: "/page/bills/billDetail/billDetail?id=" + id
    });
  },
  goReturnBack() {
    let id = this.data.orderId;
    my.navigateTo({
      url: "/page/order/returnBack/returnBack?id=" + id
    });
  },
  goLogistics() {
    //  查看物流
    // app 过来的自提订单   没有订单跟踪
    if (this.data.dataList.orderLeaseInfo.deliveryWay == "PRIVATE_STORE")
      return;

    if (this.data.dataList && this.data.dataList.state) {
      let state = this.data.dataList.state;
      let orderId = this.data.orderId;
      let str = "";
      switch (state) {
        case "returning":
        case "returned_unreceived":
        case "returned_received":
        case "after_sales_retruning":
        case "return_goods":
        case "after_sales_retruned_unreceived":
        case "after_sales_returned_received":
        case "lease_finished":
        case "relet_finished":
        case "buyout_finished":
          str = "&type=merchant";
          break;
        default:
          str = "&type=user";
          break;
      }
      // if (state == 'returning' || state == 'returned_unreceived' || state == 'returned_received' || state == 'after_sales_retruning' || state == 'return_goods' || state == 'after_sales_retruned_unreceived' || state == 'after_sales_returned_received' // 退还
      //   ||
      //   state == 'lease_finished' || state == 'relet_finished' || state == 'buyout_finished') { // 已完成
      //   str = '&type=merchant';
      // } else {
      //   str = '&type=user';
      // }
      my.navigateTo({
        url: "/page/order/orderLogistics/orderLogistics?id=" + orderId + str
      });
    }
  },
  cancelModel() {
    // 关闭取消弹窗
    this.setData({
      modelFlag: false
    });
  },
  chooseCancelReason(e) {
    this.setData({
      cancelReasonValue: e.detail.value
    });
  },
  confirmModel() {
    // 确认取消
    let orderId = this.data.orderId;
    let cancelReason = this.data.cancelReasonValue;
    if (!cancelReason) {
      my.showToast({
        content: "请选择取消原因",
        duration: 3000
      });
      return;
    }
    let data = {
      id: orderId,
      cancelReason: cancelReason
    };
    my.showLoading({ content: "请稍候" });
    order
      .cancelOrder(data)
      .then(resp => {
        my.hideLoading();
        if (resp.code == 200) {
          my.showToast({
            type: "success",
            content: resp.data,
            duration: 3000
          });
          // 重新获取本页数据
          let orderId = this.data.orderId;
          this.renderPage(orderId);
        } else {
          my.showToast({
            type: "fail",
            content: resp.message,
            duration: 3000
          });
        }
      })
      .catch(e => {
        my.hideLoading();
        console.log(e);
      });
    this.setData({
      modelFlag: false
    });
  },
  callService() {
    // 拨打客服电话
    my.confirm({
      title: "拨打客服电话？",
      content: "18185907733",
      confirmButtonText: "拨打",
      cancelButtonText: "取消",
      success: result => {
        if (result.confirm) {
          my.makePhoneCall({
            number: "18185907733"
          });
        }
      }
    });
  },
  callMerchant() {
    // 拨打商家电话
    if (!this.data.shopPhone) {
      this.showServer();
    } else {
      my.confirm({
        title: "联系商家？",
        content: `是否联系商家${this.data.shopName}?`,
        confirmButtonText: "联系商家",
        cancelButtonText: "取 消",
        success: result => {
          if (result.confirm) {
            my.makePhoneCall({
              number: this.data.shopPhone
            });
          }
        }
      });
    }
  },
  confirmReceipt() {
    // 确认收货
    my.confirm({
      title: "确认收货？",
      content: "是否确认收货？",
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      success: result => {
        if (result.confirm) {
          let orderId = this.data.orderId;
          order
            .confirmReceipt(orderId)
            .then(resp => {
              if (resp.code == 200) {
                my.showToast({
                  type: "success",
                  content: "操作成功",
                  duration: 3000
                });
                // 重新获取本页数据
                let orderId = this.data.orderId;
                this.renderPage(orderId);
              } else {
                my.showToast({
                  type: "fail",
                  content: resp.message,
                  duration: 3000
                });
              }
            })
            .catch(e => {
              console.log(e);
            });
        }
      }
    });
  },
  //减法  防止精度丢失的方法
  Subtr(arg1, arg2) {
    var r1, r2, m, n;
    try {
      r1 = arg1.toString().split(".")[1].length;
    } catch (e) {
      r1 = 0;
    }
    try {
      r2 = arg2.toString().split(".")[1].length;
    } catch (e) {
      r2 = 0;
    }
    m = Math.pow(10, Math.max(r1, r2));
    n = r1 >= r2 ? r1 : r2;
    return ((arg1 * m - arg2 * m) / m).toFixed(n);
  },
  saveSchedule() {
    //  赔偿进度
    order
      .refuseCompensateDetail({ id: this.data.orderId })
      .then(resp => {
        if (resp.code == 200) {
          let data = resp.data || {};
          this.setData({
            compensateS: data.compensateProgress
          });
          this.setData({
            hideModal: false,
            hideProgress: false
          });
        }
      })
      .catch(err => {
        my.showToast({
          type: "fail",
          content: err,
          duration: 2000
        });
      });
  },
  toSaveGuard() {
    let orderMerchantInfoBean = this.data.orderInfo.orderMerchantInfoBean;
    //  赔偿申诉
    my.navigateTo({
      url: `/page/order/compensateApply/compensateApply?id=${this.data.orderId
        }&goodsInfo=${JSON.stringify(
          this.data.goodsInfo
        )}&MerchantInfo=${JSON.stringify(orderMerchantInfoBean)}`
    });
  },
  initAnimation() {
    var animation = my.createAnimation({
      duration: 200,
      timingFunction: "linear"
    });
    this.animation = animation;
    animation.translateY("100%").step();
    this.setData({
      animationData: animation.export()
    });
  },
  hideModal() {
    let animation = this.animation;
    animation.translateY("100%").step();
    this.setData({
      animationData: animation.export()
    });
    setTimeout(
      function () {
        this.setData({
          hideModal: true,
          hideDetailModal: true,
          hideProgress: true
        });
      }.bind(this),
      200
    );
  },
  showModal(e) {
    let key = e.currentTarget.dataset.key;
    let animation = this.animation;
    animation.translateY(0).step();
    this.setData({
      [key]: false,
      hideModal: false
    });
    setTimeout(() => {
      this.setData({
        animationData: animation.export()
      });
    }, 1);
  },
  previewCompensateImage(e) {
    var current = e.target.dataset.index;
    if (this.data.showUserCompensate) {
      //商户的
      if (this.data.orderCompensateInfo.image.length) {
        let images = this.data.orderCompensateInfo.image.map(item => {
          return item.url;
        });
        my.previewImage({
          current,
          urls: images
        });
      }
    } else {
      //    用户的
      if (this.data.proof.image.length) {
        let images = this.data.proof.image.map(item => {
          return item.url;
        });
        my.previewImage({
          current,
          urls: images
        });
      }
    }
  },
  showWhichCompensate() {
    this.setData({
      showUserCompensate: !this.data.showUserCompensate
    });
    if (!this.data.showUserCompensate) {
      if (!this.data.proof.remark) {
        this.getCompensate();
      }
      //    获取拒绝信息
    }
  },
  getCompensate() {
    order
      .refuseCompensateDetail({ id: this.data.orderId })
      .then(resp => {
        if (resp.code == 200) {
          let data = resp.data || {};
          let proof = {
            remark: data.remark,
            proofInfo: data.proofInfo,
            image: data.proofImage || []
          };
          proof.image.forEach(item => {
            if (item.url.indexOf("http") != 0) {
              item.url = env.image_host + item.url;
            }
          });

          this.setData({
            proof: proof
          });
        }
      })
      .catch(err => {
        this.$networkErr(err);
      });
  },
  revokeCancel() {
    //撤销申请取消
    let orderId = this.data.orderId;
    my.confirm({
      title: "提示",
      content: "确认取消申请?",
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      success: result => {
        my.showLoading({ content: "请稍候" });
        if (result.confirm) {
          order
            .revokeCancel(orderId)
            .then(resp => {
              my.hideLoading();
              if (resp.code == 200) {
                my.showToast({
                  type: "success",
                  content: "撤销申请成功!",
                  duration: 3000
                });
                this.renderPage(orderId);
              }
            })
            .catch(err => {
              my.hideLoading();
              my.showToast({
                type: "fail",
                content: err,
                duration: 2000
              });
            });
        }
      }
    });
  }
});
