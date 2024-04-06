import { brandPavilion } from '/api/brandHall.js';
import { receiveCouponGroup } from '/api/receive.js';
import { accordGo } from '../../util/common'

Page({
  data: {
    brandList: [],
    bonusList: [], //优惠券
    gatherList1: [],
    gatherList2: [],
    gatherList3: [],
    youHuiHuoDongList: '',
    switchIndex: 0,
    url: '',
    tabItem: ['购前领券', "优惠活动", "新品驾到", "热销榜单", "惊喜回馈"],
    tabIndex: 0,
    getFlag: '',
    redcou: [1, 2, 3, 4, 5, 6],
    toView: 'easy',
    calHeightO: '',
    calHeightT: '',
    boxheight: '',
  },
  async onLoad() {
    const res = await brandPavilion();
    if (res.code === 200) {
      const { bonusList, gatherList1, gatherList2, gatherList3, youHuiHuoDongList } = res.data || []
      this.setData({
        brandList: res.data,
        bonusList,
        gatherList1: gatherList1[0].goodsItemVOs,
        calHeightO: Math.ceil(gatherList1[0].goodsItemVOs.length / 2),
        gatherList2: gatherList2[0].goodsItemVOs,
        calHeightT: Math.ceil(gatherList2[0].goodsItemVOs.length / 2),
        gatherList3: gatherList3[0].goodsItemVOs,
        youHuiHuoDongList: youHuiHuoDongList[0],
      })
    };
    this.getBoxheight();
  },
  getBoxheight() {
    let query = my.createSelectorQuery()
    query.select('.p_new_content_newPro').boundingClientRect().exec(ret => {
      this.setData({
        boxheight: ret[0].height + 20,
      });
    });
  },
  async handleGetRed(e) {
    try {
      my.showLoading({
        content: '领取中...',
      });
      const id = e.target.dataset.id;
      await getApp().getUserInfo();
      const res = await receiveCouponGroup({ id: id });
      if (res.code === 200) {
        my.showToast({
          type: 'success',
          content: res.data.msg,
          duration: 2000,
        });
        this.setData({
          getFlag: id,
        })

      } else {
        my.showToast({
          type: 'fail',
          content: res.message,
          duration: 2000,
        });
      }
    }
    catch (e) {
      console.log(e);
    }
    finally {
      my.hideLoading();
    }

  },
  handleClickItem(e) {
    const index = e.currentTarget.dataset.index;
    const tabIndex = this.data.tabIndex;
    let toView = '';
    if (index != tabIndex) {
      this.setData({
        tabIndex: index
      })
    };
    switch (index) {
      case 0:
        toView = '#easy'
        break;
      case 1:
        toView = '#nopass'

        break;
      case 2:
        toView = '#newPro'
        break;
      case 3:
        toView = '#hotSale'
        break;
      case 4:
        toView = '#poprec'
        break;
      default:
        break;
    };

    let query = my.createSelectorQuery()
    query.select(toView).boundingClientRect().exec(ret => {
      my.pageScrollTo({
        scrollTop: ret[0].top - 200
      })
    });
    this.setData({
      toView,
    });
  },
  goBuyDeatil(e) {
    const type = e.currentTarget.dataset.type;
    const id = e.currentTarget.dataset.id;
    if (type) {
      accordGo(type, id)
    } else {
      my.navigateTo({
        url: "/page/detail/index?goodsId=" + id
      });
    }

  },

});
