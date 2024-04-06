import order from '/api/order.js';
import {dateFormat,skuFormat,priceFormat} from '/util/format.js';
import env from '/util/env.js';
Page({
  data: {
    goodsId:'',
    goodsInfo:{
      xinyongzuDepositBean: null
    },
    paymentInfo:[],
    hasPaid:'',
    remainPaid:''
  },
  onLoad(query) {
   let id = query.id;
   // let id = 5888;
    this.setData({
      goodsId: id
    });
    this.getOrderDetail();
  },
  onPullDownRefresh() {   
    this.getOrderDetail();
    setTimeout(()=>{
       my.stopPullDownRefresh();
    },800);
  },  
  getOrderDetail() {
    let goodsId = this.data.goodsId;
    order.getOrderDetail(goodsId).then(resp => {
      if(resp.code == 200) {
        let data = resp.data;
        let goodsInfo = this.formatGoodsInfo(data);
        let paymentInfo = this.formatPaymentInfo(data.orderPaymentBeanList);
        this.setData({
          goodsInfo: goodsInfo, 
          paymentInfo: paymentInfo 
        });
      } else {
        my.showToast({
          type: 'fail',
          content: resp.message,
          duration: 3000
        });
      }
    }).catch(e=>{
      console.log(e);
    });
  },
  formatGoodsInfo(obj) {
    obj.specification = skuFormat(obj.specification);
    obj.image = env.image_host + obj.image;
    obj.price = priceFormat(obj.price);
    return obj;
  },
  formatPaymentInfo(list) {
    let hasPaid = 0,remainPaid =0;
    const paidList = [], waitingList = [];
    for(let i in list) {
      list[i].paidAmount1 = parseInt(list[i].paidAmount/100);
      list[i].paidAmount2 = priceFormat(list[i].paidAmount,'fixed');
      list[i].totalAmount1 = parseInt(list[i].totalAmount/100);
      list[i].totalAmount2 = priceFormat(list[i].totalAmount,'fixed');
      list[i].billStartTime = dateFormat(list[i].billStartTime,2);
      list[i].paidTime = dateFormat(list[i].paidTime,2);
      if(list[i].paymentState == 'paid') {
        hasPaid += list[i].paidAmount;
        paidList.push(list[i]);
      } else if(list[i].paymentState == 'waiting') {
        remainPaid += list[i].totalAmount;
        waitingList.push(list[i]);
      }
    }
    this.setData({
      hasPaid: priceFormat(hasPaid),
      remainPaid: priceFormat(remainPaid)
    });
    
    return waitingList.concat(paidList);
  }
});
