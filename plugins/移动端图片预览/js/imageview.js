  /*
        图片大图预览
  */
  (function() {
      jQuery.extend({
        os:{
            ios : false,
            android: false,
            version: false
        }
      });
      var ua = navigator.userAgent;
      var browser = {},
          webkit = ua.match(/WebKit\/([\d.]+)/),
          android = ua.match(/(Android)\s+([\d.]+)/),
          ipad = ua.match(/(iPad).*OS\s([\d_]+)/),
          ipod = ua.match(/(iPod).*OS\s([\d_]+)/),
          iphone = !ipod && !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/),
          webos = ua.match(/(webOS|hpwOS)[\s\/]([\d.]+)/),
          touchpad = webos && ua.match(/TouchPad/),
          kindle = ua.match(/Kindle\/([\d.]+)/),
          silk = ua.match(/Silk\/([\d._]+)/),
          blackberry = ua.match(/(BlackBerry).*Version\/([\d.]+)/),
          mqqbrowser = ua.match(/MQQBrowser\/([\d.]+)/),
          chrome = ua.match(/CriOS\/([\d.]+)/),
          opera = ua.match(/Opera\/([\d.]+)/),
          safari = ua.match(/Safari\/([\d.]+)/);
      // if (browser.webkit = !! webkit) browser.version = webkit[1]
      if (android) {
          jQuery.os.android = true;
          jQuery.os.version = android[2];
      }
      if (iphone) {
          jQuery.os.ios = jQuery.os.iphone = true;
          jQuery.os.version = iphone[2].replace(/_/g, '.');
      }
      if (ipad) {
          jQuery.os.ios = jQuery.os.ipad = true;
          jQuery.os.version = ipad[2].replace(/_/g, '.');
      }
      if (ipod) {
          jQuery.os.ios = jQuery.os.ipod = true;
          jQuery.os.version = ipod[2].replace(/_/g, '.');
      }
  })();
;(function($){
    var touch = {},
      touchTimeout, tapTimeout, swipeTimeout, longTapTimeout,
      longTapDelay = 750,
      gesture

    function swipeDirection(x1, x2, y1, y2) {
      return Math.abs(x1 - x2) >=
        Math.abs(y1 - y2) ? (x1 - x2 > 0 ? 'Left' : 'Right') : (y1 - y2 > 0 ? 'Up' : 'Down')
    }

    function longTap() {
      longTapTimeout = null
      if (touch.last) {
        touch.el.trigger('longTap')
        touch = {}
      }
    }

    function cancelLongTap() {
      if (longTapTimeout) clearTimeout(longTapTimeout)
      longTapTimeout = null
    }

    function cancelAll() {
      if (touchTimeout) clearTimeout(touchTimeout)
      if (tapTimeout) clearTimeout(tapTimeout)
      if (swipeTimeout) clearTimeout(swipeTimeout)
      if (longTapTimeout) clearTimeout(longTapTimeout)
      touchTimeout = tapTimeout = swipeTimeout = longTapTimeout = null
      touch = {}
    }

    function isPrimaryTouch(event){
      return (event.pointerType == 'touch' ||
        event.pointerType == event.MSPOINTER_TYPE_TOUCH)
        && event.isPrimary
    }

    function isPointerEventType(e, type){
      return (e.type == 'pointer'+type ||
        e.type.toLowerCase() == 'mspointer'+type)
    }

    $(document).ready(function(){
      var now, delta, deltaX = 0, deltaY = 0, firstTouch, _isPointerType

      if ('MSGesture' in window) {
        gesture = new MSGesture()
        gesture.target = document.body
      }

      $(document)
        .bind('MSGestureEnd', function(e){
          var swipeDirectionFromVelocity =
            e.velocityX > 1 ? 'Right' : e.velocityX < -1 ? 'Left' : e.velocityY > 1 ? 'Down' : e.velocityY < -1 ? 'Up' : null;
          if (swipeDirectionFromVelocity) {
            touch.el.trigger('swipe')
            touch.el.trigger('swipe'+ swipeDirectionFromVelocity)
          }
        })
        .on('touchstart MSPointerDown pointerdown', function(e){
          if((_isPointerType = isPointerEventType(e, 'down')) &&
            !isPrimaryTouch(e)) return
          firstTouch = _isPointerType ? e : e.originalEvent.touches[0]
          if (e.originalEvent.touches && e.originalEvent.touches.length === 1 && touch.x2) {
            // Clear out touch movement data if we have it sticking around
            // This can occur if touchcancel doesn't fire due to preventDefault, etc.
            touch.x2 = undefined
            touch.y2 = undefined
          }
          now = Date.now()
          delta = now - (touch.last || now)
          touch.el = $('tagName' in firstTouch.target ?
            firstTouch.target : firstTouch.target.parentNode)
          touchTimeout && clearTimeout(touchTimeout)
          touch.x1 = firstTouch.pageX
          touch.y1 = firstTouch.pageY
          if (delta > 0 && delta <= 250) touch.isDoubleTap = true
          touch.last = now
          longTapTimeout = setTimeout(longTap, longTapDelay)
          // adds the current touch contact for IE gesture recognition
          if (gesture && _isPointerType) gesture.addPointer(e.pointerId);
        })
        .on('touchmove MSPointerMove pointermove', function(e){
          if((_isPointerType = isPointerEventType(e, 'move')) &&
            !isPrimaryTouch(e)) return
          firstTouch = _isPointerType ? e : e.originalEvent.touches[0]
          cancelLongTap()
          touch.x2 = firstTouch.pageX
          touch.y2 = firstTouch.pageY

          deltaX += Math.abs(touch.x1 - touch.x2)
          deltaY += Math.abs(touch.y1 - touch.y2)
        })
        .on('touchend MSPointerUp pointerup', function(e){
          if((_isPointerType = isPointerEventType(e, 'up')) &&
            !isPrimaryTouch(e)) return
          cancelLongTap()

          // swipe
          if ((touch.x2 && Math.abs(touch.x1 - touch.x2) > 30) ||
              (touch.y2 && Math.abs(touch.y1 - touch.y2) > 30))

            swipeTimeout = setTimeout(function() {
              touch.el.trigger('swipe')
              touch.el.trigger('swipe' + (swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2)))
              touch = {}
            }, 0)

          // normal tap
          else if ('last' in touch)
            // don't fire tap when delta position changed by more than 30 pixels,
            // for instance when moving to a point and back to origin
            if (deltaX < 30 && deltaY < 30) {
              // delay by one tick so we can cancel the 'tap' event if 'scroll' fires
              // ('tap' fires before 'scroll')
              tapTimeout = setTimeout(function() {

                // trigger universal 'tap' with the option to cancelTouch()
                // (cancelTouch cancels processing of single vs double taps for faster 'tap' response)
                var event = $.Event('tap')
                event.cancelTouch = cancelAll
                touch.el.trigger(event)

                // trigger double tap immediately
                if (touch.isDoubleTap) {
                  if (touch.el) touch.el.trigger('doubleTap')
                  touch = {}
                }

                // trigger single tap after 250ms of inactivity
                else {
                  touchTimeout = setTimeout(function(){
                    touchTimeout = null
                    if (touch.el) touch.el.trigger('singleTap')
                    touch = {}
                  }, 250)
                }
              }, 0)
            } else {
              touch = {}
            }
            deltaX = deltaY = 0

        })
        // when the browser window loses focus,
        // for example when a modal dialog is shown,
        // cancel all ongoing events
        .on('touchcancel MSPointerCancel pointercancel', cancelAll)

      // scrolling the window indicates intention of the user
      // to scroll, not tap or swipe, so cancel all ongoing events
      $(window).on('scroll', cancelAll)
    })

    ;['swipe', 'swipeLeft', 'swipeRight', 'swipeUp', 'swipeDown',
      'doubleTap', 'tap', 'singleTap', 'longTap'].forEach(function(eventName){
      $.fn[eventName] = function(callback){ return this.on(eventName, callback) }
    })
  })(jQuery);

  (function(){
    $.os = $.os || {};

    var tmpl = {
        'item': function (data) {
 
            var __p = [],
                _p = function (s) {
                    __p.push(s)
                };
            with(data || {}) {
                var arrTitle = titles || [];
                __p.push('<ul class="pv-inner" style="line-height:');
                _p(height);
                __p.push('px;">');
                for (var i = 0; i < photos.length; i++) {
                    var imgTitle = arrTitle[i] || '';
                    __p.push('<li class="pv-img" title="' + imgTitle + '" style="width:');
                    _p(width);
                    __p.push('px;height:');
                    _p(height);
                    __p.push('px;"></li>');
                }
                __p.push(
                    '</ul>    <span class="ui-loading white" id="J_loading"><div class="loadInco"><span class="blockG" id="rotateG_01"></span><span class="blockG" id="rotateG_02"></span><span class="blockG" id="rotateG_03"></span><span class="blockG" id="rotateG_04"></span><span class="blockG" id="rotateG_05"></span><span class="blockG" id="rotateG_06"></span><span class="blockG" id="rotateG_07"></span><span class="blockG" id="rotateG_08"></span></div></span><p class="counts"><span class="value" id="J_index">');
                _p(index + 1);
                __p.push('/');
                _p(photos.length);
                __p.push('</span></p>');
                __p.push('<p class="slide-view-title"><span id="J_title" class="value">1111111</span></p>');
 
            }
            return __p.join("");
        }
    };
    var ImageView = window['ImageView'] = {
        photos: null,
        index:0,
        el: null,
        config: null,
        lastContainerScroll: 0,
        zoom:1,
        advancedSupport : false,
        lastTapDate: 0,
        /**
         *
         * @param photos {Array} photo url list
         * @param index {Number} display photo at this index as default
         * @param config{
         *      count: global photo count, leave blank while {photos} is enough for displaying.
         *      idx_space: global index of the first photo in given photo array, leave blank in the same condition above.
         *      onRequestMore: callback when lacking of photos
         *      onIndexChange:callback at index changes
         *      onClose: callback at close
         * }
         */
        init : function(photos, index, config){
            var self = this;
            index = +index || 0;
            this.config = $.extend({
                fade: true
            },config);

            this.lastContainerScroll = document.body.scrollTop;
            // if mobile is iphone or android
            if($.os.iphone || ($.os.android && parseFloat($.os.version)>=4.0)){
                this.advancedSupport = true;
            }

            //rebuild photos array based on global count ????for what
            if(this.config.count){
                this.photos = new Array(this.config.count);
                var len = photos.length,
                    start = this.config.idx_space || 0;
                for(var i=start;i<start+len;i++){
                    this.photos[i] = photos[i - start];
                }
                this.index = start + index;
            }else{
                this.photos = photos || [];
                this.index = index || 0;
            }

            //do size calculation in next tick, leave time to browser for any size related changes to take place.
            setTimeout(function(){
                self.clearStatus();
                self.render(true);
                self.bind();
                self.changeIndex(self.index, true);
            },0);
        },

        //reset sizes.
        clearStatus: function(){
            this.width = Math.max(window.innerWidth,document.body.clientWidth);//android compatibility
            this.height = window.innerHeight;
            this.zoom = 1;
            this.zoomX = 0;
            this.zoomY = 0;
        },
        render: function(first){
            var config = this.config || {}, titles = config.titles || [];

            if(first) {
              $('<div id="imageView" class="slide-view" style="display:none;">').appendTo($('body'));
            }
            
            this.el = $('#imageView');
            this.el.html(tmpl.item({
                photos: this.photos,
                titles:titles,
                index: this.index,
                width: this.width,
                height: this.height
            }));
            //window.scrollY+'px'
            if(first){
                this.el.css({
                    'opacity':0,
                    'height': this.height + 2 +'px',  //2px higher
                    'top':window.scrollY+'px'
                    //'top':this.lastContainerScroll - 1 +'px'
                }).show().animate({
                        'opacity':1
                    },300);
            }

        },
        topFix: function(){
            if(!ImageView.el) return;
            ImageView.el.css('top', window.scrollY + 'px');
        },
        bind : function(){
            var self = this;
            this.unbind();
            $(window).on('scroll',this.topFix);
            this.el.on('touchstart touchmove touchend touchcancel',function(e){
                //alert(e.originalEvent.touches[0].pageX)
                e.touches = e.originalEvent?e.originalEvent.touches:null;
                self.handleEvent(e);
            });
            this.el.on('click',function(e){
                console.log('click',e)
                e.preventDefault();
                var now = new Date();
                if(now - this.lastTapDate < 500){
                    return;
                }
                this.lastTapDate = now;
                self.onSingleTap(e);
            }).on('doubleTap', function(e){
                    
                    e.preventDefault();
                    self.onDoubleTap(e);
                });
       
            this._resize = function(){
              self.resize();
            };
            'onorientationchange' in window ? window.addEventListener('orientationchange', this._resize, false) : window.addEventListener('resize', this._resize, false);
        },
        unbind: function(){
            this.el.off();
            $(window).off('scroll',this.topFix);
            'onorientationchange' in window ? window.removeEventListener('orientationchange', this._resize, false) : window.removeEventListener('resize', this._resize, false);
        },
        handleEvent: function(e) {
            switch (e.type) {

                case 'touchstart':
                    this.onTouchStart(e);
                    break;
                case 'touchmove':
                    e.preventDefault();
                    this.onTouchMove(e);
                    break;
                case 'touchcancel':
                case 'touchend':
                    this.onTouchEnd(e);
                    break;
                case 'orientationchange':
                case 'resize':
                    this.resize(e);
                    break;
            }
        },
        onSingleTap: function(e){
            this.close(e);
        },
        getDist: function(x1,y1,x2,y2){
            return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2), 2);
        },
        doubleZoomOrg: 1,
        doubleDistOrg: 1,
        isDoubleZoom: false,
        onTouchStart: function(e){
            if(this.advancedSupport && e.touches && e.touches.length >=2){
                var img = this.getImg();
                img.style.webkitTransitionDuration= '0';
                this.isDoubleZoom = true;
                this.doubleZoomOrg = this.zoom;
                this.doubleDistOrg  = this.getDist(e.touches[0].pageX,e.touches[0].pageY,e.touches[1].pageX,e.touches[1].pageY);
                return;
            }

            e = e.touches ? e.touches[0] : e;
            //alert(1111+','+e.touches[0].pageX)
            this.isDoubleZoom = false;
            this.startX = e.pageX;
            this.startY = e.pageY;
            this.orgX = e.pageX;
            this.orgY = e.pageY;
            this.hasMoved = false;
            //alert(this.startX+',')
            if(this.zoom != 1){
                this.zoomX = this.zoomX || 0;
                this.zoomY = this.zoomY || 0;
                var img = this.getImg();
                if(img){
                    img.style.webkitTransitionDuration = '0';
                }
                this.drag = true;
            }else{
                //disable movement with single photo
                if(this.photos.length == 1){
                    return;
                }
                this.el.find('.pv-inner').css('transitionDuration','0');
                //this.el.find('.pv-inner').css('-webkitTransitionDuration','0');
                this.transX = -this.index*this.width;
                this.slide = true;
            }
        },

        onTouchMove: function(e){
            if(this.advancedSupport && e.touches && e.touches.length >=2){
                var newDist = this.getDist(e.touches[0].pageX,e.touches[0].pageY,e.touches[1].pageX,e.touches[1].pageY);
                this.zoom = newDist * this.doubleZoomOrg / this.doubleDistOrg;
                var img = this.getImg();
                img.style.webkitTransitionDuration = '0';
                if(this.zoom < 1){
                    this.zoom = 1;
                    this.zoomX = 0;
                    this.zoomY = 0;
                    img.style.webkitTransitionDuration = '200ms';
                }else if(this.zoom > this.getScale(img)*2){
                    this.zoom = this.getScale(img)*2;
                }
                img.style.webkitTransform = "scale("+this.zoom+") translate("+this.zoomX+"px,"+this.zoomY+"px)";
                return;
            }
            //disable movement at double status.
            if(this.isDoubleZoom){
                return;
            }
            e = e.touches ? e.touches[0] : e;
            //move distance larger than 5px
            if(!this.hasMoved && (Math.abs(e.pageX - this.orgX)>5 || Math.abs(e.pageY - this.orgY)>5)){
                this.hasMoved = true;
            }
            //zoom status
            if(this.zoom != 1){
                var deltaX = (e.pageX - this.startX) / this.zoom;
                var deltaY = (e.pageY - this.startY) / this.zoom;
                this.startX = e.pageX;
                this.startY = e.pageY;

                var img = this.getImg();
                var newWidth = img.width * this.zoom,
                    newHeight = img.height * this.zoom;
                var borderX = (newWidth - this.width) / 2 / this.zoom,
                    borderY = (newHeight - this.height) /2 / this.zoom;
                //edge status
                if(borderX >= 0){
                    if(this.zoomX < -borderX || this.zoomX > borderX){
                        deltaX /= 3;
                    }
                }
                if(borderY > 0){
                    if(this.zoomY < -borderY || this.zoomY > borderY){
                        deltaY /= 3;
                    }
                }
                this.zoomX += deltaX;
                this.zoomY += deltaY;
                //long image status
                if((this.photos.length == 1 && newWidth < this.width)){
                    this.zoomX = 0;
                }else if(newHeight < this.height){
                    this.zoomY = 0;
                }
                img.style.webkitTransform = "scale("+this.zoom+") translate("+this.zoomX+"px,"+this.zoomY+"px)";
            }else{

                //slide status
                if(!this.slide){
                    return;
                }

                var deltaX = e.pageX - this.startX;
                //alert(e.pageX+','+this.startX)
                if(this.transX > 0 || this.transX < -this.width*(this.photos.length-1)){
                    deltaX /= 4;
                }

                this.transX = -this.index*this.width+deltaX;
                //alert(this.width+','+deltaX+','+this.index)
                this.el.find('.pv-inner').css('transform','translateX('+this.transX+'px)');
                //this.el.find('.pv-inner').css('-webkitTransform','translateX('+this.transX+'px)');
            }
        },
        onTouchEnd: function(e){
            if(this.isDoubleZoom){
                return;
            }

            if(!this.hasMoved){
                return;
            }
            if(this.zoom != 1){
                if(!this.drag){
                    return;
                }
                var img = this.getImg();
                img.style.webkitTransitionDuration= '200ms';

                var newWidth = img.width * this.zoom,
                    newHeight = img.height * this.zoom;
                var borderX = (newWidth - this.width) / 2 / this.zoom,
                    borderY = (newHeight - this.height) /2 / this.zoom;
                //index change conditions
                var len = this.photos.length;
                if(len > 1 && borderX>=0){
                    var updateDelta = 0;
                    var switchDelta = this.width / 6;
                    if(this.zoomX < -borderX - switchDelta/this.zoom && this.index < len-1){
                        updateDelta = 1;
                    }else if(this.zoomX > borderX + switchDelta/this.zoom && this.index > 0){
                        updateDelta = -1;
                    }
                    if(updateDelta != 0){
                        this.scaleDown(img);
                        this.changeIndex(this.index + updateDelta);
                        return;
                    }
                }
                //edge
                if(borderX >= 0){
                    if(this.zoomX < -borderX){
                        this.zoomX = -borderX;
                    }else if(this.zoomX > borderX){
                        this.zoomX = borderX;
                    }
                }
                if(borderY > 0){
                    if(this.zoomY < -borderY){
                        this.zoomY = -borderY;
                    }else if(this.zoomY > borderY){
                        this.zoomY = borderY;
                    }
                }
                if(this.isLongPic(img) && Math.abs(this.zoomX) < 10){
                    img.style.webkitTransform = "scale("+this.zoom+") translate(0px,"+this.zoomY+"px)";
                    return;
                }else{
                    img.style.webkitTransform = "scale("+this.zoom+") translate("+this.zoomX+"px,"+this.zoomY+"px)";
                }
                this.drag = false;

            }else{
                if(!this.slide){
                    return;
                }
                var deltaX = this.transX - (-this.index*this.width);
                var updateDelta = 0;
                if(deltaX > 50){
                    updateDelta = -1;
                }else if(deltaX < -50){
                    updateDelta = 1;
                }
                this.changeIndex(this.index + updateDelta);
                this.slide = false;
            }
        },
        getImg: function(index){
            var img = this.el.find('li').eq(index || this.index).find('img');
            if(img.size() == 1){
                return img[0];
            }else{
                return null;
            }
        },
        //return default zoom factor
        getScale: function(img){
            //long images
            if(this.isLongPic(img)){
                return this.width / img.width; //scale to fit window
            }else{
                //other images
                //return 1 if image is smaller than window
                var h = img.naturalHeight,
                    w = img.naturalWidth;
                var hScale = h/img.height,
                    wScale = w/img.width;
                if(hScale > wScale){
                    return wScale;
                }else{
                    return hScale;
                }
            }
        },
        onDoubleTap: function(e){
            var now = new Date();
            if(now - this.lastTapDate < 500){
                return;
            }
            this.lastTapDate = now;
            var img = this.getImg();
            if(!img){
                return;
            }

            if(this.zoom != 1){
                this.scaleDown(img);
            }else{
                this.scaleUp(img);
            }
            this.afterZoom(img);
        },

        scaleUp: function(img){
            var scale = this.getScale(img);
            if(scale > 1){
                img.style.webkitTransform = "scale("+scale+")";
                img.style.webkitTransition= "200ms";
            }

            this.zoom = scale;
            this.afterZoom(img);
        },

        scaleDown: function(img){
            this.zoom = 1;
            this.zoomX = 0;
            this.zoomY = 0;
            this.doubleDistOrg = 1;
            this.doubleZoomOrg = 1;
            img.style.webkitTransform = "";
            this.afterZoom(img);
        },
        afterZoom: function(img){
            //reposition: top of image.
            if(this.zoom > 1 && this.isLongPic(img)){
                var newHeight = img.height * this.zoom;
                var borderY = (newHeight - this.height) /2 / this.zoom;
                if(borderY > 0){
                    this.zoomY = borderY;
                    img.style.webkitTransform = "scale("+this.zoom+") translate(0px,"+borderY+"px)";
                }
            }
        },
        isLongPic: function(img){
            return img.height / img.width >= 3.5
        },
        resizeTimer : null,
        resize: function(e){
            clearTimeout(this.resizeTimer);
            var self =this;
            this.resizeTimer = setTimeout(function(){

                document.body.style.minHeight = window.innerHeight + 1 +'px';
                if(self.zoom != 1){
                    //cancel zoom status
                    self.scaleDown(self.getImg());
                }
                self.clearStatus();
                self.render();  //re-render is faster than nodes modification.

                self.el.height(self.height).css('top',window.scrollY+'px');
                self.changeIndex(self.index, true);
            },600);
        },

        changeIndex: function(index, force){
            if(this.indexChangeLock){
                return;
            }
            if(index<0){
                index = 0;
            }else if(index >= this.photos.length){
                index = this.photos.length - 1;
            }
            var changed = this.index != index;
            this.index = index;
            var inner = this.el.find('.pv-inner');
            inner.css({
                'transitionDuration':force?'0':'200ms',
                'transform':'translateX(-'+index*this.width+'px)'
            });
            /*inner.css({
                '-webkitTransitionDuration':force?'0':'200ms',
                '-webkitTransform':'translateX(-'+index*this.width+'px)'
            });*/
            //load image at current index
            var li = inner.find('li').eq(index);
            var title = li.attr('title') || '';
            var imgs = li.find('img');
            var self = this;
            if(!imgs.size()){
                this.el.find('#J_loading').show();
                if(typeof this.photos[index] != 'undefined'){
                    var img = new Image();
                    img.onload = function(){
                        if(self.el == null){
                            return;
                        }
                        img.onload = null;
                        self.el.find('#J_loading').hide();
                        img.style.webkitTransform = '';
                        img.style.opacity = '';
                        if(self.isLongPic(img)){
                            setTimeout(function(){
                                self.scaleUp(img);
                            },0);
                        }
                    };
                    img.ontimeout = img.onerror = function(){
                        li.html('<i style="color:white;">This image is broken, try again later.</i>');
                        self.el.find('#J_loading').hide();
                    }
                    if(this.advancedSupport){
                        img.style.webkitBackfaceVisibility = 'hidden';
                    }
                    img.style.opacity='0';
                    img.src = this.getImgUrl(index);
                    li.html('').append(img);
                    //do we have enough photos
                    if(this.config.onRequestMore && this.index > 0 && typeof this.photos[index-1] == 'undefined'){
                        this.config.onRequestMore(this.photos[index],-1, index);
                    }else if(this.config.onRequestMore && this.index < this.photos.length -1 && typeof this.photos[this.index+1] == 'undefined'){
                        this.config.onRequestMore(this.photos[index],1, index);
                    }
                    this.preload(index-1);
                    this.preload(index+1);
                }else{
                    this.indexChangeLock = true;
                }
            }
            if(changed || force){
                this.el.find('#J_index').html((index+1)+'/'+this.photos.length);
                this.el.find('#J_title').html(title);
                this.config.onIndexChange && this.config.onIndexChange(img, this.photos, index);
            }
            setTimeout(function(){
                self.memoryClear();
            },0);
        },
        //defaule memory clear，remove nodes at index between [0, index - 10] && [index+10, max]
        memoryClear: function(){
            var li = this.el.find('.pv-img');
            var i = this.index - 10;
            while(i>=0){
                if(li.eq(i).html() == '') break;
                li.eq(i).html('');
                i--;
            }
            i = this.index + 10;
            while(i< li.size()){
                if(li.eq(i).html() == '') break;
                li.eq(i).html('');
                i++;
            }
        },

        getImgUrl: function(index, useOrg){
            if(index<0 || index>= this.photos.length || !this.photos[index]){
                return "";
            }

            return this.photos[index];
        },

        preload: function(index){
            if(index<0 || index>= this.photos.length || !this.getImg(index)){
                return;
            }
            var url = this.getImgUrl(index);
            if(url){
                var img = new Image();
                img.src = url;
            }
        },
        /**
         * update photos at given index
         * @param photos {Array}
         * @param index {Number} global index of first photo in given array
         */
        update:function(photos,index){
            if(index < this.photos.length){
                var len = photos.length;
                for(var i = index;i<index + len;i++){
                    this.photos[i] = photos[i-index];
                }

                if(this.indexChangeLock){
                    this.indexChangeLock = false;
                    this.changeIndex(this.index);
                }
            }
        },

        destroy: function(){
            if(this.el){
                var self = this;
                this.unbind();
                this.el.animate({
                    'opacity':0
                },300,'linear',function(){
                    if(self.el){
                        self.el.html('').remove();
                        self.el = null;
                    }
                });
                this.config.onClose && this.config.onClose(this.img, this.photos, this.index);
            }
        },

        close: function(){
            this.destroy();
        }
    };

    return ImageView;
  })();