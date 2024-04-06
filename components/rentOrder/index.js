import Desk from "../desk/index";
import HttpApi from "/api/lease";
import rentOrderApi from "./rentOrderAPI";
import { conversionBack } from '../../util/common';
import moment from 'moment';
const app = getApp(); // 获取全局对象
export default {
  ...Desk.deskApi,
  data: {
    ...Desk.data,
    viewShow: true,
    kipe: {
      pageControl: {
        couponShow: true,
        animMaskData: "", // 控制遮罩层动画轨迹
        animContentData: ""
      },
      location: null,
      email: "",
      modelShow:false , // 遮罩层
      // contact: [],
      // contacts: {
      //   name: '',
      //   mobile: ''
      // },
      leaseDay: 0,
      pageInfo: {},
      nowtime: '',
      arrtime: '',
      totalRentMoney: 0,
      yuezu: 0,
      shouyue: 0,
      address: {},
      showTips: true,
      zfblogoflag: true,
      depositflag: true,
      rentToastFlag: true,
      ZmRentMoneyFlag: true,
      userName: "",
      userPhone: "",
      userAddr: "",
      zfblogoImgSrc: "/image/assign/zfblogo.png",
      userHelpMessage:
        "如需修改地址，请取消订单，重新下单并在信用套餐页面进行修改",
      goodsImageSrc: "",
      hidden: true,
      indicatorDots: true,
      autoplay: false,
      interval: 500,
      duration: 500,
      indicatorActiveColor: "#4BCFCA",
      indicatorColor: "rgba(204, 204, 204,0.3)",
      hiddeToast: "none",
      path: "",
      swiperHeight: "100%",
      tabsArr: [false, true, true],
      checkedNameArr: ["active", "", ""],
      serverDescription: [],
      skuServer: {},
      rentContent: [],
      replaceTabsHidden: true,
      rentPriceDate: "/天",
      goodsDetailContent: {},
      goodsZfbPay: {},
      currentCouponInfo:{}, // 选择当前券信息
      goodsRentOrder: {},
      radioChecked: false,
      helpToastHidden: true,
      rent_checkBtn: "",
      buyoutMoney: null,
      storeCouponDatas: [], // 商家券数据
    },
    goodsId: '',
  },

  detailApi: {
    ...rentOrderApi,
    onLoad(query) {
      const _this = this;
      my.showLoading({
        content: "查询结果中..."
      });
      setTimeout(() => {
        my.hideLoading();
      }, 1000);

      getApp()
        .getUserInfo()
        .then(user => {
          const pageInfo = my.getStorageSync({
            key: "pageInfo"
          }).data || null;
          pageInfo.specification.forEach(item => {
            if (item.key === "leaseDay") {
              _this.dateFormat(item.value)
            }
          })

          my.removeStorageSync({
            key: "pageInfo"
          });
          console.log(pageInfo,">>>>>>>>>>>>>pageInfo");
          this.setData({
            "kipe.pageInfo": pageInfo,
            viewShow: true,
            goodsId: pageInfo.goodsId
          });
          this.getStoreCoupon();

          this.fetchCoupons();



          my.getStorage({
            key: "imageSrc",
            success: function (res) {
              if (res.data != undefined || res.data != "") {
                _this.setData({
                  "kipe.goodsImageSrc": res.data,
                  viewShow: true
                });
              }
            }
          });
        })
        .catch(() => { });


    },
    computedPrice(pageInfo) {
      const {currentCouponInfo ={}}  = this.data.kipe;
      let day;
      if (pageInfo.inputDays && pageInfo.inputDays > 0) {
        day = pageInfo.inputDays;
      } else {
        pageInfo.specification.forEach(item => {
          if (item.key === "leaseDay") {
            day = item.value;
          }
        });
      }

      let yuezu; //  首月租金
      let shouyue; // 首付实付
      // chooseRent 每天租金
      if (day >= 30) {
        yuezu = (pageInfo.detail.chooseRent * 30).toFixed(2);
        // 大于30天 首月 = 月租+保险-优惠券
        shouyue = pageInfo.detail.chooseRent * 30;
      } else {
        shouyue = pageInfo.detail.chooseRent * day;
      }
      // 如果选的有优惠券  优惠券只抵扣首月租金
      if (pageInfo.currentCoupon.couponPrice) {
        if(!currentCouponInfo.voucherType){
          shouyue -= parseFloat(pageInfo.currentCoupon.couponPrice);          
        }

        switch (currentCouponInfo.voucherType) {
          case 'FIX_VOUCHER':
            shouyue -= parseFloat(pageInfo.currentCoupon.couponPrice);          
            break;
          case 'DISCOUNT_VOUCHER':
            shouyue = shouyue * parseFloat(pageInfo.currentCoupon.couponPrice/10);          
            break;
          case 'SPECIAL_VOUCHER':
            shouyue = parseFloat(pageInfo.currentCoupon.couponPrice);      
            break;
        }








        if (shouyue <= 0) shouyue = 0;








      }
      if (
        pageInfo.insuranceServer.insuranceMandatory ||
        pageInfo.insuranceServer.insuranceChoose
      ) {
        shouyue += pageInfo.insuranceServer.accidentInsurance / 100;
      }
      console.log(pageInfo.accessoriesList,">>>>>>>>>>>>>pageInfo.accessoriesList");
      if (pageInfo.accessoriesList && pageInfo.accessoriesList.length) {
        pageInfo.accessoriesList.forEach(item => {
          if (item.choose) {
            shouyue += (item.amount / 100);
          }
        })
      }

      if (shouyue < 0) {
        shouyue = 0;
      }
      if (yuezu < 0) {
        yuezu = 0;
      }

      shouyue = shouyue.toFixed(2);
      this.setData({
        "kipe.leaseDay": day,
        "kipe.totalRentMoney": (pageInfo.detail.chooseRent * day).toFixed(
          2
        ),
        "kipe.yuezu": yuezu,
        "kipe.shouyue": shouyue
      });
    },



    async fetchCoupons() {
      const pageInfo = this.data.kipe.pageInfo;
      const allData = pageInfo.allData;
      if (allData.whiteListed) {
        return;
      }
      // 在这里获取可使用的优惠券
      let id = allData.id; // 商品ID
      let detail = pageInfo.detail; // 商品详情
      let payPrice = detail.chooseRent || detail.defaultRent; // 当前选择的支付单价或者默认最低价
      // let activityStatus = detail.activityStatus; // 活动状态.
      let days = 0;
      if (!allData.customLease) {
        // 固定租期
        let specificationJson = allData.specificationJson; // 拿到的规格JSON
        let obj = specificationJson[specificationJson.length - 1];
        let daysCurrentChoose = obj.currentChoose;
        days = obj.specificationJson[daysCurrentChoose]; // 拿到最终用户选择的天数
      } else {
        // 自定义租期
        days = pageInfo.inputDays;
      }
      days >= 30
        ? (payPrice = Number(payPrice) * 100 * 30)
        : (payPrice = Number(payPrice) * 100 * days);
      // if (pageInfo.insuranceServer.insuranceChoose) {
      //   // 选择了增值保险 || 必选
      //   let accidentPrice = allData.accidentInsurance;
      //   payPrice = payPrice + accidentPrice; // 租金加上意外保险金去获取优惠券
      // }
      // if (pageInfo.accessoriesList && pageInfo.accessoriesList.length) {
      //   pageInfo.accessoriesList.forEach(item => {
      //     if (item.choose) {
      //       payPrice = payPrice + item.amount;
      //     }
      //   })
      // }
      // if (pageInfo.accessoriesServer.accessoriesChoose) {
      //   // 选择了增值保险 || 必选
      //   let accessoriesAmount = allData.accessoriesAmount;
      //   payPrice = payPrice + accessoriesAmount; // 租金加上配件费用去获取优惠券
      // }
      let priceobj = {
        price: parseInt(payPrice)
      };
      HttpApi.getCoupon(id, priceobj).then(resp => {
        if (resp.code == 200) {
          let coupon = {
            title: "店铺优惠",
            content: resp.data
            // || [
            //   {
            //     price: 100,
            //     id: 1,
            //     bonusModelName: '4元优惠券',
            //     bonusModelMoneyOffRole: 100,
            //     bonusModelNote: '123',
            //     effectiveTimeStr: '465'
            //   }
            // ]
          };
          // 

          if (coupon.content && coupon.content.length) {
            coupon.content = coupon.content.sort((a, b) => {
              // 默认以最大优惠券开始排序
              return a.price < b.price;
            });
            for (let i = 0; i < coupon.content.length; i++) {
              coupon["content"][i]["couponflag"] = false; // 将所有优惠券的选中状态变为false
            }
            // if (coupon.content.length) {
            //   coupon["content"][0]["couponflag"] = true;
            // }
            this.setData(
              {
                "kipe.pageInfo.coupon": coupon,
                "kipe.pageInfo.currentCoupon.couponPrice": (
                  coupon.content[0].price / 100
                ).toFixed(2),
                "kipe.pageInfo.currentCoupon.couponId": coupon.content[0].id
              }, () => {
                this.computedPrice(this.data.kipe.pageInfo);
              });
          } else {
            this.computedPrice(pageInfo);
          }
        }
      });
    },
    handleModelShow(){
      this.setData({
        "kipe.modelShow": false,
        "kipe.pageControl.couponShow": !this.data.kipe.pageControl.couponShow,
      })
    },
    controlCoupon() {
      const pageInfo = this.data.kipe.pageInfo;
      if (pageInfo.allData.whiteListed) {
        my.showToast({
          content: "抱歉！此商品无法使用优惠券",
          duration: 2000
        });
        return;
      }
      let coupon = pageInfo.coupon;
      if (!coupon.content.length) {
        my.showToast({
          content: "抱歉！暂无可用优惠券",
          duration: 2000
        });
        return;
      }
      if (!this.data.kipe.pageControl.couponShow) {
        // 显示 变 隐藏
        setTimeout(() => {
          this.setData({
            "kipe.pageControl.couponShow": !this.data.kipe.pageControl
              .couponShow,
              "kipe.modelShow": false,
          });
        }, 500);
        this.createMaskHideAnim();
        this.createContentHideAnim();
      } else {
        // 隐藏 变显示
        this.setData({
          "kipe.pageControl.couponShow": !this.data.kipe.pageControl.couponShow,
          "kipe.modelShow": true,
        });
        this.createMaskShowAnim();
        this.createContentShowAnim();
      }
    },
    dateFormat(expire) {

      let nowtime = '';
      let arrtime = '';

      let dt = new Date()
      let y = dt.getFullYear()
      let mt = (dt.getMonth() + 1).toString().padStart(2, '0')
      let day = parseInt(dt.getDate().toString().padStart(2, '0')) + 1
      if (day < 10) {
        nowtime = y + "." + mt + "." + '0' + day
      } else {
        nowtime = y + "." + mt + "." + day
      };
      this.setData({
        'kipe.nowtime': nowtime,
      })
      if (expire) {


        let dts = Date.parse(new Date()) + 86400000 * expire
        dt = new Date(parseInt(dts))
        let y = dt.getFullYear()
        let mt = (dt.getMonth() + 1).toString().padStart(2, '0')
        let day = parseInt(dt.getDate().toString().padStart(2, '0')) + 1
        if (day < 10) {
          arrtime = y + "." + mt + "." + '0' + day
        } else {
          arrtime = y + "." + mt + "." + day
        };
        this.setData({
          'kipe.arrtime': arrtime,
        })
      }
    },
    createMaskShowAnim() {
      if (!this.animationMask) {
        // 如果没有动画对象
        this.animationMask = my.createAnimation({
          // 没有则要init
          duration: 200
        });
      }
      this.animationMask = this.animationMask.opacity(1).step();
      this.setData({
        "kipe.pageControl.animMaskData": this.animationMask.export()
      });
    },
    createMaskHideAnim() {
      this.animationMask = this.animationMask.opacity(0).step();
      this.setData({
        "kipe.pageControl.animMaskData": this.animationMask.export()
      });
    },
    createContentShowAnim() {
      if (!this.animationContent) {
        // 如果已有动画对象
        this.animationContent = my.createAnimation({
          // 没有则要init
          duration: 200
        });
      }
      this.animationContent = this.animationContent.translateY(0).step();
      this.setData({
        "kipe.pageControl.animContentData": this.animationContent.export()
      });
    },
    createContentHideAnim() {
      this.animationContent = this.animationContent.translateY("100%").step();
      this.setData({
        "kipe.pageControl.animContentData": this.animationContent.export()
      });
    },


    selectCoupon(e) {
      let index = e.currentTarget.dataset.index;
      let content = this.data.kipe.pageInfo.coupon.content;
      for (let i = 0; i < content.length; i++) {
        // 将所有优惠券为false
        content[i]["couponflag"] = false;
      }
      if (index == "no") {
        // 不选择优惠券
        this.setData({
          "kipe.pageInfo.currentCoupon.couponPrice": "",
          "kipe.pageInfo.currentCoupon.couponId": "",
          "kipe.pageInfo.coupon.content": content
        }, () => {
          this.computedPrice(this.data.kipe.pageInfo);
        });
      } else {
        content[index]["couponflag"] = true; // 将选择的优惠券为true
        let currentCoupon = content[index];
        console.log(currentCoupon, ">>>>>>>>>>>>>>currentCoupon.id");
        let price;
        if (!currentCoupon.voucherType) {
          price = new Number(currentCoupon.price / 100).toFixed(2);
        } else {
          price = currentCoupon.price.toFixed(2)
        }

        this.setData({
          "kipe.pageInfo.currentCoupon.couponPrice": price,
          "kipe.pageInfo.currentCoupon.couponId": currentCoupon.id,
          "kipe.currentCouponInfo" :content[index],
          "kipe.pageInfo.coupon.content": content
        }, () => {
          this.computedPrice(this.data.kipe.pageInfo);
        });
      }
    },


    getLocation() {
      var that = this;
      my.getLocation({
        type: 2,
        success(res) {
          that.setData({
            "kipe.location": res
          });
        },
        fail() {
          my.confirm({
            title: "提示",
            content:
              "确认订单需获取您的精确位置,请在授权管理页面打开位置授权开关",
            success: result => {
              if (result.confirm) {
                my.openSetting({
                  success: res => { }
                });
              }
            }
          });
        }
      });
    },
    loader(query) {
      var zmOrderNo = query.zmOrderNo;
      var outOrderNo = query.outOrderNo;
      // zmOrderNo = "2018070400001001090995141948";
      // outOrderNo = "2018070415390301513";
      // outOrderNo 商户订单号
      //  orderNo 芝麻订单号
      this.config = {
        zmOrderNo: zmOrderNo,
        outOrderNo: outOrderNo
      };
      var orderNumberObj = {
        zmOrderNo: zmOrderNo,
        outOrderNo: outOrderNo
      };
      this.loade(orderNumberObj);
    },
    onShow() {
      this.getLocation();
      let userSelectAdd = my.getStorageSync({
        key: "userSelectAdd"
      }).data || null;
      if (userSelectAdd) {
        userSelectAdd = JSON.parse(userSelectAdd);
        my.removeStorageSync({
          key: "userSelectAdd"
        });
        const result = {
          country: "中国",
          address: userSelectAdd.text,
          prov: userSelectAdd.provice,
          city: userSelectAdd.city,
          area: userSelectAdd.regoin,
          fullname: userSelectAdd.name,
          mobilePhone: userSelectAdd.phone
        };
        this.setData({
          "kipe.address": result || {}
        });
      }
      let buyoutMoney = my.getStorageSync({
        key: "buyoutMoney"
      }).data || null;
      this.setData({
        "kipe.buyoutMoney": buyoutMoney || ""
      });
    },
    getStoreCoupon() {
      const userId = my.getStorageSync({
        key: 'userId',
      }).data || '';
      const params = {
        appId: '2021002189690874',
        uid: userId,
        goodId: this.data.goodsId
      }
      HttpApi.selectCouponData(params).then(resp => {
        const storeCoupon = resp.data;
        storeCoupon.forEach(item => {
          // if (item.voucherType === 'FIX_VOUCHER' || item.voucherType === 'SPECIAL_VOUCHER') {
          //   item.amount = item.amount * 100;
          // }
          item.bonusModelName = item.activitName;
          switch (item.voucherType) {
            case 'DISCOUNT_VOUCHER':
              item.price = item.discount;
              break;
            case 'FIX_VOUCHER':
              item.price = item.amount;
              break;
            case 'SPECIAL_VOUCHER':
              item.price = item.specialAmount;
              break;
          }
          item.couponflag = false;
          item.publishStartTime = moment(item.publishStartTime).format("YYYY-MM-DD HH:mm");
          item.publishEndTime = moment(item.publishEndTime).format("YYYY-MM-DD HH:mm");

        })
        storeCoupon.filter(item => {
          item.volumeStatus === 0 && item.failure === 0
        })
        const newCoupon = this.data.kipe.pageInfo.coupon || [];
        newCoupon.content.push(...storeCoupon)
        this.setData({
          'kipe.storeCouponDatas': newCoupon,
          "kipe.pageInfo.coupon": newCoupon,
        })
      }).catch(err => {

      })

    },
    iptEmail(e) {
      // email
      let email = e.detail.value.trim() || "";
      this.setData({
        "kipe.email": email
      });
    },
    // iptContact(e) {
    //   // email
    //   let name = e.detail.value.trim() || "";
    //   this.setData({
    //     "kipe.contacts.name": name
    //   });
    // },
    // iptPhone(e) {
    //   // email
    //   let mobile = e.detail.value.trim() || "";
    //   this.setData({
    //     "kipe.contacts.mobile": mobile
    //   });
    // },
    choosePhoneContact() {
      const contact = this.data.kipe.contact;
      my.choosePhoneContact({
        success: res => {
          contact[0] = res;
          this.setData({
            "kipe.contact": contact
          });
        },
        fail: res => {
          if (res.error == 11) {
            // 用户取消选择
            return;
          }
          my.confirm({
            title: "提示",
            content:
              "确认订单需获取您的紧急联系人,请在授权管理页面打开通讯录授权开关",
            success: result => {
              if (result.confirm) {
                my.openSetting({
                  success: res => { }
                });
              }
            }
          });
        }
      });
    },
    selectAddress() {
      this.setData({
        selectAddress: false,
      })
      my.getAddress({
        success: res => {
          this.setData({
            "kipe.address": res.result || {}
          });
        },
        fail: e => {
          my.navigateTo({
            url: `/page/addressList/index`
          });
          // 用户拒绝   那就需要跳转列表了
        }
      });
    },
    radioChecked() {
      this.setData({
        "kipe.radioChecked": !this.data.kipe.radioChecked
      });
      if (this.data.kipe.radioChecked == true) {
        this.setData({
          "kipe.helpToastHidden": true,
          "kipe.rent_checkBtn": "rentcheckBtn"
        });
      } else {
        this.setData({
          "kipe.rent_checkBtn": ""
        });
      }
    },
    helpAgreement() {
      // my.navigateTo({
      //   url: "../../page/help/helpagreement/helpagreement"
      // });
      // https://img.dbzubei.com/hetong/ht_1.0.pdf
      my.showLoading({
        content: "合同加载中..."
      });
      my.downloadFile({
        // 示例 url，并非真实存在
        url: "https://img.zejihui.com.cn/hetong/ht_1.0_2021002189690874.pdf",
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
    // loginBtn() {kipe.shouyue
    //   getApp()
    //     .getUserInfo()
    //     .then(user => {
    //       this.submitBtn();
    //     })
    //     .catch(() => {});
    // },
    submitBtn() {
      conversionBack('95')
      const email = this.data.kipe.email;
      const reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
      if (!reg.test(email)) {
        my.showToast({
          content: "请输入正确的邮箱",
          duration: 2000
        });
        return;
      }
      const location = this.data.kipe.location;
      if (!location) {
        this.getLocation();
        return;
      }
      // const contacts = this.data.kipe.contacts;
      // if (contacts.mobile) {
      //   let regPhone = /^1[3456789]\d{9}$/g;
      //   if (!regPhone.test(contacts.mobile)) {
      //     my.showToast({
      //       content: "请输入正确的手机号",
      //       duration: 2000
      //     });
      //     return;
      //   }
      // }
      // const contact = this.data.kipe.contact;
      // if (!contact.length) {
      //   my.showToast({
      //     content: "请选择紧急联系人",
      //     duration: 2000
      //   });
      //   return;
      // }
      const pageInfo = this.data.kipe.pageInfo;
      // url: '../../page/rent/index?pageInfo=' + JSON.stringify(this.data.pageInfo)
      const address = this.data.kipe.address;
      if (!address.prov) {
        my.showToast({
          content: "请先选择地址",
          duration: 2000
        });
        return;
      }
      var checked = this.data.kipe.radioChecked;
      if (checked == true) {
        app
          .getUserInfo()
          .then(data => {
            // const channel = getApp().globalQuery.channel || null;
            const channel = my.getStorageSync({
              key: 'channel',
            }).data || '';
            let params = {
              goodsId: pageInfo.goodsId,
              channel
            };
            pageInfo.specification.forEach(item => {
              params[item.key] = item.value; // 生成发请求的参数
            });
            if (!params.leaseDay) {
              // 没天数是自定义期限
              params.leaseDay = pageInfo.inputDays;
            }
            params.isSelectInsurance =
              pageInfo.insuranceServer.insuranceMandatory ||
              pageInfo.insuranceServer.insuranceChoose ||
              false;
            params.accessoryIds = '';
            pageInfo.accessoriesList && pageInfo.accessoriesList.length && pageInfo.accessoriesList.forEach(item => {
              if (item.choose) {
                params.accessoryIds += `${item.id},`
              }
            })
            if (!!params.accessoryIds) {
              params.accessoryIds = params.accessoryIds.slice(0, params.accessoryIds.length - 1);
            }
            if (pageInfo.currentCoupon.couponId && !this.data.kipe.currentCouponInfo.voucherType) {
              params.userBonusId = pageInfo.currentCoupon.couponId;
            }
            if (pageInfo.currentCoupon.couponId && this.data.kipe.currentCouponInfo.voucherType) {
              params.couponId = pageInfo.currentCoupon.couponId;
            }

            if (pageInfo.activityId) {
              params.activityId = pageInfo.activityId;
            }
            if (pageInfo.detail.discountId) {
              params.discountId = pageInfo.detail.discountId;
            }
            params = Object.assign(
              {},
              params,
              { ...address },
              {
                location: JSON.stringify(location),
              }
            );
            if (email) {
              params.email = email;
            }
            // if (contacts.name || contacts.mobile) {
            //   params.contact = JSON.stringify([contacts])
            // }

            HttpApi.getOrderNumber(params)
              .then(res => {
                // 这里拿到支付信息 调支付
                if (res.code === 200) {
                  const data = res.data;
                  const {
                    orderNumber,
                    payParams
                  } = data;
                  my.tradePay({
                    // 调用统一收单交易创建接口（alipay.trade.create），获得返回字段支付宝交易号trade_no
                    orderStr: payParams,
                    success: res => {
                      let result;
                      switch (res.resultCode) {
                        case "9000":
                          result = "订单支付成功!";
                          break;
                        case "4000":
                          result = "订单支付失败!";
                          break;
                        case "6001":
                          result = "用户中途取消!";
                          break;
                        case "6002":
                          result = "网络连接出错!";
                          break;
                        default:
                          result = "订单支付失败!";
                          break;
                      }
                      my.showToast({
                        type: res.resultCode === "9000" ? "success" : "fail",
                        content: result,
                        duration: 2000
                      });
                      if (res.resultCode === "9000") {
                        // 这里进行免密代扣签约
                        // HttpApi.deductionSign(orderNumber).then(res => {
                        //   console.warn(res)
                        // }).catch(err => {
                        //   console.warn(err);
                        // });
                        // return;
                        my.reLaunch({
                          url: "../../page/order/orderResult/orderResult"
                        });
                      } else {
                        my.showToast({
                          type: "fail",
                          content: result,
                          duration: 2000
                        });
                      }
                      //   my.navigateTo({
                      //     // 跳转订单下单成功
                      //     url:
                      //       "../../page/order/orderResult/orderResult?zmOrderNo=" +
                      //       _res.zm_order_no +
                      //       "&outOrderNo=" +
                      //       _res.out_order_no
                      //   });

                      // 支付成功逻辑
                    },
                    fail: res => {
                      // 支付失败逻辑
                    }
                  });
                } else {
                  my.showToast({
                    type: "fail",
                    content: res.message,
                    duration: 2000
                  });
                }
              })
              .catch(e => {
                my.showToast({
                  type: "fail",
                  content: res.message,
                  duration: 2000
                });
              });
          })
          .catch(e => { });
        return;
        // var config = this.config;
        // 调用确认订单接口
        my.zmRentTransition({
          creditRentType: "signPay",
          outOrderNo: config.outOrderNo,
          zmOrderNo: config.zmOrderNo,
          success: function (res) {
            // resolve(res);
            if (res.resultStatus == "6001") {
              my.showToast({
                type: "success",
                content: "用户中途取消",
                duration: 2000
              });
              // console.log("输出rentorder页面出现的参数:", JSON.stringify(res, "", ""));
              my.navigateTo({
                // 跳转订单失败页面
                url:
                  "../../page/order/orderResultFail/orderResultFail/?zm_order_no=" +
                  config.zmOrderNo +
                  "&out_order_no=" +
                  config.outOrderNo +
                  "&error_msg=" +
                  "用户中途取消,请重试"
              });
              // 订单确认失败,请重试
              // 跳转到失败页面 显示 用户中途已取消
            } else if (res.resultStatus == "6002") {
              my.showToast({
                type: "success",
                content: "网络连接出错",
                duration: 2000
              });
              my.navigateTo({
                // 跳转订单失败页面
                url:
                  "../../page/order/orderResultFail/orderResultFail/?zm_order_no=" +
                  config.zmOrderNo +
                  "&out_order_no=" +
                  config.outOrderNo +
                  "&error_msg=" +
                  "网络连接出错,请重试或联系管理员"
              });
              // 跳转到失败页面 显示 网络连接出错
            } else if (res.resultStatus == "7002") {
              my.showToast({
                type: "success",
                content: "协议签约失败",
                duration: 2000
              });
              my.navigateTo({
                // 跳转订单失败页面
                url:
                  "../../page/order/orderResultFail/orderResultFail/?zm_order_no=" +
                  config.zmOrderNo +
                  "&out_order_no=" +
                  config.outOrderNo +
                  "&error_msg=" +
                  "协议签约失败,请重试或联系管理员"
              });
              my.navigateTo({
                // 跳转订单失败页面
                url:
                  "../../page/order/orderResultFail/orderResultFail/?zm_order_no=" +
                  config.zmOrderNo +
                  "&out_order_no=" +
                  config.outOrderNo +
                  "&error_msg=" +
                  "网络连接出错,请重试或联系管理员"
              });
              // 跳转到失败页面 显示 协议签约失败
            } else if (res.order_status == "SUCCESS") {
              var _res = res;
              // console.error('调试输出的信息:1111',_res);
              my.navigateTo({
                // 跳转订单下单成功
                url:
                  "../../page/order/orderResult/orderResult?zmOrderNo=" +
                  _res.zm_order_no +
                  "&outOrderNo=" +
                  _res.out_order_no
              });
            }
          },
          fail: function (res) {
            // reject(res);
            // 失败 跳转到失败页面 现在 还没有 等下添加
            // console.log(JSON.stringify(res, "", ""));
            var error_msg = "";
            if (res.order_status == "FAIL") {
              if (res.error_code == "SYSTEM_FAILURE") {
                error_msg = "系统错误，稍后再试";
              } else if (res.error_code == "ORDER_NOT_EXISTS") {
                error_msg = "订单不存在,请重试";
              } else if (res.error_code == "SIGN_ERROR") {
                error_msg = "验签错误,请重试";
              } else if (res.error_code == "WITHHOLDING_FAILED") {
                error_msg = "签约代扣协议失败,请重试";
              } else if (res.error_code == "PREAUTH_FREEZE_ERROR") {
                error_msg = "用户预授权冻结资金失败,请重试";
              } else if (res.error_code == "ORDER_CONFIRM_ERROR") {
                error_msg = "订单确认失败,请重试";
              } else if (res.error_code == "CLOSE_PRE_AUTH_BACK") {
                // error_msg = "订单确认失败,请重试"
                // CLOSE_PRE_AUTH_BACK  关闭预授权，回跳商户下单页
                my.showToast({
                  type: "fail",
                  content: "关闭预授权,回跳商户下单页",
                  duration: 2000
                });
                my.navigateTo({
                  // 跳转订单失败页面
                  url:
                    "../../page/rent/index?zmOrderNo=" +
                    config.zmOrderNo +
                    "&outOrderNo=" +
                    config.outOrderNo
                });
              }
              my.navigateTo({
                // 跳转订单失败页面
                url:
                  "../../page/order/orderResultFail/orderResultFail?zm_order_no=" +
                  config.zmOrderNo +
                  "&out_order_no=" +
                  config.outOrderNo +
                  "&error_msg=" +
                  error_msg
              });
            }
          }
        });
        // 已选择 radio 点击之后与支付宝链接确认下单
      } else {
        this.setData({
          "kipe.helpToastHidden": false
        });
      }
    }
  }
};
