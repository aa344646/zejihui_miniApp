import service from './fetch.js';
const api = {
    //    店铺搜索
    search:(data)=>{
        return service({
            url:'/goods/goodsByMerchant',
            method:'GET',
            data:data
        })
    },
//    查询是否收藏该商户 /merchantCollects/isCollect/{merchantId}
    isCollect:(data)=>{
        return service({
            url:`/merchantCollects/isCollect/${data.id}`,
            method:'GET',
            data:data
        })
    },
//    店铺收藏
    // storeCollect:(data)=>{
    //     return fetch({
    //         url:'/merchantCollects/collect/'+data.id,
    //         method:'POST'
    //     })
    // },
//    取消店铺收藏
    // celstoreCollect:(data)=>{
    //     return fetch({
    //         url:'/merchantCollects/'+data.id,
    //         method:'DELETE'
    //     })
    // },
//    店铺内容
    storeContent:(data)=>{
        return service({
            url:'/merchantHomePage/detail/'+data.id,
            method:'GET'
        })
    },
    //    店铺详情
    storeInfo:(data)=>{
        if(data.id){
            return service({
                url:'/merchant/'+data.id,
                method:'GET'
            })
        }
    
    },
    // getMerchantCoupon:(data)=>{   // 获取商户优惠券列表
    //     return fetch({
    //         url:'/merchant/bonus/list',
    //         method:'GET',
    //         data
    //     })
    // },
    // receiveCoupon:(data)=>{   // 领取商户优惠券
    //     return fetch({
    //         url:`/users/drawBonus/${data.merchantId}/${data.id}`,
    //         method:'POST'
    //     })
    // },
};

export default api;