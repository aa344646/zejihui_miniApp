import { cherryPick } from '/api/you.js';
import env from '/util/env.js';
import { bannerClick, goodsClick, goodsImgSuffix } from '/util/common.js';

Page({
  data: {
    banner: {
      autoplay: true,
      interval: 3000,
      duration: 1000,
      circular: true,
      current: Date.now(),
    },
    opac: 0,
    showLeft: [],
    showRight: [],
    showLeftHeight: 0,
    showRightHeight: 0,
    bannerList: [
      // {imgUrl: '/image/you/banner@2x.png'},{imgUrl: '/image/you/banner@2x.png'}
    ],
    rankList: [], //排行商品
    sallList: [], //补贴商品
    modelList: [
      //  { iconUrl: '/image/you/icon_a.png', name: '13 Pro Max', categoryId: 60, typeId: 197 },
    ],
    goodsList: [], // 严选商品列表
    officialRecommend: {},
    opac: 0, // 渐变透明度
    systemInfo: {},
    swiperHeight: '',

  },
  onLoad() {
    this.getSystemInfo();
    this.getData();
  },
  toSearch() {
    my.navigateTo({
      url: '/page/search/search'
    })
  },
  onShow() {

  },
  onPageScroll(e) {
    this.setData({
      opac: e.scrollTop / 300
    })
  },
  async getData() {
    try {
      my.showLoading({ content: '加载中' });
      const res = await cherryPick();
      if (res.code === 200) {
        const data = res.data || {};
        // baner
        const bannerList = (data.bannerList || []).map((item) => {
          item.imgUrl =
            item.img.indexOf('http') === 0
              ? item.img
              : env.image_host + item.img;
          return item;
        });
        console.log(bannerList, ">>>>>>>>>>");


        // 排行商品
        const rankList = (data.hotRentList || []).map((item) => {
          const goods = goodsImgSuffix(item, 4);
          return goods;
        });
        // 补贴价商品
        const sallList = (data.subsidyList || []).map((item) => {
          const goods = goodsImgSuffix(item, 4);
          return goods;
        });

        // 商品列表
        const goodsList = (data.goodsList || []).map((item) => {
          const goods = goodsImgSuffix(item, 3);
          return goods;
        });
        this.handleWaterfallsFlow(goodsList);

        // 型号列表
        const modelList = (data.modelList || []);

        // 热区
        const officialRecommend = (data.officialRecommend || {});

        this.setData({
          bannerList,
          rankList,
          sallList,
          goodsList,
          modelList,
          officialRecommend,
        });
      } else {
        my.showToast({
          type: 'fail',
          content: res.message,
          duration: 3000,
        });
      }
    } catch (e) {
      my.showToast({
        type: 'fail',
        content: e.message || err,
        duration: 3000,
      });
    } finally {
      my.hideLoading();
    }
  },
  getSystemInfo() {
    const systemInfo = my.getSystemInfoSync();
    const swiperHeight = (systemInfo.titleBarHeight + systemInfo.statusBarHeight + ((systemInfo.windowWidth) / 750) * 280) + 'px';
    this.setData({
      systemInfo,
      swiperHeight
    })
  },
  async handleWaterfallsFlow(goodsList) {
    for (let i = 0; i < goodsList.length; i++) {
      await this.pushEle(goodsList[i]);
    }
    console.log({
      showLeft: this.data.showLeft,
      showRight: this.data.showRight
    })
  },
  handleBannerClick(e) {
    const item = e.target.dataset.item;
    bannerClick(item);
  },
  handleGoodsClick(e) {
    const id = e.target.dataset.id;
    goodsClick(id);
  },
  handleModelClick(e) {
    const item = e.target.dataset.item;
    const { categoryId, typeId } = item;

    my.navigateTo({
      url: `/page/category/index?cid=${categoryId}&tid=${typeId}`,
    });
  },
  handleYanjiClick(e) {
    const id = e.target.dataset.id;
    my.navigateTo({
      url: '/page/mapArea/index?id=' + id
    });
  },
  pushEle(v) {
    const _this = this;
    let showLeft = this.data.showLeft;
    let showRight = this.data.showRight;
    let showLeftHeight = this.data.showLeftHeight;
    let showRightHeight = this.data.showRightHeight;
    return new Promise(resolve => {
      if (showLeftHeight > showRightHeight) {
        showRight.push(v)
      } else {
        showLeft.push(v)
      }
      this.setData({
        showRight,
        showLeft
      }, () => {
        let query = my.createSelectorQuery();
        query.select(".tab-list-left")
          .boundingClientRect()
          .exec(ret => {
            let height = ret[0].height;
            _this.setData({
              showLeftHeight: height
            }, resolve)
          });
        let query1 = my.createSelectorQuery();
        query1.select(".tab-list-right")
          .boundingClientRect()
          .exec(ret => {
            let height = ret[0].height;
            _this.setData({
              showRightHeight: height
            }, resolve)
          });
        // query.select('.tab-list-left').boundingClientRect(rect=>{
        //   console.log(5)
        //   let height = rect.height;
        //   console.log({height})
        //   showLeftHeight = height;

        // }).exec();
        // query.select('.list-item-right').boundingClientRect(rect=>{
        //   console.log(6)
        //   let height = rect.height;
        //   console.log({height})
        //   showRightHeight = height;
        //   _this.setData({
        //     showRightHeight
        //   },resolve)
        // }).exec();
      })

    },)
  }
});
