import service from './fetch.js';
const order = {
  // getOrderList: (data) => {        // 订单列表
  //   return service({
  //     url: `/order/${data.orderType}/list`,
  //     method: 'get',
  //     data: data
  //   });
  // },
  getOrderList: (data) => {        // 订单列表
    return service({
      url: `/order/${data.orderType}/mylist`,
      method: 'get',
      data: data
    });
  },
  getOrderDetail: (orderId) => { // 订单详情
    return service({
      url: '/order/' + orderId,
      method: 'get'
    });
  },
  getComment: (data) => {
    return service({
      url: `/comments/detail/${data.orderId}`,
      method: 'GET',
      data: data
    })
  },
  comment: (data) => { // 评论订单
    return service({
      url: `/comments/comment/${data.orderId}`,
      method: 'POST',
      data: data
    })
  },
  getLogisticsInfo: (data) => {   // 物流信息
    return service({
      url: '/order/logisticsInfo/' + data.channel + '/' + data.id,
      method: 'get'
    });
  },
  getLogisticsCompany: () => {  // 物流公司列表
    return service({
      url: '/logistics/company/list',
      method: 'get'
    });
  },
  goodsBack: (data) => {  // 退还商品
    return service({
      url: '/order/goodsBack/' + data.id,
      method: 'post',
      data: data
    });
  },
  confirmReceipt: (id) => {  // 确认收货
    return service({
      url: '/order/confirmReceipt/' + id,
      method: 'post'
    });
  },
  cancelOrder: (data) => {  // 取消订单
    return service({
      url: '/order/cancelLeaseOrder/' + data.id,
      method: 'post',
      data: data
    });
  },
  revokeCancel: (id) => {  // 取消订单
    return service({
      url: `/order/${id}/revokeCancel`,
      method: 'post'
    });
  },

  // 续租列表
  otherRenewalList: (data) => {
    return service({
      url: '/order/relet/' + data.type + '/list',
      data: data,
      method: 'GET',
    });
  },
  // 买断列表
  otherBuyOutList: (data) => {
    return service({
      url: '/order/buyout/' + data.type + '/list',
      data: data,
      method: 'GET',
    });
  },
  // 去续租信息
  getToReletInfo: (data) => {
    return service({
      url: '/order/toRelet/' + data.id,
      data: data,
      method: 'GET',
    });
  },
  // 申请续租
  applyRelet: (data) => {
    return service({
      url: `/order/${data.id}/relet`,
      data: data,
      method: 'POST',
    });
  },
  // 取消申请续租
  cancelApplyRelet: (data) => {
    return service({
      url: `/order/relet/${data.id}/cancel`,
      data: data,
      method: 'POST',
    });
  },
  // 已申请续租信息
  getReletDetail: (data) => {
    return service({
      url: `/order/relet/${data.id}`,
      data: data,
      method: 'GET',
    });
  },
  // 去买断信息
  getToBuyoutInfo: (data) => {
    return service({
      url: '/order/toBuyout/' + data.id,
      data: data,
      method: 'GET',
    });
  },
  // 申请买断
  applyBuyout: (data) => {
    return service({
      url: `/order/${data.id}/buyout`,
      data: data,
      method: 'POST',
    });
  },
  // 已申请买断信息  
  getBuyoutDetail: (data) => {
    return service({
      url: `/order/buyout/${data.id}`,
      data: data,
      method: 'GET',
    });
  },
  // 取消申请买断
  cancelApplyBuyout: (data) => {
    return service({
      url: `/order/buyout/${data.id}/cancel`,
      data: data,
      method: 'POST',
    });
  },
  //    支付详情 /order/toPay/{id}
  detailPay: (data) => {
    return service({
      url: `/order/toPay/${data.id}`,
      method: "GET",
      data: data
    })
  },
  paymentPay(orderId) {  // 续租支付
    return service({
      url: "/order/payment/alipay/" + orderId,
      method: "post"
    })
  },
  buyoutPay(orderId) {  // 买断支付
    return service({
      url: "/order/buyout/payment/alipay/" + orderId,
      method: "post"
    })
  },
  //    赔偿支付 /order/compensate/payment/{payType}/:id
  compensatePay: (orderId) => {
    return service({
      url: `/order/compensate/payment/alipay/${orderId}`,
      method: "POST"
    })
  },
  //    账期支付 /order/bill/payment/alipay/:id
  /*
  *
  * */
  billPay: (orderId) => {
    return service({
      url: `/order/bill/payment/alipay/${orderId}`,
      method: "POST"
    })
  },
  //    用户拒绝赔偿 申请 /order/refuseCompensate/:id
  refuseCompensate: (data) => {
    return service({
      url: `/order/refuseCompensate/${data.id}`,
      method: "POST",
      data: data
    })
  },
  //    用户拒绝赔偿 详情和进度 /order/proofInfo/:id
  refuseCompensateDetail: (data) => {
    return service({
      url: `/order/proofInfo/${data.id}`,
      method: "GET",
      data: data
    })
  },
  orderSign: (data) => {
    return service({
      url: `/order/sign/${data.id}`,
      method: "POST"
    })
  },
}

export default order;