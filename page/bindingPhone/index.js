import HttpApi from "../../api/lease";
import util from '../../util/util';
import env from '../../util/env';
const app = getApp();
Page({
    data: {
        path: "", //path存放的位置
        phone: "", // 用户手机号
        captchaUrl:'',//图片验证码地址
        captcha:'',  //图片验证码
        smsCode:'',//短信验证码
        random:'', //随机数字
        smsTime:0, // 获取验证码倒计时
        showCaptcha:false, //显示图片验证码
        submitBtnStatus:false, // 绑定按钮显示状态
    },
    itr:'',//定时器
    onLoad(query) {
        let path = query.url || "";
        this.setData({
            path: path
        })
    },
    iptPhone(e) {   // 验证手机号正常就显示图片
        let phone = e.detail.value || "";
        this.setData({
            phone:phone
        })
        let result = util.validatePhone(phone);
        if(result){
            if(!this.data.captchaUrl){
                this.getCaptcha();
            }
        }  
    },
    getCaptcha() { // 获取图片验证码
        let phone = this.data.phone;
        let result = util.validatePhone(phone);
        if(result){
            let random = new Date().getTime();
            this.setData({
                showCaptcha:true,
                random:random,
                captchaUrl:env.api_host + '/getCaptcha?phone=' + phone + '&random='+random,
            });

        }else{
            my.showToast({
                content: '请输入正确的手机号',
                duration: 2000
            });
        }
    },
    inputCaptcha(e) { // 输入图片验证码
        let captcha = e.detail.value || "";
        this.setData({
            captcha:captcha
        });
    },
    sendSmsCode(){
      if(this.data.smsTime > 0){ // 如果倒计时大于0 点击无效
        return;
      }
      let phone = this.data.phone;
      if(!util.validatePhone(phone)){  // 验证手机号
        my.showToast({
            content: '请输入正确的手机号',
            duration: 2000
        });
        return;
      }
      let captcha = this.data.captcha;
      if(!captcha||captcha.length<5||isNaN(captcha)){ // 未填写或长度小于5或非数字
        my.showToast({
            content: '请输入正确的图片验证码',
            duration: 2000
        });
        return;
      }
      this.setData({
        smsTime:60
      });
      this.smsTimeDown();
      HttpApi.getSendCode({phone,code:captcha,random:this.data.random}).then(resp=>{
        if(resp.code != 200){
            my.showToast({
                content:resp.message,
                duration: 2000
            });
            this.getCaptcha();
            this.setData({
                smsTime:0
            });
            clearInterval(this.itr);
        }
      }).catch(err=>{
          this.getCaptcha();
        my.showToast({
            content: err,
            duration: 2000
        });
      })
    },
    smsTimeDown(){
      this.itr = setInterval(()=>{
        let time = --this.data.smsTime;
        this.setData({
          smsTime:time
        });
        if(time<=0)
        {
          clearInterval(this.itr);
        }
      },1000);
    },
    inputSmsCode(e){ // 输入验证码
        let smsCode = e.detail.value;
        this.setData({
          smsCode:smsCode
        });  
    },
    submit() { // 提交
        // console.log(this.data.submitBtnStatus)
        if(this.data.submitBtnStatus){
            return;
        }
        let that = this;
        this.setData({
            submitBtnStatus:true
        })
        let phone = this.data.phone;
        if(!util.validatePhone(phone)){  // 验证手机号
            my.showToast({
                content: '请输入正确的手机号',
                duration: 2000
            });
            this.setData({
                submitBtnStatus:false
            })
            return;
        }
        let smsCode = this.data.smsCode;
        if(!smsCode){ // 验证短信
            my.showToast({
                content: '请输入短信验证码',
                duration: 2000
            });
            this.setData({
                submitBtnStatus:false
            })
            return;
        }
        const channel = getApp().globalQuery.channel || null;
        HttpApi.getBindUser({
            phone: phone,
            code: smsCode,
            random: Math.random(),
            channel
        }).then(resp=>{
            if (resp.code == 200) {
                clearInterval(that.itr);
                my.setStorageSync({
                    key: 'bindStatus',
                    data: true
                });
                my.redirectTo({
                    url: that.data.path
                })
            }else{
                my.showToast({
                    type: 'error',
                    content: resp.message,
                    duration: 2000
                });
                that.setData({
                    submitBtnStatus:false
                })
            }
        }).catch(err=>{
            my.showToast({
                content: err,
                duration: 2000
            });
            that.setData({
                submitBtnStatus:false
            })
        })
    },
});