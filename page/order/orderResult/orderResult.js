import leaseApi from "../../../api/lease";
import { conversionBack } from "../../../util/common";
Page({
  data: {
    LogoimageSrc: "/image/assign/logo.png",
    ZfblogoimageSrc: "/image/assign/zfblogo2.png",
    
    deposit:0, //总押金
    creditAmount:0, //芝麻信用押金
    freezingDeposit:0, //冻结的押金
  
    cost:0, //总租金
    dailyRent:0, //日租金
    leaseDay:0, //租期
    bonusPrice:0,//优惠券
    accidentInsurance:0,//保险金额
    
    error:false,
    errorMsg:'',
    showPage:true,
    buyoutMoney:'',
  },
  onLoad(query) {
    conversionBack('104');

    // let zmOrderNo = query.zmOrderNo;
    // let outOrderNo = query.outOrderNo;
    // //let zmOrderNo = "2018081600001001098431124512";
    // //let outOrderNo = "2018081616482203196";
    
    // let orderNumberObj = {
    //   zmOrderNo: zmOrderNo,
    //   outOrderNo: outOrderNo
    // };
    
    // this.getOrderResult(orderNumberObj);
  
    
    // let buyoutMoney = my.getStorageSync({
    //   key: 'buyoutMoney',
    // }).data;
  
    // this.setData({
    //   'buyoutMoney': buyoutMoney || '',
    // });
    
  },
  
  getOrderResult(orderNumberObj)
  {
    
    leaseApi.getOrderInfo(orderNumberObj).then((resp) =>
    {
      console.log("输出获取的账单信息", JSON.stringify(resp||{}));
       
      if (resp.code === 200)
      {
        let data = resp.data || {};
        
        let deposit = data.deposit || 0;
        let creditAmount = data.creditAmount || 0;
        let freezingDeposit = data.freezingDeposit || 0;
        let bonusPrice = data.bonusPrice || 0;
        
        let orderInfo = data.orderInfo || {};
        let order = orderInfo.order || {};
        
        let dailyRent = order.dailyRent || 0;
        let leaseDay = order.leaseTerm || 0;
        let accidentInsurance = order.accidentInsurance || 0;
        let cost = order.cost || leaseDay*dailyRent;
  
        this.setData({
          deposit: this.parsePrice(deposit),
          creditAmount:this.parsePrice(creditAmount),
          freezingDeposit:this.parsePrice(freezingDeposit),
          bonusPrice:this.parsePrice(bonusPrice),
          cost:this.parsePrice(cost),
          dailyRent:this.parsePrice(dailyRent),
          accidentInsurance:this.parsePrice(accidentInsurance),
          leaseDay:leaseDay,
        });
        
      }
      else
      {
        my.showToast({
          type: 'fail',
          content: resp.message,
          duration: 2000,
        });
        
        this.setData({
          error: true,
          errorMsg:resp.message
        })
      }
  
      this.setData({
        showPage:true,
      });
      
    }).catch(res => {
      
      my.showToast({
        type: 'fail',
        content: res,
        duration: 2000,
      });
      
      this.setData({
        showPage:true,
        error: true,
        errorMsg:'网络异常，请稍后再试'
      });
    });
    
  },
  parsePrice(price)
  {
    if(!price)
    {
      return '0.00';
    }
    else
    {
      let p = parseFloat(price);
      return (p/100).toFixed(2);
    }
  },
  //跳转到首页
  backTop() {
    my.reLaunch({
      url: "/page/lease/index"
    })
  },
  //跳转到首页
  gotoorder() {
    my.reLaunch({
      url: "../orderList/orderList"
    })
  },
});