import { goodsClick } from '/util/common.js';

Component({
  mixins: [],
  data: {},
  props: {
    goods: {},
  },
  didMount() {},
  didUpdate() {},
  didUnmount() {},
  methods: {
    handleGoodsDetail() {
      const id = this.props.goods.id;
      goodsClick(id);
    },
  },
});
