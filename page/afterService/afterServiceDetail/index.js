import env from '/util/env';
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {

    type:'progress',
    afterServiceDetail:{}

  },

  /**
   * 生命周期函数--监听页面加载
   */
   /**
   *  @function abc()
   *  @argument (current,page,size)
   *  
   *  @onLoad
   */
  onLoad: function (options) {

    let afterServiceDetail = this.formatImg(app.afterServiceDetail);

    let { category } = afterServiceDetail;

    let title = '';

    switch(category){
      case 'repair' :
        title = '维修详情';
      break; 
      case 'exchange' :
        title = '换货详情';
      break;
      case 'return' :
        title = '退货详情';
      break;
    }
    my.setNavigationBar({title});

    this.setData({

      afterServiceDetail

    })


  },
  formatImg(afterServiceDetail){

    let sysInfo = my.getSystemInfoSync();

    let iw = Math.round(sysInfo.windowWidth * (sysInfo.pixelRatio || 1));

    afterServiceDetail.images = [];

    afterServiceDetail.seeImages = [];

    afterServiceDetail.imgJsonArray.forEach(item=>{

      let image = item.url.indexOf('http')===0?item.url:env.image_host+item.url;

      afterServiceDetail.images.push(image+app.getImageSuffix(4))
      afterServiceDetail.seeImages.push(image);
    })
    return afterServiceDetail;
  },
  changeTab(e){

    let type = e.currentTarget.dataset.type;

    if(type == this.data.type){

      return;

    }

    this.setData({

      type

    })

  },
  copy(){
    my.setClipboard({
      text: this.data.afterServiceDetail.serviceOrderNumber,
      success:(res) => {
          my.showToast({
            type: 'none',
            content: '复制成功',
            duration: 2000,
          });
      }
    })
  },
  toOrderDetail(){

    let { orderId } = this.data.afterServiceDetail;

    my.navigateTo({

      url:`/page/order/orderDetail/orderDetail?id=${orderId}`

    })

  },
  previewImg(e){
    let index=e.currentTarget.dataset.index;
    let { seeImages } = this.data.afterServiceDetail;
    my.previewImage({
      current: index,
      urls:seeImages
    });
  },
})