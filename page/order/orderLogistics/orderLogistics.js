import order from '/api/order.js';
Page({
  data: {
    logisticsInfo:{
      info:[]
    },
    orderId:'',
    type:''
  },
  onLoad(query) {
    // let id = 5885;
    // let type = 'user';
    let id   = query.id;
    let type = query.type;
    this.setData({
      orderId: id,
      type: type
    });
    this.getLogisticsInfo();
  },
  onPullDownRefresh()
  {
    this.getLogisticsInfo();
  },
  getLogisticsInfo()
  {
    // 判断  用户快递信息/商家快递信息
    let data = {
      channel: this.data.type,
      id: this.data.orderId
      //id: 5951
    }
    order.getLogisticsInfo(data).then(resp => {
      if(resp.code==200){
        let data = resp.data;
        this.setData({
          logisticsInfo: data,
          'logisticsInfo.info': this.dateFormat(data.info)
        });
        my.stopPullDownRefresh();
      } else {
        my.showToast({
          type: 'fail',
          content: resp.message,
          duration: 3000
        });
      }
    }).catch(e=>{
      console.log(e);
    })
  },
  dateFormat(arr) {
    for(let i in arr) {
      arr[i].yymmdd = arr[i].ftime.slice(0,10);
      arr[i].hhmmss = arr[i].ftime.slice(-8,-3);
    }
    return arr;
  },
  handleCopy() {
    my.setClipboard({
      text: this.data.logisticsInfo.expressNo,
      success: () => {
        my.showToast({
          type: 'none',
          content: '已复制' + this.data.logisticsInfo.expressNo,
          duration: 2000,
        });
      },
    });
  }
});
