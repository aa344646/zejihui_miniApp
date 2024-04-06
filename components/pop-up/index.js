// components/pop-up/index.js
Component({
    data:{
        init:false
    },
    props: {
        hideModal:true,
        loadingHide:true,
        //弹出位置
        position:'bottom',
        closeHide:false,
    },
    /**
     * 组件的初始数据
     */
    data: {
        animationData:{},
    },
    /**
     * 组件的方法列表
     */
    methods: {
        initAnimation(){
            var animation = my.createAnimation({
                duration: 200,
                timingFunction: "linear",
            });
            this.animation = animation;
            animation.translateY('100%').step();
            this.setData({
                animationData: animation.export()
            });
        },
        hideModal(){
            if(this.data.position=='top' || this.data.position=='middle')
            {
                this.setData({
                    hideModal:true
                });
            }else{
                let animation = this.animation;
                animation.translateY('100%').step();
                this.setData({
                    animationData: animation.export(),
                });
                setTimeout(function () {
                    this.setData({
                        hideModal: true
                    });
                }.bind(this), 200)
            }

        },
        showModal(){
            if(!this.data.init){ // 未初始化动画
                this.initAnimation(); // 初始化动画
                this.setData({
                    init:true
                })
            }
            let animation = this.animation;
            animation.translateY(0).step();
            this.setData({
                hideModal: false
            });
            setTimeout(()=>{
                this.setData({
                    animationData: animation.export()
                });
            },20);
            
        }
    }
})
