/*
    title: 日期格式化
    参数：（时间戳，类型）
    描述：
        不传输类型时：         return  2018-03-13  08:00:00
        传类型参数时：类型为 1  return  2018年04月13日08:00
                    类型为2   return  2018年03月20
*/
export function dateFormat(timestamp,type) {
    if(!timestamp){
        return null;
    }   
    let time = new Date(timestamp);
    let year = time.getFullYear();
    let month = time.getMonth()+1;
    let date = time.getDate();
    let hours = time.getHours();
    let minutes = time.getMinutes();
    let seconds = time.getSeconds();
    if(type && type==1) {
        return year+'年'+add0(month)+'月'+add0(date)+'日'+add0(hours)+':'+add0(minutes);
    } else if(type && type==2) {
        return year+'年'+add0(month)+'月'+add0(date)+'日';
    }
    return year+'-'+add0(month)+'-'+add0(date)+' '+add0(hours)+':'+add0(minutes)+':'+add0(seconds);
}
function add0(i) {
    if(i<=9) {
        return '0' + i;
    } else {
        return i;
    }
}
/*   
     title: 格式化sku
     参数： list[{name:'3天'},{name:'红色'},{name:'套餐-'}]
     return   3天/红色/套餐一
*/
export function skuFormat(list) {               // 格式化sku
    let str = '';
    for(let i in list) {
       str += list[i].name + '/';
    }
    return str.slice(0,str.length-1);
}
/*   
     title: 格式化price
     参数： ( 价格（分为单位）, 1)  
     描述   
            1.第二个参数不传，则返回价格保留两位小数 100 -> 1.00
            2.第二个参数为int,则返回整数部分    100  ->  1
            3.第二个参数为fixed,则返回小数部分  100  ->  00
*/
export function priceFormat(price,type) {   

    if(type && type=='int') {
        return parseInt(price/100);
    } else if(type && type=='fixed') {
        return (price/100 - parseInt(price/100)).toFixed(2).slice(2);
    } else {
        return (price/100).toFixed(2);
    }
}