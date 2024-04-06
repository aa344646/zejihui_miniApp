import afterService from '/api/afterService.js';
import env from '/util/env';
import util from '/util/util.js';
import area from '/util/area';
const app = getApp();

Page({
  data: {
    area,
    text:'',
    viewShow:false,
    array: [],
    index:0,
    afterServiceDetail:{},
    merchantInfo:{},
    logisticsId:'',
    logisticsNum:'',
    freight:'', //运费
    expressAddress:[],
    addressIndex:0,
    selectExpressAddress:{},
    hideResult:false,
    animationData:{}
  },
  onLoad: function (options) {
    this.initAnimation();
    my.showLoading({
      content:'加载中'
    });
    let afterServiceDetail = app.afterServiceDetail;
    this.setData({
      afterServiceDetail
    })
    let { orderId , serviceOrderId,category} = afterServiceDetail;
    let text = '';
    let title = '';
    switch(category){
      case 'repair' :
        title = '维修信息';
        text = '维修';
      break; 
      case 'exchange' :
        title = '换货信息';
        text = '换货';
      break;
      case 'return' :
        title = '退货信息';
        text = '退货';
      break;
    }
    my.setNavigationBar({title});
    this.setData({
      text
    })
    this.getLogistics(); // 获取物流列表
    this.getToSend();  // 获取商家信息
    if( category != 'return' ){  // 换货 维修 需要获取用户的地址
      this.getAddress();  // 获取用户地址
    }
  },
  submitSuccess(ref){  // ref绑定一下
    this.submitSuccess = ref;
  },
  selectAddress(e){
    let index = e.currentTarget.dataset.index;
    let addressIndex = this.data.addressIndex;
    if(index == addressIndex) return;
    let selectExpressAddress = this.data.expressAddress[index];
    this.setData({
      addressIndex:index,
      selectExpressAddress
    })
  },
  del(){
    const _this = this;
    my.confirm({
      title: '提示',
      content: '确定要删除此地址吗?',
      success: (result) => {
        if(result.confirm){
          _this.setData({
            selectExpressAddress:{}
          })
        }
      },
    });
  },
  aboutAddress(e){
    let { type , index } = e.currentTarget.dataset;
    const _this = this;
    let selectExpressAddress = {
      provice:'',
      city:'',
      regoin:'',
      text:''
    };
    let provice,city,regoin,text;
    my.multiLevelSelect({
      title:'选择地址',
      list:this.data.area,
      success(res){
        if(res.success){  // 取到省市区
          selectExpressAddress.provice = res.result[0].name;
          selectExpressAddress.city = res.result[1].name;
          selectExpressAddress.regoin = res.result[2].name;
          _this.getInfo({
            object:selectExpressAddress,
            title:'详细地址',
            placeholder:'请输入收货人详细地址',
            align:'left',
            key:'text',
            errorTips:'未输入收货人详细地址,请重新添加!'
          }).then(
            res=>{
               if(type == 'add'){
                _this.getInfo({
                  object:res,
                  title:'',
                  placeholder:'请输入收货人姓名',
                  align:'left',
                  key:'name',
                  errorTips:'未输入收货人姓名,请重新添加!'
                }).then(res=>{
                  _this.getPhone(res,index);
                }).catch()

              }else{

                _this.setData({
                  selectExpressAddress:{..._this.data.selectExpressAddress,...res}
                })
              }
            }
          ).catch()
        }
      }
    })
  },
  getInfo(params){
    return new Promise((resolve,reject)=>{
      my.prompt({
        title:params.title,
        placeholder:params.placeholder,
        align:params.align,
        success(res){
          if(res.ok&&res.inputValue){
            params.object[params.key] = res.inputValue;
            resolve(params.object);
          }else if(res.ok&&!res.inputValue){
            my.alert({
              title:'提示',
              content:params.errorTips
            });
            reject();
          }
        }
      })
    })
  },
  getPhone(res,index){
    const selectExpressAddress = res;
    const _this = this;
    _this.getInfo({
      object:res,
      title:'',
      placeholder:'请输入收货人电话',
      align:'left',
      key:'phone',
      errorTips:'未输入收货人电话,请重新添加!'
    }).then(res=>{
      let phone = res.phone;
      if(util.validatePhone(phone)){
        if(!isNaN(index)&&index!=null){ // 修改已有地址
          _this.editAddress({...selectExpressAddress,...res},index).then(result=>{
            if(res.name){
              my.showToast({
                type: 'success',
                content: '修改成功!',
                duration: 2000,
              })
              let expressAddress = this.data.expressAddress;
              expressAddress[index] = selectExpressAddress;
              _this.setData({
                selectExpressAddress:result,
                expressAddress
              })
            }
          }).catch(err=>{
            my.showToast({
              type: 'fail',
              content: err,
              duration: 2000,
            })
          });
        }
      }else{
        my.confirm({
          title: '提示',
          content: '收货人电话不符合规则,请重新添加!',
          success: (res) => {
            if (res.confirm)
            {
              _this.getPhone(selectExpressAddress);
            }
          }
        })
      }
    })
  },
  editAddress(selectExpressAddress,index){
    my.showLoading(
      {content:'请稍候'}
    )
    let current = this.data.expressAddress[index];
    selectExpressAddress.defaulted = false;
    selectExpressAddress.id = current.id;
    return new Promise((resolve,reject)=>{
      afterService.editAddress(selectExpressAddress).then(res=>{
        my.hideLoading();
        if(res.code == 200){
          resolve(selectExpressAddress);
        }else{
          reject(res.message);
        }
      }).catch(err=>{
        reject(err);
      })
    })
    
  },
  bindPickerChange(e)
  {
    this.setData({
      index: e.detail.value,
      logisticsId: this.data.array[e.detail.value].id
    })
  },
  input(e)
  {
    this.setData({
      logisticsNum: e.detail.value
    })
  },
  inputFreight(e)
  {
    this.setData({
      freight: e.detail.value
    })
  },
  getAddress(){
    afterService.getAddress().then(resp=>{
      if(resp.code==200)
      {
        if(resp.data.length){ // 有地址
          this.setData({
            expressAddress:resp.data
          })
          resp.data.forEach((item,index)=>{
            if(item.defaulted){
              this.setData({
                addressIndex:index,
                selectExpressAddress:resp.data[index]
              })
            }
          })
        }
         
      }
      else if(resp.code==401)
      {
        my.showToast({
          type: 'fail',
          content: "请先登录",
          duration: 2000,
        })
      }
      else
      {
        my.showToast({
          type: 'fail',
          content: resp.message,
          duration: 2000,
        })
      }
  })
  .catch(e=>{
    my.showToast({
      type: 'fail',
      content: e,
      duration: 2000,
    })
  })
  },
  getToSend(){
    afterService.getToSend({serviceOrderId:this.data.afterServiceDetail.serviceOrderId}).then(resp=>{
      if(resp.code==200)
      {
        let { data:merchantInfo } = resp;
        this.setData({
          merchantInfo,
          viewShow:true
        })
        my.hideLoading();
      }
      else if(resp.code==401)
      {
        my.showToast({
          type: 'fail',
          content: "请先登录",
          duration: 2000,
        })
      }
      else
      {
        my.showToast({
          type: 'fail',
          content: resp.message,
          duration: 2000,
        })
      }
  })
  .catch(e=>{
    my.showToast({
      type: 'fail',
      content: e,
      duration: 2000,
    })
  })
  },
  getLogistics(){
    afterService.getLogisticsCompany().then(resp=>{
      if(resp.code==200)
      {
        let { data : array } = resp;

        this.setData({

          array

        })
         
      }
      else if(resp.code==401)
      {
        my.showToast({
          type: 'fail',
          content: "请先登录",
          duration: 2000,
        })
      }
      else
      {
        my.showToast({
          type: 'fail',
          content: resp.message,
          duration: 2000,
        })
      }
  })
  .catch(e=>{
    my.showToast({
      type: 'fail',
      content: e,
      duration: 2000,
    })
  })
  },
  copy(){
    my.setClipboard({

      text: this.data.merchantInfo.address,

      success:(res) => {

        my.showToast({
          type: 'success',
          content: "复制成功",
          duration: 2000,
        })

      }
      
    })
  },
  confirmReturn()
  {
    const _this = this;
    let {merchantInfo , logisticsId , logisticsNum , freight , expressAddress ,selectExpressAddress} = this.data;

    let afterServiceDetail = this.data.afterServiceDetail;

    let { category : type , serviceOrderId } = afterServiceDetail;
    
    if (!logisticsId)
    {
      my.showToast({
        type: 'fail',
        content: '请选择物流公司',
        duration: 2000,
      })
      return;
    }
    
    if (!logisticsNum)
    {
      my.showToast({
        type: 'fail',
        content: '请输入物流单号',
        duration: 2000,
      })
      return;
    }
    if (!freight)
    {
      my.showToast({
        type: 'fail',
        content: '请输入运费',
        duration: 2000,
      })
      return;
    }
    let params = {
      serviceOrderId,
      expressCompany:logisticsId,
      expressNo: logisticsNum,
      freight:freight*100
    };
    if(type !='return'){ // 退货不需要填这些参数  其他需要
      params = {
        ...params,
        contactName:selectExpressAddress.name, // 收件人
        contactNumber:selectExpressAddress.phone, // 联系方式
        address:selectExpressAddress.provice+selectExpressAddress.city+selectExpressAddress.regoin+selectExpressAddress.text, // 地址
      }
    }
    my.confirm({
      title: '提示',
      content: '已确认输入无误并寄回商品吗？',
      success: (res) => {
        if (res.confirm)
        {
          afterService.applySendGoods(params)
            .then(resp => {
              if (resp.code == 200)
              {
                _this.showModal();
              }
              else if (resp.code == 401)
              {
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
                  duration: 2000,
                })
              }
            })
            .catch(err => {
              my.showToast({
                type: 'fail',
                content: err,
                duration: 2000,
              })
            })
        }
      }
    })
    
  },
  returnOrder(){

    my.navigateBack({delta: 1})

  },
  initAnimation(){
    var animation = my.createAnimation({
        duration: 200,
        timingFunction: "linear",
    });
    this.animation = animation;
    animation.translateY('100%').step();
    this.setData({
        animationData: animation.export()
    });
  },
  hideModal(){
      let animation = this.animation;
      animation.translateY('100%').step();
      this.setData({
          animationData: animation.export(),
      });
      setTimeout(function () {
          this.setData({
            hideResult: false
          });
      }.bind(this), 200)

  },
  showModal(){
      let animation = this.animation;
      animation.translateY(0).step();
      this.setData({
          hideResult: true
      });
      setTimeout(() => {
        this.setData({
          animationData: animation.export()
        });
      }, 1);
      
  }
})