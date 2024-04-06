const config =1; //1正式 0测试

let env = {};

if(config===1) //正式服
{
  env = {
    server_host:'https://h5.zejihui.com.cn/',
    api_host: 'https://ali-mini.zejihui.com.cn/v5_0_0/',
    image_host: 'https://img.zejihui.com.cn/',
  }
}
else //测试服
{
  env = {
    server_host:'http://h5-test1210.zejihui.com.cn/',
     api_host:'https://ali-mini-test.zejihui.com.cn/v5_0_0/',
    //  api_host:'http://47.99.128.189:8787/v5_0_0/',
     //api_host:'http://116.62.119.245:8787/v5_0_0/',
     
    //api_host:'http://xyzapi.mibaostore.cn/v5_0_0/',
    //api_host:'http://49d340a3.ngrok.io:8787/v5_0_0/',   // 小潘机器quick
    image_host: 'https://zubei-oss.oss-cn-hangzhou.aliyuncs.com/',
  }
}

export default env;