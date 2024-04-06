
const app = getApp();
Page({
    data: {
        options:[
            {
              name:'我要维修',
              type:'repair',
              image:'/image/afterService/maintain.png'
            },
            {
              name:'我要换货',
              type:'exchange',
              image:'/image/afterService/exchange.png'
            },
            {
              name:'我要退货',
              type:'return',
              image:'/image/afterService/return.png'
            },
            {
              name:'售后记录',
              type:'applyResult',
              image:'/image/afterService/sale.png'
            }
          ]
    },
    toSaleAfterList(e){
        let type = e.currentTarget.dataset.type;
        my.navigateTo({
          url:`/page/afterService/afterServiceList/index?type=${type}`
        })
      },
});