import HTTPRequest from '/api/lease.js';
import WxParse from "../../../components/wxParse/wxParse.js";
Page({
  data: {
  },
  onLoad() {
    this.getLeaseData()
    my.setNavigationBar({
      title: '用户租赁及服务协议'
    });
  },
  getLeaseData(){
    HTTPRequest.getLeaseAgreement().then((data)=>{
      if (data.code == 200) {
        
        let htmlStr = data.data || '';
        // 展示富文本
        WxParse.wxParse('htmlStr', 'html', htmlStr, this, 5);
      }
    }).catch((data)=>{
      my.showToast({
        ype: 'fail',
        content: '获取数据失败,请重试',
        duration: 2000
      })
    })
  }
});
