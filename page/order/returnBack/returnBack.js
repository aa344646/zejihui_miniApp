import order from '/api/order.js';
import {skuFormat} from '/util/format.js';
import env from '/util/env.js';
Page({
  data: {
    goodsId:'',
    goodsInfo:{
      orderReturnMerchantInfoBean: {}
    },

    deliveryFlag:false, 
    returnModeIndex:0,
    returnDeliveryIndex:null,
    returnMode:['快递归还'],
    returnDelivery:[],
    inputValue:'',      // 物流单号
    deliveryValue:'',  // 选择的物流公司
    deliveryId:'',  // 选择的物流公司id
    finished:false,    // 表单是否填完
  },
  onLoad(query) {
    let id = query.id;
   //  let id = 5885
    this.setData({
      goodsId: id
    });
    this.getOrderDetail();
    this.getLogisticsCompany();
  },
  getOrderDetail() {        // 获取商品详情
    let id = this.data.goodsId;
    order.getOrderDetail(id).then(resp => { 
      if(resp.code == 200) {
        let data = resp.data;
        let goodsInfo = this.formatGoodsInfo(data);
        let phone = goodsInfo.orderReturnMerchantInfoBean.phone;
        this.setData({
          goodsInfo: goodsInfo,
        });
      }
    }).catch(e => {
      console.log(e)
    });
  },
  getLogisticsCompany() {   // 获取物流公司列表
    order.getLogisticsCompany().then(resp => {   
      if(resp.code == 200) {
        let data = resp.data;
        this.setData({
          returnDelivery: data
        });
      }
    }).catch(e=>{
      console.log(e);
    });
  },
  formatGoodsInfo(obj) {
    obj.specification = skuFormat(obj.specification);
    obj.image = env.image_host + obj.image;
    return obj;
  },
  returnDeliveryChange(e) {
    let _this = this;
    this.setData({
      returnDeliveryIndex: e.detail.value,
      deliveryValue: _this.data.returnDelivery[e.detail.value].name,
      deliveryId: _this.data.returnDelivery[e.detail.value].id,
      deliveryFlag:true
    });  
    if(this.data.inputValue&&this.data.deliveryValue)  {
      this.setData({
        finished: true
      }); 
    }
    this.isFinished();
  },
  inputChange(e) {
    if(e.target.tagName == 'input') {
      this.setData({
        inputValue: e.detail.value
      }); 
    }
    this.isFinished();
  },
  isFinished() {
    if(this.data.inputValue&&this.data.deliveryValue)  {
      this.setData({
        finished: true
      }); 
    } else {
      this.setData({
        finished: false
      }); 
    }
  },
  confirm() {
    if(!this.data.finished) {
      return;
    } 
    let _this = this;
    my.confirm({
      title: '确认归还',
      content: '请核对物流单号以免产生逾期费用，归还后请耐心等待商家收货验货并保持电话畅通',
      confirmButtonText: '确定',
      cancelButtonText:  '取消',
      success: (result) => {
        if(result.confirm) {
          let data = {
            id: _this.data.goodsId,
            logisticsCompany: _this.data.deliveryId,
            logisticsNo: _this.data.inputValue
          }
          order.goodsBack(data).then(resp => {   
            if(resp.code == 200) {
              my.showToast({
                type: 'success',
                content: '操作成功',
                duration: 2000
              });
              // 跳转至订单详情页
              setTimeout(function() {
                let id = _this.data.goodsId;
                my.navigateTo({
                  url: '../orderDetail/orderDetail?id='+id
                });
              },1000);
            } else {
              my.showToast({
                type: 'fail',
                content: resp.message,
                duration: 2000
              });
            }
          }).catch(e=>{
            console.log(e);
          });
        }
      },
    });
  }
});
