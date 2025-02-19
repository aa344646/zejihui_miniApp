Component({
  data: {
    isConfirm: false,
    // 确认是否可点击
    selectList: [{
      title: '请选择',
      sub: []
    }],
    // list数据
    activeTab: 0 // 当前tab项

  },
  props: {
    selectShow: false // 选择面板是否展示

  },
  didMount: function didMount() {
    var list = this.props.list;
    this.setData({
      selectList: [{
        title: '请选择',
        sub: list
      }]
    });
  },
  didUpdate: function didUpdate(prevProps) {
    var _this$props = this.props,
        selectValue = _this$props.selectValue,
        list = _this$props.list; // 面板状态改变的时候数据的重新渲染

    if (!prevProps.selectShow && this.props.selectShow && selectValue) {
      var selectArray = selectValue.split(' ');
      var selectList = [];
      selectArray.forEach(function (item, k) {
        if (k === 0) {
          var provinces = {
            title: item,
            sub: list
          };
          selectList.push(provinces);
        }

        if (k === 1) {
          list.forEach(function (data) {
            if (data.name === selectArray[k - 1]) {
              var city = {
                title: item,
                sub: data.sub
              };
              selectList.push(city);
            }
          });
        }

        if (k === 2) {
          list.forEach(function (data) {
            if (data.name === selectArray[k - 2]) {
              data.sub.forEach(function (areaData) {
                if (areaData.name === selectArray[k - 1]) {
                  var area = {
                    title: item,
                    sub: areaData.sub
                  };
                  selectList.push(area);
                }
              });
            }
          });
        }
      });
      this.setData({
        selectList: selectList,
        activeTab: selectArray.length - 1
      });
    }
  },
  didUnmount: function didUnmount() {},
  methods: {
    /**
    * 关闭popup
    * @method onPopupClose
    */
    onPopupClose: function onPopupClose() {
      var _this$props2 = this.props,
          selectValue = _this$props2.selectValue,
          list = _this$props2.list;

      if (!selectValue) {
        this.setData({
          isConfirm: false,
          selectList: [{
            title: '请选择',
            sub: list
          }],
          activeTab: 0
        });
      }

      this.props.onClose();
    },

    /**
     * 确认
     * @method onConfirm
     * @param {*} e
     */
    onConfirm (e) {
      if (e.target.dataset.click) {
        // 点击确定
        var selectList = this.data.selectList;
        var result = [];
        selectList.forEach(function (item) {
          var singleSelect = {
            name: item.title,
            code: item.code
          };
          result.push(singleSelect);
        });
        this.props.onSelectSuccess(result);
        this.props.onClose();
      }
    },

    /**
     * 取消
     * @method onCancel
     */
    onCancel: function onCancel() {
      this.props.onClose();
    },

    /**
     * tab切换
     * @method handleTabClick
     * @param {*} index
     */
    handleTabClick: function handleTabClick(_ref) {
      var index = _ref.index;
      this.setData({
        activeTab: index
      });
    },

    /**
     * 省市区选择事件
     * @method itemSelect
     * @param {*} e
     */
    itemSelect: function itemSelect(e) {
      var _e$target$dataset = e.target.dataset,
          key = _e$target$dataset.key,
          name = _e$target$dataset.name,
          code = _e$target$dataset.code,
          sub = _e$target$dataset.sub;
      var list = this.props.list;

      if (key === 0) {
        // 第一级数据处理
        if (sub) {
          this.setData({
            selectList: [{
              title: name,
              code: code,
              sub: list
            }, {
              title: '城市',
              sub: sub
            }],
            activeTab: 1,
            isConfirm: false
          });
        } else {
          this.setData({
            selectList: [{
              title: name,
              code: code,
              sub: list
            }],
            isConfirm: true
          });
        }
      }

      if (key === 1) {
        // 第二级数据处理
        if (sub) {
          this.setData({
            selectList: [{
              title: this.data.selectList[0].title,
              code: this.data.selectList[0].code,
              sub: list
            }, {
              title: name,
              code: code,
              sub: this.data.selectList[1].sub
            }, {
              title: '区县',
              sub: sub
            }],
            activeTab: 2,
            isConfirm: false
          });
        } else {
          this.setData({
            selectList: [{
              title: this.data.selectList[0].title,
              code: this.data.selectList[0].code,
              sub: list
            }, {
              title: name,
              code: code,
              sub: this.data.selectList[1].sub
            }],
            activeTab: 1,
            isConfirm: true
          });
        }
      }

      if (key === 2) {
        // 第三级数据处理
        this.setData({
          selectList: [{
            title: this.data.selectList[0].title,
            code: this.data.selectList[0].code,
            sub: list
          }, {
            title: this.data.selectList[1].title,
            code: this.data.selectList[1].code,
            sub: this.data.selectList[1].sub
          }, {
            title: name,
            code: code,
            sub: this.data.selectList[2].sub
          }],
          activeTab: 2,
          isConfirm: true
        });
      }
    }
  }
});