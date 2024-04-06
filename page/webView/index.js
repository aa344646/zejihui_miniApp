Page({
  data: {
    url:'',
    canUseWebView:true,
  },
  onLoad(query)
  {
    const { channel } = query || {};
    if (channel) {
      getApp().globalQuery.channel = channel;
      my.setStorageSync({
        key: 'channel',
        data: channel,
      });
    }
    console.log(channel,">>>>>>>wview")

    this.setData({
      url:decodeURIComponent(query.url),
    });
  },
  receiveMessage(e)
  {
    console.log(e);
  }
});
