import HttpApi from "/api/lease"; // 租赁API
import WxParse from "/components/wxParse/wxParse.js"; // 将文本解析为HTML
import { dateFormat } from "../../util/format";
import util from "/util/util.js";
import env from "/util/env.js";
import { conversionBack } from '../../util/common'
let app = getApp(); // 获取全局对象

Page({
  data: {
    goodsId: null, // 商品ID
    allData: {}, // 所有数据
    pageControl: {
      // 控制页面元素的对象
      viewShow: false, // 控制视图 show || hidden
      slotShow: false, // 控制错误 show || hidden
      loadShow: false, //控制loading show || hidden
      indicatorColor: "rgba(204, 204, 204,0.3)", // 轮播图按钮颜色
      indicatorActiveColor: "#1187F7", // 轮播图当前按钮的颜色
      controlServeInst: false, // 控制服务说明 show || hidden数 租赁说明的按钮样式+
      tabIndex: 0,
      fixTabShow: false, // 上边的商品介绍 规格参数 租赁说明悬浮栏的显示与隐藏
      couponShow: true, // 控制优惠券 show || hidden
      animMaskData: "", // 控制遮罩层动画轨迹
      animContentData: "", // 控制内容动画轨迹
      submitDisable: true //立即租赁按钮不能点击
    },
    pageInfo: {
      swiperIndex: 1,
      alreadySku: [],
      goodsId: null,
      tabsArr: ["商品详情", "租赁说明", "下单流程", "活动须知"],
      slotHlepImageSrc: "/image/order/empty.png", // 页面出现错误的时候的图片
      swiperImageSrc: "/image/assign/zm.png", // 芝麻免押金的图
      detail: {},
      serverDescription: {},
      insuranceServer: {
        rentName: "增值服务" // 增值服务的名字
      },
      accessoriesList: [],
      coupon: {
        title: "",
        content: []
      }, // 优惠券数组
      currentCoupon: {
        couponPrice: "",
        couponId: ""
      },
      comment: [], // 商品评论
      star: ["", "", "", "", ""], // 星星数组
      rentExplain: "https://img.zejihui.com.cn/2018/znlc.jpg", // 租赁说明的图片
      inputDays: "", // 自定义天数
      submitText: "确定", // 立即租赁的按钮文字
      rentContent: "",
      activityId: ""
    },
    bindData: "", // 绑定的页面数据

    buyoutRatio: 1.2, //买断系数
    buyoutMoney: 0,//买断尾款
    chfig: false,
    ctorCss: '',
  },
  showServer() {
    this.server.showModal();
    this.setData({
      chfig: true
    })
  },
  hideServer() {
    this.server.hideModal();
  },
  server(ref) {
    this.server = ref;
  },
  chooseSkuPop(ref) {
    this.chooseSkuPop = ref;
  },
  openSkuPop() {
    this.chooseSkuPop.showModal();
    this.setData({
      chfig: true
    })
  },
  confirm(ref) {
    this.confirm = ref;
  },
  // clickCh(){
  //   this.clickCh = ref;
  // },
  onGetAuthorize() {
    const channel = getApp().globalQuery.channel || null;
    // 授权
    this.confirm.hideModal();
    my.getPhoneNumber({
      success: res => {
        let encryptedData = JSON.parse(res.response);
        HttpApi.bindAuthUser({ encryptedData: encryptedData.response, channel })
          .then(res => {
            if (res.code === 200) {
              my.showToast({
                type: "success",
                content: "手机号已绑定",
                duration: 3000
              });
            } else {
              my.showToast({
                type: "fail",
                content: res.message,
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
      fail: res => {
        my.showToast({
          type: "fail",
          content: res,
          duration: 3000
        });
        // console.log(res);
        // console.log('getPhoneNumber_fail');
      }
    });
  },
  tips(e) {
    const item = e.currentTarget.dataset.item;
    my.alert({
      title: '提示',
      content: item.name,
      buttonText: '我知道了',
      success: () => { }
    });
  },
  onAuthError() {
    this.confirm.hideModal();
    // 未授权 去短信绑定页面
    let url = "/page/detail/index?goodsId=" + this.data.allData.id; // 为了能跳转回来
    my.navigateTo({
      // 跳往绑定手机号
      url: "/page/bindingPhone/index?url=" + url
    });
  },
  onLoad(options) {
    const { channel = '', goodsId: goods_Id } = options || {};
    if (channel) {
      getApp().globalQuery.channel = channel
      my.setStorageSync({
        key: 'channel',
        data: channel,
      });
    }
    conversionBack('94', goods_Id)
    // my.showLoading({
    //     content: '加载中...',
    //     success: () => {

    //     }
    // });
    let goodsId = null;
    if (app.globalQuery.goodsId) {
      goodsId = app.globalQuery.goodsId;
      app.globalQuery.goodsId = '';
    } else if (options.goodsId) {
      goodsId = options.goodsId;
    } else {
      goodsId = options.query.goodsId || null;
    }
    // goodsId = 14376;
    this.setData({
      "pageControl.loadShow": true, // 开启loading
      goodsId: goodsId,
      "pageInfo.goodsId": goodsId
    });
    !!goodsId
      ? this.loder(goodsId)
      : this.setData({
        "pageControl.slotShow": true
      });
    // app.getUserInfo().then(data => {}).catch()
  },
  swiperChange(e) {
    this.setData({
      'pageInfo.swiperIndex': e.detail.current + 1
    })
  },
  loder(id) {
    if (!id) { return };
    HttpApi.getDetail(id).then(d => {
      if (d.code == 200) {
        // 请求到商品的详细信息
        let data = d.data || {};
        //console.log(data);
        //banner图片处理
        let sysInfo = my.getSystemInfoSync();
        let iw = Math.round(sysInfo.windowWidth * (sysInfo.pixelRatio || 1));
        let oss_process =
          "?x-oss-process=image/resize,m_lfit,w_" +
          iw +
          ",limit_1/format,jpg/sharpen,100/interlace,1/quality,q_95";

        let imgJson = data.imgJson || [];
        imgJson.forEach(item => {
          if (item.url.indexOf("http") === 0) {
            item.url += oss_process;
          } else {
            item.url = env.image_host + item.url + oss_process;
          }
        });

        data.imgJson = imgJson;

        let detail = {
          title: data.name,
          subtitle: "【" + data.oldLevelStr + "】",
          originPrice: this.tofixednum(data.originalPrice), // 商品原价 与租金无关
          defaultRent: (data.displayRent / 100).toFixed(2), //默认价格 其实就是多少元起  如果有活动 则是活动价最低多少起
          oldDefaultRent: "", // 商品活动状态下的旧租金
          activityStatus: data.activityStatus,
          discount: data.discount,
          discountId: data.discountId
        };

        if (detail.activityStatus) {
          // 此商品的活动状态
          detail.defaultRent = (
            data.displaySpecificationCombination.rent / 100
          ).toFixed(2); //活动状态下的活动最低价
          detail.oldDefaultRent = (
            data.displaySpecificationCombination.originalRent / 100
          ).toFixed(2); // 活动下的原租金的最低值
        }
        if (detail.discount) {
          detail.defaultRent = detail.defaultRent * (detail.discount / 100);
        }
        let serverDescription = data.characteristics.map(item => {
          // 服务及服务说明
          return {
            iconfont: "icon-ico-xuanzhongxian",
            name: item.name,
            content: item.detail,
            img: item.img
          };
        });
        // let accessoriesServer = {
        //   control: !!data.accessoriesSwitch
        // }
        // if (accessoriesServer.control) {
        //   accessoriesServer.accessoriesMandatory = !!data.accessoriesMandatory;
        //   accessoriesServer.accessoriesChoose = true;
        //   accessoriesServer.rentPrice = this.tofixednum(data.accessoriesAmount);
        //   accessoriesServer.accessoriesAmount = data.accessoriesAmount;
        //   accessoriesServer.rentTitle = '配件'; // 配件名称
        //   accessoriesServer.rentContent = data.accessoriesName;
        //   if (data.accessoriesMandatory && data.accessoriesAmount > 0) {
        //     accessoriesServer.rentsubtit = "（必选）";
        //   }
        // }
        let insuranceServer = {
          control: !!data.insuranceSwitch // 保险开关
        };
        if (insuranceServer.control) {
          insuranceServer.insuranceMandatory = !!data.insuranceMandatory; // 保险是否必选
          insuranceServer.insuranceChoose = !!data.insuranceMandatory || !!data.insuranceSelected; // 保险当前选择
          if (data.accidentInsurance > 0) {
            // 意外保险金额大于0  要考虑是必选还是可选
            insuranceServer.rentPrice = this.tofixednum(data.accidentInsurance);
            insuranceServer.accidentInsurance = data.accidentInsurance;
          } else {
            // 意外保险金额等于0  赠送  也要考虑是必选还是可选
            insuranceServer.rentPrice = 0;
            insuranceServer.rentsubtit = "(赠送)";
          }
          insuranceServer.rentTitle = data.insurances["0"].insuranceName; //保险名称
          insuranceServer.rentContent = data.insurances["0"].detail; //保险详情
          if (data.insuranceMandatory && data.accidentInsurance > 0) {
            //如果是必选 并且 意外保险金大于0
            insuranceServer.rentsubtit = "(必选)";
          }
        }
        let specificationJson = data.specificationJson; // 拿到 规格 JSON
        if (!data.customLease) {
          // 非自定义租赁日期
          let leaseDaysArr = data.leaseDays.split(",");
          specificationJson.push(
            // push租期
            {
              specification: "leaseDay",
              specificationJson: leaseDaysArr,
              specificationName: "租期"
            }
          );
        } else {
          // 自定义租期的逻辑
          this.setData({
            // 设置默认的天数
            "pageInfo.inputDays": data.displaySpecificationCombination.leaseDay
          });
        }
        specificationJson.map(item => {
          // 循环判断哪个规格里边只有一个选项 需默认选中
          if (item.specificationJson.length === 1) {
            // 需要默认选中
            item.defaultChoose = true; // 默认选中
            item.currentChoose = 0; // 默认选中第几个
          }
          item.specificationJson.map(subItem => {
            // 循环内层的规格选项 判断是否禁用
            let rules = data.skuStr;
            for (let i = 0; i < rules.length; i++) {
              let flag = false;
              let spiltRule = rules[i].split(",");
              for (let j = 0; j < spiltRule.length; j++) {
                if (spiltRule[j] === subItem) {
                  // console.log('找到对应的选项:'+spiltRule[j]+'==='+subItem+'跳出循环');
                  item[subItem] = true;
                  flag = true;
                  break;
                }
              }
              if (flag) {
                // console.log('跳出当前rules循环');
                break;
              }
            }
            item[subItem] = item[subItem] || false;
          });
        });
        this.getGoodsParameters(); // 异步获取参数  因为是异步 放在商品信息前执行
        let pictDetailALL;
        switch (this.data.pageControl.tabIndex) {
          case 0:
            pictDetailALL = data.introduceDetail;
            break;
          case 1:
            pictDetailALL = data.introduceDetail2;
            break;
          case 2:
            pictDetailALL = data.introduceDetail3;
            break;
          case 3:
            pictDetailALL = data.introduceDetail4;
            break;
        }

        WxParse.wxParse("pictDetailALL", "html", pictDetailALL, this, 5);

        // console.log(detail)
        const accessoriesList = data.accessoriesList;
        accessoriesList
        if (accessoriesList && accessoriesList.length) {
          accessoriesList.forEach(item => {
            // 配件默认勾选
            item.choose = item.defaultChecked;
            item.price = this.tofixednum(item.amount);
            item.rentTitle = '配件';
            if (item.mandatory) {
              item.rentsubtit = "(必选)";
            }
          })
        }
        this.setData({
          'pageInfo.accessoriesList': accessoriesList,
          // 将所有数据给予allData
          allData: d.data,
          "pageInfo.detail": detail, // 商品详情 detail
          "pageInfo.serverDescription": serverDescription, // 弹出服务说明框
          "pageInfo.insuranceServer": insuranceServer, // 控制增值服务
          // "pageInfo.accessoriesServer": accessoriesServer, // 控制增值服务
          buyoutMoney: (data.buyoutMoney / 100).toFixed(2)
        });
        this.setData({
          "allData.specificationJson": specificationJson
        });
        this.setData({
          "pageControl.customLease": data.customLease, // 判断商品是否自定义租期
          "pageControl.viewShow": true,
          "pageControl.loadShow": false
        });
        // console.log(this.data.allData.specificationJson);  //init 禁用和默认选中的button
        this.BtnChoose();
        this.getComment("init"); // 获取一下评论列表
        my.hideLoading(); // 关loading
      } else if (d.code == 400 && d.message == "该商品不存在") {
        this.setData({
          "pageControl.viewShow": false,
          "pageControl.slotShow": true
        });
        my.hideLoading();
      }
    });
  },
  getComment(init) {
    // 获取用户评论  init 用来判断是否是初始化第一次请求用户评论   pageInfo.parameters 会在初始化赋值 如果接口错误或者网络问题 并不会做任何提示  如果没有赋值  则会在tabChange 的时候再次发起请求拿 用户评论  如果依然拿不到 则会提示错误类型
    let comment = this.data.pageInfo.comment;
    if (comment.length) return;
    let parameters = [];
    HttpApi.getGoodsCommentList({
      goodsId: this.data.goodsId,
      pageNum: 1,
      pageSize: 200
    })
      .then(resp => {
        if (resp.code == 200) {
          let list = resp.data.list || [];
          let sysInfo = my.getSystemInfoSync();
          let iw = Math.round(sysInfo.windowWidth * (sysInfo.pixelRatio || 1));
          list.forEach(item => {
            item.commentImgUrl = JSON.parse(item.commentImgUrl || "[]");
            item.seeCommentImgUrl = [];
            item.commentImgUrl.forEach(i => {
              let url =
                i.url.indexOf("http") === 0 ? i.url : env.image_host + i.url;
              item.seeCommentImgUrl.push(url);
              i.src = url + app.getImageSuffix(4);
            });

            let headImg = item.headImgUrl
              ? item.headImgUrl.indexOf("http") === 0
                ? item.headImgUrl
                : env.image_host + item.headImgUrl
              : "/image/icon/avatar_default.png";
            item.commentTime = util.formatTime(new Date(item.commentTime), {
              type: "easy",
              jsonMode: "through"
            });
          });
          this.setData({
            "pageInfo.comment": list
          });
        } else {
          if (!init) {
            my.showToast({
              type: "fail",
              content: resp.message,
              duration: 3000
            });
          }
        }
      })
      .catch(err => {
        if (!init) {
          my.showToast({
            type: "fail",
            content: err,
            duration: 3000
          });
        }
      });
  },
  watchScroll(e) {
    // 滚动的时候   如果<=0 让固定的栏出现
    my.createSelectorQuery()
      .select("#tabsView")
      .boundingClientRect()
      .exec(ret => {
        let fixTabShow = ret[0].top <= 0;
        if (this.data.pageControl.fixTabShow !== fixTabShow) {
          this.setData({
            "pageControl.fixTabShow": fixTabShow
          });
        }
      });
  },
  controlServeInst() {
    // 控制服务说明 show || hidden
    this.setData({
      "pageControl.controlServeInst": !this.data.pageControl.controlServeInst
    });
  },
  selectCoupon(e) {
    let index = e.currentTarget.dataset.index;
    let content = this.data.pageInfo.coupon.content;
    for (let i = 0; i < content.length; i++) {
      // 将所有优惠券为false
      content[i]["couponflag"] = false;
    }
    if (index == "no") {
      // 不选择优惠券
      this.setData({
        "pageInfo.currentCoupon.couponPrice": "",
        "pageInfo.currentCoupon.couponId": "",
        "pageInfo.coupon.content": content
      });
    } else {
      content[index]["couponflag"] = true; // 将选择的优惠券为true
      let currentCoupon = content[index];
      let price = new Number(currentCoupon.price / 100).toFixed(2);
      this.setData({
        "pageInfo.currentCoupon.couponPrice": price,
        "pageInfo.currentCoupon.couponId": currentCoupon.id,
        "pageInfo.coupon.content": content
      });
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
      "pageControl.animMaskData": this.animationMask.export()
    });
  },
  createMaskHideAnim() {
    this.animationMask = this.animationMask.opacity(0).step();
    this.setData({
      "pageControl.animMaskData": this.animationMask.export()
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
      "pageControl.animContentData": this.animationContent.export()
    });
  },
  createContentHideAnim() {
    this.animationContent = this.animationContent.translateY("100%").step();
    this.setData({
      "pageControl.animContentData": this.animationContent.export()
    });
  },
  controlCoupon() {
    if (this.data.allData.whiteListed) {
      my.showToast({
        content: "抱歉！此商品无法使用优惠券",
        duration: 2000
      });
      return;
    }
    let coupon = this.data.pageInfo.coupon;
    if (!coupon.content.length) {
      my.showToast({
        content: "抱歉！暂无可用优惠券",
        duration: 2000
      });
      return;
    }
    if (!this.data.pageControl.couponShow) {
      // 显示 变 隐藏
      setTimeout(() => {
        this.setData({
          "pageControl.couponShow": !this.data.pageControl.couponShow
        });
      }, 500);
      this.createMaskHideAnim();
      this.createContentHideAnim();
    } else {
      // 隐藏 变显示
      this.setData({
        "pageControl.couponShow": !this.data.pageControl.couponShow
      });
      this.createMaskShowAnim();
      this.createContentShowAnim();
    }
  },
  setRadio1(e) {
    const { item, index } = e.currentTarget.dataset;
    const accessoriesList = this.data.pageInfo.accessoriesList;
    if (accessoriesList[index].mandatory) return;
    accessoriesList[index].defaultChecked = !accessoriesList[index].defaultChecked;
    accessoriesList[index].choose = !accessoriesList[index].choose;
    this.setData({
      'pageInfo.accessoriesList': accessoriesList
    })
  },
  setRadio() {
    let doRequest = true;
    let specificationJson = this.data.allData.specificationJson;
    specificationJson.forEach(item => {
      if (isNaN(item.currentChoose) && !item.currentChoose > -1) {
        // 数字假，非数字真 需要做请求拿新的优惠券
        doRequest = false;
      }
    });
    let insu = this.data.pageInfo.insuranceServer;

    if (!insu.insuranceMandatory) {
      // 不是必选 用户可选可不选
      this.setData({
        "pageInfo.insuranceServer.insuranceChoose": !this.data.pageInfo
          .insuranceServer.insuranceChoose
      });
    }
    if (doRequest) {
      // this.insurancePriceflag 为false的时候 为已经 添加过保险金额
      // this.insurancePriceflag = true 时 未添加 这个保险金额
      if (!this.data.allData.customLease) {
        // 固定租期  如果改变了增值的选择与否  则要重新获取优惠券 但要建立在规格都已经选取的情况下
        this.fetchCoupons(0);
      } else {
        // 自定义租期
        this.fetchCoupons(1);
      }
    }
  },

  BtnChoose(e) {
    // 规格选项按钮点击之后
    let spec = this.data.allData.specificationJson;
    if (e) {
      // 如果是用户操作点了规格按钮
      let rules = this.data.allData.skuStr;
      let index = e.currentTarget.dataset.index.index,
        subIndex = e.currentTarget.dataset.index.subIndex;
      if (spec[index].defaultChoose) return;
      spec[index].currentChoose =
        typeof spec[index].currentChoose == "number" &&
          spec[index].currentChoose == subIndex
          ? ""
          : subIndex;
      // rules // 符合当前选择的规格的规则
      this.setData({
        "allData.specificationJson": spec
      });
    }
    const alreadySku = spec.map(item => {
      if (typeof item.currentChoose == "number") {
        return {
          key: item.specification,
          value: item.specificationJson[item.currentChoose]
        };
      }
      return {}
    })
    this.setData({
      'pageInfo.alreadySku': alreadySku
    });
    let doRequest = true,
      params = {}; // doRequest控制是否发起请求获得价格。
    for (let i = 0; i < spec.length; i++) {
      if (!(typeof spec[i].currentChoose == "number")) {
        doRequest = false;
        break;
      }
    }
    if (doRequest) {
      let params = {
        goodsId: this.data.goodsId
      };
      spec.forEach(item => {
        params[item.specification] = item.specificationJson[item.currentChoose]; // 生成发请求的参数
      });
      if (!params.leaseDay) {
        // 没天数是自定义期限
        params.leaseDay = this.data.pageInfo.inputDays;
      }
      this.setData({
        "pageControl.submitDisable": true
      });
      this.fetchPrice(params); // 获取价格
    } else {
      this.setData({
        "pageControl.submitDisable": true,
        "pageInfo.submitText": "确定",
        "pageInfo.detail.chooseRent": ""
      });
    }
  },
  fetchCoupons(type) {
    if (this.data.allData.whiteListed) {
      return;
    }
    // 在这里获取可使用的优惠券
    let id = this.data.goodsId; // 商品ID
    let detail = this.data.pageInfo.detail; // 商品详情
    let payPrice = detail.chooseRent || detail.defaultRent; // 当前选择的支付单价或者默认最低价
    let activityStatus = detail.activityStatus; // 活动状态.
    let days = 0;
    if (type == 0) {
      // 固定租期
      let specificationJson = this.data.allData.specificationJson; // 拿到的规格JSON
      let obj = specificationJson[specificationJson.length - 1];
      let daysCurrentChoose = obj.currentChoose;
      days = obj.specificationJson[daysCurrentChoose]; // 拿到最终用户选择的天数
    } else {
      // 自定义租期
      days = this.data.pageInfo.inputDays;
    }
    days >= 30
      ? (payPrice = Number(payPrice) * 100 * 30)
      : (payPrice = Number(payPrice) * 100 * days);
    if (this.data.pageInfo.insuranceServer.insuranceChoose) {
      // 选择了增值保险 || 必选
      let accidentPrice = this.data.allData.accidentInsurance;
      payPrice = payPrice + accidentPrice; // 租金加上意外保险金去获取优惠券
    }
    let priceobj = {
      price: parseInt(payPrice)
    };
    HttpApi.getCoupon(id, priceobj).then(resp => {
      if (resp.code == 200) {
        let coupon = {
          title: "店铺优惠",
          content: resp.data
        };
        if (coupon.content && coupon.content.length) {
          coupon.content = coupon.content.sort((a, b) => {
            // 默认以最大优惠券开始排序
            return a.price < b.price;
          });
          for (let i = 0; i < coupon.content.length; i++) {
            coupon["content"][i]["couponflag"] = false; // 将所有优惠券的选中状态变为false
          }
          if (coupon.content.length) {
            coupon["content"][0]["couponflag"] = true;
          }
          this.setData({
            "pageInfo.coupon": coupon,
            "pageInfo.currentCoupon.couponPrice": (
              coupon.content[0].price / 100
            ).toFixed(2),
            "pageInfo.currentCoupon.couponId": coupon.content[0].id
          });
        }
      }
    });
  },
  fetchPrice(params) {
    HttpApi.goodsPricePostFrom(params)
      .then(resp => {
        if (resp.code == 200) {
          my.setStorageSync({
            key: 'buyoutMoney',
            data: resp.data.buyoutMoney,
          });
          let result = resp.data || {};
          let activityStatus = result.activityStatus;
          this.setData({
            buyoutMoney: (result.buyoutMoney / 100).toFixed(2)
          });
          if (result.goodsSpecificationCombination.stock > 0) {
            // 库存大于0的状态
            this.setData({
              "pageControl.submitDisable": false,
              "pageInfo.submitText": "确认下单"
            });
          } else {
            const allData = this.data.allData;
            const skuStr = allData.skuStr;
            const some = skuStr.some(item => {
              return item.indexOf('流量') > -1
            })
            if (some && allData.merchantId == 69) {
              this.setData({
                "pageControl.submitDisable": true,
                "pageInfo.submitText": "套餐不符"
              });
              my.showToast({
                type: "fail",
                content: "套餐不符",
                duration: 2000
              });
            } else {
              this.setData({
                "pageControl.submitDisable": true,
                "pageInfo.submitText": "库存不足"
              });
              my.showToast({
                type: "fail",
                content: "库存不足",
                duration: 2000
              });
            }
          }
          let detail = this.data.pageInfo.detail;
          if (activityStatus) {
            // 此规格参与活动
            detail.oldDefaultRent = (
              Number(result.goodsSpecificationCombination.originalRent) / 100
            ).toFixed(2);
            detail.chooseRent = (
              Number(result.goodsSpecificationCombination.rent) / 100
            ).toFixed(2);
            this.setData({
              "pageInfo.activityId":
                result.goodsSpecificationCombination.activityId
            });
          } else {
            //  不参与活动。判断天数区间
            this.setData({
              "pageInfo.activityId": ""
            });
            if (this.data.allData.customLease) {
              // 不参与活动 自定义租期
              let rentGroup = JSON.parse(
                result.goodsSpecificationCombination.rentGroup || "[]"
              );
              let rent = Number(result.goodsSpecificationCombination.rent);
              // 低于区间的天数取这个默认值
              let inputDays = this.data.pageInfo.inputDays;
              let chooseRent = 0;
              rentGroup = rentGroup.sort((a, b) => {
                return a.day < b.day;
              });
              let sectionPrice = false;
              for (let i = 0; i < rentGroup.length; i++) {
                if (inputDays >= rentGroup[i].day) {
                  chooseRent = rentGroup[i].rent / 100;
                  sectionPrice = true;
                  break;
                }
              }
              if (!sectionPrice) {
                // 区间未找到合适的价格

                chooseRent = rent / 100;
              }
              detail.chooseRent = chooseRent;
            } else {
              // 不参与活动 固定租期
              detail.chooseRent =
                result.goodsSpecificationCombination.rent / 100;
            }
            if (detail.discount) {
              detail.chooseRent = detail.chooseRent * (detail.discount / 100);
            }

            detail.chooseRent = detail.chooseRent.toFixed(2);
          }
          detail.activityStatus = activityStatus;
          detail.originPrice = (
            result.goodsSpecificationCombination.originalPrice / 100
          ).toFixed(2);
          this.setData({
            "pageInfo.detail": detail
          });
          if (this.data.allData.customLease) {
            //自定义租期获取优惠券
            this.fetchCoupons(1);
          } else {
            //固定租期获取优惠券
            this.fetchCoupons(0);
          }
        } else {
          const allData = this.data.allData;
          const skuStr = allData.skuStr;
          const some = skuStr.some(item => {
            return item.indexOf('流量') > -1
          })
          if (some && allData.merchantId == 69) {
            this.setData({
              "pageControl.submitDisable": true,
              "pageInfo.submitText": "套餐不符"
            });
          } else {
            this.setData({
              "pageControl.submitDisable": true,
              "pageInfo.submitText": "库存不足"
            });
          }
        }
      })
      .catch(msg => {
        const allData = this.data.allData;
        const skuStr = allData.skuStr;
        const some = skuStr.some(item => {
          return item.indexOf('流量') > -1
        })
        if (some && allData.merchantId == 69) {
          this.setData({
            "pageControl.submitDisable": true,
            "pageInfo.submitText": "套餐不符"
          });
        } else {
          this.setData({
            "pageControl.submitDisable": true,
            "pageInfo.submitText": "库存不足"
          });
        }
        my.showToast({
          type: "fail",
          content: msg.message,
          duration: 2000
        });
      });
  },
  getGoodsParameters() {
    // getGoodsParameters 获取商品的详细的参数信息
    if (this.data.pageInfo.rentContent.length) return;
    var params = {
      goodsId: this.data.goodsId
    };
    HttpApi.getGoodsParameters(params).then(data => {
      // //console.log(data);
      var parametersList = [];
      var rentContent = [];
      var goodsNum = "";
      if (data.code == 200) {
        this.goodsList = data.data.list;
        if (this.goodsList.length == 1) {
          parametersList = this.goodsList[0].parametersList;
          // //console.log(this.goodsList);
          for (let i = 0; i < parametersList.length; i++) {
            rentContent.push({
              rentTitle: parametersList[i].parameterName,
              rentContent: parametersList[i].parameterValue
            });
          }
        } else if (this.goodsList.length > 1) {
          for (let i = 0; i < this.goodsList.length; i++) {
            goodsNum = this.goodsList[i].name;
            for (let j = 0; j < this.goodsList[i].parametersList.length; j++) {
              rentContent.push({
                rentTitle:
                  goodsNum + this.goodsList[i].parametersList[j].parameterName,
                rentContent: this.goodsList[i].parametersList[j].parameterValue
              });
            }
          }
        }
        this.setData({
          "pageInfo.rentContent": rentContent
        });
      }
    });
  },
  getUserInfo() {
    return new Promise((resolve, reject) => {
      app.getUserInfo().then(resolve).catch(reject);

    })
  },
  realStatus() {
    return new Promise((resolve, reject) => {
      HttpApi.realStatus({}).then(resolve).catch(reject);
    })
  },
  faceStatus() {
    return new Promise((resolve, reject) => {
      HttpApi.faceStatus({}).then(resolve).catch(reject);

    })
  },




















  async submitBtn() {
    // 按钮禁用状态  return出去。
    if (this.data.pageControl.submitDisable) {
      my.showToast({
        type: "none",
        content: this.data.pageInfo.submitText,
        duration: 2000
      });
      return;
    }
    this.chooseSkuPop.hideModal();
    const that = this;
    const pageInfo = this.data.pageInfo;
    pageInfo.allData = this.data.allData;
    let imageSrc = this.data.allData.imgJson[0].url;
    my.setStorageSync({
      key: "imageSrc",
      data: imageSrc
    });
    const specificationJson = this.data.allData.specificationJson;
    pageInfo.specification = specificationJson.map(item => {
      return {
        key: item.specification,
        value: item.specificationJson[item.currentChoose]
      };
    });
    const submitDisable = this.data.pageControl.submitDisable;
    const submitText = this.data.pageInfo.submitText;
    this.setData({
      "pageControl.submitDisable": true,
      "pageInfo.submitText": "下单中..."
    });
    try {
      // 先授权
      await this.getUserInfo();
      conversionBack('111', this.data.goodsId)

      if (!(getApp().userInfo.bindStatus)) {
        this.setData({
          "pageControl.submitDisable": submitDisable,
          "pageInfo.submitText": submitText
        });
        this.confirm.showModal();
        this.setData({
          chfig: true
        })
        return;
      }
      const res = await this.realStatus();
      if (res.code !== 200 || !(res.data)) {
        // 去实名
        my.setStorageSync({
          key: 'pageInfo',
          data: pageInfo,
        });
        let url =
          "/page/rent/index"; // 为了能跳转回来
        this.setData({
          "pageControl.submitDisable": submitDisable,
          "pageInfo.submitText": submitText
        });
        console.log("1111111111111111111");
        my.navigateTo({
          url: "/page/realName/index?url=" + url
        });
        return;
      }
      conversionBack('112', this.data.goodsId);
      const res1 = await this.faceStatus();
      conversionBack('97', this.data.goodsId)

      if (res1.code !== 200 || !(res1.data)) {
        // 未人脸
        my.confirm({
          title: "温馨提示",
          content: "您暂未人脸识别认证,无法下单",
          confirmButtonText: "马上认证",
          cancelButtonText: "暂不认证",
          success: result => {
            if (result.confirm) {
              // 这里增加人脸识别 识别完成后再做跳转
              HttpApi.faceInit().then(res => {
                if (res.code === 200) {
                  const certifyId = res.data.certifyId;
                  const certifyUrl = res.data.certifyUrl;
                  const requestNo = res.data.requestNo;
                  this.setData({
                    "pageControl.submitDisable": submitDisable,
                    "pageInfo.submitText": submitText
                  });
                  my.startAPVerify({
                    url: certifyUrl,
                    certifyId,
                    success: (verifyResult) => {
                      // 认证结果回调触发, 以下处理逻辑为示例代码，开发者可根据自身业务特性来自行处理
                      if (
                        verifyResult.resultStatus === "9000"
                      ) {
                        // 验证成功，接入方在此处处理后续的业务逻辑
                        // ...
                        HttpApi.faceCertify({ requestNo })
                          .then(res => {
                            my.setStorageSync({
                              key: 'pageInfo',
                              data: pageInfo,
                            });
                            console.log("22222222222222");

                            my.navigateTo({
                              url:
                                "../../page/rent/index"
                            });
                          })
                          .catch(e => {
                            my.setStorageSync({
                              key: 'pageInfo',
                              data: pageInfo,
                            });
                            console.log("33333333333333333");

                            my.navigateTo({
                              url:
                                "../../page/rent/index"
                            });
                          });
                        return;
                      }
                      if (
                        verifyResult.resultStatus === "6001"
                      ) {
                        // 可做下 toast 弱提示
                        my.showToast({
                          type: "fail",
                          content: "用户取消认证",
                          duration: 3000
                        });
                        return;
                      }
                      const errorCode =
                        verifyResult.result &&
                        verifyResult.result.errorCode;
                      // 其他结果状态码判断和处理 ...
                      if (errorCode) {
                        my.showToast({
                          type: "fail",
                          content: "系统异常,请稍后再试",
                          duration: 3000
                        });
                      }
                    },
                    fail: (res) => {
                      my.showToast({
                        type: "fail",
                        content: res,
                        duration: 3000
                      });
                    }
                  })
                } else {
                  this.setData({
                    "pageControl.submitDisable": submitDisable,
                    "pageInfo.submitText": submitText
                  });
                  my.showToast({
                    type: "fail",
                    content: res.message,
                    duration: 3000
                  });
                }
              }).catch(e => {
                this.setData({
                  "pageControl.submitDisable": submitDisable,
                  "pageInfo.submitText": submitText
                });
              });
            } else {
              this.setData({
                "pageControl.submitDisable": submitDisable,
                "pageInfo.submitText": submitText
              });
            }
          }
        });
      } else {
        this.setData({
          "pageControl.submitDisable": submitDisable,
          "pageInfo.submitText": submitText
        });
        my.setStorageSync({
          key: 'pageInfo',
          data: pageInfo,
        });

        my.navigateTo({
          url:
            "../../page/rent/index"
        });
      }

    } catch (e) {
      if (e && e.message) {
        my.showToast({
          type: "fail",
          content: e.message || e,
          duration: 2000
        });
      }
      this.setData({
        "pageControl.submitDisable": submitDisable,
        "pageInfo.submitText": submitText
      })
    }
    conversionBack('110', this.data.goodsId)

  },


















  tofixednum(num) {
    num = num / 100;
    var flag = false;
    if (num.toString().indexOf(".") != -1) {
      flag = true;
      var string = num.toString();
      var length = string.length;
      var str = "";
      var index = string.indexOf(".") + 1;
      for (var i = index; i < length; i++) {
        str += string[i];
      }
      str = "." + str;
    }
    var num = (parseInt(num) || 0).toString(),
      re = /\d{3}$/,
      result = "";
    while (re.test(num)) {
      result = RegExp.lastMatch + result;
      if (num !== RegExp.lastMatch) {
        result = "," + result;
        num = RegExp.leftContext;
      } else {
        num = "";
        break;
      }
    }
    if (num) {
      result = num + result;
    }
    if (flag) {
      return (result = result + str);
    }
    result = result + ".00";
    return result;
  },
  setindex(e) {
    let { index } = e.currentTarget.dataset;
    let { tabIndex } = this.data.pageControl;
    if (index == tabIndex) return;
    tabIndex = index;
    this.setData({
      "pageControl.tabIndex": tabIndex
    });
    this.loder(this.data.goodsId)
    // if (tabIndex == 3) {
    //   this.getComment();
    // }
  },
  setNumber(e) {
    let status = e.currentTarget.dataset.status;
    let minLease = this.data.allData.minLease;
    let maxLease = this.data.allData.maxLease;
    let inputDays = Number(this.data.pageInfo.inputDays);
    if (status == "reduce") {
      // 用户点了减少
      if (inputDays <= minLease) {
        // 如果已经是最少的天数
        my.showToast({
          content: "抱歉，该商品租赁最小天数为 " + minLease + " 天",
          duration: 3000
        });
      } else {
        inputDays--;
        this.setData({
          "pageInfo.inputDays": inputDays
        });
      }
    } else {
      //用户点了增加
      if (inputDays >= maxLease) {
        my.showToast({
          content: "抱歉，该商品租赁最大天数为 " + maxLease + " 天",
          duration: 3000
        });
      } else {
        inputDays++;
        this.setData({
          "pageInfo.inputDays": inputDays
        });
      }
    }
    this.BtnChoose();
  },
  inputDay(e) {
    // 用户输入天数
    let day = e.detail.value;
    this.setData({
      "pageInfo.inputDays": day
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
          my.makePhoneCall({ number: "18185907733" });
        }
      }
    });
  },
  inputEnd() {
    // 输入结束
    let day = this.data.pageInfo.inputDays;
    let minLease = this.data.allData.minLease;
    let maxLease = this.data.allData.maxLease;
    if (day < minLease) {
      my.showToast({
        content: "抱歉，该商品租赁最小天数为 " + minLease + " 天",
        duration: 2000
      });
      this.setData({
        "pageInfo.inputDays": minLease
      });
    }
    if (day > maxLease) {
      my.showToast({
        content: "抱歉，该商品租赁最大天数为 " + maxLease + " 天",
        duration: 2000
      });
      this.setData({
        "pageInfo.inputDays": maxLease
      });
    }
    this.BtnChoose();
  },
  ToHome() {
    // 去主页
    app.globalQuery.goodsId = "";
    my.reLaunch({
      url: "/page/lease/index"
    });
  },

  ToStore() {
    // 去店铺页
    let { merchantId } = this.data.allData;
    if (merchantId) {
      my.navigateTo({
        url: `/page/store/index?merchantId=${merchantId}`
      });
    }
  },
  previewImage(e) {
    let { index, subIndex } = e.currentTarget.dataset;
    let pageInfo = this.data.pageInfo;
    let urls = pageInfo.comment[index].seeCommentImgUrl;
    let current = subIndex;
    my.previewImage({
      current,
      urls
    });
  },
  backToHome() {
    my.navigateBack({
      delta: 1
    });
  },
  onShareAppMessage() {
    let goodsDetail = this.data.pageInfo.detail;
    let id = this.data.goodsId;
    return {
      title: "0押金租" + goodsDetail.title,
      desc: "租数码上择机汇，注册就送388元红包",
      path: "page/detail/index?goodsId=" + id
    };
  }
});
