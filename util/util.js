const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
const util = {
  validatePhone(phone)
  {// 验证手机
    let regPhone = /^1[3456789]\d{9}$/g;
    return regPhone.test(phone);
  },
  getQueryString(url, name)
  {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    let queryStr = url.split('?')[1];
    var r = queryStr.match(reg);
    if (r != null) return unescape(r[2]); return null;
  },
  formatTime (date,params){
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()
    let link = '/';
    link = params.jsonMode=='through'?'-':'/';

    if(params.type=="easy"){
      return [year, month, day].map(formatNumber).join(link)
    }else if(params.type=="object"){
      return {

          year:formatNumber(year),
          month:formatNumber(month),
          day:formatNumber(day),
          hour:formatNumber(hour),
          minute:formatNumber(minute),
          second:formatNumber(second),
      }
    }
    return [year, month, day].map(formatNumber).join(link) + ' ' + [hour, minute, second].map(formatNumber).join(':')
  },
  checkContent(content){  // 对用户输入的内容做一次过滤 
    return new Promise((resolve,reject)=>{
      my.textRiskIdentification({
        content,
        type: ['keyword', '0', '1', '2', '3'],
        success: (res) => {
          let result = res.result;
          let flag = true;
          for(let i = 0;i<result.length;i++){
            if(result[i].hitKeywords){  // 关键字 如果命中了自定义的关键字 才会反回hitKeywords 不会反回score 目前没有设置什么关键字 所以只做预留
              flag = false;
              break;
            }
            if(parseFloat(result[i].score)>=90){
              flag = false;
              break;
            }
          }
          if(!flag){  // 内容验证不通过
            reject('您的评论内容包含敏感词，请删除后再提交!');
          }
          resolve();
        },
        fail: (res) => {
          reject(JSON.stringify(res));
        },
      });
    })
  },
  checkPic(params){
    let setInt = null;
    const that = this;
    params.success = params.success?params.success:0;
    params.fail = params.fail?params.fail:0;
    return new Promise((resolve,reject)=>{
      my.ap.imgRisk({
        pid:'2088831566726462',
        appId:'2021002189690874',
        bizContext:{
          "risk_type":"img_risk",
          "content":params.picUrl[params.i]
        },
        success: (res) => {
          let applyId = JSON.parse(res.riskResult).apply_id;
          setInt = setInterval(()=>{
            that.getCheckPicResult(applyId).then(res=>{
              if( res != ''){ // 保证图片结果一定能回来 而非空
                clearInterval(setInt);
                if(res == 'PASSED'){ // 图片审核通过
                  params.success = ++params.success;
                  resolve(params);
                }else{ // 图片审核未通过
                  params.fail = ++params.fail;
                  resolve(params);
                }
              }
            }).catch(err=>{
              reject(err);
            })
          },300)  // 三百ms查询一次 以免用户等待时间过长
        },
        fail: (err) => {
          console.log(err)
        },
        complete:() => {

        }
      });
    })
  },
  getCheckPicResult(applyId){
    const that = this;
    return new Promise((resolve,reject)=>{
      my.ap.imgRiskCallback({
        pid:'2088831566726462',  
        appId:'2021002189690874',  
        bizContext:{
          "risk_type": "img_risk_result",
          "apply_id": applyId
        },
        success(res) {
          let result = JSON.parse(res.riskResult).action;
          resolve(result);
        },
        fail(err){
        }
      })
    })
  }
};

export default util;