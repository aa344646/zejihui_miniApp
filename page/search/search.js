import merchantApi from "../../api/merchant.js";
import env from "/util/env.js";
import searchApi from "/api/search.js";
Page({
  /**
   * 页面的初始数据
   */
  data: {
    placeholder: "请输入商品关键词",
    inputValue: "", //输入的关键词
    hotWords: [], // 热门商品展示
    list: [], // 搜索到的商品
    orderBy: "", //'putaway_time':上架时间, 'display_rent',价格
    desc: false, //降序 从高到低
    pageSize: 10,
    pageNum: 1,
    hasMore: false,
    col: 1,
    merchantId: "",
    globalQuery: "暂无",
    type: "",
    modelId: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const app = getApp();
    this.setData({
      globalQuery: JSON.stringify(app.globalQuery)
    });
    if (options.type === "model") {
      this.setData(
        {
          type: options.type,
          modelId: options.id
        },
        () => {
          this.doSearch();
        }
      );
      return;
    }
    if (options.merchantId) {
      this.setData({
        merchantId: options.merchantId || ""
      });
    } else {
      this.getHotWords();
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.setData({
      pageNum: 1
    });

    this.doSearch();

    setTimeout(() => {
      my.stopPullDownRefresh();
    }, 1000);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    if (this.data.hasMore) {
      this.doSearch();
    }
  },

  //键盘输入
  doInput(e) {
    this.setData({
      inputValue: e.detail.value || "",
      pageNum: 1,
      type: '',
      modelId: ''
    });
  },
  //清除输入
  doClean() {
    this.setData({
      inputValue: "",
      pageNum: 1,
      list: [],
      modelId: '',
      type: ''
    });
  },
  //获取热搜词
  getHotWords() {
    searchApi
      .hotWords()
      .then(resp => {
        if (resp.code === 200) {
          let data = resp.data || [];
          this.setData({
            hotWords: data
          });
        }
      })
      .catch(err => {});
  },
  //输入框搜索
  inputSearch() {
    this.setData({
      pageNum: 1
    });

    this.doSearch();
  },
  //热门搜索
  hotSearch(e) {
    let value = e.currentTarget.dataset.value || "";
    this.setData({
      inputValue: value,
      pageNum: 1
    });
    this.doSearch();
  },
  //排序搜索
  sortSearch(e) {
    let orderBy = e.currentTarget.dataset.sort || "";
    if (orderBy === this.data.orderBy) {
      let desc = this.data.desc;
      this.setData({
        desc: !desc,
        pageNum: 1
      });
    } else {
      this.setData({
        orderBy: orderBy,
        desc: false,
        pageNum: 1
      });
    }

    this.doSearch();
  },
  //搜索
  doSearch() {
    const { modelId, type } = this.data;
    if (type === "model") {
      let params = {
        pageNum: this.data.pageNum,
        pageSize: this.data.pageSize,
        modelId,
        orderBy: this.data.orderBy,
        desc: this.data.desc,
      };
      searchApi
        .search(params)
        .then(resp => {
          if (resp.code === 200) {
            let data = resp.data || {};
            let list = data.list || [];
            this.processSearchResult(list);
          } else {
            my.showToast({
              type: "fail",
              content: resp.message,
              duration: 3000
            });
          }
          my.hideLoading();
        })
        .catch(err => {
          my.showToast({
            type: "fail",
            content: err,
            duration: 3000
          });
          my.hideLoading();
        });
      return;
    } else {
      let value = this.data.inputValue || "";
      if (!!value.trim()) {
        if (this.data.pageNum === 1) {
          my.showLoading({
            content: "搜索中..."
          });
        } else {
          my.showLoading({
            content: "加载中..."
          });
        }

        let params = {
          merchantId: this.data.merchantId,
          search: value,
          orderBy: this.data.orderBy,
          desc: this.data.desc,
          pageNum: this.data.pageNum,
          pageSize: this.data.pageSize
        };
        // 商户搜索
        if (!!this.data.merchantId) {
          merchantApi
            .search(params)
            .then(resp => {
              if (resp.code === 200) {
                let data = resp.data || {};
                let list = data.list || [];
                this.processSearchResult(list);
              } else {
                my.showToast({
                  type: "fail",
                  content: resp.message,
                  duration: 3000
                });
              }

              my.hideLoading();
            })
            .catch(err => {
              my.showToast({
                type: "fail",
                content: err,
                duration: 3000
              });
              my.hideLoading();
            });
        }
        // 全局搜索
        else {
          searchApi
            .search(params)
            .then(resp => {
              if (resp.code === 200) {
                let data = resp.data || {};

                let list = data.list || [];
                this.processSearchResult(list);
              } else {
                my.showToast({
                  type: "fail",
                  content: resp.message,
                  duration: 3000
                });
              }

              my.hideLoading();
            })
            .catch(err => {
              my.showToast({
                type: "fail",
                content: err,
                duration: 3000
              });
              my.hideLoading();
            });
        }
      } else {
        my.showToast({
          content: "请输入商品关键词",
          type: "fail"
        });
      }
    }
  },
  processSearchResult(list) {
    if (!list) {
      return;
    }

    list.forEach(item => {
      let src = [];
      let imgs = item.imgUrl || [];

      imgs.forEach(img => {
        if (img.url.indexOf("http") === 0) {
          src.push(img.url);
        } else {
          src.push(env.image_host + img.url);
        }
      });
      item.src = src;
    });

    let currentPageNum = this.data.pageNum;

    this.setData({
      list: currentPageNum === 1 ? list : this.data.list.concat(list),
      pageNum: currentPageNum + 1,
      hasMore: list.length >= this.data.pageSize
    });

    if (currentPageNum === 1) {
      my.pageScrollTo({
        scrollTop: 0
      });
    }
  },
  goodsClick(e) {
    my.navigateTo({
      url: "/page/detail/index?goodsId=" + e.currentTarget.dataset.id
    });
  }
});
