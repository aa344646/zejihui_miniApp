// pages/order/orderPay/orderPay.js
import orderApi from "/api/order";
import util from '/util/util.js';
Page({
  
  /**
   * 页面的初始数据
   */
  data: {
    payType: '',
    orderId: '',
    payInfo: {},//支付信息
    viewShow: false,
    emptyShow: false,
    disable:false   //支付按钮 防止多次触发
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    my.showLoading({
      title: '请稍候'
    })
    let {orderId, payType} = options;
    if (orderId && payType)
    {
      this.setData({
        orderId,
        payType
        
      })
      this.getPayDetail();
    } else
    {
      my.hideLoading();
      this.setData({
        emptyShow: true
      })
    }
  },
  getPayDetail()
  {
    //支付详情
    orderApi.detailPay({id: this.data.orderId}).then(resp => {
      if (resp.code === 200)
      {
        let payInfo = resp.data || {};
        this.setData({
          payInfo
        });
        my.hideLoading();
        this.computedPrice();
        this.setData({
          viewShow: true
        })
      }else{
        my.hideLoading();
        my.showToast({
          type:'fail',
          content: resp.message,
          duration: 2000,
        })
      }
    }).catch(err => {
      my.hideLoading();
      my.showToast({
        type:'fail',
        content: err,
        duration: 2000,
      })
    })
  },
  computedPrice()
  {
    let payType = this.data.payType;
    let payInfo = this.data.payInfo;
    let showPrice = 0;  // 用户最终要付的金额
    let accidentInsurance = payInfo.accidentInsurance;
    let couponPrice = payInfo.userBonusPrice;
    switch(payType){
      case 'payment':   // 首期
        showPrice = payInfo.dailyRent * payInfo.currentPeriodDays + payInfo.accessoriesAmount+payInfo.accidentInsurance - couponPrice;
        showPrice += (payInfo.state == 'pending_pay' && payInfo.deposit) ? payInfo.deposit : 0;
        showPrice = showPrice > 0 ? showPrice : 0;
        break;
      case 'bill':  // 账期
        let orderBillPaymentDetailBean = payInfo.orderBillPaymentDetailBean || {};
        //逾期
        let delayAmount = orderBillPaymentDetailBean.delayAmount || 0;
        showPrice = payInfo.rent + delayAmount;
        break;
      case 'relet':   // 续租
        showPrice = payInfo.rent+payInfo.accidentInsurance;
        break;
      case 'BuyOut':   // 买断
        showPrice = payInfo.orderBuyoutPaymentDetailBean.buyoutMoney;
        break;
      case 'compensate':   // 赔偿
        showPrice = payInfo.orderCompensatePaymentDetailBean.compensateAmount;
        break;
    }
    
    this.setData({
      showPrice
    })
  },
  pay()
  {
    let disable = this.data.disable;
    if(disable){  // true   禁用
      my.alert({
        content: '请勿重复点击!'
      });
      return;
    }
    this.setData({
      disable:true
    })
    my.showLoading({
      content:'请稍候'
    })
    let payType = this.data.payType;
    let fun = null;
    if(payType == 'compensate'){
      fun = orderApi.compensatePay;
    }else if(payType=='relet' || payType=='payment'){ // 续租和app待支付 都是首期
      fun = orderApi.paymentPay;
    }else if(payType=='BuyOut'){
      fun = orderApi.buyoutPay;
    }else if(payType=='bill'){
      fun = orderApi.billPay;
    }
    fun(this.data.orderId).then(resp => {
      if (resp.code === 200)
      {
        let data = resp.data;
        this.callAliPay(data);
      }
      else
      {
        this.setData({
          disable:false
        })
        my.hideLoading();
        my.showToast({
          type:'fail',
          content: resp.message,
          duration: 2000,
        })
      }
      
    }).catch(
      err => {
        this.setData({
          disable:false
        })
        my.hideLoading();
        my.showToast({
          type:'fail',
          content: err,
          duration: 2000,
        })
      }
    );
  },
  callAliPay(data)
  {
    let _this = this;
    
    my.tradePay({
      tradeNO: data,  
      success: function(res) {
        console.log(res);
        let success = false;
        my.hideLoading();
        let result = '';
        switch(res.resultCode){
          case "9000" :
            result = '订单支付成功!';
            success = true;
            break;
          case "4000" :
            result = '订单支付失败!';
            break;
          case "6001":
            result = '用户中途取消!';
            break;
          case "6002":
            result = '网络连接出错!';
            break;
          default :
            result = '订单支付失败!';
            break;
        }
        my.alert({
          content:result
        })
        if(success){  // 订单支付成功  跳转  // 支付成功按钮依然禁用
          setTimeout(()=>{
            my.redirectTo({
              url:'/page/order/orderList/orderList'
            })
          },2000)
        }else{  // 支付失败按钮可用
          _this.setData({
            disable:false
          })
        }
      },
      fail: function(res) {
        my.alert({
          content: JSON.stringify(res)
        });
      },
    });
  }
});