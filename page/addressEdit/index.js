// pages/personal/addressEdit/addressEdit.js
import utils from '/util/util';
import commonApi from '/api/common.js';
import cityData from '/util/area';
const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    isEdit:false, //默认新增
    address: {},
    region: cityData,
    btnDisabled: false, 		//防止表单重复提交
    selectShow: false
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options)
  {
    let id = options.id;
    let address = my.getStorageSync({ key: 'editAddress' }).data || null;
    
    if(id && address)
    {
      my.setNavigationBar({
        title:'编辑收货地址'
      });
      this.setData({
        address:address,
        isEdit:true,
      });
    }
    else
    {
      my.setNavigationBar({
        title:'新增收货地址'
      });
  
      this.setData({
        address:{},
        isEdit:false,
      });
    }
  },
  showPicker () {
    this.setData({ selectShow: true });
  },
  closeSelect() {
    this.setData({ selectShow: false });
  },
  onSelectSuccess(result) {
    let selectValue = '';
    result && result.forEach((item) => {
      selectValue += `${item.name} `;
    });
    if (selectValue.length > 0) {
      selectValue = selectValue.substr(0, selectValue.length - 1);
    }
    console.log(result)
    this.setData({
      'address.provice': result[0].name,
      'address.city': result[1].name,
      'address.regoin': result[2].name
    });
  },
  //监听收件人
  inputName(e)
  {
    this.setData({
      'address.name': e.detail.value
    })
    
  },
  //监听电话
  inputPhone(e)
  {
    this.setData({
      'address.phone': e.detail.value
    })
    
  },
  //监听详细地址
  inputAddr(e)
  {
    this.setData({
      'address.text': e.detail.value
    })
  },
  //监听省市区
  bindRegionChange: function (e) {
    this.setData({
      'address.provice': e.detail.value[0],
      'address.city': e.detail.value[1],
      'address.regoin': e.detail.value[2]
    });
  },
  //设置默认地址开关
  switchChangeEvent: function () {
    let defaulted = !this.data.address.defaulted;
    this.setData({
      'address.defaulted': defaulted
    });
  },
  /**
   * 提交
   */
  addrFormSubmit: function ()
  {
    if(this.btnDisabled)
    {
      return;
    }
    
    let address = this.data.address || {};
    
    if (!address.name)
    {
      my.showToast({
        type: 'none',
        content: '请填写正确的收件人姓名',
        duration: 3000,
      });
      return;
    }
    if (!utils.validatePhone(address.phone))
    {
      my.showToast({
        type: 'none',
        content: '请填写正确联系电话',
        duration: 3000,
      });
      return;
    }
    if (!address.provice || !address.city || !address.regoin)
    {
      my.showToast({
        type: 'none',
        content: '请选择正确的省市区',
        duration: 3000,
      });
      return;
    }
    if (!address.text)
    {
      my.showToast({
        type: 'none',
        content: '请填写详细地址',
        duration: 3000,
      });
      return;
    }
    
    this.setData({
      btnDisabled: true
    });
    
    let data = {
      name: this.data.address.name,
      phone: this.data.address.phone,
      provice: this.data.address.provice,
      city: this.data.address.city,
      regoin: this.data.address.regoin,
      text: this.data.address.text,
      defaulted: this.data.address.defaulted || false,
    };
    
    if(this.data.isEdit)
    {
      data.id = this.data.address.id;
      commonApi.editAddress(data).then(resp=>{
        this.postSave(resp);
      }).catch(err=>{
        my.showToast({
          type: 'fail',
          content: err,
          duration: 3000,
        });
        my.hideLoading();
        this.setData({
          btnDisabled: false
        });
      });
    }
    else
    {
      commonApi.addAddress(data).then(resp=>{
        this.postSave(resp);
      }).catch(err=>{
        my.showToast({
          type: 'fail',
          content: err,
          duration: 3000,
        });
        this.setData({
          btnDisabled: false
        });
      });
    }
    
  },
  /**
   * 处理地址保存后跳转
   */
  postSave (resp)
  {
    if (resp.code === 200)
    {
      my.showToast({
        type: 'success',
        content: '保存成功',
        duration: 3000,
      });
      setTimeout(()=>{
        my.navigateBack({
          delta: 1
        });
      },1000);
      
    }
    else if(resp.code===401)
    {
      app.getUserInfo().then(data => {
        this.addrFormSubmit();
      })
    }
    else
    {
      my.showToast({
        type: 'none',
        content: resp.message,
        duration: 3000,
      });
      this.setData({
        btnDisabled: false
      });
    }
  }
});