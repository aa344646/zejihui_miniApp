import orderApi from "/api/order";
import env from '/util/env';
import util from '/util/util.js';
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
      array: [
          {
              name: '赔偿价格超出实际损坏价格'
          },
          {
              name: '并非人为损坏（有相应证明）'
          },
          {
              name: '已与商家协商其他处理方案'
          },
          {
              name: '其他'
          }
      ],
      index:'',
      reason:'',
      content:'',
      hideModal:true,
      goodsInfo:{},//商品信息
      MerchantInfo:{},//商家信息
      orderId:'',
      apFilePaths:[],
      commentImgUrl:[],
      params:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
    onLoad: function (options) {
        // this.selectComponent("#submitSuccess").initAnimation();
        this.setData({
            orderId:options.id,
            goodsInfo:JSON.parse(options.goodsInfo||'{}'),
            MerchantInfo:JSON.parse(options.MerchantInfo||'{}')
        })
    },
    bindPickerChange(e){
        //选择原因
        this.setData({
            index: e.detail.value,
            reason:this.data.array[e.detail.value].name
        })
    },
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
    submit(){
      let data={
          id:this.data.orderId,
          remark:this.data.reason,
          refuseReasons:this.data.content,
          image:JSON.stringify(this.data.commentImgUrl||[])
      };
      if(!data.remark)
      {
          my.showToast({
            content: "请选择拒绝赔偿理由",
            duration: 2000,
          })
          return;
      }
        if(!data.refuseReasons)
        {
            my.showToast({
              content: "请填写详细描述",
              duration: 2000,
            })
            return;
        }
        if(!this.data.apFilePaths.length)
        {
            my.showToast({
              content: "请上传拒绝赔偿的图片",
              duration: 2000,
            })
            return;
        }
        let { apFilePaths , content  } = this.data;  // 确认要申请的时候
        util.checkContent(content).then(res=>{ // 内容过滤通过
          // 如果用户选择了图片  需要上传 并且验证图片是否违规

            this.upLoadImg(this.callback);
  
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
      let data={
          id:_this.data.orderId,
          remark:_this.data.reason,
          refuseReasons:_this.data.content,
          image:JSON.stringify(_this.data.commentImgUrl||[])
      };
      orderApi.refuseCompensate(data).then(resp=>{
          if(resp.code==200)
          {
              my.showToast({
                type:'success',
                content: "提交成功!",
                duration: 2000,
              })
              _this.setData({
                hideModal:false
              })
          }
          else
          {
              my.showToast({
                type:'fail',
                content: resp.message,
                duration: 2000,
              })
          }
        }).catch(err=>{
              my.showToast({
                type:'fail',
                content: err,
                duration: 2000,
              })
        });
    },
    hideModal(){
      this.setData({
        hideModal:true
      })
    },
    backToOrder(){
        my.navigateTo({
            url:`/page/order/orderDetail/orderDetail?id=${this.data.orderId}`
        })
    }
})