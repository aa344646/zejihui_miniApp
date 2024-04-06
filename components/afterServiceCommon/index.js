Component({
    props: {
        afterServiceDetail:{}
    },
  
    data: {
    },
  
    methods: {
        callphone(){
            my.makePhoneCall({ number: this.props.afterServiceDetail.shopContactNumber.split(',')[0]});
         },
    }
  })
  