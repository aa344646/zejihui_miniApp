import orderApi from '/api/order.js';
import env from '/util/env.js';
import util from '/util/util.js';
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    finish:false,//路由传递
    content:'',//接收的评价内容
    orderId:'',
    score:0,//评分
    commentImgUrl:[],//接收上传的图片
    apFilePaths:[],  // 上传的图片
    goodsInfo:{},
    params:{}
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      orderId:options.id,
      finish:options.finish=='false'?false:true,
      goodsInfo:JSON.parse(options.goodsInfo||'{}'),
    });
    if(this.data.finish){
      this.getComment();
    }
  },
  // 获取评价
  getComment(){
    orderApi.getComment({orderId:this.data.orderId})
      .then(resp=>{
        if(resp.code==200)
        {
          let data=resp.data||{};
          let commentImgUrl=JSON.parse(data.commentImgUrl||'[]');
          let commentSeeImgUrl = [];
          commentImgUrl.forEach(item=>
          {
            if(item.url.indexOf('http')===0)
            {
              item.url = item.url;
            }
            else
            {
              item.url=env.image_host+ item.url;
            }
  
            item.src = item.url + app.getImageSuffix(3);
            commentSeeImgUrl.push(item.url)
            
          });
          this.setData({
            commentImgUrl,
            commentSeeImgUrl,
            content:data.content,
            score:data.score,
          })
        }
        else if(resp.code==401)
        {
          //    请先登录
          // this.$login().then(()=>{
          //   this.getComment();
          // });
        }
        else
        {
          // this.$toast(resp.message)
        }
      }).catch(err=>{
      // this.$networkErr(err);
    })
  },
  //提交评价
  commentSubmit(){

    let data = this.data;
    
    let apFilePaths = this.data.apFilePaths;
    let commentImgUrl = this.data.commentImgUrl;
    
    if(!data.score)
    {
      my.showToast({
        content: "请打分",
        duration: 2000,
      })
      return;
    }
    if(!data.content)
    {
      my.showToast({
        content: "请填写评价内容",
        duration: 2000,
      })
      return;
    }else{
      util.checkContent(data.content).then(res=>{ // 内容过滤通过

        if(!apFilePaths.length){  // 如果用户没有选择图片   直接下一步即可   
          this.callback(this);

        }else{   // 如果用户选择了图片  需要上传 并且验证图片是否违规
          this.upLoadImg(this.callback);
        }

      }).catch(err=>{
        my.showToast({
          type: 'fail',
          content: err,
          duration: 2000,
        })
      });
    }
  },
  callback(_this){
    let data = _this.data;
    let params={
      score:data.score,
      content:data.content,
      commentImgUrl:JSON.stringify(data.commentImgUrl),
      orderId:data.orderId
    };
    my.confirm({
      title: '提示',
      content: '确定提交吗？',
      confirmButtonText: '提交',
      cancelButtonText: '取消',
      success: (result) => {
         if(result.confirm){
            orderApi.comment(params).then(resp=>{
              if(resp.code===200)
              {
                my.showToast({
                  type: 'success',
                  content: "评价提交成功",
                  duration: 2000,
                })
                setTimeout(()=>{
                  my.redirectTo({
                    url:`/page/order/orderDetail/orderDetail?id=${data.orderId}`
                  });
                },2000)
              }
              else if(resp.code===401)
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
            .catch(err=>{
              my.showToast({
                type: 'fail',
                content: err,
                duration: 2000,
              })
            })
         }
      },
    });
  },
  //组件传递获取评分星星数
  rate(e){
    let { index } = e.currentTarget.dataset;
    let { score } = this.data;
    if(score == index) return;
    this.setData({
      score:index
    });
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

          }); // 对图片过滤
          
        },
    })
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
  previewImage(e){
    let index = e.currentTarget.dataset.index;
    my.previewImage({
        current: index,
        urls: this.data.apFilePaths
    });
},
  previewImg(e){
    let index=e.currentTarget.dataset.index;
    let images = this.data.commentSeeImgUrl||[];
    my.previewImage({
      current: index,
      urls:images
    });
  },
  getData(obj){
    this.setData({
      commentImgUrl:obj.detail.imageUrl,
      content:obj.detail.content,
    })
  },
})