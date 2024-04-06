import service from './fetch.js';

const api = {
  // 获取首页数据
  getMiniProgram: () => {
    return service({
      url: '/miniProgram',
      method: 'GET',
    })
  },
  // 获取首页数据
  newIndex: () => {
    return service({
      url: '/miniProgram/newIndex',
      method: 'GET',
    })
  },
  //首页分类
  getHomeCategory: () => {
    return service({
      url: '/goods/home/list',
      method: 'GET',
    })
  },
  // 获取首页活动数据
  getMiniProgramActivity: () => {
    return service({
      url: '/miniProgram/activity',
      method: 'GET',
    })
  },
  // 获取红包数据
  getRedCouponData: (params) => {
    return service({
      url: '/merchantsActivitie/list',
      method: 'post',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      },
      data: {
        ...params
      }
    })
  },
  // 活动领取咨询接口
  getValidationReceive: (params) => {
    return service({
      url: '/merchantsActivitie/validationReceive',
      method: 'post',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      },
      data: {
        ...params
      }
    })
  },
  //   我的- 优惠劵----查询用户商家券列表
  queryRedCouponData: (params) => {
    return service({
      url: '/merchantsActivitie/selectUserMa',
      method: 'post',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      },
      data: {
        ...params,
      }
    })
  },
  // 下单前----查询用户商家劵列表
  selectCouponData: (params) => {
    return service({
      url: '/merchantsActivitie/selectOrderUserMa',
      method: 'post',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      },
      data: {
        ...params
      }
    })
  },

  // 
  // getIndex: () => {
  //     return service({
  //         url: '/miniProgram/index', method: 'get'
  //     });
  // },
  getGoodsCategory: () => {
    return service({
      url: '/goods/category/list', method: 'get'
    });
  },
  getGoodsType: data => {
    return service({
      url: '/goods/type/' + data.id, method: 'get'
    });
  },
  getGoodsModel: data => {
    if (!data.typeId) { return };
    return service({
      url: '/goods/model/' + data.typeId, method: 'get',
      data
    });
  },
  getCategoryGoods: (data) => {
    return service({
      url: 'goods/searchList', method: 'get', data: data
    });
  },
  getDetail: function (id) {
    return service({
      url: `/goods/${id}/`, method: 'get', data: {
        version: 2
      }
    })
  },
  getOrderNumber: function (params) {
    return service({
      url: 'order/preRent', method: 'post', data: params,
    })
  },
  deductionSign: function (orderNumber) {
    return service({
      url: `order/deductionSign/${orderNumber}`, method: 'get'
    })
  },
  getOrderInfo: function (params) {
    return service({
      url: '/order/getZhimaMerchantOrderInfo/' + params.outOrderNo + "/",
      method: 'get',
      data: params,
    })
  },
  getOrderRent: function (params) {
    return service({
      url: `/order/getZhimaMerchantOrderInfo/${params}`, method: 'get'
    })
  },
  getGoodsParameters: function (params) {
    return service({
      url: `goods/parameters/group`,
      method: 'get', data: params
    })
  },
  getLeaseAgreement: function (params) {
    return service({
      url: `common/ismtAgmtToView`,
      method: 'get'
    })
  },
  getCoupon(goodsId, price) { //获取过滤的优惠券/获取过滤的优惠券
    return service({
      url: "/user/bonus/" + goodsId + "/unused",
      method: 'get',
      data: price
    })
  },
  getAllCoupon(type, pageNS) {
    // /user/bonus/{tab}/list
    return service({
      url: "/user/bonus/" + type + "/list",
      method: 'get',
      data: pageNS
    })
  },

  getCaptcha(phone) {
    // /getCaptcha 获取图片验证码的图片
    return service({
      url: "/getCaptcha",
      method: 'get',
      data: phone
    })
  },
  getSendCode(data) {
    return service({
      url: "/sendCode",
      method: 'get',
      data: data
    })
  },
  getBindUser(data) {
    return service({
      url: "/bindUser",
      method: 'post',
      data: data
    })
  },
  goodsPricePostFrom(data) {
    //通过提交参数获取sku价格信息 因为李栋做了 data JSON格式的限制
    return service({
      url: "/goods/goodsPricePostFrom",
      method: 'post',
      data: data
    })
  },
  getCollectGoods: (data) => {
    return service({
      url: '/miniProgram/listGoods/' + data.id,
      method: 'GET',
      data: data
    })
  },
  getGoodsCommentList(data) { // 获取评价列表
    return service({
      url: "/comments/goodsCommentList/" + data.goodsId,
      method: 'get',
      data: data
    })
  },
  uploadFlag(type, goods_Id = '') {  //  上传埋点

    // const channel = getApp().globalQuery.channel || '';
    const channel =   my.getStorageSync({
      key: 'channel',
    }).data|| ''; 
    console.log(channel,">>>>>>>>>>>flag");
    const params = {
      type,
      channel,
      appid: '2021002189690874',
      orderNumber: '',
      goodsId: goods_Id
    }
    return service({
      url: `/dh/20221205dy888`,
      method: "post",
      data: { ...params },
      headers: {
        'Content-Type': 'application/json'
      }
    })
  },
  realname(data) { // 实名认证
    return service({
      url: "/user/realname/",
      method: 'post',
      data: data
    })
  },
  realStatus(data) { // 获取实名认证状态
    return service({
      url: "/user/realStatus/",
      method: 'get',
      data: data
    })
  },
  idCardUpload(data) { // 上传实名认证图片
    return service({
      url: "/user/idCardUpload/" + data.type,
      method: 'post',
      data: data
    })
  },
  realSubmit(data) { // 上传实名认证图片
    return service({
      url: "/user/realSubmit/",
      method: 'post',
      data
    })
  },
  bindAuthUser(data) { // 授权绑定
    return service({
      url: "/bindAuthUser/",
      method: 'post',
      data
    })
  },
  faceStatus(data) { // 获取人脸状态
    return service({
      url: "/user/faceStatus/",
      method: 'get',
      data
    })
  },
  faceInit() { // 获取人脸参数
    return service({
      url: "/user/face/init/",
      method: 'post'
    })
  },
  faceCertify(data) { // 获取人脸结果
    return service({
      url: "/user/face/certify/",
      method: 'post',
      data
    })
  },
  popularize(data) { // 获取热区详情
    return service({
      url: `/popularize/${data.id}`,
      method: 'get'
    })
  },
  getPopularize() { // 获豆腐块
    return service({
      url: `/miniProgram/newIndex/popularize`,
      method: 'get'
    })
  },
  getListGoods() { // 中部列表
    return service({
      url: `/miniProgram/newIndex/listGoods`,
      method: 'get'
    })
  },
  getRecommend() { // 中部列表
    return service({
      url: `/miniProgram/newIndex/recommendList`,
      method: 'get'
    })
  },
};

export default api;