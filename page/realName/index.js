import HttpApi from "../../api/lease";
import util from "../../util/util";
import env from "../../util/env";
Page({
  data: {
    path: "", //path存放的位置
    name: "", // 用户手机号
    certNo: "",
    submitBtnStatus: false
  },
  onLoad(query) {
    let path = query.url || "";
    this.setData({
      path: path
    });
  },
  iptName(e) {
    // 验证手机号正常就显示图片
    let name = e.detail.value || "";
    this.setData({
      name: name
    });
  },
  iptCertNo(e) {
    let certNo = e.detail.value || "";
    this.setData({
      certNo: certNo
    });
  },
  submit() {
    // 提交
    if (this.data.submitBtnStatus) return;
    let that = this;
    this.setData({
      submitBtnStatus: true
    });
    let name = this.data.name;
    let certNo = this.data.certNo;
    HttpApi.realname({
      name: name,
      certNo: certNo
    }).then(resp => {
        if (resp.code == 200) {
          // 这里增加人脸识别 识别完成后再做跳转
          HttpApi.faceInit().then(res => {
            this.setData({
              submitBtnStatus: false
            });
            if (res.code === 200) {
              const certifyId = res.data.certifyId;
              const certifyUrl = res.data.certifyUrl;
              const requestNo = res.data.requestNo;
              my.startAPVerify({
                url: certifyUrl,
                certifyId: certifyId,
                success: (verifyResult) => {
                  console.log({
                    verifyResult
                  });
                  // 认证结果回调触发, 以下处理逻辑为示例代码，开发者可根据自身业务特性来自行处理
                  if (verifyResult.resultStatus === "9000") {
                    // 验证成功，接入方在此处处理后续的业务逻辑
                    // ...
                    HttpApi.faceCertify({ requestNo })
                      .then(res => {
                        my.redirectTo({
                          url: that.data.path
                        });
                      })
                      .catch(e => {
                        my.redirectTo({
                          url: that.data.path
                        });
                      });
                    return;
                  }
                  // 用户主动取消认证
                  if (verifyResult.resultStatus === "6001") {
                    // 可做下 toast 弱提示
                    my.showToast({
                      type: "fail",
                      content: "用户取消认证",
                      duration: 3000
                    });
                    return;
                  }
                  const errorCode =
                    verifyResult.result && verifyResult.result.errorCode;
                  // 其他结果状态码判断和处理 ...
                  if (errorCode) {
                    my.showToast({
                      type: "fail",
                      content: "系统开小差了，请稍后",
                      duration: 3000
                    });
                  }
                },
                fail: (res) => {
                  my.showToast({
                    type: "fail",
                    content: res,
                    duration: 3000
                  });
                },
              });
            } else {
              that.setData({
                submitBtnStatus: false
              });
              my.showToast({
                type: "fail",
                content: res.message,
                duration: 3000
              });
            }
          }).catch(e => {
            my.showToast({
              type: "fail",
              content: e.message || e,
              duration: 3000
            });
            that.setData({
              submitBtnStatus: false
            });
          });
          return;
        } else {
          my.showToast({
            type: "error",
            content: resp.message,
            duration: 2000
          });
        }
        that.setData({
          submitBtnStatus: false
        });
      })
      .catch(err => {
        my.showToast({
          content: err,
          duration: 2000
        });
        that.setData({
          submitBtnStatus: false
        });
      });
  }
});
