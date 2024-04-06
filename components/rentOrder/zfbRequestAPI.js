    let ZfbRequestAPI = {}
    let zmRentTransition = (config) => {
        return new Promise((resolve, reject) => {
            my.zmRentTransition({
                "creditRentType": "signPay",
                "outOrderNo": config.outOrderNo,
                "zmOrderNo": config.zmOrderNo,
                success: function (res) {
                    resolve(res);
                },
                fail: function (res) {
                    reject(res);
                }
            })
        });
    }
    export default ZfbRequestAPI = {
        zmRentTransition
    }