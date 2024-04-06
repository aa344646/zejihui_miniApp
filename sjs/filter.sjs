var filters = {
  parseDiscount: function (value) {
    return value / 10;
  },
  parsePrice: function (value) {
    if (!value) {
      return parseFloat(0).toFixed(2);
    }

    return parseFloat(value / 100).toFixed(2);
  },
  parseTime: function (time, format) {
    if (!time) {
      return '-';
    }
    if (arguments.length === 0) {
      return '-';
    }
    var date = getDate(time);
    var formatObj = {
      y: date.getFullYear() + '-',
      m: (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-',
      d: (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' ',
      h: (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':',
      i: (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()),
      s: ':' + (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()),
      a: date.getDay()
    };
    if (format && format == 'y-m-d') {
      return formatObj.y + formatObj.m + formatObj.d
    }
    if (format && format == 'h:m:s') {
      return formatObj.h + formatObj.i + formatObj.s
    }
    if (format && format == 'h:m') {
      return formatObj.h + formatObj.i
    }
    return formatObj.y + formatObj.m + formatObj.d + formatObj.h + formatObj.i + formatObj.s
  },
  parseTimeTwo: function (time, format) {
    if (!time) {
      return '-';
    }
    if (arguments.length === 0) {
      return '-';
    }
    var date = getDate(time);
    var formatObj = {
      y: date.getFullYear() + '.',
      m: (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '.',
      d: (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' ',
      h: (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':',
      i: (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()),
      s: ':' + (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()),
      a: date.getDay()
    };
    if (format && format == 'y-m-d') {
      return formatObj.y + formatObj.m + formatObj.d
    }
    if (format && format == 'h:m:s') {
      return formatObj.h + formatObj.i + formatObj.s
    }
    if (format && format == 'h:m') {
      return formatObj.h + formatObj.i
    }
    return formatObj.y + formatObj.m + formatObj.d + formatObj.h + formatObj.i + formatObj.s
  },
  ifAddressFlag: function (value) {
    if (JSON.stringify(value) === '{}') {
      return true
    }
    return false
  },
  topStatusBg: function (value) {
    if (value === 'lease_finished' || value === 'relet_finished' || value === 'buyout_finished') {
      return 'topStatus-complete'
    } else if (value == 'merchant_credit_check_unpass_canceled' || value == 'system_credit_check_unpass_canceled' || value == 'artificial_credit_check_unpass_canceled' || value == 'merchant_relet_check_unpass_canceled' || value == 'user_canceled' || value == 'safeguard_rights_canceled' || value == 'order_payment_overtime_canceled' || value == 'merchant_not_yet_send_canceled' || value == 'express_rejection_canceled') {
      return 'topStatus-cancel'
    } else if (value == 'running_overdue') {
      return 'topStatus-slippage'
    } else {
      return 'topStatus-normal'
    }
  },
  imgFormat: function (url) {
    if (!url) {
      return
    }
    const data = url.split('').reverse().join('');
    const index = data.indexOf('/')
    const str1 = data.slice(0, index);
    const str2 = data.slice(index);
    const str = str1 + '/csed'
    const str3 = str + str2;
    const newUrl = str3.split('').reverse().join('');
    return newUrl
  },
  parseIntPrice: function (pre, end) {
    if (!pre || !end || (pre - end) < 0) {
      return 0
    }
    return pre - end
  },
  txtformat: function (data) {
    if (!(JSON.stringify(data) === "{}")) {
      switch (data.voucherType) {
        case 'FIX_VOUCHER':
          return `满${data.floorAmount}减${data.amount}元`
        case 'DISCOUNT_VOUCHER':
          return `满${data.floorAmount}享${data.discount}折`
        case 'SPECIAL_VOUCHER':
          return `满${data.floorAmount}享${data.specialAmount}元`
      }
    }
    return
  },
  titleformat: function (type) {
    switch (type) {
      case 'FIX_VOUCHER':
        return `全场满减券`
      case 'DISCOUNT_VOUCHER':
        return `全场折扣券`
      case 'SPECIAL_VOUCHER':
        return `全场特价券`
    }
  },
  returnPrice: function (data) {
    switch (data.voucherType) {
      case 'FIX_VOUCHER':
        return data.amount.toFixed(2)
      case 'DISCOUNT_VOUCHER':
        return data.discount
      case 'SPECIAL_VOUCHER':
        return data.specialAmount.toFixed(2)
    }
  },
  returnTypeTxt: function (voucherType) {
    switch (voucherType) {
      case 'FIX_VOUCHER':
        return `满减券`
      case 'DISCOUNT_VOUCHER':
        return `折扣券`
      case 'SPECIAL_VOUCHER':
        return `特价券`
    }
  },

  optimizeImage: function (url, wid, hit) {
    if (!url) {
      return
    }
    const newUrl = `${url}?x-oss-process=image/resize,m_fill,w_${wid},h_${hit}/quality,q_80`
    return newUrl
  },

  selectBg: function (val) {
    if (!val) { return }
    if (val.voucherType && val.volumeStatus === 1) { return "newbg2" }
    if (val.voucherType && val.failure === 0) { return "newbg" }
    if (val.voucherType && val.failure === 1) { return "newbg2" }
    if (!val.voucherType) { return "newbg1" }
  },
  returnFlag: function (val) {
    if (!val) { return "" }
    if (val.voucherType === 'SPECIAL_VOUCHER') { return 1 }
    if (val.voucherType === 'DISCOUNT_VOUCHER') { return 2 }

  },
  handleParts: function (val) {
    if (!val.length) { return }
    let sum = 0;
    val.map(_ => {
      if (_.choose) {
        sum += Number(_.price)
      }
    });
    return sum
  },
  formatData: function (val) {
    if (!val.length) { return }
    let newArr = []
    val.map((item) => {
      item = item.toString()
      return newArr.push(`${item.substring(0, 3)} ${item.substring(3, 7)} ${item.substring(7, 11)}`)
    });
    return newArr





  },

};
export default {
  parsePrice: filters.parsePrice,
  parseTime: filters.parseTime,
  parseDiscount: filters.parseDiscount,
  ifAddressFlag: filters.ifAddressFlag,
  imgFormat: filters.imgFormat,
  parseIntPrice: filters.parseIntPrice,
  txtformat: filters.txtformat,
  titleformat: filters.titleformat,
  returnPrice: filters.returnPrice,
  returnTypeTxt: filters.returnTypeTxt,
  parseTimeTwo: filters.parseTimeTwo,
  topStatusBg: filters.topStatusBg,
  selectBg: filters.selectBg,
  returnFlag: filters.returnFlag,
  handleParts: filters.handleParts,
  optimizeImage: filters.optimizeImage,
  formatData: filters.formatData,
};