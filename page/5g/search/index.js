const app = getApp();

Page({
  data: {
    paIndex: 0,// 换一换
    phoneArr: [], // 源数据号码组
    selectId: null,
    showPhoneArr: [],// 展示数据
    searchValue: null,
    returnData: [], // 搜索后数据
    selectPhoneNumber: '', // 选中的手机号
    flagBtn:true,
  },
  onLoad(options) {
    let showPhoneArr = JSON.parse(options.phoneArr)[0] || [];
    this.setData({
      phoneArr: JSON.parse(options.phoneArr) || [],
      showPhoneArr,
    })
  },

  handleSelectNumber(e) {
    this.setData({
      selectId: e.currentTarget.dataset.Id,
      selectPhoneNumber: e.currentTarget.dataset.number,
    })
  },
  showBtn(){
    this.setData({
      flagBtn:false
    })
  },

  closeBtn(){
    this.setData({
      flagBtn:true
    })
  },

  clearSearchValue(){
    this.setData({
      searchValue:'',
      showPhoneArr:this.data.phoneArr[0]
    })

  },
  Confirmss(){
   this.handleSearch();
  },

  handleSearch() {
    let { phoneArr = [], searchValue , } = this.data;
    let returnData = []
    if (!searchValue) { searchValue = 1 }

    phoneArr.forEach(item => {
      item.forEach(item => {
        if (item.toString().includes(searchValue)) {
          returnData.push(item)
        }
      })
    })
    let smallArr = [];
    let bigArr = [];
    console.log(returnData, ">>>>>>>>>returnData");

    if (returnData.length <= 18) {
      return this.setData({
        returnData,
        showPhoneArr: returnData,
        selectPhoneNumber:'',
        selectId:null
      }
      );
    }
    returnData.forEach((item, index, arr) => {
      if (index && !(index % 18)) {
        bigArr.push(smallArr);
        smallArr = []

      }
      smallArr.push(item)
      if (arr.length - 1 === index) {
        bigArr.push(smallArr);
      }
    })


    this.setData({
      returnData: bigArr,
      showPhoneArr: bigArr[0],
      selectPhoneNumber:'',
      selectId:null
    })
    console.log(phoneArr, ">>>>>>>>>phoneArr");
    console.log(returnData, ">>>>>>>>>returnData");

    console.log(bigArr, ">>>>>>>>>bigArr");

  },

  updateData(e) {
    this.setData({
      searchValue: e.detail.value
    })
  },

  // 换一换
  toReplace() {
    const { paIndex, returnData=[], phoneArr=[] } = this.data;
    console.log(phoneArr, ">>>>>????phoneArr");
    console.log(returnData, ">>>>>????returnData");

    const data = returnData.length ? returnData : phoneArr;
    if (data.length < 1 ||  !Array.isArray(data[0])) { return }
    console.log(data, ">>>>>????data");
    if (paIndex + 1 < data.length) {
      this.setData({
        paIndex: paIndex + 1
      })
    } else {
      this.setData({
        paIndex: 0
      })
    };
    let showPhoneArr = data[this.data.paIndex];
    this.setData({
      showPhoneArr,
      selectId: null,
      selectPhoneNumber:''
    })
  },


  goKplan() {
    let { selectPhoneNumber = '' } = this.data;
    selectPhoneNumber = selectPhoneNumber.replace(/\s*/g, "");
    app.selectPhoneObj = {
      selectPhoneNumber,
      time: Date.now(),
    };
    my.navigateBack();
  }
});
