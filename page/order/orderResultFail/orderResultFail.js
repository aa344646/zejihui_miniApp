Page({
  data: {
    error_msg: "",
    LogoimageSrc: "/image/assign/logo.png"
  },
  onLoad(query) {
    var zmOrderNo = query.zm_order_no;
    var outOrderNo = query.out_order_no;
    var error_msg = query.error_msg;
    this.config = {
      outOrderNo: outOrderNo,
      zmOrderNo: zmOrderNo
    }
    if (error_msg != "") {
      this.setData({
        "error_msg": error_msg
      })
    }else{
      this.setData({
        "error_msg": "异常错误,请联系客服!"
      })
    }

  },
  reset() {
    // console.log('重试输出的订单号:',this.config.zmOrderNo,this.config.outOrderNo);
    my.reLaunch({
      url: '../../rent/index?zmOrderNo=' + this.config.zmOrderNo + '&outOrderNo=' + this.config.outOrderNo
    })
  }
});