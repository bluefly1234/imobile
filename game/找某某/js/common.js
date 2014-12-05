

var wxShare;
~ function(bt) {
    var clickTime = 0;
    var dataForWeixin = {
        width: "66",
        src: '',
        url: location.href,
        title: document.title,
        desc: document.title,
        callback: function() {
            
        }
    };
    window.dataForWeixin = dataForWeixin;
    var onBridgeReady = function() {
        WeixinJSBridge.on('menu:share:appmessage', function(argv) {
            WeixinJSBridge.invoke('sendAppMessage', {
                "img_url": dataForWeixin.src,
                "img_width": dataForWeixin.width,
                "img_height": dataForWeixin.width,
                "link": dataForWeixin.url,
                "desc": dataForWeixin.desc,
                "title": dataForWeixin.title
            }, function(res) {
                (dataForWeixin.callback)()
            })
        });
        WeixinJSBridge.on('menu:share:timeline', function(argv) {
            WeixinJSBridge.invoke('shareTimeline', {
                "img_url": dataForWeixin.src,
                "img_width": dataForWeixin.width,
                "img_height": dataForWeixin.width,
                "link": dataForWeixin.url,
                "desc": dataForWeixin.desc,
                "title": dataForWeixin.title
            }, function(res) {
                (dataForWeixin.callback)()
            })
        });
        WeixinJSBridge.on('menu:share:weibo', function(argv) {
            WeixinJSBridge.invoke('shareWeibo', {
                "content": dataForWeixin.title,
                "url": dataForWeixin.url
            }, function(res) {
                (dataForWeixin.callback)()
            })
        });
        WeixinJSBridge.on('menu:share:facebook', function(argv) {
            (dataForWeixin.callback)();
            WeixinJSBridge.invoke('shareFB', {
                "img_url": dataForWeixin.src,
                "img_width": dataForWeixin.width,
                "img_height": dataForWeixin.width,
                "link": dataForWeixin.url,
                "desc": dataForWeixin.desc,
                "title": dataForWeixin.title
            }, function(res) {})
        })
    };
    if (typeof WeixinJSBridge == "undefined") {
        if (document.addEventListener) {
            document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false)
        } else if (document.attachEvent) {
            document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
            document.attachEvent('onWeixinJSBridgeReady', onBridgeReady)
        }
    } else {
        onBridgeReady()
    };
    bt.setShare = function(option) {
        $.extend(dataForWeixin, option || {});
        document.title = dataForWeixin.desc = dataForWeixin.title;
    }
}(wxShare || (wxShare = {}));/*  |xGv00|60d04bdb3b4c0ecb61269150ac182739 */