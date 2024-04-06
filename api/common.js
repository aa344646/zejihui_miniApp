import service from './fetch.js';

/*公共接口*/

const commonApi = {
  // 获取收获地址
  getAddress: () => {
    return service({
      url: `/userContacts`,
      method: 'GET',
    })
  },
  //删除收货地址接口
  getAddressRemove: (data) => {
    return service({
      url: '/userContacts/' + data.id,
      data: data,
      method: 'DELETE',
    })
  },
  //新增收货地址接口
  addAddress: (data) => {
    return service({
      url: '/userContacts',
      data: data,
      method: 'POST',
    })
  },
  //编辑收货地址接口
  editAddress: (data) => {
    return service({
      url: '/userContacts/update/' + data.id,
      data: data,
      method: 'POST',
    })
  },
  //编辑收货地址接口
  getConfig: (code) => {
    return service({
      url: `/config/${code}`,
      method: 'get',
    })
  }
};

export default commonApi;