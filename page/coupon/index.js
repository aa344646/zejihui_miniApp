import HttpApi from "../../api/lease";

Page({
    data: {
        kipe: {
            couponList: [], // 平台数据
            storeCouponList: [], // 商家券数据
            haveCoupons: false,
            couponListflag: true,
            slotHlepImageSrc: "../../image/coupon/ico_2x.png"
        },
        couponData: {},
        openDescIndex: '',
        DescFlag: false,
    },
    onLoad() {
        this.postlogn();
        this.queryRedCouponData();
    },
    // 获取商家券
    queryRedCouponData() {
        const userId = my.getStorageSync({
            key: 'userId',
        }).data || '';

        const params = {
            appId: '2021002189690874',
            uid: userId,
        }

        HttpApi.queryRedCouponData(params).then(res => {
            if (res.code === 200) {
                let storeCouponList = res.data || [];
                storeCouponList.forEach(item => {
                    item.status = 'unused';
                })
                const newCouponInfo = this.data.kipe.couponList;
                if (storeCouponList.length) {
                    if (newCouponInfo.length) {
                        const IdArr = [];
                        storeCouponList.forEach(_ => {
                            IdArr.push(_.id);
                        })
                        newCouponInfo.forEach(item => {
                            if (!IdArr.includes(item.id)) {
                                return
                            }
                        })
                        newCouponInfo.push(...storeCouponList);
                    } else {
                        newCouponInfo.push(...storeCouponList);
                    }
                    this.setData({
                        "kipe.couponList": newCouponInfo,
                        "kipe.haveCoupons": true,
                    })
                };
                this.setData({
                    storeCouponList
                })
            }
        })

    },
    postlogn() {
        let type = "unused" //此次只是为了获取 未使用的 优惠券
        this.pageNum = 1;
        this.pageSize = 10000;
        // page的参数 从 第一页 1 开始 每次获取10个优惠券 之后可以叠加
        let pageNS = {
            pageNum: this.pageNum,
            pageSize: this.pageSize,
        }
        this.coupons = [];
        this.haveCoupons(type, pageNS);
    },
    handleOpenDesc(e) {
        const { openDescIndex } = this.data;
        if (openDescIndex && e.currentTarget.dataset.index == openDescIndex - 1 && !this.data.DescFlag) {
            this.setData({
                openDescIndex: e.currentTarget.dataset.index + 1,
                DescFlag: true
            })
        } else {
            this.setData({
                openDescIndex: e.currentTarget.dataset.index + 1,
                DescFlag: false
            })
        }

    },
    haveCoupons(type, pageNS) {
        HttpApi.getAllCoupon(type, pageNS).then((result) => {
            if (result.code == 200) {
                this.couponData = result.data;
                if (this.data.kipe.couponListflag) {
                    if (this.couponData != null) {
                        if (this.couponData.list && this.couponData.list.length) {
                            // 这里是下拉加载
                            // 之后需要判断是否 list这个 数组是否 小于传递的 page的值
                            this.coupons.push(...this.couponData.list);

                            this.setData({
                                "kipe.couponList": this.coupons,
                            })
                            this.setData({
                                "kipe.haveCoupons": true
                            })
                        } else {
                            // 第一次提交的结果  如果 == 0 之后 要做什么操作？？？
                            // 没有值了之后
                            // 做一下 下拉刷新 上拉加载 的位置
                            this.setData({
                                "kipe.haveCoupons": false
                            })
                        }
                    } else {
                        this.setData({
                            "kipe.haveCoupons": false,
                        })
                    }
                }
            } else {
                this.setData({
                    "kipe.haveCoupons": false,
                })
            }
        });
    },
    // onReachBottom() {
    //     // 页面被拉到底部
    //     // console.log('触发页面被拉倒底部');
    //     // 上拉加载
    //     if (this.data.kipe.couponListflag) {
    //         let type = "unused" //此次只是为了获取 未使用的 优惠券
    //         this.pageNum = parseInt(this.pageNum) + 1;
    //         this.pageSize = 10;
    //         let pageNS = {
    //             pageNum: this.pageNum,
    //             pageSize: this.pageSize,
    //         }
    //         HttpApi.getAllCoupon(type, pageNS).then((result) => {
    //             if (result.code == 200) {
    //                 this.couponData = result.data;
    //                 if (this.couponData.list.length != 0) {
    //                     // 之后需要判断是否 list这个 数组是否 小于传递的 page的值
    //                     this.coupons.push(...this.couponData.list);

    //                     this.setData({
    //                         "kipe.couponList": this.coupons,
    //                     })
    //                 }
    //                 if (result.data.list.length < 10) {
    //                     this.setData({
    //                         "kipe.couponListflag": false,
    //                     })
    //                 }
    //                 // 做一下 下拉刷新 上拉加载 的位置
    //                 // console.log('输出可用的优惠券:', result);
    //                 // this.couponData = result.data;
    //                 // let couponList = this.couponData;
    //                 // this.setData({
    //                 //   "kipe.couponList": couponList,
    //                 //   "kipe.list": list,
    //                 // })
    //             }
    //         })
    //     }
    // },
    goUseCoupon(e) {
        const goUrlCode = e.currentTarget.dataset.goUrl.jump || '';
        const goUrl = e.currentTarget.dataset.goUrl.jumpUrl || '';
        const urlHeader = goUrl.indexOf('alipays');
        let goToUrl = "";
        if (!goUrlCode) { return };
        if (goUrlCode === 3) {
            my.showLoading({
                content: ""
            });
            setTimeout(() => {
                my.hideLoading();
            }, 1000);
            return
        }
        if (urlHeader != -1) {
            let index = goUrl.indexOf("?");
            let newStr = goUrl.slice(index + 1, goUrl.length);
            let newArr = newStr.split("&")
            let newArr2 = newArr[1].split("=")
            goToUrl = newArr2[1];
            my.switchTab({
                url: goToUrl
            });
        } else {
            my.switchTab({
                url: goUrl
            });
        };


        console.log(e.currentTarget.dataset);
    },
    backToHome() {
        // 返回首页
        my.reLaunch({
            url: "/page/lease/index"
        })
    },
});