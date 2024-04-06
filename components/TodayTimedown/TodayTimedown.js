import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);

Component({
  data: {
    dd: '00',
    hh: '00',
    mm: '00',
    ss: '00',
    itr: null,
    diff: 0, //剩余时间差
  },
  props: {},
  didMount() {
    this.init();
  },
  didUpdate() {},
  didUnmount() {
    this.destory();
  },
  methods: {
    init() {
      my.getServerTime({
        success: ({ time }) => {
          this.intervalTime(time);
        },
        fail: () => {
          this.intervalTime(new Date());
        }
      });
    },
    intervalTime(time) {
      // 获取当前时间
      const current = dayjs(time);
      // 获取今天结束时间
      const todayEnd = current.endOf('day');
      // 获取今天剩余时间差
      const diff = todayEnd.diff(current);
      
      const itr = setInterval(() => {
        let diff = this.data.diff-1000; //读秒更新
        if (diff < 1000) {
          // 重置
          diff = 86400000;
        }

        // 解析持续时间
        const res = dayjs.duration(diff);
        const dd = res.get('days');
        const hh = res.get('hours');
        const mm = res.get('minutes');
        const ss = res.get('seconds');
        this.setData({
          dd: dd < 10 ? '0' + dd : String(dd),
          hh: hh < 10 ? '0' + hh : String(hh),
          mm: mm < 10 ? '0' + mm : String(mm),
          ss: ss < 10 ? '0' + ss : String(ss),
          diff,
        });
      }, 1000);

      this.setData({
        diff,
        itr,
      });
    },
    destory() {
      clearInterval(this.data.itr);
    },
  },
});
