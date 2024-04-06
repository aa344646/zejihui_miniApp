// etc 完善车主资料，默认图片
var DRIVER_LICENSE_DEFAULT_PIC = {
  sfzLicense_front: 'https://gw.alipayobjects.com/mdn/rms_5c69fa/afts/img/A*syv1QJQl3rEAAAAAAAAAAABjARQnAQ',
  sfzLicense_back: 'https://gw.alipayobjects.com/mdn/rms_5c69fa/afts/img/A*GWRhQIadSQsAAAAAAAAAAABjARQnAQ',
  userInfo_contract: 'https://gw.alipayobjects.com/mdn/industry_l/afts/img/A*xgjMTrXp3FUAAAAAAAAAAABkARQnAQ',
  userInfo_bankCard: 'https://gw.alipayobjects.com/mdn/industry_l/afts/img/A*xgjMTrXp3FUAAAAAAAAAAABkARQnAQ',
}; // etc 完善车主资料，默认图片

var DRIVER_LICENSE_DEFAULT_TXT = {
  sfzLicense_front: '身份证（人像面）',
  sfzLicense_back: '身份证（国徽面）',
  userInfo_contract: '手持身份证正面照',
  userInfo_bankCard: '银行卡'
};
Component({
  props: {
    onClick: function onClick() {},
    type: 'sfzLicenseFront',
    imgSrc: '',
    isPadding: false
  },
  data: {
    licensePicDefault: DRIVER_LICENSE_DEFAULT_PIC,
    licenseTxtDefault: DRIVER_LICENSE_DEFAULT_TXT
  },
  didMount: function didMount() {},
  didUpdate: function didUpdate() {},
  methods: {
    upLoadImageFromCamera: function upLoadImageFromCamera(e) {
      var type = e.target.dataset.type;

      if (this.props.onClick) {
        this.props.onClick(e);
      }
    }
  }
});