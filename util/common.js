import util from '/util/util.js';
import env from '/util/env.js';
import { uploadFlag } from "../api/lease";
// 处理banner点击
export const bannerClick = (item) => {
  const sysInfo = my.getSystemInfoSync();
  console.log(sysInfo);
  if (!item) {
    return;
  }

  let type = item.type;
  console.log(type);

  if (type === 'popularize') {
    let id = item.dataId || '';
    my.navigateTo({
      url: '/page/mapArea/index?id=' + id,
    });
  } else if (type === 'goods') {
    let id = item.dataId || '';
    my.navigateTo({
      url: '/page/detail/index?goodsId=' + id,
    });
  } else if (type === 'goodsList') {
    let id = item.dataId;
    if (id) {
      my.navigateTo({
        url: `/page/lease/collect/index?collectId=${id}`,
      });
    }
  } else if (type === 'activity') {
    let url = item.linkUrl || '';
    // if(url.indexOf('newUserTemplate')>-1){  // 收藏有礼活动
    //   let path = `pages/index/index?appId=2018122562686742&page=pages/index/index&originAppId=2021002189690874&newUserTemplate=20190107000000104987`;
    //   my.navigateToMiniProgram({
    //     appId: '2018122562686742',
    //     path,
    //   });
    // }else
    if (url.indexOf('alipays://') === 0) {
      //跳转到app目前也是activity类型
      let appId = util.getQueryString(url, 'appId');
      let page = util.getQueryString(url, 'page') || '';
      let encodeExtraData = util.getQueryString(url, 'query') || '';

      let extraData = {};
      //解析参数，封装成对象
      if (encodeExtraData) {
        let paramStr = decodeURIComponent(encodeExtraData);
        let queryArr = paramStr.split('&') || [];
        queryArr.forEach((item) => {
          let key = item.split('=')[0];
          let value = item.split('=')[1];
          extraData[key] = value;
        });
      }
      my.uma.trackEvent('navigateToMiniProgram', {
        _appId_: appId,
        _path_: page,
        _extraData_: JSON.stringify(extraData),
      });
      setTimeout(() => {
        my.navigateToMiniProgram({
          appId: appId,
          path: page,
          extraData: extraData,
          success: (res) => { },
        });
      }, 200);
    } else if (url.indexOf('target=self') > -1) {
      // 微信小程序要跳转自己的领券页面
      let page = util.getQueryString(url, 'page') || '';
      my.navigateTo({
        url: page,
      });
    } else {
      my.navigateTo({
        url: '/page/webView/index?url=' + encodeURIComponent(url),
      });
    }
  } else if (type === 'alipayLink') {
    my.ap.navigateToAlipayPage({
      path: item.linkUrl,
    });
  }
};
// 转化回传，https://b.alipay.com/page/fw-market/home/detail/AM010401000000114377
export const conversionBack = (type,goods_Id) => {
  if (!type) {
    return "请输入转化类型"
  };
  uploadFlag(type,goods_Id);
  const conversionSdk = requirePlugin('conversion-sdk');
  conversionSdk.upload({
    params: {
      type,
      extInfo: {},
    },
    success: () => {
      // console.log(type, '上传转化成功');
    },
    fail: ({ code, message, detail }) => {
      // console.log(`上传转化失败，${code}: ${message},错误明细：${JSON.stringify(detail)}`);
    },
  });
};


// 点击商品
export const goodsClick = (id) => {
  if (id) {
    my.navigateTo({
      url: `/page/detail/index?goodsId=${id}`,
    });
  }
};
// 点击商品根据type值跳
export const accordGo = (type, id) => {
  if (!type || !id) {
    return;
  }
  switch (type) {
    case 'goodsList':
      my.navigateTo({
        url: `/page/lease/collect/index?collectId=${id}`
      })
      break;
    case 'popularize':
      my.navigateTo({
        url: '/page/mapArea/index?id=' + id
      });
      break;
    case 'goods':
      my.navigateTo({
        url: '/page/detail/index?goodsId=' + id
      });
      break;
    case 'alipayLink':
      my.ap.navigateToAlipayPage({
        path: item.linkUrl
      })
      break;
    default:
      my.navigateTo({
        url: '/page/detail/index?goodsId=' + id
      });
      break;
  }
};

// 获取裁剪参数
export const getImageSuffix = (num = 1, format = 'jpg') => {
  const sysInfo = my.getSystemInfoSync();
  let iw = Math.round(sysInfo.windowWidth * (sysInfo.pixelRatio || 1));
  const suffix =
    '?x-oss-process=image/resize,m_lfit,w_' +
    Math.ceil(iw / num) +
    `,limit_1/format,${format}/sharpen,100/interlace,1/quality,q_95`;
  return suffix;
};

// 处理商品图片裁剪
export const goodsImgSuffix = (item, num = 1) => {
  if (!item) {
    return;
  }
  const goods = { ...item };
  goods.imgPro = (item.imgFull || [])[0].url + getImageSuffix(num);
  return goods;
};