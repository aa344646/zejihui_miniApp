import afterService from '/api/afterService.js';
import env from '/util/env';
const app = getApp();
Page({
  data: {
    type:'applyResult',
    list:[],
    pageNum:1,
    pageSize:10,
    hasMore:true,
    buttonText:''
  },
  onLoad: function (options) {

    let { type = 'applyResult',title = '',buttonText=''}= options;  

    switch(type){
      case 'repair' :
        title = '我要维修';
        buttonText = '申请维修';
      break; 
      case 'exchange' :
        title = '我要换货';
        buttonText = '申请换货';
      break;
      case 'return' :
        title = '我要退货';
        buttonText = '申请退货';
      break;
      default :
        title = '售后记录';
        buttonText = '取消申请';
      break;
    }

    my.setNavigationBar({title});

    this.setData({
        type,
        buttonText
    })  
  },
  onShow(){
    this.onPullDownRefresh();
  },
  apply(e){  // 申请

    let type = this.data.type;

    let item = e.currentTarget.dataset.item;

    if(type == 'applyResult'){   // 那就是取消或者寄回了~

      let { serviceOrderId , state } = item;

      if( state == 'pending_check' ){

        this.cancelApply(serviceOrderId);
        
      }else{  // 寄回 跳页面

        app.afterServiceDetail = item;

        my.navigateTo({

          url:`/page/afterService/afterServiceReturn/index`

        })

      }
      
    }else{  

      item.category = type;

      app.afterServiceDetail = item;

      my.navigateTo(
        {
          url:`/page/afterService/afterServiceApply/index`
        }
      )
    }
    
  },
  cancelApply(serviceOrderId){

    my.confirm({

      title: '提示',

      content: '确定取消该订单申请？',

      success:(res)=>{

        if (res.confirm){

          afterService.cancelApply({serviceOrderId}).then(resp => {

            if(resp.code == 200 ){

              my.showToast({
                type: 'success',
                content: "已取消申请",
                duration: 2000,
              })

              this.onPullDownRefresh();
      
            }else if(resp.code == 401){
      
              my.showToast({
                type: 'fail',
                content: "请先登录!",
                duration: 2000,
              })
            }else{

              my.showToast({
                type: 'fail',
                content: resp.message,
                duration: 2000,
              })
      
            }
      
          }).catch(err=>{

            my.showToast({
              type: 'fail',
              content: err,
              duration: 2000,
            })
      
          })
        } 
          
      }
    })

  },
  onPullDownRefresh: function () {
    this.setData({
      pageNum:1,
      hasMore:true,
    });
    this.getList();
    setTimeout(()=>{
      my.stopPullDownRefresh();
    },800);
  },
  
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.getList();
  },

  getList(){
    if(!this.data.hasMore)
    {
      return;
    }
    my.showLoading({
      content:'加载中'
    });
    let type = this.data.type;
    let api = null;
    let params = {
      pageNum: this.data.pageNum,
      pageSize: this.data.pageSize,
      type
    };
    if(type == 'applyResult'){   // 查看售后结果

      api = 'getApplyResult';

    }else{

      api = 'getServiceOrders';

    }
    afterService[api](params).then(resp => {

      if(resp.code == 200 ){

        let list = this.formatList(resp.data.list)

         this.setData({

           list:this.data.pageNum===1?list:[...this.data.list, ...list],
           pageNum:this.data.pageNum+1

         })
         if(list.length<this.data.pageSize)
        {
          this.setData({
            hasMore:false,
          });
        }
         my.hideLoading();

      }else if(resp.code == 401){

        my.showToast({
          type: 'fail',
          content: "请先登录!",
          duration: 2000,
        })
      }else{

        my.hideLoading();

        this.$toast(resp.message)

      }

    }).catch(err=>{

      my.hideLoading();

    })
  },
  goOrderProgress(e)
  {

    let item = e.currentTarget.dataset.item;

    app.afterServiceDetail = item;

    let type = this.data.type;

    if(type === 'applyResult'){   // 跳维修详情

      my.navigateTo({

        url:`/page/afterService/afterServiceDetail/index`

      })

    }else{

      my.navigateTo({

        url:`/page/order/orderDetail/orderDetail?id=${item.orderId}`
        
      })

    }

    
    
  },
  formatList : function(list) {
    if(!list) {
      return [];
    }
    let sysInfo = my.getSystemInfoSync();
    let iw = Math.round(sysInfo.windowWidth * (sysInfo.pixelRatio || 1));
    
    list.forEach(item=>{

      let image = item.image.indexOf('http')===0?item.image:env.image_host+item.image;

      item.goodsImage =  image+app.getImageSuffix(4);
      item.standard = this.skuFormat(item.standard||[]);
    })
    
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

})