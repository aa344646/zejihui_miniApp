const app = getApp();
let aniSetInterval = null;
import env from '/util/env.js';
import merchantApi from '/api/merchant.js';
import shopbg from '../../image/base64/shopBG.js';
Page({
  data: {
    animationData:'',
    merchantCouponList:[],
    viewShow:false,
    activeTab: 'a',
    swiper: {
      autoplay: true,
      interval: 5000,
      duration: 800,
      circular: true,
      index:0,
    },
    bannerList: [],
    hot: {},//热门
    newly: {},//新品上架
    list: [],//全部商品
    orderByTime: true,
    priceUp: false,//升序
    scroll_top: 0,//滚动条位置
    gudingdingwei: false,//tab定位
    paixudingwei: false,//排序的固定定位
    storeHeight: 0,//tab以上的高度
    hasMore: true,
    merchantId: '',
    isCollected: false,
    hide: true,
    pageNum: 1,
    pageSize: 10,
    top: 0,//全部商品的滚动条
    scrollHeight: 0,//全部商品的高度
    merchantInfo: {},
    shareImg:'',
    goodsListWpHeight:0
  },
  onLoad(options)
  {
    if (options.scene)
    {
      let getQueryString = {};
      let strs = decodeURIComponent(options.scene).split('&'); //以&分割
      //取得全部并赋值
      for (let i = 0; i < strs.length; i++)
      {
        getQueryString[strs[i].split('=')[0]] = unescape(strs[i].split('=')[1])
      }
      //&是我们定义的参数链接方式
      let merchantId = getQueryString['merchantId'] || 0;
      //其他逻辑处理。。。。。
      this.setData({
        merchantId: merchantId || 0,
        // saas:true,
      });
      app.merchantId = merchantId;
    }
    else if(app.merchantId)
    {
      this.setData({
        merchantId: app.merchantId,
        // saas:true,
      });
    }
    else
    {
      this.setData({
        merchantId: options.merchantId || '0',
        // saas:false,
      });
    }
    this.init();
  },
  init()
  {
    my.showLoading(
      {
        content:'加载中...'
      }
    );
    this.getStoreInfo().then(()=>{
      this.setData({
        viewShow:true
      });
      this.getStoreContent();
      this.getAllProducts();
      this.setPageHeight();
      my.hideLoading();
    }).catch(err=>{
    });

  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function ()
  {
    this.init();
    setTimeout(()=>{
      my.stopPullDownRefresh();
    },800);
  },
  onShareAppMessage: function (res) {
    return {
      title:this.data.merchantInfo.shopName,
      desc: this.data.merchantInfo.slogan || `报告！发现一家超火爆的租赁店铺`,
      path:  '/page/store/index?merchantId=' + this.data.merchantId,
      imageUrl: this.data.shareImg
    }
  },
  getStoreInfo()
  {
    return new Promise((resolve,reject)=>{
      merchantApi.storeInfo({id: this.data.merchantId})
        .then(resp => {
          if (resp.code === 200)
          {
            let data = resp.data || {};
        
            let sysInfo = my.getSystemInfoSync();
            let iw = Math.round(sysInfo.windowWidth * (sysInfo.pixelRatio || 1));
        
            if (data.backgroundPicture)
            {
              let backgroundPicture = data.backgroundPicture.indexOf('http') === 0?data.backgroundPicture:env.image_host + data.backgroundPicture;
          
              data.backgroundPicture = backgroundPicture + app.getImageSuffix();
          
            }
            else
            {
              data.backgroundPicture = shopbg;
            }
            if (data.shopLogo && !data.shopLogo.endsWith('/null'))
            {
              let shopLogo = data.shopLogo.indexOf('http') === 0?data.shopLogo:env.image_host + data.shopLogo;
              data.shopLogo = shopLogo + app.getImageSuffix(3);
          
              this.setData({
                shareImg:shopLogo + app.getImageSuffix()
              });
          
            }
            else
            {   // 什么智障代码???
              // data.shopLogo = shopLogo;
            }
            data.merchantId = this.data.merchantId;
            this.setData({
              merchantInfo: data
            });
            resolve();
          }
          else
          {
            my.showToast({
              type: 'fail',
              content: resp.message,
              duration: 3000
            });
          }
        }).catch(err => {
          my.showToast({
            type: 'fail',
            content: err,
            duration: 3000
          });
        })
    });
  },
  getStoreContent()
  {
    merchantApi.storeContent({id: this.data.merchantId}).then(resp => {
     
      if (resp.code === 200)
      {
        let sysInfo = my.getSystemInfoSync();
        let iw = Math.round(sysInfo.windowWidth * (sysInfo.pixelRatio || 1));
        
        let data = resp.data || {};
        let bannerList = data.bannerList || [];
        bannerList.forEach(item => {
          if (item.imgUrl.indexOf('http') === 0)
          {
            item.src = item.imgUrl;
          }
          else
          {
            item.src = env.image_host + item.imgUrl;
          }
          
          item.src += app.getImageSuffix();
          
        });
        
        let hot = data.hot || {};
        if(hot.goodsList&&hot.goodsList.length){
          hot.goodsList = hot.goodsList.slice(0, 6);
          hot.goodsList.forEach(item => {
            if (item.img.indexOf('http') === 0)
            {
              item.src = item.img;
            }
            else
            {
              item.src = env.image_host + item.img;
            }
    
            item.src += app.getImageSuffix(3)
            
          });
        }
        let newly = data.newly || {};
        if(newly.goodsList&&newly.goodsList.length){
          newly.goodsList = newly.goodsList.slice(0, 20);
          newly.goodsList.forEach(item => {
            if (item.img.indexOf('http') === 0)
            {
              item.src = [].concat(item.img);
            }
            else
            {
              item.src = [].concat(env.image_host + item.img);
            }
          });
        }
        
        this.setData({
          bannerList: bannerList,
          newly: newly,
          hot: hot
        });
      }
      else
      {
        my.showToast({
          type: 'fail',
          content: resp.message,
          duration: 3000
        });
      }
    }).catch(err => {
      my.showToast({
        type: 'fail',
        content: err,
        duration: 3000
      });
    });
    
  },
  // 获取全部商品
  getAllProducts()
  {
    this.setData({
      hasMore: true,
      pageNum: 1,
      orderByTime: true,
      priceUp: false,
    });
    this.loadMore();
  },
  loadMore()
  {
    if (!this.data.hasMore) return;
    this.setData({
      hide: false
    });
    my.showLoading({content:'加载中...'});
    //封装搜索过程
    let data = {
      merchantId: this.data.merchantId,
      pageSize: this.data.pageSize,
      pageNum: this.data.pageNum,
      "orderBy": this.data.orderByTime ? 'putaway_time' : 'display_rent',
      "desc": this.data.orderByTime ? true : this.data.priceUp,
    };
    merchantApi.search(data).then(resp => {
      if (resp.code === 200)
      {
        let data = resp.data.list || [];
        data.forEach(item => {
          let src = [];
          let imgs = item.imgUrl || [];
          
          imgs.forEach((img) => {
            if (img.url.indexOf('http') === 0)
            {
              src.push(img.url);
            }
            else
            {
              src.push(env.image_host + img.url);
            }
          });
          item.src = src;
          
          //    处理店铺名称 过长的中间显示省略号
          if (item.shopName.length > 8)
          {
            item.shopNameEnd = item.shopName.substr(item.shopName.length - 2, 2)
          }
        });
        
        if (data.length < this.data.pageSize)
        {
          this.setData({
            hasMore: false,
          });
        }
        this.setData({
          list: this.data.pageNum === 1 ? data : [...this.data.list, ...data],
          pageNum: this.data.pageNum + 1,
          hide: true
        });
        my.hideLoading();
      }
    })
  },
  tabClick(e)
  {
    if(e){
      let name = e.currentTarget.dataset.name;
      this.setData({
        activeTab: name,
      });
      if(name!='b')return;
    }
    let {goodsListWpHeight} = this.data;
    if(goodsListWpHeight)return;
    const that = this;
    //创建节点选择器
    my.createSelectorQuery()
    .select('.goodslist-wp')
    .boundingClientRect()
    .exec((ret) => {
      let top = ret[0].top;
      let scrollHeight = that.data.scrollHeight;
      let goodsListWpHeight = scrollHeight - top;
      that.setData({
        goodsListWpHeight:goodsListWpHeight
        
      })
    });
  },
  //banner切换
  swiperChange(e)
  {
    let index = e.detail.current;
    this.setData({
      'swiper.index':index
    });
  },
  //下拉刷新
  topLoad(e)
  {
    this.loadMore();
  },
  //上拉加载
  lower(e)
  {
    this.loadMore();
  },
  setOrderByTime()
  {
    // 时间
    if (!this.data.orderByTime)
    {
      this.setData({
        hasMore: true,
        orderByTime: !this.data.orderByTime,
        pageNum: 1,
        top: 0,
      });
      this.loadMore();
    }
  },
  setOrderByPrice()
  {
    //价格
    if (this.data.orderByTime)
    {
      this.setData({
        hasMore: true,
        orderByTime: !this.data.orderByTime,
        priceUp: false,
        pageNum: 1,
        top: 0,
      });
    }
    else
    {
      this.setData({
        hasMore: true,
        priceUp: !this.data.priceUp,
        pageNum: 1,
        top: 0,
      })
    }
    this.loadMore();
  },
  //回到顶部
  bakToTop()
  {
    var _top = this.data.scroll_top;//发现设置scroll-top值不能和上一次的值一样，否则无效，所以这里加了个判断
    if (_top == 1)
    {
      _top = 0;
    } else
    {
      _top = 1;
    }
    this.setData({
      scroll_top: _top
    });
  },
  // 搜索店内商品
  toSearch()
  {
    my.navigateTo({
      url: "/page/search/search?merchantId=" + this.data.merchantId
    })
  },
  //客服
  callPhone()
  {
    if(this.data.merchantInfo && this.data.merchantInfo.shopPhone){
      
      let phone = this.data.merchantInfo.shopPhone || '';
      if(phone){
        my.makePhoneCall({
          number: phone.split(',')[0]
        })
      }
    }else{
      my.showToast({
        content: '抱歉! 暂无此商户联系方式!',
        duration: 3000
      });
    }
  },
  toAll()
  {
    this.setData({
      activeTab: 'b',
    });
    this.tabClick();
    this.bakToTop();
  },
  //获取头部高度
  setPageHeight()
  {
    const that = this;
    //创建节点选择器
    my.createSelectorQuery()
    .select('.store-header')
    .boundingClientRect()
    .exec((ret) => {
      that.setData({
        storeHeight: ret[0].height
      })
    });
    let SysInfo = my.getSystemInfoSync();
    this.setData({
      scrollHeight:SysInfo.windowHeight
    })
  },
  scrollTopFun(e)
  {
    let scrollTop = e.detail.scrollTop;
    if (scrollTop > this.data.storeHeight)
    {
      this.setData({
        gudingdingwei: true
      })
    }
    else
    {
      this.setData({
        gudingdingwei: false
      })
    }
    //    排序
    if (this.data.activeTab == 'b')
    {
      if (scrollTop > this.data.storeHeight)
      {
        this.setData({
          paixudingwei: true
        })
      }
      else
      {
        this.setData({
          paixudingwei: false
        })
      }
    }
  },
  cancelornot(_this)
  {
    merchantApi.storeCollect({id: _this.data.merchantId})
      .then(resp => {
        if (resp.code === 200)
        {
          _this.setData({
            isCollected: !_this.data.isCollected
          });
          my.showToast({
            type: 'success',
            content: resp.message,
            duration: 3000
          });
          
        }
        else if (resp.code === 401)
        {
          // this.$login().then(() => {
          //   this.cancelornot(_this);
          // })
          my.showToast({
            type: 'fail',
            content: "请先登录!",
            duration: 2000,
          })
        }
        else
        {
          my.showToast({
            type: 'fail',
            content: resp.message,
            duration: 3000
          });
        }
      })
      .catch(err => {
        my.showToast({
          type: 'fail',
          content: err,
          duration: 3000
        });
      })
  },
  goodsClick(e)
  {
    my.navigateTo({
      url: "/page/detail/index?goodsId=" + e.currentTarget.dataset.id
    })
  },
  bannerClick(e)
  {
    let item = e.currentTarget.dataset.item ||{};
    if(item.goodsId)
    {
      my.navigateTo({
        url: "/page/detail/index?goodsId=" + item.goodsId
      })
    }
  },
});
