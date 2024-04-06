import service from './fetch.js';

const api = {
    receiveCoupon: (data) => {
        return service({
            url: '/user/bonus/receiveCommon',
            method: 'post',
            data
        });
    },
    receiveCouponGroup: (data) => {
        return service({
            url: `/bonus/receive/${data.id}`,
            method: 'post'
        });
    }
};

export default api;