/*! 1 2014-11-25 */
var _config = {
    color: {
        allTime: 60,
        addTime: 0,// 下一轮加的时间
        lvMap: [2, 3, 4, 5, 5, 6, 6, 7, 7, 7, 8, 8, 8, 8, 8, 8, 9]
    },
    pic: {
        isOpen: !1,
        allTime: 5,
        addTime: 0,
        lvMap: [2, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 8]
    }
}; 
// game
!function() {
    var a = $box = $("#box"),
        b  = Elements = {
            lv: $("#room .lv em"),
            time: $("#room .time"),
            start: $("#dialog .btn-restart"),
            back: $("#dialog .btn-back"),
            share: $("#dialog .btn-share"),
            pause: $("#room .btn-pause"),
            resume: $("#dialog .btn-resume"),
            dialog: $("#dialog"),
            d_content: $("#dialog .content"),
            d_pause: $("#dialog .pause"),
            d_gameover: $("#dialog .gameover")
        },
        c = Game = {
            // type('color'), gameRoom, app
            init: function(type, gameRoom, app) {
                this.type = type;
                this.api = API[type];
                this.config = _config[type];
                this.reset();
                this.parent = app;
                this.el = gameRoom;
                this.renderUI();
                this.inited || this.initEvent();
                this.inited = !0;
                this.start();
            },
            // 初始化照片容器
            renderUI: function() {
                // 是否是横屏 0表示竖屏，正负90表示横屏（向左与向右）模式
                var orientation = 90 == window.orientation || -90 == window.orientation,

                size = orientation ? window.innerHeight: window.innerWidth;
                size -= 20;
                size = Math.min(size, 500);
                // 设定照片map的正方形容器宽和高  最大500px
                $box.width(size).height(size);
                this.el.show();
            },
            // 
            initEvent: function() {
                var e = "ontouchstart" in document.documentElement ? "touchend": "click",
                    self = this;

                $(window).resize(function() {
                    Game.renderUI();
                });
                $box.on(e, "span",
                function() {
                    var type = $(this).data("type");

                    // a 表示正确的图片 若正确则到下一级
                    "a" == type && self.nextLv.call(self);
                });
                Elements.pause.on(e, _.bind(this.pause, this));
                Elements.resume.on(e, _.bind(this.resume, this));
                Elements.start.on(e, _.bind(this.start, this));
                Elements.back.on(e, _.bind(this.back, this));
                Elements.share.on(e, _.bind(this.share, this));
            },
            // 游戏开始
            start: function() {
                Elements.time.text(this.time);
                // 最后5s
                this.time > 5 && Elements.time.removeClass("danger");
                Elements.dialog.hide();
                this._pause = !1;
                // lv默认0
                this.lv = "undefined" != typeof this.lv ? this.lv + 1 : 0;
                this.lvMap = this.config.lvMap[this.lv] || _.last(this.config.lvMap);
                this.renderMap();
                this.renderInfo();
                // 定时器
                this.timer || (this.timer = setInterval(_.bind(this.tick, this), 1000));
            },
            share: function() {},
            resume: function() {
                Elements.dialog.hide(),
                this._pause = !1
            },
            pause: function() {
                this._pause = !0,
                Elements.d_content.hide(),
                Elements.d_pause.show(),
                Elements.dialog.show();
            },
            tick: function() {
                return this._pause ? void 0 : (this.time--, this.time < 6 && b.time.addClass("danger"), this.time < 0 ? void this.gameOver() : void Elements.time.text(parseInt(this.time)));
            },
            // 渲染map
            renderMap: function() {
                if (!this._pause) {
                    var size = this.lvMap * this.lvMap,
                        buffer = "",
                        lv = "lv" + this.lvMap;
                    //console.log(lv)
                    _(size).times(function() {
                        buffer += "<span></span>"
                    });
                    $box.attr("class", lv).html(buffer);
                    // this is importart
                    // todo arguments 2,
                    this.api.render(this.lvMap, this.lv);
                }
            },
            renderInfo: function() {
                Elements.lv.text(this.lv);
            },
            gameOver: function() {
                try {
                    WeixinJSBridge.call("showOptionMenu");
                } catch(c) {

                }
                var who = GameData.who || {}, where = GameData.where;
                var d = this.api.getGameOverText(this.lv - 1);
                this.lastLv = this.lv,
                this.lastGameTxt = d.txt,
                this.lastGamePercent = d.percent;

                // var shareTitle = this.lastLv > 0 ? "我闯过" + (this.lastLv + 1) + "关，击败" + this.lastGamePercent + "%的人！我是【" + this.lastGameTxt + "】！不服来战！" : "看你有多色？";
                var shareTitle = "我在1分钟内" + (this.lastLv) + "次从"+where.name+"身边找到"+who.name+"！你也来试试！";
                window.shareData.tTitle = shareTitle;
                
                if (this.lastLv > 0) {
                    var scoreMsg = "你一共" + (this.lastLv) + "次从"+where.name+"身边找到"+who.name+"，你的24K氪金眼还没瞎吗？快让你的朋友也来试试吧！";
                    window.shareData.tTitle = "我在1分钟内" + (this.lastLv) + "次从"+where.name+"身边找到"+who.name+"";
                    //wxShare.playScoreMsg(scoreMsg);
                }

                Elements.d_content.hide(),
                Elements.d_gameover.show().find("h3").html(this.lastGameTxt),
                $box.find("span").fadeOut(1000,
                function() {
                    Elements.dialog.fadeIn();
                });
                this._pause = true;
                this.reset();
            },
            reset: function() {
                this.time = this.config.allTime;
                this.lv = -1;
                //clearInterval(this.timer);
                //this.timer = null;
                //Elements.time.text(this.time);
            },
            nextLv: function() {
                this.time += this.config.addTime;
                Elements.time.text(parseInt(this.time));
                this._pause || this.start();
            },
            back: function() {
                this._pause = !0;
                this.el.hide();
                Elements.dialog.hide();
                this.parent.render();
            }
        };
    window.Game = c;
} (),

// init APP
function(win) {
    var b = {
        index: $("#index"),
        room: $("#room"),
        loading: $("#loading"),
        dialog: $("#dialog"),
        play: $(".play-btn")
    },
    c = {
        init: function() {
            this.initEvent(),
            this.loading()
        },
        loading: function() {
            function a() {
                f++,
                f == e && c.render()
            }
            function b() {}
            if (_config.pic.isOpen) for (var d = ["assets/img/1.png", "assets/img/2.png", "assets/img/3.png", "assets/img/4.png", "assets/img/5.png", "assets/img/6.png", "assets/img/7.png", "assets/img/8.png", "assets/img/9.png", "assets/img/10.png", "assets/img/11.png", "assets/img/12.png", "assets/img/13.png", "assets/img/14.png", "assets/img/15.png", "assets/img/16.png", "assets/img/17.png", "assets/img/18.png"], e = d.length, f = 0, g = 0; e > g; g++) {
                var h = new Image;
                h.onload = a,
                h.src = d[g]
            } else c.render();
        },
        // 显示游戏界面
        render: function() {
            b.loading.hide(),
            b.index.show()
        },
        // 初始化游戏
        // 绑定开始游戏按钮
        initEvent: function() {
            var e = "ontouchstart" in document.documentElement ? "touchstart": "click",
                self = this;
            b.play.on(e,
            function() {
                var type = $(this).data("type") || "color";
                b.index.hide();
                Game.init(type, b.room, self);
            })
        }
    };
    c.init();
    win.API = {};
} (window),


function() {
    var a = $box = $("#box"),
    b = "span",
    c = $("#help p"),
    d = $("#help_color"),
    e = {

        // lvMap, lv (2,0)
        render: function(lvMap, lv) {
            
            var size = _config.color.lvMap[lv] || _.last(_config.color.lvMap);
            this.lv = lv;
            this.d = 15 * Math.max(9 - size, 1);
            this.d = lv > 20 ? 10 : this.d;
            this.d = lv > 40 ? 8 : this.d;
            this.d = lv > 50 ? 5 : this.d;
            // 设置正确图像的位置
            var h = Math.floor(Math.random() * lvMap * lvMap),
                i = this.getColor(255 - this.d),
                j = this.getLvColor(i[0]);

            $box.find('span').css("background-color", i[1]).data("type", "b").css({
                "background": "url(" + GameData.where.avatar + ")" + j[1],
                "background-size": "cover"
            });
            // 正确的照片
            $box.find('span').eq(h).css("background-color", j[1]).data("type", "a").css({
                "background": "url(" + GameData.who.avatar + ")" + j[1],
                "background-size": "cover"
            });
        },
        getColor: function(a) {
            var b = [Math.round(Math.random() * a), Math.round(Math.random() * a), Math.round(Math.random() * a)],
                c = "rgb(" + b.join(",") + ")";
            return [b, c]
        },
        getLvColor: function(a) {
            var b = this.d,
                c = _.map(a,
                function(a) {
                    return a + b + 10
                }),
                d = "rgb(" + c.join(",") + ")";

            return [c, d]
        },
        getGameOverText: function(lv) {
            // 根据游戏结果计算等级
            var b = 10 > lv ? 0 : Math.ceil((lv - 10) / 3),
                c = GameData.lvT[b] || _.last(GameData.lvT),
                txt = c + "<br/>lv" + (lv + 1),
                e = 2 * lv;

            e = e > 60 ? 60 + .1 * lv: e;
            e = Math.min(e, 100);
            return { txt: txt, percent: e };
        }
    };
    // 
    API.color = e;
} ();
/*  |xGv00|c906e36531043bfb4bc45b5d7d87ac52 */
