import service from './fetch.js';

const api = {
    //    热搜词
    hotWords: () => {
        return service({
        url: '/goods/heatSearchGet',
        method: 'GET',
        })
    },
    //   商品搜索页
    search: (data) => {
        return service({
            url: '/goods/searchList',
            method: 'GET',
            data: data
        })
    },
};

export default api;