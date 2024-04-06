Page({
  data: {
    goNext: 0,
    radioValue: false,
    over:false, // 完成签名
  },
  onLoad() { },
  goNextStep() {
    console.log(this.data.goNext,">>>>>>>>>>");
    if (this.data.goNext === 0 && this.data.radioValue === true) {
      this.setData({
        goNext: 1,
        radioValue:false
      })
    }else if (this.data.goNext === 1 && this.data.radioValue === true) {
      this.setData({
        goNext: 2
      })
    }
  },
  // 跳转签约手写版
  goSian(){
    my.navigateTo({
      url: '../signUp/signUp'
    });
  },
  handleRadioValue() {
    console.log(">>>>>>>>.")
    this.setData({
      radioValue: !this.data.radioValue
    })
  }
});
