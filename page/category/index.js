import api from '/api/lease.js';
import env from '/util/env.js';
import util from '/util/util.js';
const app = getApp();
Page({
  data: {
    mainTop: '',
    systemInfo: {},
    pageNum: 1,
    pageSize: 10,
    categoryId:'', //一级类目
    typeId:'', //二级类目
    toL1View:'',
    toL2View:'',
    categoryL2Split: [],
    categoryL1:[],
    currentCate1: {},
    categoryL2:[],
    products: [],
    hasMore:true,
    showContent:false,
    autoplay:true,
    interval:3000,
    duration:1000,
    circular:true,
    recommentList: [],
    recommentBanner: [],
    currBottom: undefined,
    currTop: undefined
  },
  onLoad(options)

  {
    this.getSystemInfo();
    let cid = '';
    if (app.globalQuery.cid) {
      cid = app.globalQuery.cid;
      app.globalQuery.cid = '';
    } else if (app.cid) {
      cid = app.cid;

      app.cid = '';
    } else if (options.cid) {
      cid = options.cid;

    }
    let tid = '';
    if (app.globalQuery.tid) {
      tid = app.globalQuery.tid;
      app.globalQuery.tid = '';
    } else if (app.tid) {
      tid = app.tid;
      app.tid = '';
    } else if (options.tid) {
      tid = options.tid;
    }
    this.setData({
      categoryId: cid,
      typeId: tid
    }, () => {
      this.getCategoryL1();
    })
  },
  modelSearch (e) {
    const item = e.target.dataset.item;
    my.navigateTo({
      // 跳转订单失败页面
      url: `/page/search/search?type=model&id=${item.id}`
  })
    
  },
  toSearch(){
    my.navigateTo({
        // 跳转订单失败页面
        url: '/page/search/search'
    })
  },
  splitArray(N,Q){  // 分隔数组 一页展示五个
    var R = [],F;
    for (F = 0;F < Q.length;) R.push(Q.slice(F,F += N))
    return R
  },
  getSystemInfo() {
    const systemInfo = my.getSystemInfoSync();
    const mainTop = (systemInfo.titleBarHeight + systemInfo.statusBarHeight + ((systemInfo.windowWidth)/750)*180) + 'px';
    this.setData({
      systemInfo,
      mainTop
    })
  },
  onPullDownRefresh()
  {
    this.getCategoryL1();
    setTimeout(()=>{
       my.stopPullDownRefresh();
    },800);
  },
  getCategoryL1()
  {
    let cid = this.data.categoryId;
    api.getGoodsCategory().then(resp=>{
      if(resp.code == 200)
      {
        let data = resp.data || [];
        data.forEach( item => {
          item.src = item.wechatIcon || item.icon; //没有zimaIcon字段则先赋值
          item.src = item.src.indexOf('http') === 0?item.src:env.image_host+item.src;
          item.src = item.src;
        })
       
        if (!cid) {
          // 进来后没有带cid 获取推荐数据
          cid = 1;
          this.getRecommend();
          this.setData({
            categoryL1: data,
            currBottom: data[0],
            categoryId: cid || '', 
            toL1View:'category' + cid,
            // currentCate1: find
          });
        } else {
          // 进来后有cid 获取对应cid的三级数据
          this.getGoodsType(cid);
          const findIndex = data.find(item => {
            // 找到cid 对应的数据  展示他的banner
            item.id == cid;
          })
          this.setData({
            currTop: data[findIndex-1],
            currBottom: data[findIndex+1],
            categoryL1: data,
            categoryId: cid || '', 
            toL1View:'category' + cid,
            currentCate1: data[findIndex]
          });
        }
      }
      else
      {
        my.showToast({
          type: 'fail',
          content: resp.message,
          duration: 3000,
        });
      }
      
    }).catch(err=>{
      console.error(err);
    });
  },
  open () {
    this.setData({
      open: !this.data.open
    })
  },
  async getGoodsType (cid) {
    let typeId = this.data.typeId;
    try {
      const res = await api.getGoodsType({
        id: cid
      });
      if (res.code == 200) {
        const categoryL2 = res.data || [];
        if (!typeId && categoryL2.length) {
          typeId = categoryL2[0].id || '';
        }
        this.setData({
          categoryL2,
          typeId: typeId || '', 
          toL2View:'typeId' + typeId,
          pageNum:1,
          hasMore:true,
        }, () => {
          this.getProducts();
        })
      }else {
        my.showToast({
          type: 'fail',
          content: res.message,
          duration: 3000,
        });
      }
    }catch(e) {
      my.showToast({
        type: 'fail',
        content: e,
        duration: 3000,
      });
    }
  },
  getProducts()
  {
    my.showLoading({
      content:'加载中'
    });
    setTimeout(()=>{
      my.hideLoading();
    },1000);
    let data = {
      typeId:this.data.typeId
    };
    api.getGoodsModel(data).then(resp=>{
      if(resp.code == 200)
      {
        let list = resp.data || [];
        let sysInfo = my.getSystemInfoSync();
        let iw = Math.round(sysInfo.windowWidth * (sysInfo.pixelRatio || 1)/2.5);
        let oss_process = '?x-oss-process=image/resize,m_lfit,w_' + iw + ',limit_1/format,jpg/sharpen,100/interlace,1/quality,q_95';
  
        list.forEach(item=>{
          if(item.icon.indexOf('http') == 0)
          {
            item.icon = item.icon + oss_process;
          }
          else
          {
            item.icon = env.image_host + item.icon + oss_process;
          }
        });
        
        this.setData({
          products:list
        });
        this.setData({
          toL2View:'typeId' + this.data.typeId
        });
      }
      else
      {
        my.showToast({
          type: 'fail',
          content: resp.message,
          duration: 3000,
        });
      }
  
      my.hideLoading();
      
    }).catch(err=>{
      console.error(err);
      my.hideLoading();
  
    });
  },
  modelClick (e) {
    
  },
  goodsClick(e)
  {
    let id = e.target.dataset.gid;
    my.navigateTo({
      url: '/page/detail/index?goodsId=' + id
    });
  },
  categoryClick(e)
  {
    const dataset = e.target.dataset;

    if (dataset.cid == 1) {
      this.setData({
        categoryId: dataset.cid,
        currBottom: this.data.categoryL1[0],
        currTop: {}
      })
      console.warn({
        currTop: this.data.currTop
      })
      if (!this.data.recommentList.length) {
        this.getRecommend();
      }
      return;
    }
    if (dataset.cid) {
      // 一级分类点击
      const id = dataset.cid;
      if(id == this.data.categoryId)
      {
        return;
      }
      this.setData({
        currBottom: dataset.btm?dataset.btm:{},
        currTop:dataset.index == 0?{id:1}:dataset.tp?dataset.tp:{},
        categoryId: id,
        pageNum:1,
        hasMore:true,
        showContent:false,
        typeId: '',
        currentCate1: dataset.item
      }, () => {
        this.getGoodsType(id);
      })

    }else {
      // 二级分类点击
      const id = dataset.tid;
      if(id == this.data.typeId)
      {
        return;
      }
      this.setData({
        typeId: id,
        pageNum:1,
        hasMore:true,
        showContent:false,
      }, () => {
        this.getProducts();
      })
    }
  },
  async getRecommend() {
    try{
      const resp = await api.getRecommend();
      const recommendList = resp.data;
      for (let i = 0;i<recommendList.length;i++) {
        const item = recommendList[i];
        if (item.goodsItemVOs) {
          for (let k = 0;k<item.goodsItemVOs.length;k++) {
            const subItem = item.goodsItemVOs[k];
            subItem.imgPro = subItem.imgFull[0].url.indexOf('http') === 0?subItem.imgFull[0].url:env.image_host+subItem.imgFull[0].url;
            subItem.imgPro = subItem.imgPro + app.getImageSuffix(3);
          }
        }
      }
      this.setData({
        recommentList: recommendList[0].goodsItemVOs,
        recommentBanner: recommendList[0].bannerList
      },() => {
        console.warn({
          recommentList: this.data.recommentList
        })
      })
      
    }catch(err){
      throw new Error(err.message || err);
    }
  },
  bannerClick(e){
    console.warn({
      e
    })

    let item = e.target.dataset.item;

    let type = item.type;

    console.warn(type);

    if (type === 'popularize') {
      let id = item.dataId || '';
      my.navigateTo({
        url: '/page/mapArea/index?id=' + id
      });
    } else if(type === 'goods')
    {
      let id = item.dataId || '';
      my.navigateTo({
        url: '/page/detail/index?goodsId=' + id
      });
    }else if(type === 'goodsList'){
      let id = item.dataId;
      if(id){
        my.navigateTo({
          url:`/page/lease/collect/index?collectId=${id}`
        })
      }
    }else if(type === 'activity')
    {
      let url = item.linkUrl || '';
      // if(url.indexOf('newUserTemplate')>-1){  // 收藏有礼活动
      //   let path = `pages/index/index?appId=2018122562686742&page=pages/index/index&originAppId=2021002189690874&newUserTemplate=20190107000000104987`;
      //   my.navigateToMiniProgram({
      //     appId: '2018122562686742',
      //     path,
      //   }); 
      // }else 
      if(url.indexOf('alipays://')===0) //跳转到app目前也是activity类型
      {
        let appId = util.getQueryString(url,'appId');
        let page = util.getQueryString(url,'page') || '';
        let encodeExtraData = util.getQueryString(url,'query') ||'';
        
        let extraData = {};
        //解析参数，封装成对象
        if(encodeExtraData)
        {
          let paramStr = decodeURIComponent(encodeExtraData);
          let queryArr = paramStr.split("&") || [];
          queryArr.forEach(item=>
          {
            let key = item.split("=")[0];
            let value = item.split("=")[1];
            extraData[key] = value;
          });
        }
        my.uma.trackEvent('navigateToMiniProgram',{
          _appId_: appId,
          _path_: page,
          _extraData_:JSON.stringify(extraData)
        });
        my.navigateToMiniProgram({
          appId: appId,
          path: page,
          extraData:extraData,
          success: (res) => {
          },
        });
      }else if(url.indexOf('target=self')>-1){   // 微信小程序要跳转自己的领券页面
        let page =  util.getQueryString(url,'page') || '';
        my.navigateTo({
          url:page
        })
      }else
      {
        my.navigateTo({
          url: '/page/webView/index?url=' + encodeURIComponent(url)
        });
      }
      
    }else if(type === 'alipayLink'){
      my.ap.navigateToAlipayPage({
        path:item.linkUrl
      })
    }
    
  },
});
