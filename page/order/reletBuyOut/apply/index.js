import orderApi from '/api/order.js';
import env from '/util/env.js';
const app = getApp();
Page({

  data: { 

    id: 0,   //  订单ID

    status:0,  //  订单状态  0 续租 1买断

    disabled:true,   // 按钮是否禁用

    focus:false, // input框聚焦

    pageInfo:{},  // 接口请求数据

    baseRent:0,  // 基本价格

    inputDays:'', // 用户输入天数

    selectDays:'',

    selectIndex:-1,

    totalPrice:0, // 计算总价

    result:false,

    content:'', // 用户留言

    hideModal:true,

    animationData:{}
  },
  onLoad: function (options) {

    this.initAnimation();

    let { id = 0 , status = 0 } = options;
    
    this.setData({

        id,

        status

    })
    my.setNavigationBar(
      {
        title: status==0?'申请续租':'申请买断'
      }
    );
    status == 0?this.getToRelet():this.getToBuyout();
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
  showModal(){
    let animation = this.animation;
    animation.translateY(0).step();
    this.setData({
      hideModal: false
    });
    setTimeout(() => {
        this.setData({
            animationData: animation.export()
        });
    }, 1);
  },
  hideModal(){
    let animation = this.animation;
    animation.translateY('100%').step();
    this.setData({
        animationData: animation.export(),
    });
    setTimeout(function () {
        this.setData({
            hideModal: true
        });
    }.bind(this), 200)
  },
  setContent(e){
    console.log(1)
    this.setData({
        content:e.detail.value
    });
  },
  returnOrder(){

    my.navigateBack({delta: 1})

  },
  submit(){

    

    let status = this.data.status;

    if(status == 0){  // 续租

      let disabled = this.data.disabled;

      if(disabled){

        my.showToast({
          content: '请选择续租天数',
          duration: 2000,
        })
        return;

      }
      my.showLoading(
        {
          content:'请稍候'
        }
      )
      this.setData({

        disabled:true

      })
      
      let pageInfo = this.data.pageInfo;

      let days = pageInfo.customLease?this.data.inputDays:this.data.selectDays;

      orderApi.applyRelet({id : this.data.id,leaseDay:days}).then(resp => {

        my.hideLoading();

        if(resp.code == 200 ){

          this.setData({

            disabled:false,

            result:true
      
          })

          this.showModal();

        }else if(resp.code == 401){

          my.showToast({
            type:'fail',
            content: '请先登录!',
            duration: 2000,
          })

        }else{

          this.setData({

            disabled:false,

            result:false
      
          })

          this.showModal();

        }

      }).catch(err=>{

        this.setData({

          disabled:false
          
        })
        my.showToast({
          type: 'fail',
          content: '网络异常,请稍后再试',
          duration: 2000,
        })

      })
    }else{   // 买断
      my.showLoading(
        {
          content:'请稍候'
        }
      )
      let content = this.data.content || '';
      orderApi.applyBuyout({id : this.data.id,remark:content}).then(resp => {
        my.hideLoading();
        if(resp.code == 200 ){

          this.setData({

            result:true
      
          })

          this.showModal();

        }else if(resp.code == 401){

          my.showToast({
            type:'fail',
            content: '请先登录!',
            duration: 2000,
          })

        }else{
          this.setData({

            result:false
      
          })
          this.showModal();

        }

      }).catch(err=>{

        my.showToast({
          type: 'fail',
          content: '网络异常，请稍后再试',
          duration: 2000,
        })

      })
    }
  },
  computedTotal(){  // 计算续租总价

    let status = this.data.status;  // 0 续租 1买断
    
    let day = this.data.inputDays || this.data.selectDays;  // 用户输入的天数 或者选择的天数
    let pageInfo = this.data.pageInfo;  // 接口数据

    let baseRent = this.data.baseRent;  // 当前用户选择天数的基本租金
 
    let total = 0;   // 页面展示的价格

    if(status == 0){  // 续租

    if( day > 30){
        
      total = baseRent * 30;
    }else{

      total = baseRent * day;
    }
    total += pageInfo.accidentInsurance;
  }
    this.setData({

      totalPrice:total

    })

  },
  selectDays(e){  // 固定租期 用户选择天数

    let pageInfo = this.data.pageInfo;  // 接口数据

    let leaseDays = pageInfo.leaseDays; // 固定租期可选择的天数数组

    let selectIndex = e.currentTarget.dataset.index;  // 用户选择的索引

    let selectDays = leaseDays[selectIndex]; // 用户选择的天数

    let renewRent = pageInfo.renewRent;  // 选不同的天数 所展示的不同的租金

    let dailyRent = pageInfo.dailyRent;  // 如果没找到  则是这个默认值  一般都能找到吧

    let baseRent = 0;

    if(selectIndex == this.data.selectIndex){

      return;

    }

    baseRent =  renewRent[selectDays] || 0;

    if(!baseRent){

      baseRent = dailyRent;

    }

    this.setData({

      selectIndex,

      selectDays,

      baseRent

    })

    this.computedTotal();

    this.setData({

      disabled:false

    })

  },
  iptDay(e){ // 用户输入天数

    let minDay = Number(this.data.pageInfo.minLease);

    let maxDay = Number(this.data.pageInfo.maxLease);

    let days = e.detail.value;
    console.log(days)

    let pageInfo = this.data.pageInfo;

    let baseRent = 0;

    if(days.indexOf('天')>-1){ // 如果有天  则要先把天拿掉  只要天前边的东西 以防止用户在后边继续输入
     let dayArr = days.split('');

     let newArr = [];

     for(let i=0;i<dayArr.length;i++){  // 如果用户输入了非数字 （其实Number类型的输入框是不可能出现的）则把非数字之前的数字拿出来 其他删掉
      if((Number(dayArr[i]))>=0){
        newArr.push(dayArr[i])
      }else{
        break;
      }
     }

     days = Number(newArr.join(''));

    }
    if(days<minDay || days==''){// 如果用户把输入框里的内容都删掉了 取最低天数
      
      days = '';
      my.showToast({
        content: '该商品租赁最小天数为 ' + minDay +' 天',
        duration: 2000,
      })
      this.setData({
        inputDays:days,
        disabled:true
      })
      return;
    }
    if(days>maxDay){
      days = '';
      my.showToast({
        content: '该商品租赁最大天数为 ' + maxDay +' 天',
        duration: 2000,
      })
      this.setData({
        inputDays:days,
        disabled:true
  
      })
      return;

    }
    this.setData({
      inputDays:days,

      disabled:false

    })
    if(pageInfo.customLease){//  自定义租期  

      let rentGroup = pageInfo.rentGroup || [];

      let rent = Number(pageInfo.dailyRent);

        // 低于区间的天数取这个默认值

      rentGroup=rentGroup.sort((a,b)=>{

          return a.day<b.day
          
      })

      let sectionPrice = false;

      for(let i=0;i<rentGroup.length;i++){
        
          if(days>=rentGroup[i].day){

              baseRent = rentGroup[i].rent;

              sectionPrice = true;

              break;

          }

      }

      if(!sectionPrice){ // 区间内未找到合适的价格

        baseRent = rent;

      }

      this.setData({

        baseRent

      })

    }

    this.computedTotal();

    this.setData({

      disabled:false

    })

  },

  getToRelet(){   // 获取数据接口

    orderApi.getToReletInfo({id:this.data.id}).then(resp=>{

      if(resp.code == 200){

        let data  = resp.data || null;

        data = this.formatData(data);

        this.setData({

          pageInfo:data

        })

        if(data.customLease){  // 自定义租期   

          this.setData({

            baseRent:data.dailyRent
  
          })

        }else{   // 固定租期


        }

      }else if(resp.code == 401){

        my.showToast({
          type:'fail',
          content: '请先登录!',
          duration: 2000,
        })

      }else{

        my.showToast({
          type:'fail',
          content: resp.message,
          duration: 2000,
        })

      }
    }).catch(

      err=>{

        my.showToast({
          type: 'fail',
          content: '网络异常,请稍后再试',
          duration: 2000,
        })

      }

    )

  },
  getToBuyout(){   // 获取数据接口

    orderApi.getToBuyoutInfo({id:this.data.id}).then(resp=>{

      if(resp.code == 200){

        let data  = resp.data || null;

        data = this.formatData(data);

        this.setData({

          pageInfo:data,

          disabled:false

        })

      }else if(resp.code == 401){

        my.showToast({
          type:'fail',
          content: '请先登录!',
          duration: 2000,
        })

      }else{
        my.showToast({
          type: 'fail',
          content: resp.message,
          duration: 2000,
        })

      }
    }).catch(

      err=>{

        my.showToast({
          type: 'fail',
          content: '网络异常，请稍后再试',
          duration: 2000,
        })

      }

    )

  },
  
  formatData(data) { 

    if(!data) {

      return {};

    }
    let sysInfo = my.getSystemInfoSync();

    let iw = Math.round(sysInfo.windowWidth * (sysInfo.pixelRatio || 1));

    let image = data.image.indexOf('http')===0?data.image:env.image_host + data.image;

    data.goodsImage = image+app.getImageSuffix(4);

    data.standard = this.skuFormat(data.standard||[]);

    return data;

  },

  skuFormat: function(list) {

    list = list || [];

    let skus = [];

    for (let i = 0; i < list.length; i++)

    {
      skus.push(list[i].name || '-');

    }

    return skus.join(' | ');

  },

  callphone(){

    my.makePhoneCall({

        number: this.data.pageInfo.contactNumber.split(',')[0]//仅为示例，并非真实的电话号码

    })

  }

})