import env from '/util/env.js';

let service = (config) => {
  return new Promise((resolve, reject) => {
    // httpRequest
    // request
    my.httpRequest({
      headers: {
        'Content-Type': (config.headers && config.headers['Content-Type']) || "application/x-www-form-urlencoded",
        "Cache-Control": (config.headers && config.headers['Cache-Control']) || "no-cache",
        'token':my.getStorageSync({key: 'token'}).data || 'null',
        'App-Id': '2021002189690874'
      },
      url:env.api_host + (config.url.indexOf('/') == '0' ? config.url.substr(1) : config.url),
      method: config.method,
      data: {'_t': new Date().getTime(),'token':my.getStorageSync({key:'token'}).data,...config.data},
      dataType: 'json',
      success: function (res) {
        resolve(res.data);
      },
      fail: function (res) {
        reject(res);
      },
      complete: function (res) {
      }
    });
  });
};

export default service;
