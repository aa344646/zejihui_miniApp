import service from './fetch.js';

/*售后模块*/

const afterServiceApi = {
  // 获取售后列表
  getServiceOrders: (data) => {
    return service({
      url: `/serviceOrders/${data.type}/canApplyList`,
      data: data,
      method: 'GET',
    })
  },
  //  订单是否有保险
  getBuyInsurance: (data) => {
    return service({
      url: `/serviceOrders/isBuyInsurance/${data.id}`,
      method: "GET"
    })
  },
  // 申请维权
  applyRepair: (data) => {
    return service({
      url: `/serviceOrders/applyRepair/${data.orderId}`,
      method: "POST",
      data
    })
  },
  // 申请换货
  applyExchange: (data) => {
    return service({
      url: `/serviceOrders/applyExchange/${data.orderId}`,
      method: "POST",
      data
    })
  },
  // 申请退货
  applyReturn: (data) => {
    return service({
      url: `/serviceOrders/applyReturn/${data.orderId}`,
      method: "POST",
      data
    })
  },
  // 获取申请结果页 也就是售后
  getApplyResult: (data) => {
    return service({
      url: `/serviceOrders/applyResultList`,
      method: "GET",
      data
    })
  },
  // 取消申请
  cancelApply: (data) => {
    return service({
      url: `/serviceOrders/cancelApply/${data.serviceOrderId}`,
      method: "POST",
      data
    })
  },
  // 获取商家信息
  getToSend: (data) => {
    return service({
      url: `/serviceOrders/toSends/${data.serviceOrderId}`,
      method: "GET",
      data
    })
  },
  getAddress:()=>{ // 获取用户收货地址
    return service({
        url:'/userContacts',
        method:'get',
    })
  },
  editAddress: (data) => { // 修改收货地址
    return service({
      url: '/userContacts/' + data.id,
      data: data,
      method: 'POST',
    })
  },
  // 获取物流列表
  getLogisticsCompany:()=>{
      return service({
          url:'/logistics/company/list',
          method:"GET"
      })
  },
  // 申请发货
  applySendGoods: (data) => {
    return service({
      url: `/serviceOrders/sends/${data.serviceOrderId}`,
      method: "POST",
      data
    })
  },

  
};

export default afterServiceApi;