Page({
  data: {
    renewal:{
      pic:'/image/order/renewalTip.jpg',
      title:'什么是续租？',
      desc:'续租是择机汇平台为用户想持续性使用商品推出的一个功能',
      processPic:'/image/order/renewalProcess.png',
      buttonText:'申请续租'

    },
    buyOut:{
      pic:'/image/order/buyout.png',
      title:'什么是买断？',
      desc:'买断是择机汇平台为用户想永久性拥有商品推出的一个功能',
      processPic:'/image/order/buyOutProcess.png',
      buttonText:'申请买断'
      
    },
    status:0, //  0 续租 1 买断
    current:{},
    hideTip:false   // false 显示 // true 不显示
  },
  onLoad: function (options) {
    let { status = 0 } = options;
    my.setNavigationBar({
      title: status==0?'续租':'买断'
    })
    let current = status == 0?this.data.renewal:this.data.buyOut;
    this.setData({
      current,
      status
    })
  },
  controlTipShow(){
    let hideTip = !this.data.hideTip;
    this.setData({
      hideTip
    })
  },
  toList(){
    let hideTip = this.data.hideTip;
    let status = this.data.status;
    if(status==0){
      my.setStorageSync({key:'hideRenewalTip',data:true})
    }else{
      my.setStorageSync({key:'hideBuyoutTip',data:true})
    }
    my.navigateTo({
      url:'/page/order/reletBuyOut/list/index?status='+this.data.status
    })
  }
})