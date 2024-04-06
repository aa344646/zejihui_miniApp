import afterService from '/api/afterService.js';
import env from '/util/env';
import util from '/util/util.js';
const app = getApp();
Page({
    data: {
        array: [
            {
                name: '商家未按时发货'
            },
            {
                name: '商家表示缺货'
            },
            {
                name: '商家发放的货物与描述不一致'
            },
            {
                name: '商品存在质量问题'
            },
            {
                name: '商品缺少配件'
            },
            {
                name: '其他'
            }
        ],
        havaInsurance:false, // 是否有保险
        index:'',
        reason:'',
        content:'',
        apFilePaths:[],
        commentImgUrl:[],
        result:false,
        applyTime:'',
        afterServiceDetail:{},
        params:{},  // 检测图片是否违规 
        hideModal:false,
        hideResult:false,
        animationData:{}
    },
    
    onLoad: function (options) {
        let afterServiceDetail = app.afterServiceDetail;

        let { category } = afterServiceDetail;

        let title = '';

        switch(category){
            
            case 'repair' :
                title = '申请维修';
            break; 
            case 'exchange' :
                title = '申请换货';
            break;
            case 'return' :
                title = '申请退货';
            break;

        }
        my.setNavigationBar({title});

        this.setData({

            afterServiceDetail

        })
        this.initAnimation();
    },
    // saveNoInsurance(ref){  // ref绑定一下 未来版本可用
    //     this.noInsurance = ref;
    // },
    // submitSuccess(ref){  // ref绑定一下 未来版本可用
    //     this.submitSuccess = ref;
    // },
    setContent(e){
        this.setData({
            content:e.detail.value
        });
    },
    chooseImage(){
        //调取图片相册接口
        let _this=this;
        my.chooseImage({
            count: 4-this.data.apFilePaths.length, // 默认9
            success: function (res) {
              // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
              let apFilePaths = res.apFilePaths;
              console.log(apFilePaths)
              _this.setData({
                  apFilePaths:[..._this.data.apFilePaths,...apFilePaths],
            });
            }
        })
    },
    previewImage(e){
        let index = e.currentTarget.dataset.index;
        my.previewImage({
            current: index,
            urls: this.data.apFilePaths
        });
    },
    delPhote(e){
        let index=e.currentTarget.dataset.index;
        var commentImgUrl=this.data.commentImgUrl;
        var apFilePaths=this.data.apFilePaths;
        apFilePaths.splice(index,1);
        commentImgUrl.splice(index,1);
        this.setData({
            commentImgUrl,
            apFilePaths
        });
    },
    
    bindPickerChange(e){
        //选择原因
        this.setData({
            index: e.detail.value,
            reason:this.data.array[e.detail.value].name
        })
    },
    submit(){

        let { apFilePaths , content , reason } = this.data;

        let { category : type } = this.data.afterServiceDetail;

        if(!content){

            my.showToast({
                type: 'fail',
                content: "请添加描述",
                duration: 2000,
            })

            return;

        }
        if(!apFilePaths.length){
            my.showToast({
                type: 'fail',
                content: "请添加图片",
                duration: 2000,
            })
            return;
        }
        if(type == 'exchange' || type == 'return'){
            if(!reason){
                my.showToast({
                    type: 'fail',
                    content: `请选择${type=='exchange'?'换货':'退货'}理由`,
                    duration: 2000,
                })
                return;
            }
        }
        type == 'repair'?this.getBuyInsurance():this.apply();
        
        my.showLoading({content:'请稍候'})
        // 维修的话 要查看是否有保险
        
    },
    getBuyInsurance(){

        afterService.getBuyInsurance({id:this.data.afterServiceDetail.orderId}).then(resp=>{

            if(resp.code==200)
            {   
                // let  havaInsurance = false;
                let { havaInsurance = false }  = resp.data;

                this.setData({
                    havaInsurance
                })
                if(havaInsurance) {  // 有保险 直接申请维修
                    this.apply();

                }else{   // 没保险 做弹出框
                    this.showModal('hideModal');
                    my.hideLoading();
                }
            }
            else if(resp.code==401)
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
        }).catch(err=>{
            my.showToast({
                type: 'fail',
                content: err,
                duration: 2000,
            })
        });

    },
    apply(){

        let { apFilePaths , content  } = this.data;  // 确认要申请的时候  比如维修已经确认过有保险
        util.checkContent(content).then(res=>{ // 内容过滤通过

            {   // 如果用户选择了图片  需要上传 并且验证图片是否违规
                this.upLoadImg(this.callback);
            }
    
            }).catch(err=>{
                my.showToast({
                    type: 'fail',
                    content: err,
                    duration: 2000,
                })
        });
    },
    upLoadImg(callback){
        let _this=this;
        let pics=_this.data.apFilePaths;
        let params = {
          len:pics.length,
          picUrl:[]
        };
        app.upLoadImg({
            url:'aliFileUpload/imgFileUpload/comment',//这里是你图片上传的接口
            path:pics,//这里是选取的图片的地址数组
            getFile(picUrl,i){ //每次只上传一张图片后的回调 再这里对数据进行处理 对图片进行过滤
              _this.setData({
                  commentImgUrl:[..._this.data.commentImgUrl,{url : picUrl}]
              });
              params.picUrl.push(picUrl.indexOf('http')>-1?picUrl:env.image_host+picUrl);
              params.i = i;
              util.checkPic(params).then(res=>{
                params = res;
                _this.setData({
                  params
                })
                if((i+1) == params.len && !params.fail){  // 全部图片都已过滤完成 没有问题  可以提交
                  callback && callback(_this);
                }else if((i+1) == params.len && params.fail){
                  my.showToast({
                    type: 'fail',
                    content: "您上传的图片未能通过审核，请重新添加!",
                    duration: 2000,
                  })
                }
              }).catch(err=>{
                my.showToast({
                    type: 'fail',
                    content: err,
                    duration: 2000,
                  })
    
              }); // 对图片过滤
              
            },
        })
    },
    callback(_this){
        let { category : type , orderId} = _this.data.afterServiceDetail;
        let api = null;
        let params = {
            orderId,
            explanation:_this.data.content,
            imgJson:JSON.stringify(_this.data.commentImgUrl),
        }
        if(type == 'repair'){

            api = 'applyRepair';
            
        }else if(type == 'exchange'){

            api = 'applyExchange';

            params.reason = _this.data.reason;

        }else {

            api = 'applyReturn';

            params.reason = _this.data.reason;

        }
        afterService[api](params).then(resp=>{

            if(resp.code==200)
            {
                let { applyTime } = resp.data;

                _this.setData({

                    applyTime,

                    result:true

                })
                my.hideLoading();

                _this.showModal('hideResult');

            }else if(resp.code==401){
                my.hideLoading();
                my.showToast({
                    type: 'fail',
                    content: "请先登录!",
                    duration: 2000,
                  })
            }else{
                my.hideLoading();
                my.showToast({
                    type: 'fail',
                    content: resp.message,
                    duration: 2000,
                })
            }

        }).catch(err=>{
            my.hideLoading();
            my.showToast({
                type: 'fail',
                content: err,
                duration: 2000,
            })
            
        });
    },
    callphone(){
        my.makePhoneCall({
            number: this.data.afterServiceDetail.shopContactNumber.split(',')[0] 
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
                hideModal: false,
                hideResult: false
            });
        }.bind(this), 200)
    },
    showModal(key){
        let animation = this.animation;
        animation.translateY(0).step();
        this.setData({
            [key]: true
        });
        setTimeout(() => {
            this.setData({
                animationData: animation.export()
            });
        }, 1);
        
    }
})