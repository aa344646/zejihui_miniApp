import service from './fetch.js';

const api = {
  /**
   * 品牌馆
   * */
   brandPavilion:(data)=> {
    return service({
      url: '/taocan/index',
      method: 'get',
      data:data,
    });
  },
};

export default api;
