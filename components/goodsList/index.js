// component/goodsList/index.js
Component({
  /**
   * 组件的属性列表
   */
  props: {
      list:{
        type:Array,
          value(){
          return []
          }
      },
      col:{
        type:Number,
          value:1,
      },
      showOldPrice:{
          type:Boolean,
          value:false,
      },
      darkBg:false,
      fromMerchant:{
          type:Boolean,
          value:false,
      }
  },

  /**
   * 组件的初始数据
   */
  data: {
    width:Math.round(my.getSystemInfoSync().windowWidth * (my.getSystemInfoSync().pixelRatio || 1)/2)
  },

  /**
   * 组件的方法列表
   */

  methods: {
      toStore(e){
          my.navigateTo({
              url:"/pages/merchant/store/store?merchantId="+e.currentTarget.dataset.id
          })
      },
      goodsClick(e){
          my.navigateTo({
              url:"/page/detail/index?goodsId="+e.currentTarget.dataset.id
          })
      }
  }
})
