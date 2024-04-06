// 订单追踪
import orderApi from '/api/order.js';
import env from '/util/env.js';
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: '',
    viewShow:false,
    emptyShow:false,
    data:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    let { id = 0 , status = 0 } = options;

    this.setData({

      id,
      status

    });

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.onPullDownRefresh();
  },
  onPullDownRefresh: function () {
    this.getorderProgress('pullDown');
  
    setTimeout(()=>{
      my.stopPullDownRefresh();
    },1000);
  },
  formatData(data) { 

    if(!data) {

      return {};

    }
    let sysInfo = my.getSystemInfoSync();

    let iw = Math.round(sysInfo.windowWidth * (sysInfo.pixelRatio || 1));

    let image = data.image.indexOf('http')===0?data.image:env.image_host + data.image;

    data.goodsImage = image+app.getImageSuffix(4);

    data.standard = this.skuFormat(data.standard||[]);

    return data;

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
  // 获取物流信息 
  getorderProgress(pullDown){

      let { id , status} = this.data;

      let api = status == 0?orderApi.getReletDetail:orderApi.getBuyoutDetail;
      
      api({id}).then(resp=>{

        if(resp.code==200){

            let { data = {} } = resp;

            data = this.formatData(data)

            this.setData({

                viewShow:true,

                data
            })

            my.hideLoading();

            if(pullDown == 'pullDown'){
                setTimeout(()=>{
                    my.hideNavigationBarLoading();
                    my.stopPullDownRefresh();
                },1000)
            }

        }else{
            my.showToast({
              type:'fail',
              content: resp.message,
              duration: 2000,
            })

            this.setData({

                emptyShow:true
            })

            my.hideLoading();

        }


    }).catch(
        err=>{
            my.hideLoading();
            my.showToast({
              type:'fail',
              content: err,
              duration: 2000,
            })
            this.setData({
                emptyShow:true
            })
        }
       
    );


  },
  concatOrder(e){

    let { id = 0 } = e.currentTarget.dataset;

    if(id){
      my.navigateTo({
        url:`/page/order/orderDetail/orderDetail?id=${id}`
      })
    }
  },
})