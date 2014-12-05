/**
 * Created with sublime text.
 * Author: majinhui
 * Date: 14-11-19
 * Time: 15:00 pm
 * name:  imobile.js 移动端库
 */
 // 环境检测
(function(){
    //
    var _env = (function() {

        var _ua = navigator.userAgent,
            _m = null,
            _formatV = function(vstr, vdiv) {
                var f = vstr.split(vdiv);
                f = f.shift() + '.' + f.join('');
                return f * 1;
            }, _rtn = {
                isPC:true,
                ua: _ua,
                version: null,
                ios: false,
                android: false,
                windows: false,
                blackberry: false,
                meizu: false,
                weixin: false,
                wVersion: null,
                touchSupport: ('createTouch' in document),
                hashSupport: !! ('onhashchange' in window)
            };
        _m = _ua.match(/MicroMessenger\/([\.0-9]+)/);

        if (_m != null) {
            _rtn.weixin = true;
            _rtn.wVersion = _formatV(_m[1], '.');
        }
        _m = _ua.match(/Android\s([\.0-9]+)/);
        if (_m != null) {
            _rtn.isPC = false;
            _rtn.android = true;
            _rtn.version = _formatV(_m[1], '.');
            _rtn.meizu = /M030|M031|M032|MEIZU/.test(_ua);
            return _rtn;
        }
        _m = _ua.match(/i(Pod|Pad|Phone)\;.*\sOS\s([\_0-9]+)/);
        if (_m != null) {
            _rtn.isPC = false;
            _rtn.ios = true;
            _rtn.version = _formatV(_m[2], '_');
            return _rtn;
        }
        _m = _ua.match(/Windows\sPhone\sOS\s([\.0-9]+)/);
        if (_m != null) {
            _rtn.isPC = false;
            _rtn.windows = true;
            _rtn.version = _formatV(_m[1], '.');
            return _rtn;
        }
        var bb = {
            a: _ua.match(/\(BB1\d+\;\s.*\sVersion\/([\.0-9]+)\s/),
            b: _ua.match(/\(BlackBerry\;\s.*\sVersion\/([\.0-9]+)\s/),
            c: _ua.match(/^BlackBerry\d+\/([\.0-9]+)\s/),
            d: _ua.match(/\(PlayBook\;\s.*\sVersion\/([\.0-9]+)\s/)
        };
        for (var k in bb) {
            if (bb[k] != null) {
                _m = bb[k];
                _rtn.blackberry = true;
                _rtn.version = _formatV(_m[1], '.');
                return _rtn;
            }
        }
        
        
        return _rtn;
    }());
        



    // region 浏览器检测
    var ua = function ( ua, appVersion, platform ) {

        return {
            // win系列
            win32 : platform === "Win32",
            ie : /MSIE ([^;]+)/.test( ua ),
            ieMobile : window.navigator.msPointerEnabled,
            ieVersion : Math.floor( (/MSIE ([^;]+)/.exec( ua ) || [0, "0"])[1] ),

            // ios系列
            ios : (/iphone|ipad/gi).test( appVersion ),
            iphone : (/iphone/gi).test( appVersion ),
            ipad : (/ipad/gi).test( appVersion ),
            iosVersion : parseFloat( ('' + (/CPU.*OS ([0-9_]{1,5})|(CPU like).*AppleWebKit.*Mobile/i.exec( ua ) || [0, ''])[1])
                .replace( 'undefined', '3_2' ).replace( '_', '.' ).replace( '_', '' ) ) || false,
            safari : /Version\//gi.test( appVersion ) && /Safari/gi.test( appVersion ),
            uiWebView : /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test( ua ),

            // 安卓系列
            android : (/android/gi).test( appVersion ),
            androidVersion : parseFloat( "" + (/android ([0-9\.]*)/i.exec( ua ) || [0, ''])[1] ),

            // chrome
            chrome : /Chrome/gi.test( ua ),
            chromeVersion : parseInt( ( /Chrome\/([0-9]*)/gi.exec( ua ) || [0, 0] )[1], 10 ),

            // 内核
            webkit : /AppleWebKit/.test( appVersion ),

            // 其他浏览器
            uc : appVersion.indexOf( "UCBrowser" ) !== -1,
            Browser : / Browser/gi.test( appVersion ),
            MiuiBrowser : /MiuiBrowser/gi.test( appVersion ),

            // 微信
            MicroMessenger : ua.toLowerCase().match( /MicroMessenger/i ) == "micromessenger",

            // 其他
            canTouch : "ontouchstart" in document

        };
    }( navigator.userAgent, navigator.appVersion, navigator.platform );

    //console.log(_env,ua);
})();

// 
(function(){
    
    /*  工具类 */
    // _setTimeout(function(a,b){},3000,'a','b')
    function _setTimeout() {
        var func = arguments[0],
            timeout = arguments[1],
            args = Array.prototype.slice.call(arguments, 2);
        return window.setTimeout(function(args) {
            return function() {
                func.apply(null, args);
            }
        }(args), timeout);
    }

    // 格式化日期 formatDate(new Date(1384931712000), 'yyyy-MM-dd hh:mm:ss')
    function formatDate(date, fmt) {
        var o = {
            "M+": date.getMonth() + 1,
            //月份   
            "d+": date.getDate(),
            //日   
            "h+": date.getHours(),
            //小时   
            "m+": date.getMinutes(),
            //分   
            "s+": date.getSeconds(),
            //秒   
            "q+": Math.floor((date.getMonth() + 3) / 3),
            //季度   
            "S": date.getMilliseconds() //毫秒   
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        for (var k in o) {
            if (new RegExp("(" + k + ")").test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            }
        }
        return fmt;
    }

    //获取图片宽 和 高
    function imgReady(url, success, error) {
        var width, height, intervalId, check, div,
            img = new Image(),
            body = document.body;
            
        img.src = url;
        
        // 从缓存中读取
        if (img.complete) {
            return success(img.width, img.height);
        }
        // 通过占位提前获取图片头部数据
        if (body) {
            div = document.createElement('div');
            div.style.cssText = 'position:absolute;left:-99999px;top:0;';
            div.appendChild(img);
            body.appendChild(div);
            width = img.offsetWidth;
            height = img.offsetHeight;
           
            check = function () {
               
                if (img.offsetWidth !== width || img.offsetHeight !== height) {
                    
                    clearInterval(intervalId);
                    success(img.offsetWidth, img.clientHeight);
                    img.onload = null;
                    div.innerHTML = '';
                    div.parentNode.removeChild(div);
                };

            };
            
            intervalId = setInterval(check, 150);
        }
        
        // 加载完毕后方式获取
        img.onload = function () {
            if(img.complete){
                success(img.width, img.height);
                img.onload = img.onerror = null;
                clearInterval(intervalId);
                body && img.parentNode &&img.parentNode.removeChild(img);
            }
                
        };
        
        // 图片加载错误
        img.onerror = function () {
            error && error();
            clearInterval(intervalId);
            body && img.parentNode && img.parentNode.removeChild(img);
        };
        
    }

    // getQuery() return {} ,getQuery(key) return string or null
    function getQuery(key) {
        
        var search = window.location.search;
      
        if (search.indexOf('?') != -1) {
            var params = search.substr(1).split('&');
            var query = {};
            var q = [];
            var name = '';

            for (i = 0; i < params.length; i++) {
                q = params[i].split('=');
                name = decodeURIComponent(q[0]);

                if (name.substr(-2) == '[]') {
                    if (!query[name]) {
                        query[name] = [];
                    }
                    query[name].push(q[1]);
                } else {
                    query[name] = q[1];
                }

            }
            if (key) {
                if (query[key]) {
                    return query[key];
                }

                return null;
            } else {
                return query;
            }
        }
    }
    // 屏幕居中
    function rate(width, height) {
        var wWidth = window.innerWidth,
            wHeight = window.innerHeight;
        var mid;
        if (width <= wWidth && height <= wHeight) {} else if (width > wWidth && height > wHeight) {
            var rateW = wWidth / width,
                rateH = wHeight / height;
            if (rateW <= rateH) {
                mid = width;
                width = wWidth;
                height = height * width / mid
            } else {
                mid = height;
                height = wHeight;
                width = width * height / mid
            }
        } else if (width > wWidth) {
            mid = width;
            width = wWidth;
            height = height * wWidth / mid
        } else if (height > wHeight) {
            mid = height;
            height = wHeight;
            width = width * wHeight / mid
        } else {};
        var top = (wHeight - height) / 2,
            left = (wWidth - width) / 2;
        return {
            width: width,
            height: height,
            top: top,
            left: left
        }
    }

    // 返回朋友圈信息发布时间 
    function formatNewsTime(timeStamp){
        var now = new Date().valueOf();
        var result = '';
        var delta = (now - timeStamp)/1000;
        if(delta<60) {
            result = '刚刚';
        }else if(delta<60*60) {
            result = Math.floor( delta/(60) ) + '分钟前';
        }
        else if(delta<24*60*60) {
            result = Math.floor( delta/(60*60) ) + '小时前';
        }else if(delta<30*24*60*60) {
            result = Math.floor( delta/(24*60*60) ) + '天前';
        }
        else if(delta<12*30*24*60*60) {
            result = Math.floor( delta/(30*24*60*60) ) + '个月前';
        }else if(delta>=12*30*24*60*60){
            result = Math.floor( delta/(12*30*24*60*60) ) + '年前';
        }

        return result;
    }


    // 高频执行事件/方法的防抖 取自 UnderscoreJS 实用框架 
    // 添加resize的回调函数，但是只允许它每300毫秒执行一次  
    /* window.addEventListener('resize', debounce(function(event) {

        console.log('这里写resize过程 ') 

    }, 300));*/ 
    function debounce(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this,
                args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }

    //生成指定范围的随机数
    function r(Min, Max) {
        var Range = Max - Min;
        var Rand = Math.random();
        return (Min + Math.round(Rand * Range));
    }
    // 生成随机uuid guid();
    function guid() {
        var S4 = function(){
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        };
        return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
    }
    function getElementPos(e) {
        if (e.parentNode === null || e.style.display == "none") return ! 1;
        var t = navigator.userAgent.toLowerCase(),
        n = null,
        r = [],
        i;
        if (e.getBoundingClientRect) {
            var s, o, u, a;
            return i = e.getBoundingClientRect(),
            s = Math.max(document.documentElement.scrollTop, document.body.scrollTop),
            o = Math.max(document.documentElement.scrollLeft, document.body.scrollLeft),
            u = document.body.clientTop,
            a = document.body.clientLeft,
            {
                x: i.left + o - a,
                y: i.top + s - u
            }
        }
        if (document.getBoxObjectFor) {
            i = document.getBoxObjectFor(e);
            var f = e.style.borderLeftWidth ? Math.floor(e.style.borderLeftWidth) : 0,
            l = e.style.borderTopWidth ? Math.floor(e.style.borderTopWidth) : 0;
            r = [i.x - f, i.y - l]
        } else {
            r = [e.offsetLeft, e.offsetTop],
            n = e.offsetParent;
            if (n != e) while (n) r[0] += n.offsetLeft,
            r[1] += n.offsetTop,
            n = n.offsetParent;
            if (t.indexOf("opera") > -1 || t.indexOf("safari") > -1 && e.style.position == "absolute") r[0] -= document.body.offsetLeft,
            r[1] -= document.body.offsetTop
        }
        e.parentNode ? n = e.parentNode: n = null;
        while (n && n.tagName != "BODY" && n.tagName != "HTML") r[0] -= n.scrollLeft,
        r[1] -= n.scrollTop,
        n.parentNode ? n = n.parentNode: n = null;
        return {
            x: r[0],
            y: r[1]
        }
    }
    //判断闰年
    function IsRunYear(year) {
        var monarr = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        //闰年的话
        if (((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0)) {
            monarr[1] = "29";
            return true;
        }
        return false;
    }
    //类继承
    var extendClass = function(subClass, superClass){
        var F = function(){};

        F.prototype = superClass.prototype;　　
        subClass.prototype = new F();　　
     
        subClass.superclass = superClass.prototype;
      
    }

    // 获取宽和高
    function getClient(e){
        var w,h;
        if (e) {
            w = e.clientWidth;
            h = e.clientHeight;
        } else {
            w = (window.innerWidth) ? window.innerWidth : (document.documentElement && document.documentElement.clientWidth) ? document.documentElement.clientWidth : document.body.offsetWidth;
            h = (window.innerHeight) ? window.innerHeight : (document.documentElement && document.documentElement.clientHeight) ? document.documentElement.clientHeight : document.body.offsetHeight;
        }
        return {w:w,h:h};
    }
    // 元素屏幕居中显示 position:fixed
    function centerElement(el,width,height) {
        var win = getClient(),
            winHeight = win.h,
            winWidth = win.w,
            element = el.jquery?el[0]:el,
            _width = width || element.offsetWidth,
            height =  height || element.offsetHeight,
            scrollTop,
            top,left;
            
        left =  Math.floor( (winWidth-_width)*0.5 );

        if(width){
            element.style.width = width+'px';
        }
        element.style.position = 'fixed';
        element.style.left = left+'px';
        
        top = Math.floor( (winHeight-height)*0.45 );
        element.style.top = top+'px';
    }



    /*
        模板控制器
    */
    var iTemplate = (function(){
        var template = function(){};
        template.prototype = {
            // 针对数组数据 iTemplate.makeList('<p a="{a}">{b}</p>', [{a:1,b:2},{a:22,b:33}] ) return '<p a="1">2</p><p a="22">33</p>'
            makeList: function(tpl, arr, fn){
                var res = [], $10 = [], reg = /{(.+?)}/g, json2 = {}, index = 0;
                for(var el = 0;el<arr.length;el++){
                    if(typeof fn === "function"){
                        json2 = fn.call(this, el, arr[el], index++)||{};
                    }
                    res.push(
                         tpl.replace(reg, function($1, $2){
                            return ($2 in json2)? json2[$2]: (undefined === arr[el][$2]? '':arr[el][$2]);
                        })
                    );
                }
                return res.join('');
            },
            // 针对单个数据 iTemplate.substitute('<p a="{a}">{b}</p>',{a:1,b:2}) return '<p a="1">2</p>'
            substitute: function(tpl, obj){
                if (!(Object.prototype.toString.call(tpl) === '[object String]')) {
                    return '';
                }
                if(!(Object.prototype.toString.call(obj) === '[object Object]' && 'isPrototypeOf' in obj)) {
                    return tpl;
                }
                //    /\{([^{}]+)\}/g
                return tpl.replace(/\{(.*?)\}/igm , function(match, key) {
                    if(typeof obj[key] != 'undefined'){
                        return obj[key];
                    }
                    return '';
                });
            }
        }
        return new template();
    })();

    // 缓存器
    var Cache = (function() {
        var a = {};
            return {
                set: function(b, c) {
                    a[b] = c
                },
                get: function(b) {
                    return a[b]
                },
                clear: function() {
                    a = {}
                },
                remove: function(b) {
                    delete a[b]
                }
            }
    } ());
    
    var Util = {
        on:function (obj, type, handler) {
            var types = this.isArray(type) ? type : [type],
                k = types.length,
                d;
            if (!obj.addEventListener) {
                //绑定obj 为this
                d = function (evt) {
                    evt = evt || window.event;
                    var el = evt.srcElement;
                    return handler.call(el, evt);
                };
                handler._d = d;
            }
            if (k) while (k--) {
                type = types[k];
                if (obj.addEventListener) {
                    obj.addEventListener(type, handler, false);
                } else {
                    obj.attachEvent('on' + type, d);
                }
            }
            obj = null;
        },
        un:function (obj, type, handler) {
            var types = this.isArray(type) ? type : [type],
                k = types.length;
            if (k) while (k--) {
                type = types[k];
                if (obj.removeEventListener) {
                    obj.removeEventListener(type, handler, false);
                } else {
                    obj.detachEvent('on' + type, handler._d || handler);
                }
            }
        },
        getCharCode:function (event) {
            return event.keyCode || event.which || event.charCode;
        },
        getTarget:function (event) {
            return event.target || event.srcElement;
        },
        getBrowerVersion:function(){
            var agent = navigator.userAgent.toLowerCase(),
                opera = window.opera,
                browser = {
                    ie      : !!window.ActiveXObject,
                    webkit  : ( agent.indexOf( ' applewebkit/' ) > -1 ),
                    quirks : ( document.compatMode == 'BackCompat' ),
                    opera   : ( !!opera && opera.version )
                };
            if ( browser.ie ){
                browser.version = parseFloat( agent.match( /msie (\d+)/ )[1] );
            }
            browser.gecko = ( navigator.product == 'Gecko' && !browser.webkit && !browser.opera );
            return browser;
        },
    };

    /* 本地存储 */
    var MStorage = window.MStorage = (function() {
        var _session = window.sessionStorage,
            _local = window.localStorage,
            _get = function(k) {
                var d = _getData(k);
                if (d != null) return d.value;
                return null;
            }, _getData = function(k) {
                if(k in _local){
                    return JSON.parse(_local.getItem(k)); 
                }else {
                    return null;
                }
            }, _set = function(k, v) {
                var d = {
                    value: v,
                    ts: (new Date).getTime()
                };
                d = JSON.stringify(d);
                //_session.setItem(k, v);
                _local.setItem(k, d);
            }, _clear = function() {
                //_session.clear();
                _local.clear();
            }, _remove = function(k) {
                //_session.removeItem(k);
                _local.removeItem(k);
            }, _removeExpires = function(time) {
                var now = (new Date).getTime(),
                    data;
                for (var key in _local) {
                    data = MStorage.getData(key);
                    if (now - data.ts > time) {
                        _local.removeItem(key);
                        //_session.removeItem(key);
                    }
                }
            }, _setData = function(k,data) {
                var d;
                if(typeof data === 'object') {
                    data.ts = (new Date).getTime();
                    d = JSON.stringify(data);
                    _local.setItem(k, d);
                }
            };
        return {
            set: _set,
            get: _get,
            setData: _setData,
            getData: _getData,
            clear: _clear,
            remove: _remove,
            removeExpires: _removeExpires
        };
    }());

    /*------------------------------------------*/
    var mLoading = {
        // params:message timeout callback
        success: function(){
            var notice = '',timeout = 2000,callback,$dom;
            if(arguments.length === 3){
                notice =  arguments[0];
                timeout = arguments[1];
                callback = arguments[2];
            }else if(arguments.length === 2){
                notice =  arguments[0];
                timeout = (typeof arguments[1] == 'number')?arguments[1]:timeout;
                callback = (typeof arguments[1] == 'function')?arguments[1]:null;
            }else if(arguments.length == 1){
                notice = (typeof arguments[0] == 'string')?arguments[0]:notice;
                callback = (typeof arguments[0] == 'function')?arguments[0]:null;
            }
            
            var tmpl = '<div id="mLoading" role="success"><div class="lbk"></div><div class="lcont">' + notice + '</div></div>';
            $('#mLoading').remove();
            $dom = $(tmpl).appendTo($('body'));
            centerElement($('#mLoading'),146,146);
            setTimeout(function(){
                $dom.remove();
                callback && callback();
                
            }, timeout);
        },
        show: function(notice,options){
            var notice = notice || '正在加载...',options = options || {},
                tmpl = '<div id="mLoading"><div class="lbk"></div><div class="lcont">' + notice + '</div></div>';

            if( $('#mLoading').length >0 ) {
                $('#mLoading .lcont').text(notice);
            }else{
                $('body').append(tmpl);
                centerElement($('#mLoading'),146,146);
            }
        },
        hide: function(){
            $('#mLoading').remove();
        }
    };
    var tplAlert = '<div class="modal modal-mobile" role="dialog" id="alert">'+
                        '<div class="modal-dialog ">'+
                            '<div class="modal-content">'+
                                '<div class="modal-body"></div>'+
                                '<div class="modal-footer">'+
                                    '<a href="javascript:void(0)" class="btn-alert" data-dismiss="modal">确定</a>'+
                                '</div>'+
                            '</div>'+
                        '</div>'+
                    '</div>';

    var tplConfirm = '<div class="modal modal-mobile" role="dialog" id="confirm">'+
                        '<div class="modal-dialog ">'+
                            '<div class="modal-content">'+
                                '<div class="modal-body"></div>'+
                                '<div class="modal-footer">'+
                                    '<a href="javascript:void(0)" class="btn-confirm-no" data-dismiss="modal">取消</a>'+
                                    '<a href="javascript:void(0)" class="btn-confirm-yes" data-dismiss="modal">确定</a>'+
                                '</div>'+
                            '</div>'+
                        '</div>'+
                    '</div>';


    var iMobile = window['iMobile'] = {
        alert:function(message,callback){
            $('#alert').remove();
            $(tplAlert).appendTo($('body'));
            $('#alert .modal-body').text(message);

            $('#alert .btn-alert').bind('click',function(){
                callback && callback();
            });

            $('#alert').modal({
                backdrop:'static',
                keyboard:false
            });
        },
        confirm:function(message,onConfirm,onCancel){
            $('#confirm').remove();
            $(tplConfirm).appendTo($('body'));
            $('#confirm .modal-body').text(message);

            $('#confirm .btn-confirm-yes').bind('click',function(){
                onConfirm && onConfirm();
            });
            $('#confirm .btn-confirm-no').bind('click',function(){
                onCancel && onCancel();
            });

            $('#confirm').modal({
                backdrop:'static',
                keyboard:false
            });
        },
        loading:mLoading
    };

    iMobile.Util = Util;



})();

/* 音乐视频 */
(function(iMobile){
    function Player(el, callback){
        this.el = el;
        this.callback = callback || function(){}
        this.isPlay = true;
        this.init();
    }
    Player.prototype = {
        init: function(options){
            var _this = this,
                opts = options || {},
                attr = {loop: true, preload: "auto", src: this.el.attr("data-src")};

            $.extend(true, attr , opts);
            
            this._audio = new Audio();
           
            $(this._audio).on({
                canplay: function(){
                    console.log('canplay')
                    _this.callback.call(_this, true);
                    
                },
                error: function(e){
                    console.log('error')
                    _this.callback.call(_this, false, e);
                }

            })

            try{
                for (var i in attr){
                    attr.hasOwnProperty(i) && i in this._audio && (this._audio[i] = attr[i]);
                }

                this._audio.load();
    
            }catch(e){
                console.log('exception')
                this.callback.call(_this, false, e);
            }
            
            this.el.parent().on('click', function(){
                _this._play();
            });
        },
        _play: function(){
            var _text = this.el.prev()[0];

        
            if(!this.isPlay){
                this._audio.play();
                this.el.addClass('on');
                this.el.parent().addClass('on');
                $(_text).text('打开');
            }else{
                //alert(1)
                this._audio.pause();
                this.el.removeClass('on');
                this.el.parent().removeClass('on');
                $(_text).text('关闭');
            }
            //console.log('this.isPlay',this.isPlay);
            this.isPlay = !this.isPlay;

            _text.className = 'text';
            setTimeout(function(){
                _text.className = 'text move hide';
            }, 1000);
        },
        play:function(){
            var _text = this.el.prev()[0];

            this.isPlay = true;
            this._audio.play();
            this.el.addClass('on');
            this.el.parent().addClass('on');
            $(_text).text('打开');

            _text.className = 'text';
            setTimeout(function(){
                _text.className = 'text move hide';
            }, 1000);
        },
        pause:function(){
            var _text = this.el.prev()[0];

            this.isPlay = false;
            this._audio.pause();
            this.el.removeClass('on');
            this.el.parent().removeClass('on');
            $(_text).text('关闭');

            _text.className = 'text';
            setTimeout(function(){
                _text.className = 'text move hide';
            }, 1000);
        }

    }

    function Media(el, showCb, closeCb){
        this.el = el;
        this.init(showCb, closeCb);
    }
    Media.prototype = {
        init: function(showCb, closeCb){
            var attr = {controls: "controls", preload: "none", src: $(this.el).data('src')},
                _video = $("<video></video>")[0],
                _videoWrap = $('<div class="video_wrap"><a href="javascript:void(0);" class="video_close"></a></div>').appendTo($('.container')),
                _this = this;

            for (var i in attr){
                attr.hasOwnProperty(i) && i in _video && (_video[i] = attr[i]);
            }

            _videoWrap.append(_video);

            $(this.el).on('click', function(){
                'function' == typeof showCb && showCb();

                $(this).hide();             
                if(/android/i.test(navigator.userAgent)){
                    setTimeout(function() {
                        _videoWrap.addClass('show');
                        setTimeout(function() {
                            "function" == typeof _video.play && _video.play();
                        }, 500);
                    }, 20);
                }else{
                    _videoWrap.addClass('show');
                    _video.play();
                }
                
                return false;
            });
            
            _videoWrap.find('.video_close').on('click', function(){
                _videoWrap.removeClass('show');
                $(_this.el).show();
                'function' == typeof closeCb && closeCb();
            });
        }
    }

    iMobile.Player = Player;
    iMobile.Media = Media;
})(iMobile);

/* ========================================================================
 * Bootstrap: modal.js v3.3.0
 * http://getbootstrap.com/javascript/#modals
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // MODAL CLASS DEFINITION
  // ======================

  var Modal = function (element, options) {
    this.options        = options
    this.$body          = $(document.body)
    this.$element       = $(element)
    this.$backdrop      =
    this.isShown        = null
    this.scrollbarWidth = 0

    if (this.options.remote) {
      this.$element
        .find('.modal-content')
        .load(this.options.remote, $.proxy(function () {
          this.$element.trigger('loaded.bs.modal')
        }, this))
    }
  }

  Modal.VERSION  = '3.3.0'

  Modal.TRANSITION_DURATION = 300
  Modal.BACKDROP_TRANSITION_DURATION = 150

  Modal.DEFAULTS = {
    backdrop: true,
    keyboard: true,
    show: true
  }

  Modal.prototype.toggle = function (_relatedTarget) {
    return this.isShown ? this.hide() : this.show(_relatedTarget)
  }

  Modal.prototype.show = function (_relatedTarget) {
    var that = this
    var e    = $.Event('show.bs.modal', { relatedTarget: _relatedTarget })

    this.$element.trigger(e)

    if (this.isShown || e.isDefaultPrevented()) return

    this.isShown = true

    this.checkScrollbar()
    this.$body.addClass('modal-open')

    this.setScrollbar()
    this.escape()

    this.$element.on('click.dismiss.bs.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this))

    this.backdrop(function () {
      var transition = $.support.transition && that.$element.hasClass('fade')

      if (!that.$element.parent().length) {
        that.$element.appendTo(that.$body) // don't move modals dom position
      }

      that.$element
        .show()
        .scrollTop(0)

      if (transition) {
        that.$element[0].offsetWidth // force reflow
      }

      that.$element
        .addClass('in')
        .attr('aria-hidden', false)

      that.enforceFocus()

      var e = $.Event('shown.bs.modal', { relatedTarget: _relatedTarget })

      transition ?
        that.$element.find('.modal-dialog') // wait for modal to slide in
          .one('bsTransitionEnd', function () {
            that.$element.trigger('focus').trigger(e)
          })
          .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
        that.$element.trigger('focus').trigger(e)
    })
  }

  Modal.prototype.hide = function (e) {
    if (e) e.preventDefault()

    e = $.Event('hide.bs.modal')

    this.$element.trigger(e)

    if (!this.isShown || e.isDefaultPrevented()) return

    this.isShown = false

    this.escape()

    $(document).off('focusin.bs.modal')

    this.$element
      .removeClass('in')
      .attr('aria-hidden', true)
      .off('click.dismiss.bs.modal')

    $.support.transition && this.$element.hasClass('fade') ?
      this.$element
        .one('bsTransitionEnd', $.proxy(this.hideModal, this))
        .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
      this.hideModal()
  }

  Modal.prototype.enforceFocus = function () {
    $(document)
      .off('focusin.bs.modal') // guard against infinite focus loop
      .on('focusin.bs.modal', $.proxy(function (e) {
        if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
          this.$element.trigger('focus')
        }
      }, this))
  }

  Modal.prototype.escape = function () {
    if (this.isShown && this.options.keyboard) {
      this.$element.on('keydown.dismiss.bs.modal', $.proxy(function (e) {
        e.which == 27 && this.hide()
      }, this))
    } else if (!this.isShown) {
      this.$element.off('keydown.dismiss.bs.modal')
    }
  }

  Modal.prototype.hideModal = function () {
    var that = this
    this.$element.hide()
    this.backdrop(function () {
      that.$body.removeClass('modal-open')
      that.resetScrollbar()
      that.$element.trigger('hidden.bs.modal')
    })
  }

  Modal.prototype.removeBackdrop = function () {
    this.$backdrop && this.$backdrop.remove()
    this.$backdrop = null
  }

  Modal.prototype.backdrop = function (callback) {
    var that = this
    var animate = this.$element.hasClass('fade') ? 'fade' : ''

    if (this.isShown && this.options.backdrop) {
      var doAnimate = $.support.transition && animate

      this.$backdrop = $('<div class="modal-backdrop ' + animate + '" />')
        .prependTo(this.$element)
        .on('click.dismiss.bs.modal', $.proxy(function (e) {
          if (e.target !== e.currentTarget) return
          this.options.backdrop == 'static'
            ? this.$element[0].focus.call(this.$element[0])
            : this.hide.call(this)
        }, this))

      if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

      this.$backdrop.addClass('in')

      if (!callback) return

      doAnimate ?
        this.$backdrop
          .one('bsTransitionEnd', callback)
          .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
        callback()

    } else if (!this.isShown && this.$backdrop) {
      this.$backdrop.removeClass('in')

      var callbackRemove = function () {
        that.removeBackdrop()
        callback && callback()
      }
      $.support.transition && this.$element.hasClass('fade') ?
        this.$backdrop
          .one('bsTransitionEnd', callbackRemove)
          .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
        callbackRemove()

    } else if (callback) {
      callback()
    }
  }

  Modal.prototype.checkScrollbar = function () {
    this.scrollbarWidth = this.measureScrollbar()
  }

  Modal.prototype.setScrollbar = function () {
    var bodyPad = parseInt((this.$body.css('padding-right') || 0), 10)
    if (this.scrollbarWidth) this.$body.css('padding-right', bodyPad + this.scrollbarWidth)
  }

  Modal.prototype.resetScrollbar = function () {
    this.$body.css('padding-right', '')
  }

  Modal.prototype.measureScrollbar = function () { // thx walsh
    if (document.body.clientWidth >= window.innerWidth) return 0
    var scrollDiv = document.createElement('div')
    scrollDiv.className = 'modal-scrollbar-measure'
    this.$body.append(scrollDiv)
    var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth
    this.$body[0].removeChild(scrollDiv)
    return scrollbarWidth
  }


  // MODAL PLUGIN DEFINITION
  // =======================

  function Plugin(option, _relatedTarget) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.modal')
      var options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data) $this.data('bs.modal', (data = new Modal(this, options)))
      if (typeof option == 'string') data[option](_relatedTarget)
      else if (options.show) data.show(_relatedTarget)
    })
  }

  var old = $.fn.modal

  $.fn.modal             = Plugin
  $.fn.modal.Constructor = Modal


  // MODAL NO CONFLICT
  // =================

  $.fn.modal.noConflict = function () {
    $.fn.modal = old
    return this
  }


  // MODAL DATA-API
  // ==============

  $(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function (e) {
    var $this   = $(this)
    var href    = $this.attr('href')
    var $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))) // strip for ie7
    var option  = $target.data('bs.modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data())

    if ($this.is('a')) e.preventDefault()

    $target.one('show.bs.modal', function (showEvent) {
      if (showEvent.isDefaultPrevented()) return // only register focus restorer if modal will actually get shown
      $target.one('hidden.bs.modal', function () {
        $this.is(':visible') && $this.trigger('focus')
      })
    })
    Plugin.call($target, option, this)
  })

}(jQuery);
