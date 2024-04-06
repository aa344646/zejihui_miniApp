import service from './fetch.js';

const api = {
  /**
   * 严选
   * */
   cherryPick:(data)=> {
    return service({
      url: '/miniProgram/cherryPick',
      method: 'get',
      data:data,
    });
  },
};

export default api;
