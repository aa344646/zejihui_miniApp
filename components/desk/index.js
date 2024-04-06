export default {
    data: {
        deskData: {
            deskhidden: true,
            title: "",
            content: "",
            iconfont: ""
        }
    },
    onLoad() {
    },
    onShow() {
    },
    deskApi: {
        desk(e) {
            // console.log(e);
            let index = e.currentTarget.dataset.index;
            if (index == 1) {
                var deskData = {
                    deskhidden: false,
                    title: "支付宝免密支付",
                    content: "服务完结进行结算时，实际费用由商户发起向用户支付宝账户扣款",
                    iconfont: "icon-ico-guanbi"
                }
            } else if (index == 2) {
                var deskData = {
                    deskhidden: false,
                    title: "支付宝资金授权",
                    content: "用户使用服务时，通过支付宝账户资金渠道做相应金额的授权，并不产生实际消费",
                    iconfont: "icon-ico-guanbi"
                }
            }
            this.setData({
                deskData: deskData
            })
        },
        undesk() {
            var deskData = {
                deskhidden: true,
                title: "",
                content: "",
                iconfont: ""
            };
            this.setData({
                deskData: deskData
            })
        }
    }
}