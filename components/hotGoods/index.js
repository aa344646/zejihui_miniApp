Component({
    properties: {
        goods:{
            type:Object,
            value:{}
        },
    },
    
    data: {
    },
    methods: {

        toDetail(e){

            let id = e.currentTarget.dataset.id;
            if(id){
                my.navigateTo(
                    {
                        url:`/page/detail/index?goodsId=${id}`
                    }
                )
            }
        },

    }
})
