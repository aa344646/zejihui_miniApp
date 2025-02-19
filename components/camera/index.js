import _extends from "@babel/runtime/helpers/extends";
import _regeneratorRuntime from "@babel/runtime/regenerator";
import _asyncToGenerator from "@babel/runtime/helpers/asyncToGenerator";
import leaseApi from "/api/lease.js";
const app = getApp();
var imageMime = "data:image/png;base64,";
var ATFSBizCode = "industry_etc";
var aiCameraContext = null;
var CAMERA_CONFIG = {
  sfzLicense_front: {
    cardName: "身份证",
    cardPos: "人像页"
  },
  sfzLicense_back: {
    cardName: "身份证",
    cardPos: "国徽页"
  },
  driverLicense_front: {
    cardName: "行驶证",
    cardPos: "正页"
  },
  driverLicense_back: {
    cardName: "行驶证",
    cardPos: "副页"
  },
  driverLicense_rotate: {
    cardName: "45度角",
    cardPos: "正页"
  },
  etcDevice_front: {
    cardName: "45度角",
    cardPos: "正页"
  },
  userInfo_contract: {
    cardName: "手持身份证正面照",
    cardPos: ""
  },
  userInfo_bankCard: {
    cardName: "银行卡",
    cardPos: ""
  },
  userInfo_retired: {
    cardName: "离退休表",
    cardPos: ""
  },
  userInfo_cancellation: {
    cardName: "户口注销证明",
    cardPos: ""
  }
};
var PHOTO_UPLOAD_EXAMPLE = {
  sfzLicense_front: {
    image: [
      "https://gw.alipayobjects.com/mdn/rms_5c69fa/afts/img/A*ItSETqgK3Z0AAAAAAAAAAABkARQnAQ",
      "https://gw.alipayobjects.com/mdn/rms_5c69fa/afts/img/A*BEg8T6TcJ2wAAAAAAAAAAABkARQnAQ",
      "https://gw.alipayobjects.com/mdn/rms_5c69fa/afts/img/A*E4EYQKAcY5sAAAAAAAAAAABkARQnAQ"
    ]
  },
  sfzLicense_back: {
    image: [
      "https://gw.alipayobjects.com/mdn/rms_5c69fa/afts/img/A*R0OATJCGQ9gAAAAAAAAAAABkARQnAQ",
      "https://gw.alipayobjects.com/mdn/rms_5c69fa/afts/img/A*j8JaSbVfRXEAAAAAAAAAAABkARQnAQ",
      "https://gw.alipayobjects.com/mdn/rms_5c69fa/afts/img/A*zgOlSY212ooAAAAAAAAAAABkARQnAQ"
    ]
  },
  sfzLicenseProxy_front: {
    image: [
      "https://gw.alipayobjects.com/mdn/rms_5c69fa/afts/img/A*ItSETqgK3Z0AAAAAAAAAAABkARQnAQ",
      "https://gw.alipayobjects.com/mdn/rms_5c69fa/afts/img/A*BEg8T6TcJ2wAAAAAAAAAAABkARQnAQ",
      "https://gw.alipayobjects.com/mdn/rms_5c69fa/afts/img/A*E4EYQKAcY5sAAAAAAAAAAABkARQnAQ"
    ]
  },
  sfzLicenseProxy_back: {
    image: [
      "https://gw.alipayobjects.com/mdn/rms_5c69fa/afts/img/A*R0OATJCGQ9gAAAAAAAAAAABkARQnAQ",
      "https://gw.alipayobjects.com/mdn/rms_5c69fa/afts/img/A*j8JaSbVfRXEAAAAAAAAAAABkARQnAQ",
      "https://gw.alipayobjects.com/mdn/rms_5c69fa/afts/img/A*zgOlSY212ooAAAAAAAAAAABkARQnAQ"
    ]
  },
  driverLicense_front: {
    image: [
      "https://gw.alipayobjects.com/mdn/rms_5c69fa/afts/img/A*73MBR6uSmhIAAAAAAAAAAABkARQnAQ",
      "https://gw.alipayobjects.com/mdn/rms_5c69fa/afts/img/A*E_7oSo_RpnEAAAAAAAAAAABkARQnAQ",
      "https://gw.alipayobjects.com/mdn/rms_5c69fa/afts/img/A*YUt9Q4yILjAAAAAAAAAAAABkARQnAQ"
    ]
  },
  driverLicense_back: {
    image: [
      "https://gw.alipayobjects.com/mdn/rms_5c69fa/afts/img/A*hX0qS4XtNl0AAAAAAAAAAABkARQnAQ",
      "https://gw.alipayobjects.com/mdn/rms_5c69fa/afts/img/A*P795RqCp7F0AAAAAAAAAAABkARQnAQ",
      "https://gw.alipayobjects.com/mdn/rms_5c69fa/afts/img/A*D5B-TIAUrvAAAAAAAAAAAABkARQnAQ"
    ]
  },
  driverLicense_rotate: {
    image: [
      "https://gw.alipayobjects.com/mdn/rms_5c69fa/afts/img/A*8Au4SaKc0y0AAAAAAAAAAABkARQnAQ",
      "https://gw.alipayobjects.com/mdn/rms_5c69fa/afts/img/A*HbNyT6cwlnwAAAAAAAAAAABkARQnAQ",
      "https://gw.alipayobjects.com/mdn/rms_5c69fa/afts/img/A*F7zxRKhUQS4AAAAAAAAAAABkARQnAQ"
    ]
  },
  carHead_out: {
    image: [
      "https://gw.alipayobjects.com/mdn/rms_5c69fa/afts/img/A*8Au4SaKc0y0AAAAAAAAAAABkARQnAQ",
      "https://gw.alipayobjects.com/mdn/rms_5c69fa/afts/img/A*HbNyT6cwlnwAAAAAAAAAAABkARQnAQ",
      "https://gw.alipayobjects.com/mdn/rms_5c69fa/afts/img/A*F7zxRKhUQS4AAAAAAAAAAABkARQnAQ"
    ]
  },
  carInner_inner: {
    image: [
      "https://gw.alipayobjects.com/mdn/rms_5c69fa/afts/img/A*l8g3S7oNUb0AAAAAAAAAAABkARQnAQ",
      "https://gw.alipayobjects.com/mdn/rms_5c69fa/afts/img/A*2fI5RpSXa2QAAAAAAAAAAABkARQnAQ",
      "https://gw.alipayobjects.com/mdn/rms_5c69fa/afts/img/A*6Y2HR6cc2bwAAAAAAAAAAABkARQnAQ"
    ]
  },
  userInfo_contract: {
    image: []
  },
  userInfo_bankCard: {
    image: []
  },
  userInfo_retired: {
    image: []
  },
  userInfo_cancellation: {
    image: []
  }
};
Component({
  props: {
    // 当前拍照的证件类型，sfzLicense_front，sfzLicense_back，driverLicense_front，driverLicense_back，driverLicense_rotate
    type: "sfzLicense_front",
    // 上传文件成功的回调
    onUploadFileSuccessful: (function() {
      var _onUploadFileSuccessful = _asyncToGenerator(
        /*#__PURE__*/ _regeneratorRuntime.mark(function _callee() {
          return _regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch ((_context.prev = _context.next)) {
                case 0:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee);
        })
      );

      function onUploadFileSuccessful() {
        return _onUploadFileSuccessful.apply(this, arguments);
      }

      return onUploadFileSuccessful;
    })(),
    // 退出相机
    onExitCameraHandle: function onExitCameraHandle() {}
  },
  mixins: [],
  data: {
    canvasHeight: 0,
    canvasWidth: 0,
    cameraConfig: {},
    imageBase64: "",
    // base64拍照的图片
    // 准备拍照ready, 拍照成功takePhotoSuccess, 正在上传uploading, 上传失败uploadFailed，识别失败orcFailed,不支持企业用户enterpriseOwnerNotSupport
    cameraStatus: "ready",
    takePhotoing: false,
    tipsImages: [],
    // 拍照提示图片
    errorMsg: "" // 识别失败的错误信息
  },
  didMount: function didMount() {
    // TODO can-i-use ai-camera 检测
    this.setData({
      cameraConfig: CAMERA_CONFIG[this.props.type],
      tipsImages: PHOTO_UPLOAD_EXAMPLE[this.props.type].image
    });
    aiCameraContext = my.createAICameraContext("ai-camera");
    this.ctx = my.createCanvasContext("canvas");
  },
  didUpdate: function didUpdate(_ref) {
    var type = _ref.type;

    if (type !== this.props.type) {
      this.setData({
        cameraConfig: CAMERA_CONFIG[this.props.type]
      });
    }
  },
  methods: {
    error: function error(e) {
      console.log("---------camera onerror---------", e);
    },
    stop: function stop(e) {
      console.log("---------camera onstop---------", e);
    },

    /**
     * ai-camera组件拍照
     * 文档: https://yuque.antfin-inc.com/tiny-tmp/api/vqe745
     */
    onTakePhoto: function onTakePhoto(e) {
      var _this = this;

      return _asyncToGenerator(
        /*#__PURE__*/ _regeneratorRuntime.mark(function _callee2() {
          return _regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
              switch ((_context2.prev = _context2.next)) {
                case 0:
                  if (aiCameraContext) {
                    aiCameraContext.takePhoto({
                      quality: "normal",
                      isNeedBase64: true,
                      success(e) {
                        var tempImagePath = e.tempImagePath,
                          imageBase64 = e.imageBase64;
                        if (tempImagePath) {
                          _this.setData({
                            imageBase64: imageMime + imageBase64,
                            tempImagePath: tempImagePath,
                            cameraStatus: "takePhotoSuccess"
                          });
                        }
                      },
                      fail: function fail() {
                        _this.setData({
                          cameraStatus: "uploadFailed"
                        });
                      }
                    });
                  }

                case 1:
                case "end":
                  return _context2.stop();
              }
            }
          }, _callee2);
        })
      )();
    },

    /**
     * 上传图片jsapi
     * 文档: http://jsapi.alipay.net/jsapi/util/upload-image.html
     * 文档：http://jsapi.alipay.net/alipayjsapi/media/file/uploadFile.html
     */
    async toActionUploadImage(type) {
      this.setData({
        cameraStatus: "uploading"
      });
      const imageBase64 = this.data.imageBase64;
      let type1 = this.props.type;
      if (type1 === "sfzLicense_front") {
        type1 = "idcardPros";
      }
      if (type1 === "sfzLicense_back") {
        type1 = "idcardCons";
      }
      if (type1 === "userInfo_contract") {
        type1 = "handheldIdCard";
      }
      if (type1 === "userInfo_bankCard") {
        type1 = "bankCard";
      }
      console.warn({
        imageBase64
      })
      if (imageBase64) {
        try {
          const res = await leaseApi.idCardUpload({
            type: type1,
            image: imageBase64
          });
          if (res.code === 200) {
            // 上传成功
            app.shareData[type1] = imageBase64;
            this.onExitCameraHandle();
          } else {
            my.showToast({
              type: "fail",
              content: res.message,
              duration: 2000
            });
            this.setData({
              cameraStatus: "uploadFailed"
            });
            // 上传有问题 提示错误
          }
        } catch (e) {
          my.showToast({
            type: "fail",
            content: e.message,
            duration: 3000
          });
          this.setData({
            cameraStatus: "uploadFailed"
          });
        }
      }
      return;
      var _this2 = this;
      return _asyncToGenerator(
        /*#__PURE__*/ _regeneratorRuntime.mark(function _callee3() {
          var tempImagePath, multimediaID, result;
          return _regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
              switch ((_context3.prev = _context3.next)) {
                case 0:
                  if (type === void 0) {
                    type = "";
                  }
                  // 支付宝小程序方案
                  tempImagePath = _this2.data.tempImagePath;

                  _this2.setData({
                    takePhotoing: true
                  });

                  _context3.next = 5;
                  return uploadImageHandle(tempImagePath);

                case 5:
                  multimediaID = _context3.sent;

                  _this2.setData({
                    takePhotoing: false
                  });
                  if (!(type === "album")) {
                    _context3.next = 12;
                    break;
                  }

                  _context3.next = 10;
                  return downloadImage(multimediaID);

                case 10:
                  result = _context3.sent;

                  if (result.data) {
                    _this2.setData({
                      cameraStatus: "takePhotoSuccess",
                      imageBase64: imageMime + result.data
                    });
                  }

                case 12:
                  if (!multimediaID) {
                    _this2.setData({
                      cameraStatus: "uploadFailed"
                    });
                  } else {
                    _this2.setData(
                      {
                        multimediaID: multimediaID
                      },
                      function() {
                        _this2.uploadImageSuccessHandle();
                      }
                    );
                  }

                case 14:
                case "end":
                  return _context3.stop();
              }
            }
          }, _callee3);
        })
      )();
    },
    // 调用uploadImage API成功的回调
    uploadImageSuccessHandle: function uploadImageSuccessHandle() {
      var _this3 = this;

      return _asyncToGenerator(
        /*#__PURE__*/ _regeneratorRuntime.mark(function _callee4() {
          var type,
            _this3$data,
            imageBase64,
            cameraStatus,
            multimediaID,
            result;

          return _regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
              switch ((_context4.prev = _context4.next)) {
                case 0:
                  type = _this3.props.type;
                  (_this3$data = _this3.data),
                    (imageBase64 = _this3$data.imageBase64),
                    (cameraStatus = _this3$data.cameraStatus),
                    (multimediaID = _this3$data.multimediaID);

                  if (!(cameraStatus === "uploading")) {
                    _context4.next = 4;
                    break;
                  }

                  return _context4.abrupt("return");

                case 4:
                  _this3.changeCameraStatus("uploading", ""); // 如果是识别的身份证人面页面或者是行驶证正页的话，对行驶证和身份证做字段长度对比，如果长度不一致，且行驶证字数大于5。

                  _context4.next = 7;
                  return _this3.props.onUploadFileSuccessful({
                    type: type,
                    mediaId: multimediaID,
                    imageBase64: imageBase64
                  });

                case 7:
                  result = _context4.sent;
                  console.log("upload-result:" + JSON.stringify(result));

                  if (result && !result.isError) {
                    // if (type === 'driverLicense_front' && result.owner && name && result.owner.length > 10 && result.owner !== name) {
                    // this.changeCameraStatus(result.errorStatus || 'enterpriseOwnerNotSupport', '');
                    // }
                    // if (type === 'sfzLicense_front' && owner && result.name && owner.length > 10 && owner !== result.name) {
                    //   this.changeCameraStatus('enterpriseOwnerNotSupport', '');
                    // }
                    // if (this.data.cameraStatus === 'enterpriseOwnerNotSupport') {
                    //   getApp().shareData.nextLicenseState = null;
                    //   return;
                    // }
                    _this3.onExitCameraHandle();
                  } else {
                    _this3.changeCameraStatus("orcFailed", result.errorMsg);
                  }

                case 10:
                case "end":
                  return _context4.stop();
              }
            }
          }, _callee4);
        })
      )();
    },
    // 从相册选择照片进行上传
    onChoseImageFromAlbum: function onChoseImageFromAlbum(e) {
      var _this4 = this;

      my.chooseImage({
        chooseImage: 1,
        sourceType: ["album"],
        success: (function() {
          var _success = _asyncToGenerator(
            /*#__PURE__*/ _regeneratorRuntime.mark(function _callee5(res) {
              console.log(res);
              return _regeneratorRuntime.wrap(function _callee5$(_context5) {
                while (1) {
                  switch ((_context5.prev = _context5.next)) {
                    case 0:
                      // my.getImageInfo({
                      //   src: res.apFilePaths[0],
                      //   success:r => {
                      //     const { width, height } = r;
                      //     _this4.setData({
                      //       canvasWidth: width,
                      //       canvasHeight: height
                      //     })
                      //     console.warn({
                      //       width,
                      //       height
                      //     })
                      //     _this4.ctx.drawImage(res.apFilePaths[0], 0, 0,width,height);
                      //     _this4.ctx.draw(false, () => {
                      //       _this4.ctx.toDataURL({
                      //       }).then(dataURL => {
                      //         console.log('dataURL', dataURL)
                      //         _this4.setData({
                      //           imageBase64: dataURL,
                      //           tempImagePath: res.apFilePaths[0]
                      //         });
                      //         _this4.toActionUploadImage();
                      //       })
                      //     }), (e) => {
                      //       console.warn({
                      //         e
                      //       })
                      //     }
                      //   },
                      //   fail: err => {
                      //     console.warn({
                      //       err
                      //     })
                      //   }
                      // })
                      let fs = my.getFileSystemManager();
                      fs.readFile({
                        filePath: res.apFilePaths[0],
                        encoding: 'base64',
                        success: async (r) => {
                          _this4.setData({
                            imageBase64: imageMime + r.data,
                            tempImagePath: res.tempImagePath,
                            cameraStatus: "takePhotoSuccess"
                          });
                        //   var tempImagePath = e.tempImagePath,
                        //   imageBase64 = e.imageBase64;
                        // if (tempImagePath) {
                        //   _this.setData({
                        //     imageBase64: imageMime + imageBase64,
                        //     tempImagePath: tempImagePath,
                        //     cameraStatus: "takePhotoSuccess"
                        //   });
                        }
                      });
                      // _this4.setData(
                      //   {
                      //     tempImagePath: res.apFilePaths
                      //   },
                      //   function() {
                      //     _this4.toActionUploadImage("album");
                      //   }
                      // );
                    // _this4.setData({
                    //   tempImagePath: res.apFilePaths[0]
                    // }, function () {
                    //   // _this4.toActionUploadImage('album');
                    // });

                    case 1:
                    case "end":
                      return _context5.stop();
                  }
                }
              }, _callee5);
            })
          );

          function success(_x) {
            return _success.apply(this, arguments);
          }

          return success;
        })()
      });
    },

    /***
     * 确认清晰上传
     */
    onConfirmPhotoClearly: function onConfirmPhotoClearly(e) {
      this.toActionUploadImage();
    },

    /**
     * 重新拍摄
     */
    onReTakePhoto: function onReTakePhoto(e) {
      this.setData({
        cameraStatus: "ready",
        imageBase64: "",
        tempImagePath: "",
        errorMsg: ""
      });
    },
    // 关闭camera组件
    onExitCameraHandle: function onExitCameraHandle() {
      this.setData({
        cameraStatus: "ready",
        imageBase64: ""
      });
      this.props.onExitCameraHandle();
    },
    changeCameraStatus: function changeCameraStatus(cameraStatus, errorMsg) {
      this.setData({
        cameraStatus: cameraStatus,
        errorMsg: errorMsg
      });
    }
  }
});

function uploadImageHandle(tempImagePath) {
  return new Promise(function(resolve) {
    var param = {
      data: tempImagePath,
      // base64编码过的图片字节流 或 图片的文件URL“file://xxxx”
      dataType: "fileURL",
      // 指定上传时使用的是字节流还是绝对物理路径，'dataURL'-字节流，‘fileURL'-文件URL，默认为'dataURL'
      // 可选，默认为4。 0-低质量，1-中质量，
      // 2-高质量，3-不压缩，4-根据网络情况自动选择
      compress: 2,
      business: ATFSBizCode // 可选， 默认为“NebulaBiz”
    };
    my.call("uploadImage", _extends({}, param), function(res) {
      var errorMessage = res.errorMessage,
        multimediaID = res.multimediaID;

      if (!multimediaID) {
        my.alert({
          content:
            "\u4E0A\u4F20\u6587\u4EF6\u5931\u8D25," +
            (errorMessage || "请重试"),
          buttonText: "确定"
        });
      }

      resolve(multimediaID || "");
    });
  });
}

function downloadImage(multimediaID) {
  return new Promise(function(resolve) {
    my.call(
      "downloadImage",
      {
        multimediaID: multimediaID,
        // multimediaId： 可以是url，id， base64(带有image**base64头部的)
        business: "multimedia",
        // 该项业务存储标识 可选， 默认为“NebulaBiz”
        // width: 1200,
        // height: 500,
        match: 1,
        // 必选，默认为0。0-等比缩放 1-大图 2-原图 3-非等比裁剪
        quality: 80
      },
      function(result) {
        resolve(result);
      }
    );
  });
}
