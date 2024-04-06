//上传文件
import env from './env.js';

export function upLoadImg(data){
    var that=this,i=data.i?data.i:0,//当前上传的哪张图片
    success=data.success?data.success:0,//上传成功的个数
    fail=data.fail?data.fail:0;//上传失败的个数
    my.uploadFile({
        url: env.api_host+data.url,
        filePath: data.path[i],
        fileName: 'file',//这里根据自己的实际情况改
        fileType:'image',
        success: (resp) => {
            if(resp.statusCode==200)
            {
                let url = JSON.parse(resp.data).data;
                success++;//图片上传成功，图片上传成功的变量+1
                data.getFile(url,i)
            }
        },
        fail: (res) => {
            fail++;//图片上传失败，图片上传失败的变量+1
        },
        complete: () => {
            i++;//这个图片执行完上传后，开始上传下一张
            if(i==data.path.length){   //当图片传完时，停止调用

            }else{//若图片还没有传完，则继续调用函数
                data.i=i;
                data.success=success;
                data.fail=fail;
                that.upLoadImg(data);
            }
        }
    });
}