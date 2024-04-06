const app = getApp();
import templateRent from '../../components/rentOrder/index';
import templateDesk from '../../components/desk/index';
console.warn({
    app,
    templateRent
})
Page({
    ...templateRent.detailApi,
    ...templateDesk.deskApi,
    data: {
        ...templateRent.data,
        ...templateDesk.data,
    },
});
