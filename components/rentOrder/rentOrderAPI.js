import HttpApi from "../../api/lease";

var rentOrderApi = {
    alldata: {},
    // console.log(toThousands(1473))
    loade(orderNumberObj) {
        let _this = this;
        HttpApi.getOrderInfo(orderNumberObj).then((data) => {
            my.hideLoading();
            if (data.code == 200) {
                my.showToast({
                  type: 'success',
                  content: " 确认订单成功",
                  duration: 2000,
                });
                if (data.data != null) {
                    this.alldata = data.data;
                    var userName = this.alldata.name;
                    var userPhone = this.alldata.mobile;
                    userPhone = this.phonechange(userPhone);
                    // userPhone = userPhone
                    var userAddr = this.alldata.house;
                    // orderInfo
                    var goodsDetail = this.alldata.orderInfo.goods;
                    // 商品主标题
                    var goodsName = goodsDetail.name;
                    // 商品副标题
                    var goodsSubTitle = goodsDetail.oldLevelStr;
                    let customLeaseFlag = this.alldata.orderInfo.order.customLease;
                    let rentGroupFlag = this.alldata.orderInfo.goodsSpecificationCombination.rentGroup != "" ? true : false;
                    let rentGroup = [];
                    if (customLeaseFlag && rentGroupFlag) {
                        rentGroup = JSON.parse(this.alldata.orderInfo.goodsSpecificationCombination.rentGroup || '[]');
                    }
                    // goodsSpecificationCombination 此处是为了获取商品规格
                    // order
                    // var goodsRent = this.alldata.orderInfo.goodsSpecificationCombination;
                    // 固定租期的 组合入口 但是自定的话里面的 leaseDay 是不存在的 所以  leaseDay 额外写
                    var goodsRent = this.alldata.orderInfo.goodsSpecificationCombination;
                    var zdyDoodsInfo = this.alldata.orderInfo.order;
                    var goodsRentContent = ""
                    // 1
                    if (goodsRentContent.specificationFirst != "") {
                        // 黑色/海陆空常玩套餐/45 天
                        goodsRentContent = goodsRent.specificationFirst;
                    }
                    // 2
                    if (goodsRent.specificationSecond != "" && goodsRent.specificationFirst != "") {
                        goodsRentContent += "/" + goodsRent.specificationSecond;
                    }
                    // 3
                    if (goodsRent.specificationThird != "" && goodsRent.specificationSecond != "") {
                        goodsRentContent += "/" + goodsRent.specificationThird;
                    }
                    // 4
                    if (goodsRent.specificationFourth != "" && goodsRent.specificationThird != "") {
                        // 黑色/海陆空常玩套餐/45 天
                        goodsRentContent += "/" + goodsRent.specificationFourth;
                    }
                    // 5
                    if (goodsRent.specificationFifth != "" && goodsRent.specificationFourth != "") {
                        // 黑色/海陆空常玩套餐/45 天
                        goodsRentContent += "/" + goodsRent.specificationFifth;
                    }
                    // 6
                    if (goodsRent.specificationSixth != "" && goodsRent.specificationFifth != "") {
                        goodsRentContent += "/" + goodsRent.specificationSixth;
                    }
                    // 现在在 里面 写入当前的 租期
                    if (zdyDoodsInfo.leaseTerm > 0) {
                        goodsRentContent += "/" + zdyDoodsInfo.leaseTerm + "天";
                    }
                    // 因为
                    //  else if (goodsRent.specificationFourth != "") {
                    //     goodsRentContent += "/" + goodsRent.leaseDay + "天"
                    // }
                    // goodsImageSrc 图片的路径
                    // console.log(goodsRentContent);
                    // goodsRent 是要展示的规格;
                    // 首期计算用到的第一期的天数
                    // var goodsFirstDay = goodsDetail.leaseType == "MONTHLY" ? 30 : goodsRent.leaseDay;
                    // 那么租期天数也是需要替换掉的
                    var goodsFirstDay = zdyDoodsInfo.leaseTerm > 30 ? 30 : zdyDoodsInfo.leaseTerm;
                    // 获取 leaseType 是 天还是月
                    var flagMounth = zdyDoodsInfo.leaseType;
                    // 首期应付款 = 首期租金 + 保险金额
                    var accidentInsurance = zdyDoodsInfo.accidentInsurance > 0 ? zdyDoodsInfo.accidentInsurance / 100 : 0;
                    // insuranceflag
                    // accidentInsurance = 0
                    if (accidentInsurance > 0) {
                        this.insuranceflag = true;
                    } else {
                        this.insuranceflag = false;
                    }
                    // console.log('输出保险金额:', accidentInsurance);
                    let goodsDayPay = zdyDoodsInfo.dailyRent || 1;
                    goodsDayPay = goodsDayPay / 100;
                    console.log('输出我要获取的每天的 租金的价格', goodsDayPay);
                    goodsDayPay = new Number(goodsDayPay).toFixed(2);
                    var goodsFirstPay = new Number(goodsDayPay) * new Number(goodsFirstDay);
                    goodsFirstPay = new Number(goodsFirstPay) + new Number(accidentInsurance);
                    // kipe.couponPrice
                    // 要显示的期限
                    let goodsLeaseDay = zdyDoodsInfo.leaseTerm;
                    // accidentInsurance是 保险的金额 租金=所有计算的值加上总租金
                    let goodsAllMoney = new Number(goodsDayPay) * new Number(goodsLeaseDay);
                    goodsAllMoney = new Number(goodsAllMoney) + new Number(accidentInsurance);
                    let couponPrice = this.alldata.bonusPrice / 100 || 0;
                    // 此处声明couponPrice的值 然后 在data里面渲染 下单成功和这里保持一致 这里只是临时做的伪数据
                    // 因为可以通过信用租接口 可以获取到 小程序之前使用的 优惠券的价格 所以只能在这里设置一下价格
                    // 如果未用优惠券 就是 "" 对了 还有一种情况就是 如果 优惠券的价格 远远大于总租金的话 那么就需要 优惠券省的金额 = 总租金 - 1
                    // couponPrice = 48;
                    let ls_couponPrice = 0;
                    // 临时存储 的  couponPrice的值 所以 出现极限情况 就要转换couponPrice的值
                    if (couponPrice > 0) {
                        if (goodsLeaseDay > 30) {
                            if (couponPrice >= goodsFirstPay) {
                                // 现在已经是以元为单位了 如何 优惠券金额 大于 总租金 那么 总租金为1元 优惠券省的金额 = 总租金 -1
                                goodsAllMoney = new Number(goodsAllMoney) - new Number(goodsFirstPay) + 1;
                                ls_couponPrice = goodsFirstPay - 1;
                                goodsFirstPay = "1.00";
                            } else {
                                goodsFirstPay = this.Subtr(goodsFirstPay, couponPrice);
                                goodsAllMoney = this.Subtr(goodsAllMoney, couponPrice);
                                // console.log('输出当前应该获取的首期和总租金:',goodsFirstPay,goodsAllMoney);
                            }
                        } else {
                            if (couponPrice >= goodsFirstPay) {
                                ls_couponPrice = goodsFirstPay - 1;
                                goodsFirstPay = "1.00";
                                goodsAllMoney = goodsFirstPay;
                            } else {
                                goodsFirstPay = this.Subtr(goodsFirstPay, couponPrice);
                                goodsAllMoney = this.Subtr(goodsAllMoney, couponPrice);
                            }
                        }
                        couponPrice = ls_couponPrice > 0 ? new Number(ls_couponPrice).toFixed(2) : new Number(couponPrice).toFixed(2);
                        this.setData({
                            "kipe.couponPrice": couponPrice
                        })
                    } else {
                        couponPrice = "";
                        this.setData({
                            "kipe.couponPrice": couponPrice
                        })
                    }

                    // goodsFirstPay = goodsFirstPay * 100;
                    // console.log("首期应付款:", goodsFirstPay);
                    goodsFirstPay = new Number(goodsFirstPay).toFixed(2);
                    goodsAllMoney = new Number(goodsAllMoney).toFixed(2);
                    // couponPrice
                    // goodsFirstPay = this.tofixednum(goodsFirstPay);
                    // console.log('租金总金额：', goodsAllMoney);
                    // 计算总租金
                    // goodsRent.rent 还是分为单位
                    // console.log('计算乘法的总租金', goodsAllMoney);
                    // 测试使用当前总租金为 0.01
                    // goodsAllMoney = 1;
                    // goodsAllMoney = new Number(goodsAllMoney) * 100;
                    // goodsAllMoney = this.tofixednum(goodsAllMoney);
                    // 保险金额
                    // 目前让总租金 = 计算后的租金 + 保险金额;
                    // 总押金
                    let deposit = parseInt(this.alldata.deposit);
                    // 芝麻信用免的押金
                    let ZMxyDeposit = parseInt(this.alldata.creditAmount);
                    let freezingDeposit = parseInt(this.alldata.freezingDeposit);
                    // 修改芝麻押金做半免和全免的效果
                    // ZMxyDeposit = 9900;
                    // 用户应支付的押金
                    // freezingDeposit = deposit - ZMxyDeposit;
                    let OrderFlagObj = {
                        zfblogoflag: true,
                        depositflag: true,
                        rentToastFlag: true,
                        ZmRentMoneyFlag: true
                    }
                    if (ZMxyDeposit == 0) {
                        // 不免押金所以是 用来判断0 只显示 需冻结押金 押金冻结方式
                        OrderFlagObj.zfblogoflag = false;
                        OrderFlagObj.depositflag = false;
                        OrderFlagObj.ZmRentMoneyFlag = false;
                    } else if (ZMxyDeposit > 0 && ZMxyDeposit < deposit) {
                        // 半免押金 所以用0-deposit 之前的参数在判断
                        // 因为半免无需隐藏内容 默认不做修改
                    } else if (ZMxyDeposit == deposit) {
                        // 全免的押金 逻辑的交互
                        OrderFlagObj.rentToastFlag = false;
                    }
                    this.setData({
                        "kipe.ZmRentMoneyFlag": OrderFlagObj.ZmRentMoneyFlag,
                        "kipe.zfblogoflag": OrderFlagObj.zfblogoflag,
                        "kipe.depositflag": OrderFlagObj.depositflag,
                        "kipe.rentToastFlag": OrderFlagObj.rentToastFlag
                    })
                    // 下面是总押金 芝麻信用免得押金  已经 减免之后的押金的 转换 不能再作为数字使用
                    deposit = this.tofixednum(deposit);
                    ZMxyDeposit = this.tofixednum(ZMxyDeposit);
                    freezingDeposit = this.tofixednum(freezingDeposit);
                    // 每天需要支付的金额
                    accidentInsurance = new Number(accidentInsurance).toFixed(2);
                    // 判断是否显示保险金额
                    // if (goodsDetail.accidentInsurance != 0) {
                    //     this.skuServer.rentPrice = this.tofixednum(goodsDetail.accidentInsurance);
                    //     this.skuServer.contral = true;
                    // } else {
                    //     this.skuServer.contral = false;
                    // }
                    var goodsRentOrder = {
                        title: goodsName,
                        subtitle: "[" + goodsSubTitle + "]",
                        sentName: goodsRentContent,
                        sentPrice: goodsAllMoney,
                    }
                    // console.log(goodsRentOrder);
                    var goodsDetailContent = {
                        rentPrices: goodsFirstPay,
                        rentSentMoney: goodsDayPay,
                        rentSentDate: goodsLeaseDay,
                        flagMounth: flagMounth,
                        rentSentSafe: accidentInsurance,
                        rentSentAllMoney: goodsAllMoney
                    }
                    var goodsZfbPay = {
                        rentPaymoney: deposit,
                        rentZfbRemit: ZMxyDeposit,
                        rentSentMoney: freezingDeposit,
                    }
                    // userName: "",
                    //     userPhone: "",
                    //     userAddr: "",
                    // this.insuranceflag
                    this.setData({
                        "kipe.goodsRentOrder": goodsRentOrder,
                        "kipe.goodsDetailContent": goodsDetailContent,
                        "kipe.goodsZfbPay": goodsZfbPay,
                        "kipe.userName": userName,
                        "kipe.userPhone": userPhone,
                        "kipe.userAddr": userAddr,
                        "kipe.insuranceflag": this.insuranceflag
                    })
                }
                // console.log(data);
            } else if (data.code == 400) {
                my.showToast({
                    type: 'fail',
                    content: "查询信用租订单失败,请重试或联系管理员。",
                    duration: 2000,
                });
                my.reLaunch({
                    url: '../../page/order/orderResultFail/orderResultFail?zm_order_no=' + this.config.zmOrderNo + '&out_order_no=' + this.config.outOrderNo + "&error_msg=" + "查询信用租订单失败,请重试或联系管理员"
                })
            } else {
                my.showToast({
                    type: 'fail',
                    content: "连接服务器失败,请联系客服。",
                    duration: 2000,
                });
                my.navigateTo({
                    url: '/page/lease/index'
                })
            }
        }).catch((data) => {
            my.showToast({
                type: '查询订单失败',
                content: "查询信用租订单失败,请重试或联系管理员。",
                duration: 2000,
            });
            my.reLaunch({
                url: '../../page/order/orderResultFail/orderResultFail?zm_order_no=' + this.config.zmOrderNo + '&out_order_no=' + this.config.outOrderNo + "&error_msg=" + "查询信用租订单失败,请重试或联系管理员"
            })
        })

    },
    phonechange(num) {
        if (num.length == 11) {
            num = num.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
        }
        // console.log(num);
        return num
    },
    tofixednum(num) {
        var num = num / 100;
        num = new Number(num).toFixed(2)
        var flag = false;
        if (num.toString().indexOf(".") != -1) {
            flag = true;
            var string = num.toString();
            var length = string.length;
            var str = '';
            // console.log(string, length);
            var index = string.indexOf(".") + 1;
            for (let i = index; i < length; i++) {
                str += string[i];
            }
            str = "." + str;
            // console.log(str);
        }
        var num = (parseInt(num) || 0).toString(),
            re = /\d{3}$/,
            result = '';
        while (re.test(num)) {
            result = RegExp.lastMatch + result;
            if (num !== RegExp.lastMatch) {
                result = ',' + result;
                num = RegExp.leftContext;
            } else {
                num = '';
                break;
            }
        }
        if (num) {
            result = num + result;
        }
        if (flag) {
            return result = result + str
        }
        result = result + ".00"
        return result;
    },
    //加法 的防止精度丢失
    accAdd(arg1, arg2) {
        var r1, r2, m;
        try {
            r1 = arg1.toString().split(".")[1].length
        } catch (e) {
            r1 = 0
        }
        try {
            r2 = arg2.toString().split(".")[1].length
        } catch (e) {
            r2 = 0
        }
        m = Math.pow(10, Math.max(r1, r2))
        return (arg1 * m + arg2 * m) / m
    },
    // 此方法的调用是为了防止在计算金额的时候的精度丢失 乘法的防精度丢失
    accMul(arg1, arg2) {
        var m = 0,
            s1 = arg1.toString(),
            s2 = arg2.toString();
        try {
            m += s1.split(".")[1].length
        } catch (e) {}
        try {
            m += s2.split(".")[1].length
        } catch (e) {}
        return (Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m)).toFixed(2)
    },
    //减法  防止精度丢失的方法
    Subtr(arg1, arg2) {
        var r1, r2, m, n;
        try {
            r1 = arg1.toString().split(".")[1].length
        } catch (e) {
            r1 = 0
        }
        try {
            r2 = arg2.toString().split(".")[1].length
        } catch (e) {
            r2 = 0
        }
        m = Math.pow(10, Math.max(r1, r2));
        n = (r1 >= r2) ? r1 : r2;
        return ((arg1 * m - arg2 * m) / m).toFixed(n);
    },
}
export default rentOrderApi