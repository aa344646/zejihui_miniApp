const app = getApp();
import leaseApi from '/api/lease.js';
import env from '/util/env.js';
Page({
  data: {
    title:'', //集合页名字
    id:'', //集合页id
    img:'', //集合页图片
    list:[],
    pageSize: 10,
    pageNum: 1,
    hasMore: false,
    empty:false,
    pageData: {}
  },
  onLoad(options){
    let id = null;
    if (app.globalQuery.collectId) {
      id = app.globalQuery.collectId;
      app.globalQuery.collectId = '';
    } else if (options.collectId) {
      id = options.collectId;
    } 
    this.setData({
        id
    });
    if(id)
    {
      this.getData();
    }
  },
  onPullDownRefresh: function () {
  
    this.setData({
      pageNum:1,
      hasMore:true,
    });
    this.getData();
    setTimeout(()=>{
      my.stopPullDownRefresh();
    },800);
  },
  onReachBottom: function () {
    if(this.data.hasMore)
    {
      this.getData();
    }
  },
  getData()
  {
    if(this.data.pageNum===1)
    {
      my.showLoading({
        content:'加载中'
      });
    }
  
    let params = {
      id:this.data.id,
      pageNum:this.data.pageNum,
      pageSize:this.data.pageSize,
    };
  
    leaseApi.getCollectGoods(params).then(resp=>{
      if(resp.code===200)
      {
        let data = resp.data || {};
        
        if(!data.id)
        {
          my.showToast({
            type: 'fail',
            content: '商品列表不存在',
            duration: 3000,
          });
          this.setData({
            empty:true
          });
        }
        else
        {
          this.setData({
            empty:false
          });
        }
        
        let currentPageNum = this.data.pageNum;
        if(currentPageNum===1)
        {
          let sysInfo = my.getSystemInfoSync();
          let iw = Math.round(sysInfo.windowWidth * (sysInfo.pixelRatio || 1));
          let img = data.imgUrl?data.imgFull+app.getImageSuffix():'';
  
          this.setData({
            title:data.gatherPageName,
            img:img,
          });
          
          my.setNavigationBar({
            title:data.gatherPageName
          });
        }
        
        let list = data.pageInfo.list || [];
        this.processList(list);
        if (data.notes) {
          data.notes = data.notes.split('#');
        }
        if (data.explanation) {
          data.explanation = data.explanation.split('#');
        }
        this.setData({
          list:currentPageNum===1?list:this.data.list.concat(list),
          pageNum:currentPageNum+1,
          hasMore:list.length>=this.data.pageSize,
          pageData: data
        });
        if(currentPageNum===1)
        {
          my.pageScrollTo({
            scrollTop:0,
            duration:0
          });
        }
        
      }
      else
      {
        my.showToast({
          type: 'fail',
          content:resp.message,
          duration: 3000,
        });
      }
    
      my.hideLoading();
    
    }).catch(err=>{
      my.showToast({
        type: 'fail',
        content:err,
        duration: 3000,
      });
    })
  },
  processList(list)
  {
    if(!list)
    {
      return;
    }
    
    list.forEach(item=>{
      let src = [];
      let imgs = item.imgFull || [];
  
      imgs.forEach((img)=>{
        if(img.url.indexOf('http') === 0)
        {
          src.push(img.url);
        }
        else
        {
          src.push(env.image_host + img.url);
        }
      });
      item.src = src;
    });
    
  },
  onShareAppMessage() {
    let id = this.data.id;
    let title = this.data.title;
    return {
      title: title,
      desc: "快来看看吧~",
      path: "/page/lease/collect/index?collectId=" + id
    };
  }
});
