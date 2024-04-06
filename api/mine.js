import service from './fetch.js';

const api = {
  /**
   * 登录
   * authCode：支付宝授权码
   * */

  login:(data)=> {
    return service({
      url: '/login',
      method: 'post',
      data:data,
    });
  },
  userinfo:(data)=> {
    return service({
      url: '/user/info/',
      method: 'get',
      data:data,
    });
  },
  userDataInfo:()=> {
    return service({
      url: '/user/dataInfo',
      method: 'get'
    });
  },
  queryCityList:(data)=> {
    return service({
      url: `/unicom/queryCityList?type=${data}`,
      method: 'get'
    });
  },
  getPhoneNumberList:data=> {
    return service({
      url: '/unicom/getPhoneNumberList',
      method: 'get',
      data
    });
  },
  submitOrder:data=> {
    return service({
      url: '/unicom/submitOrder',
      method: 'post',
      data
    });
  },
  unicomMain:(data) => {
    return service({
      url: `/unicom/main?type=${data}`,
      method: 'get',
    });
  },
};

export default api;
