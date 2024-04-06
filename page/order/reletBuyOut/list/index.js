import orderApi from '/api/order.js';
import env from '/util/env.js';
import util from '/util/util.js';
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    renewal:[
      {name:'可申请',type:'appliable'},  // 可申请
      {name:'已申请',type:'applied'}, // 已申请
    ],
    buyOut:[
      {name:'可申请',type:'appliable'},  // 可申请
      {name:'已申请',type:'applied'}, // 已申请
    ],
    current:[],
    type:'appliable', //订单类型
    list:[],
    pageNum:1,
    pageSize:10,
    hasMore:true,
    status:0  //  0 续租 1 买断
  },
  /**
   * 生命周期函数--监听页面加载
   */
  
  onLoad: function (options) {
    let { status = 0 } = options;
    my.setNavigationBar({
      title: status==0?'续租订单':'买断订单'
    })
    this.setData({
      status,
      current:status==0?this.data.renewal:this.data.buyOut
    })
  },
  onShow(){
    this.onPullDownRefresh();
  },
  pay(e){
    let type = e.currentTarget.dataset.type || '';
    let id = e.currentTarget.dataset.id || '';

    my.navigateTo({
      url:"/page/order/orderPay/index?orderId="+id+'&payType='+type
    });
  },
  apply(e){  // 申请续租
    let id = e.currentTarget.dataset.id;
    let status = this.data.status;
    if(id){
      my.navigateTo(
        {
          url:`/page/order/reletBuyOut/apply/index?id=${id}&status=${status}`
        }
      )
    }
  },
  cancelApply(e){  //取消

    let id = e.currentTarget.dataset.id;

    let status = this.data.status;

    let context = '';

    let api = null;

    if(status == 0){  // 取消续租

      context = '续租'

      api = orderApi.cancelApplyRelet;

    }else{
      context = '买断'

      api = orderApi.cancelApplyBuyout;
    }
    let that = this;
    my.confirm({
      title: '提示',
      content: `确定取消${context}吗？`,
      success:(res)=> {
        if (res.confirm) {
          api({id})
            .then(resp=>{
              if(resp.code===200)
              {
                my.showToast({
                  type: 'success',
                  content: resp.data,
                  duration: 2000,
                })
                setTimeout(()=>{
                  that.onPullDownRefresh();
                },1000)
              }else if(resp.code===401)
              {
                my.showToast({
                  type:'fail',
                  content: '请先登录!',
                  duration: 2000,
                })
              }
              else
              {
                my.showToast({
                  type:'fail',
                  content: resp.message,
                  duration: 2000,
                })
              }
            })
            .catch(err=>{
              my.showToast({
                type:'fail',
                content: err,
                duration: 2000,
              })
            })
        }
      }
    });

  },
  /**
   * 获取订单列表
   */
  getOrders()
  {
    if(!this.data.hasMore) return;
    my.showLoading({content:'加载中'});
    let params = {
      pageNum: this.data.pageNum,
      pageSize: this.data.pageSize,
      type: this.data.type
    };
    let status = this.data.status;
    let api = status==0?orderApi.otherRenewalList:orderApi.otherBuyOutList;
    api(params).then(resp=>{
      if(resp.code===200)
      {
        let data = resp.data || {};
        let list = this.formatList(data.list || []);
        this.setData({
          list:this.data.pageNum===1?list:[...this.data.list, ...list],
          pageNum:this.data.pageNum+1,
        });
        if(list.length<this.data.pageSize)
        {
          this.setData({
            hasMore:false,
          });
        }
      }
      else if(resp.code===401)
      {
        my.showToast({
          type:'fail',
          content: '请先登录!',
          duration: 2000,
        })
      }
      else
      {
        my.showToast({
          type:'fail',
          content: resp.message,
          duration: 2000,
        })
      }
  
      my.hideLoading();
      
    }).catch(err=>{
      my.showToast({
        type:'fail',
        content: err,
        duration: 2000,
      })
      my.hideLoading();
    });
  },
  formatList : function(list) {
    if(!list) {
      return [];
    }
    let sysInfo = my.getSystemInfoSync();
    let iw = Math.round(sysInfo.windowWidth * (sysInfo.pixelRatio || 1));
    for (let i = 0; i < list.length; i++)
    {
      let image = list[i].image.indexOf('http')===0?list[i].image:env.image_host + list[i].image;
      list[i].goodsImage = image+app.getImageSuffix(4);
      list[i].standard = this.skuFormat(list[i].standard||[]);
      list[i].time = util.formatTime(new Date(list[i].createTime),{jsonMode:'through'})
    }
    return list;
  },
  skuFormat: function(list) {
    list = list || [];
    let skus = [];
    for (let i = 0; i < list.length; i++)
    {
      skus.push(list[i].name || '-');
    }
    return skus.join(' | ');
  },
  // 格式化商品价格
  formatPrice(price) {
    if (!price || isNaN(price))
    {
      return '0.00';
    }
    else
    {
      return parseFloat(price / 100).toFixed(2);
    }
  },
  onPullDownRefresh: function () {
    this.setData({
      pageNum:1,
      hasMore:true,
    });
    this.getOrders();
    setTimeout(()=>{
      my.stopPullDownRefresh();
    },800);
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.getOrders();
  },
  changeTab(e)
  {
    let type = e.currentTarget.dataset.type || this.data.type;
    if(this.data.type==type){
      return;
    }
    this.setData({
      type:type,
      pageNum:1,
      hasMore:true
    });
    this.getOrders();
  },
  goOrderProgress(e)
  {

    let item = e.currentTarget.dataset.item;

    let status = this.data.status;

    let type = this.data.type;

    let { id } = item;

    if(type == 'applied'){

      my.navigateTo({

        url:`/page/order/reletBuyOut/orderProgress/index?id=${id}&status=${status}`
        
      })

    }else{

      my.navigateTo({

        url:`/page/order/orderDetail/orderDetail?id=${id}`
        
      })

    }
    
    
  },
});