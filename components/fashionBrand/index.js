Component({
    props: {
        item:{}
    },
    data: {
        previewImages:[]
    },
    methods: {
        toMerchant(e){
            let { id : merchantId} = e.currentTarget.dataset;
            my.navigateTo({
                url:`/page/store/index?merchantId=${merchantId}`
            })
        },
        previewImage(e){

            let { index } = e.currentTarget.dataset;

            let { previewImages } = this.data;

            my.previewImage({
                current: index,
                urls: previewImages
            });

        }
    },
    didMount(){
        
        let { previewImages } = this.data;

        let { imgJson } = this.props.item;

        let newImages = imgJson.map(item=>{

            return item.url.split('?')[0]

        })

        this.setData({
            previewImages:previewImages.concat(newImages)
        })
    },
    
})

