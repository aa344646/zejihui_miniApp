
const app = getApp();
Page({
  data: {
    cameraType: 'sfzLicense_front', // sfzLicense_front,sfzLicense_back,driverLicense_front,driverLicense_back,driverLicense_rotate
  },
  onLoad({ cameraType }) {
    my.setNavigationBar({
      backgroundColor: '#222222',
    });
    app.shareData.nextLicenseState = null;
    this.setData({ cameraType });
  },
  onExitCameraHandle() {
    my.navigateBack();
  },
  onUploadFileSuccessful(params) {
    // const { type, mediaId, imageBase64 } = params;
    // let nextLicenseState = {
    //   name: '人生赢家',
    //   certNo: '320283199406078877',
    //   address: '江苏省无锡市市玫瑰香缇',
    // };
    // for (let key in nextLicenseState) {
    //   if (typeof nextLicenseState[key] === 'undefined') {
    //     delete nextLicenseState[key];
    //   }
    // }
    // app.shareData.nextLicenseState = {
    //   data: nextLicenseState,
    //   mediaId,
    //   imageBase64,
    // };
    // return new Promise((resolve, reject) => {
    //   setTimeout(() => {
    //     resolve(nextLicenseState)
    //   }, 1000)
    // });
  },
});
