import { queryCityList, getPhoneNumberList, submitOrder, unicomMain } from "/api/mine.js";
import { getCollectGoods } from "/api/lease.js";
Page({
  data: {
    cPhone: '',
    spPhoneList: [],
    curPhoneList: [],
    curIndex: 0,
    phoneIndex: -1,
    collList: [],
    code: [],
    showPops: false,
    addressString: '',
    addList: [],
    showPop: true,
    value: [0, 0, 0], // 地址选择器省市区 暂存 currentIndex
    resultValue: [],
    provinces: [], // 一级地址
    citys: [], // 二级地址
    areas: [], // 三级地址
    showPop: false,
    isCanConfirm: true, //是否禁止在第一列滚动期间点击确定提交数据
    showShouhuoPop: false,
    shouhuoCode: [],
    shouhuoValue: [0, 0, 0],
    shouhuoResultValue: [],
    shouhuoProvinces: [], // 一级地址
    shouhuoCitys: [], // 二级地址
    shouhuoAreas: [], // 三级地址
    shouhuoAddressString: '',
    postAddr: '',
    postName: '',
    contactNum: '',
    packageImage: '',
    goodsImage: '',
    date: '',
  },
  onLoad() {
    this.queryCityList();
    this.getCollect();
    this.getPhoneNumberList();
    this.unicomMain();
    this.random();
  },
  random () {
    this.setData({
      date: new Date().getTime()
    })
  },
  iptAddress(e)
  {
    this.setData({
      postAddr: e.detail.value
    })
  },
  iptName(e)
  {
    this.setData({
      postName: e.detail.value
    })
  },
  iptPhone(e)
  {
    this.setData({
      contactNum: e.detail.value
    })
  },
  unicomMain () {
    unicomMain('k').then(resp => {
      if (resp.code === 200) {
        this.setData({
          packageImage: resp.data.packageImage,
          goodsImage: resp.data.goodsImage
        })
      } else {
        my.alert({
          title: '提示',
          content: '需在下单完成后才能申请联通5G卡，请先下单~',
          buttonText: '我知道了',
          success: () => {
            my.reLaunch({
              url: "/page/lease/index"
            })
          }
        });
      }
    }).catch(err => {
      my.alert({
        title: '提示',
        content: '需在下单完成后才能申请联通5G卡，请先下单~',
        buttonText: '我知道了',
        success: () => {
          my.reLaunch({
            url: "/page/lease/index"
          })
        }
      });
    })
  },
  getCollect(){
    const params = {
      id: 136,
      pageNum:1,
      pageSize:10,
      
    }
    getCollectGoods(params).then(resp => {
      const data = resp.data || {};
      const list = data.pageInfo.list
      this.processList(list);
      if (data.notes) {
        data.notes = data.notes.split('#');
      }
      if (data.explanation) {
        data.explanation = data.explanation.split('#');
      }
      this.setData({
        collList: list
      });
    })
  },
  chooseConfirm () {
    const phoneIndex = this.data.phoneIndex;
    const curPhoneList = this.data.curPhoneList ||[];
    const cPhone = curPhoneList[phoneIndex];
    this.setData({
      showPops: false,
      cPhone
    })
  },
  choosePhone (e) {
    const index = e.target.dataset.index;
    this.setData({
      phoneIndex: index
    })
  },
  changePhone () {
    const curIndex = this.data.curIndex;

    const spPhoneList = this.data.spPhoneList;

    let newIndex;

    if (curIndex === spPhoneList.length - 1) {
      newIndex = 0;
    } else {
      newIndex = curIndex + 1;
    }
    this.setData({
      curIndex: newIndex,
      curPhoneList: spPhoneList[newIndex],
      phoneIndex: -1
    })
  },
  goodsClick(e){
    my.navigateTo({
        url:"/page/detail/index?goodsId="+e.currentTarget.dataset.id
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
  queryCityList() {
    queryCityList('live').then(r => {
      const provinces = r.data.map(item => {
        return item;
      });
      const shouhuoProvinces = r.data.map(item => {
        return item;
      });
      this.setData(
        {
          shouhuoProvinces,
          provinces,
          addList: r.data
        },
        () => {
          this.getCityArea();
          this.getShouHuoCityArea();
        }
      );
    });
  },
  splitArray(N,Q){  // 分隔数组 一页展示五个
    var R = [],F;
    for (F = 0;F < Q.length;) R.push(Q.slice(F,F += N))
    return R
  },
  getPhoneNumberList () {
    const code = this.data.code;
    const provinceCode = code[0];
    const cityCode = code[1];
    const params = {
      provinceCode,
      cityCode,
      type:'live'
    }
    getPhoneNumberList(params).then(r => {
      const phoneList = r.data;
      const spPhoneList = this.splitArray(18, phoneList)|| [];
      if (!spPhoneList.length) {
        my.showToast({
          type: 'fail',
          content: '当前城市,无可选号段',
          duration: 2000,
        })
      }
      this.setData({
        spPhoneList,
        curPhoneList: spPhoneList[0] ||[],
        curIndex: 0
      })
    })
  },
  cityCancel () {
    this.setData({
      showPop: false,
    })
  },
  shouhuoCityCancel () {
    this.setData({
      showShouhuoPop: false,
    })
  },
  shouhuoCitySure () {
    const shouhuoValue = this.data.shouhuoValue;
    const addList = this.data.addList;
    const shouhuoAddressString = addList[shouhuoValue[0]].name + addList[shouhuoValue[0]].childList[shouhuoValue[1]].name + addList[shouhuoValue[0]].childList[shouhuoValue[1]].childList[shouhuoValue[2]].name;
    const shouhuoCode = [addList[shouhuoValue[0]].code, addList[shouhuoValue[0]].childList[shouhuoValue[1]].code, addList[shouhuoValue[0]].childList[shouhuoValue[1]].childList[shouhuoValue[2]].code]
    this.setData({
      shouhuoCode,
      showShouhuoPop: false,
      shouhuoResultValue: this.data.shouhuoValue,
      shouhuoAddressString
    })
  },
  citySure () {
    const value = this.data.value;
    const addList = this.data.addList;
    const addressString = addList[value[0]].name + addList[value[0]].childList[value[1]].name + addList[value[0]].childList[value[1]].childList[value[2]].name;
    const code = [addList[value[0]].childList[value[1]].provinceCode, addList[value[0]].childList[value[1]].cityCode]
    this.setData({
      code,
      showPop: false,
      resultValue: this.data.value,
      addressString
    }, () => {this.getPhoneNumberList()})
  },
  getCityArea(index = 0) {
    const provinces = this.data.provinces;
    const citys =
      provinces.length && provinces[index].childList
        ? provinces[index].childList.map(item => {
            return item;
          })
        : [];
    this.setData(
      {
        citys
      },
      () => {
        this.getArea();
      }
    );
  },
  getShouHuoCityArea (index = 0) {
    const shouhuoProvinces = this.data.shouhuoProvinces;
    const shouhuoCitys =
    shouhuoProvinces.length && shouhuoProvinces[index].childList
        ? shouhuoProvinces[index].childList.map(item => {
            return item;
          })
        : [];
    this.setData(
      {
        shouhuoCitys
      },
      () => {
        this.getShouHuoArea();
      }
    );
  },
  getShouHuoArea(index = 0) {
    const shouhuoCitys = this.data.shouhuoCitys;
    const shouhuoAreas =
    shouhuoCitys.length && shouhuoCitys[index].childList
        ? shouhuoCitys[index].childList.map(item => {
            return item;
          })
        : [];
    this.setData({
      shouhuoAreas
    });
  },
  getArea(index = 0) {
    const citys = this.data.citys;
    const areas =
    citys.length && citys[index].childList
        ? citys[index].childList.map(item => {
            return item;
          })
        : [];
    this.setData({
      areas
    });
  },
  shouhuoCityChange (e) {
    var value = e.detail.value;
    var provinceNum = value[0];
    var cityNum = value[1];
    var areaNum = value[2];
    // 省级切换 重新获取市
    if (this.data.shouhuoValue[0] !== provinceNum) {
      this.getShouHuoCityArea(provinceNum)
      this.setData({
        shouhuoValue: [provinceNum, 0, 0]
      });
    } else if (this.data.shouhuoValue[1] !== cityNum) {
      this.getShouHuoArea(cityNum);
      this.setData({
        shouhuoValue: [provinceNum, cityNum, 0]
      });
    } else {
      this.setData({
        shouhuoValue: [provinceNum, cityNum, areaNum]
      });
    }
  },
  cityChange(e) {
    var value = e.detail.value;
    var provinceNum = value[0];
    var cityNum = value[1];
    var areaNum = value[2];
    // 省级切换 重新获取市
    if (this.data.value[0] !== provinceNum) {
      this.getCityArea(provinceNum);
      this.setData({
        value: [provinceNum, 0, 0]
      });
    } else if (this.data.value[1] !== cityNum) {
      this.getArea(cityNum);
      this.setData({
        value: [provinceNum, cityNum, 0]
      });
    } else {
      this.setData({
        value: [provinceNum, cityNum, areaNum]
      });
    }
  },
  openShouHuoAddressPop () {
    this.setData({
      showShouhuoPop: true
    });
  },
  openAddressPop() {
    this.setData({
      showPop: true
    });
  },
  onPopupClose() {
    this.setData({
      showPop: false
    });
  },
  onShouHuoPopupClose () {
    this.setData({
      showShouhuoPop: false
    });
  },
  receivePhone () {
    const { cPhone, shouhuoCode, postAddr, code } = this.data;
    my.showLoading({
      content: "申请中..."
    });
    submitOrder({
      provinceCode: code[0],
      cityCode: code[1], 
      phoneNumber: cPhone,
      postProvinceCode: shouhuoCode[0],
      postCityCode: shouhuoCode[1],
      postDistrictCode: shouhuoCode[2],
      postAddr,
      type: 'live'
      // postName,
      // contactNum
    }).then(r => {
      my.hideLoading();
      if(r.code === 200) {
        my.showToast({
          type: "success",
          content: '申请成功',
          duration: 2000
        })
        setTimeout(() => {
          my.reLaunch({
            url: '/page/mine/index'
          })
        }, 2000)
      } else {
        my.showToast({
          type: "fail",
          content: r.message,
          duration: 2000
        })
      }
    }).catch(e => {
      my.hideLoading();
      my.showToast({
        type: "fail",
        content: e.message || e,
        duration: 2000
      })
    })
  },
  openChoosePhone () {
    const resultValue = this.data.resultValue;
    if (!resultValue.length) {
      my.showToast({
        type: "fail",
        content: '请先选择号码归属地',
        duration: 2000
      });
    } else {
      this.setData({
        showPops: true
      });
    }
  },
  onPopupCloseMiddle () {
    this.setData({
      showPops: false
    });
  },
  zifei () {
    my.showLoading({
      content: "加载中..."
    });
    my.downloadFile({
      // 示例 url，并非真实存在
      url: "https://img.zejihui.com.cn/unicom/220530/zifei.pdf",
      success({ apFilePath }) {
        my.hideLoading();
        my.openDocument({
          filePath: apFilePath,
          fileType: "pdf",
          success: res => {},
          fail: e => {
            my.showToast({
              content: "系统异常，请稍后再试",
              duration: 2000
            });
          }
        });
      }
    });
  },
  lingquguize () {
    my.showLoading({
      content: "加载中..."
    });
    my.downloadFile({
      // 示例 url，并非真实存在
      url: "https://img.zejihui.com.cn/unicom/220530/guize.pdf",
      success({ apFilePath }) {
        my.hideLoading();
        my.openDocument({
          filePath: apFilePath,
          fileType: "pdf",
          success: res => {},
          fail: e => {
            my.showToast({
              content: "系统异常，请稍后再试",
              duration: 2000
            });
          }
        });
      }
    });
  },
  fuwuxieyi() {
    my.showLoading({
      content: "加载中..."
    });
    my.downloadFile({
      // 示例 url，并非真实存在
      url: "https://img.zejihui.com.cn/unicom/220530/fu_wu_xie_yi.pdf",
      success({ apFilePath }) {
        my.hideLoading();
        my.openDocument({
          filePath: apFilePath,
          fileType: "pdf",
          success: res => {},
          fail: e => {
            my.showToast({
              content: "系统异常，请稍后再试",
              duration: 2000
            });
          }
        });
      }
    });
  },
  gonggao() {
    my.showLoading({
      content: "加载中..."
    });
    my.downloadFile({
      // 示例 url，并非真实存在
      url: "https://img.zejihui.com.cn/unicom/220530/gong_gao.pdf",
      success({ apFilePath }) {
        my.hideLoading();
        my.openDocument({
          filePath: apFilePath,
          fileType: "pdf",
          success: res => {},
          fail: e => {
            my.showToast({
              content: "系统异常，请稍后再试",
              duration: 2000
            });
          }
        });
      }
    });
  }
});
