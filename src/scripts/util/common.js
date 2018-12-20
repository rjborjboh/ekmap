/**
 * define common functions for all modules.
 **/
/* define logger start. */
const $ = require('jquery');
const moment = require('ek-libraries/moment/moment.js');
// const moment = require('moment');
const events = require('events');

var ekMap = {};

var noop = function() {};
window.console = window.console || {};
window.console.log = window.console.log || noop;
window.console.warn = window.console.warn || noop;
window.console.info = window.console.info || noop;
window.console.error = window.console.error || noop;
/* define logger end. */

var storage = ekMap.config && ekMap.config.storage || localStorage;

//浏览器窗口resize事件用
var winResizeEventsStack = [],
    winResizeEventKeys = {};

//各个机能画面保存临时数据用
var hashSaveData = {};

/*各个机能画面保存临时额外处理用
 * 例如: [h5检索]机能页面的[编辑]处理,可以预先将【保存的页面取得并显示处理】添加到这个对象,</br>
 *     然后跳转到[h5制作]机能页面,然后将之前检索页面保存的额外处理取出并执行,</br>
 *     最后将这个额外处理清除,以免影响其他的处理。</br>
 *     *****注意--【保存的页面取得并显示处理】这个处理函数应该位于[h5制作]机能模块。
 * */
var hashAdditionalExeFuncs = {};

// 强制多个[modal]连续弹出时的顺序化对应
var layerMsgStack = {
    executing: false,
    stack: [] // 存储多个参数列表
};

// 正则表达式定义
var regexps = {
    // 文件路径禁止的符号(比文件名禁止的符号少[/])
    pathForbidChar: /[\\:\*\?"<>\|]/gm,
    // url域名部分
    domain: /((http|https):\/\/)[a-zA-Z\.0-9]*:?\d*(\/[a-zA-Z\.0-9]*)/igm,
    // html
    html: /\!DOCTYPE\s*html/igm,
    // 正常url
    uri: /([a-zA-Z]+:\/\/)[a-zA-Z\.0-9]*:?\d*(\/[a-zA-Z\.0-9]*)/ig,
    //yyyy/mm/dd|yyyy-mm-dd|yyyy mm dd 日期格式
    date: /[\d]{4}[-\/\s]\d{1,2}[-\/\s]\d{1,2}/,
    // 图片文件
    imageFile: /[\.jpg|\.png|\.gif|\.jpeg]$/,
    //IP地址
    ip: /(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9]{1,2})(\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9]{1,2})){3}/ig,
    //端口号
    port: /^([0-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-5]{2}[0-3][0-5])$/,
    //linux路径
    path: /(\/([0-9a-zA-Z]+))+/ig
};

//expose to external context.
var commons = {
    //////////////////////////////////加密/解密location[hash] start
    /**
     * @description
     *     取得加密/解密字符串的位置与次数。
     * @param number [string] 即刻的时间(毫秒数)
     * @param times [number] 加密/解密字符串的次数
     * @return [string] 加密/解密字符串的位置与次数相关(number型)字符串
     * */
    randomTimes: function(number, times) {
        var randomTimes = number.substr(0 - times);
        while (randomTimes.length < times) {
            randomTimes += number.substr(randomTimes.length - times);
        }
        return randomTimes;
    },
    /**
     * @description
     *     将字符串打乱排序。
     * @param original [string] 原始字符串值
     * @param time [string] 加密时间戳
     * @return [string] 加密后字符串值
     * */
    encodeString: function(original, time) {
        if (!original || typeof(original) != 'string') return original;
        if (isNaN(time)) time = new Date().getTime().toString();
        var twoPos, posPids = commons.randomTimes(time, 10);
        original = original.replace(/./g, function(c) {
            return String.fromCharCode(c.charCodeAt(0) + 2);
        });
        while (posPids.length > 0) {
            twoPos = posPids.substr(0, 2);
            posPids = posPids.substr(2);
            original = $.swapPos(original, twoPos[0], twoPos[1]);
        }
        return 't=' + time + '&pid=' + encodeURIComponent(original);
    },
    /**
     * @description
     *     将打乱排序的字符串还原。
     * @param encoded [string] 加密后字符串值
     * @param time [string] 加密时间戳
     * @return [string] 解密后字符串值
     * */
    decodeString: function(encoded, time) {
        if (isNaN(time)) return encoded;
        if (!encoded || typeof(encoded) != 'string') return encoded;
        var twoPos, posPids = commons.randomTimes(time, 10);
        encoded = decodeURIComponent(encoded);
        while (posPids.length > 0) {
            twoPos = posPids.substr(-2);
            posPids = posPids.substr(0, posPids.length - 2);
            encoded = $.swapPos(encoded, twoPos[0], twoPos[1]);
        }
        encoded = encoded.replace(/./g, function(c) {
            return String.fromCharCode(c.charCodeAt(0) - 2);
        });
        return encoded;
    },
    //////////////////////////////////加密/解密location[hash] end
    /* @description
     *  - get info by key word.
     * @param
     *  - [key1, key2, key3。。。] String of file which format [ekMap.x.x.x...]
     * @return
     *  - something configure info.
     * */
    getCmatcConfigBy: function() {
        var params = arguments,
            target = undefined,
            ekMap = window.top.ekMap && window.top.ekMap;
        if (params.length === 1 && commons.isArray(params[0])) {
            params = params[0];
        }
        if (!ekMap) return target;
        target = $.extend(true, {}, ekMap);
        for (var i = 0, loop = params.length; i < loop; i++) {
            if (target && target.hasOwnProperty(params[i])) {
                target = target[params[i]];
                continue;
            }
            break;
        }
        return target;
    },
    /**
     * @description
     *     取得正则表达式对象(从上记[regexps]对象中)
     * */
    regexp: function(key) {
        if (!key || !regexps.hasOwnProperty(key)) return '';
        return regexps[key];
    },
    /**
     * @description
     *     check指定的值是否为无意义(空值/undefined/null)
     * */
    isInvalidValue: function(v) {
        return (v === null || (isNaN(v) && !v) || v === '');
    },
    /**
     * @description
     *     check指定的值是否为有效日期
     * */
    isDate: function(dateStr) {
        if (!dateStr || !commons.regexp('date').test(dateStr)) return false;
        return moment(dateStr).isValid();
    },
    /**
     * @description
     *     取得指定格式的时间戳字符串。
     * */
    timeStamp: function(time, formatStr) {
        time = time || new Date();
        formatStr = formatStr || 'YYYY/MM/DD HH:mm:ss';
        return moment(time).format(formatStr);
    },
    /**
     * @description
     *     根据消息code取得消息实体内容
     * @param code [string] 指定消息的key字符串
     * @param dftCode [string] 备用/默认消息的key字符串
     * @param hash string  指定消息所属的hash页面
     * */
    renderMsg: function(code, dftCode, hash) {
        return window.top.ekMap.renderMsg(code, dftCode, hash);
    },
    /* @description
     *  - reverse Camel-Case string.
     *    逆转换字符串为驼峰类型,主要用于dataTable的sort排序传值。
     * @param wordWord [string]
     * */
    reverseCamelCase: function(wordWord) {
        // change to came type.
        wordWord = wordWord.replace(/[A-Z]/gm, function(ch) {
            return ('_' + ch);
        });

        return commons.upperCase(wordWord);
    },
    /**
     * @description
     *     将字符串变为小写字符串
     * */
    lowerCase: function(word) {
        return word.replace(/[A-Z]/gm, function(ch) {
            return String.fromCharCode(ch.charCodeAt(0) + 32);
        });
    },
    /**
     * @description
     *     将字符串变为大写字符串.
     * */
    upperCase: function(word) {
        return word.replace(/[a-z]/gm, function(ch) {
            return String.fromCharCode(ch.charCodeAt(0) - 32);
        });
    },
    /**
     * @description
     *     简单压缩HTML字符串处理,优化浏览器页面加载显示效率
     *     用于压缩从服务端download到本地浏览器内存中的HTML
     * */
    compressorHTML: function(html) {
        if (!html || typeof(html) != 'string') return '';

        // 替换制表符换行为空格
        html = html.replace(/[\r\t\n]/g, ' ');
        // 去掉多余的空格
        html = html.replace(/\s{2,}/g, ' ');
        //去掉注释
        html = html.replace(/<\!--[^!]*-->/g, '');
        return html;
    },
    /**
     * @description
     *     index.html页面加载<div data-page>用。
     * */
    loadHtmlFragments: function(readyGo, fragmentDoms, attr) {
        var count = fragmentDoms && fragmentDoms.length;
        if (isNaN(count) || count === 0) return false;
        fragmentDoms.each(function(index, dom) {
            dom = $(dom);
            var node, pageUrl = dom.attr(attr);
            if (!pageUrl) return;
            node = document.createElement('div');
            $(node).load(pageUrl, undefined, function(data) {
                count--;
                data = commons.compressorHTML(data);
                dom.replaceWith(data);
                /*画面所有指定DOM节点加载完成之后,需要立即执行的一些操作*/
                if (count === 0) {
                    if (typeof(readyGo) === "function") {
                        readyGo();
                    } else if (commons.isArray(readyGo)) {
                        $.each(readyGo, function(index, aGo) {
                            if (typeof(aGo) === "function") aGo();
                        });
                    }
                }
            });
            dom.removeAttr(attr);
        });
    },
    /* @description
     *  - 取得上传资源的一些信息(文件名/播放时长(分)/文件大小(KB)等).
     * @param
     *  -e [window Event]: 文件选择成功事件对象.
     * @param
     *  -file [object]: 文件对象.
     * @param
     *  -callback [function]: 文件选择成功并取得所有信息后的回调函数.
     *                        并传入取得的所有信息对象
     * */
    uploadFileInfo: function(e, file, callback) {
        var path = e.srcElement && e.srcElement.value || e.target && e.target.value || '';
        var info = {},
            waiter = 0;
        if (!path) return false;
        info.fileName = path.substr(path.lastIndexOf('\\') + 1);

        // 读取文件的大小
        var url = commons.createObjectURL(file);
        if (window.FileReader) {
            waiter++;
            var oFReader = new FileReader();
            oFReader.readAsDataURL(file);
            oFReader.onload = function(oFREvent) {
                info.size = (file.size / 1024).toFixed(3);
                console.log("该文件大小为: " + info.size + "KB.");
                waiter--;
            };
        }
        // 读取音视频文件的播放时长
        if (url && (/^audio/i.test(file.type))) {
            waiter++;
            var eAudio = $('<audio controls=""></audio>')[0];

            function getTime() {
                setTimeout(function audioTime() {
                    var duration = eAudio.duration;
                    if (isNaN(duration)) {
                        audioTime();
                    } else {
                        info.duration = (duration / 60).toFixed(3);
                        console.log("该文件播放时长为: " + info.duration + "分.");
                        waiter--;
                    }
                }, 200);
            }
            eAudio.src = url;
            eAudio.play();
            getTime();
        }
        var returnFunc = function() {
            if (commons.isFunction(callback)) {
                callback(info);
            } else {
                return info;
            }
        };
        if (waiter === 0) {
            return returnFunc();
        } else { // 等待信息取得完全后再执行回调函数
            setTimeout(function continue2go() {
                if (waiter > 0) {
                    continue2go();
                } else {
                    return returnFunc();
                }
            }, 220);
        }
    },
    //////////////////////////////////window resize events start
    /* @description
     *  - add window resize event.
     * @param
     *  -[resize2exec]: Function process to be executed when window resized.
     * @param
     *  -[resize_key]: String process labeled key.
     * */
    addWindowResizeEvent: function(resize2exec, resize_key) {
        if (!$.isFunction(resize2exec)) return false;
        winResizeEventsStack.push(resize2exec);
        if (resize_key && typeof(resize_key) == 'string') {
            winResizeEventKeys[resize_key] = resize2exec;
        }
    },
    /* @description
     *  - trigger window resize event.
     * @param
     *  -[resize_key]: String  key labeled for function.
     *  @param
     *  -[page_selector]: page module htmlFragment id.
     * */
    triggerWindowResizeBy: function(resize_key, page_selector) {
        if (resize_key && $.isFunction(winResizeEventKeys[resize_key])) {
            winResizeEventKeys[resize_key](page_selector);
        }
    },
    /* @description
     *  - window resize event handler.
     * */
    runWindowResizeHandler: function() {
        winResizeEventsStack = [];
        $(window).resize(function() {
            var i = 0,
                execEvent = undefined;
            for (; execEvent = winResizeEventsStack[i]; i++) {
                if ($.isFunction(execEvent)) execEvent();
            }
        });
    },
    //////////////////////////////////window resize events end
    /**
     * @description
     *     删除数组中的特定对象(对象必须在该数组中)
     * */
    splice: function(arrObj, target) {
        if (!$.isArray(arrObj)) return false;
        var index = arrObj.indexOf(target);
        Array.prototype.splice.call(arrObj, index, 1);
    },
    /* 
     * @description: parse value to [integer] type.
     * */
    int: function(value, defVlaue) {
        if (isNaN(parseInt(value, 10)) || (value === '')) {
            if (!isNaN(defVlaue)) return defVlaue;
            return commons.int(defVlaue, 0);
        }
        return parseInt(value, 10);
    },
    /* 
     * @description: parse value to [float] type.
     * */
    float: function(value, defVlaue) {
        if (isNaN(parseFloat(value, 10)) || (value === '')) {
            if (!isNaN(defVlaue)) return defVlaue;
            return commons.float(defVlaue, 0);
        }
        return parseFloat(value, 10);
    },
    /* 
     * @description: check whether [obj] is String or not..
     * */
    isString: function(obj) {
        return {}.toString.call(obj) === "[object String]";
    },
    /* 
     * @description: check whether [obj] is Array or not..
     * */
    isArray: function(obj) {
        return {}.toString.call(obj) === "[object Array]";
    },
    /* 
     * @description: check whether [obj] is Function or not..
     * */
    isFunction: function(obj) {
        return {}.toString.call(obj) === "[object Function]";
    },
    /* *
     *  @description
     *   resort array list.
     *  @param
     *   -[list]: Array sort target.
     *   -[sortKey]: String sort key.
     *   -[direction]: Boolean sort order.([default]true:DESC, false:ASC)
     *   -[isNumber]: sort value by [number/int] or not.
     * */
    sort: function(list, direction, sortKey, isNumber) {
        if (!list || !commons.isArray(list)) return list;
        direction = !!direction;
        var _getValue = function(v) {
            if (!sortKey || typeof(sortKey) !== 'string') {
                return commons.int(v, 0);
            } else {
                if ($.isEmptyObject(v)) return 0;
                if (isNumber) return commons.int(v[sortKey], 0);
                return v[sortKey];
            }
        };
        list.sort(function(a, b) {
            var x = _getValue(a),
                y = _getValue(b);
            // [x][y] must be String or number.
            if (direction) { // DESC
                return ((x > y) ? -1 : ((x < y) ? 1 : 0));
            } else { // ASC
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            }
        });
    },
    /* *
     *  @description
     *   将数组中符合的项取出组合为一个新的数组,原先的数组不变.
     *  @param
     *   -[arr]: [array] Array .
     *   -[filter]: [function] filter function
     *   -[childKey]: [string] sub filter key
     * */
    filterArray: function(arr, filter, childKey) {
        var filteredArr = [],
            loopObj = undefined;
        for (var i = 0; i < arr.length; i++) {
            loopObj = arr[i];
            if (filter(loopObj)) filteredArr.push(loopObj);
            if (commons.isArray(childKey && loopObj[childKey])) {
                filteredArr = filteredArr.concat(commons.filterArray(loopObj[childKey], filter));
            }
        }
        return filteredArr;
    },
    /* *
     *  @description
     *   将对象中符合的项取出组合为一个新的对象,原先的对象不变.
     *  @param
     *   -[target]: [object] target for filtering.
     *   -[keys]: [array] keys Array.
     * */
    filterObject: function(target, keys) {
        var clone = {};
        if (!commons.isArray(keys)) return clone;
        Object.keys(target).forEach(function(key, index) {
            if (keys.indexOf(key) > -1) {
                clone[key] = target[key];
            }
        });
        return clone;
    },
    /* 
     * @description: show dialog to user.
     * @param settings object     [可省略]
     *         {keyboard: boolean, show:boolean, remote:boolean | path}
     * @param events object | []  [可省略]
     *         方式一有额外回调处理
     *              {hide: function,hidden:function,show:function,
     *               shown:function,cancel: function, confirm:function}
     *         方式二 没有额外回调处理
     *             ['cancel', 'confirm'] 取消/确定 按钮显示
     *             ['cancel'] 取消 按钮显示
     *             ['confirm'] 确定 按钮显示
     * @param msgs object         [不可省略]
     *        {   不指定位置                  指定位置
     *          title:xx,   // or title:{msg:xx, pos: left|center|right}
     *          body:xx,    // or body:{msg:xx, pos: left|center|right}
     *          cancel:xx,  // or cancel:{msg:xx, pos: left|center|right}
     *          confirm:xx  // or confirm:{msg:xx, pos: left|center|right}
     *        }
     * @param hash string  指定消息所属的hash页面
     * */
    createLayerMsg: function(settings, events, msgs, hash) {
        var arg_length = arguments.length;
        if (arg_length === 0) return false;
        var arg0 = arguments[0],
            arg1 = arguments[1];
        if (!arg0) return false;
        if (arg_length === 1) { // 默认显示消息实体
            settings = {};
            events = {};
            msgs = $.extend(true, {}, arguments[0]) || {};
        }
        if (arg_length === 2) { // 默认arguments[1]显示消息实体
            arg1 = arg1 || {};
            if (commons.isArray(arg0) ||
                arg0.hasOwnProperty('hide') ||
                arg0.hasOwnProperty('hidden') ||
                arg0.hasOwnProperty('show') ||
                arg0.hasOwnProperty('shown') ||
                arg0.hasOwnProperty('cancel') ||
                arg0.hasOwnProperty('confirm')) {
                settings = {};
                events = arg0;
            } else {
                settings = arg0 && $.extend(true, {}, arg0);
                events = {};
            }
            msgs = $.extend(true, {}, arg1);
        }
        var _settings = {
            backdrop: false, // boolean - 背景阴影层
            keyboard: false, // boolean - keyboard events.
            show: true, // boolean
            remote: false // boolean | path
        };
        // 消息弹窗及阴影层
        var $layerMsg = $('#layerMsg'),
            $backDrop = $('#fixedBox');
        // [title]
        var area_title = $layerMsg.find('.modal-header .modal-title');
        // [body]
        var area_body = $layerMsg.find('.modal-body');
        // [cancel]
        var btn_cancel = $layerMsg.find('.modal-footer .btn.cancel');
        // [confirm]
        var btn_confirm = $layerMsg.find('.modal-footer .btn.confirm');
        var _getMsgInfo = function(panel, def_key) {
            var innerMsg = panel && panel.msg || panel,
                msg = commons.renderMsg(innerMsg, def_key, hash);
            if (!msg && typeof(innerMsg) == 'string') msg = innerMsg;
            return {
                'msg': msg,
                pos: panel && panel.pos
            };
        };
        // 控制多个连续弹窗情况的顺序问题
        if (layerMsgStack.executing) {
            var bak = [];
            bak.push(settings);
            bak.push(events);
            bak.push(msgs);
            layerMsgStack.stack.push(bak);
            return false;
        }
        // 标记当前[modal]的执行中状态
        layerMsgStack.executing = true;

        /* set modal settings. */
        // 先显示北京阴影层
        $backDrop.show(0);
        // 将自身的[$backdrop-背景阴影]的点击事件取消
        $backDrop.off('click');
        /* add events listeners */
        //        $layerMsg.click(function(){$(this).modal('hide')});

        $.extend(_settings, settings);
        // 默认初期不显示,等页面加载完全后再显示
        _settings.show = false;
        $layerMsg.modal(_settings);

        // modal显示进行中时点(未完全显示页面)
        $layerMsg.on('show.bs.modal', function(e) {
            if ($.isFunction(events.show)) {
                events.show();
            }
        });
        $layerMsg.on('shown.bs.modal', function() {
            if ($.isFunction(events.shown)) { // modal显示结束时点(已经完全显示页面)
                events.shown();
            }
        });
        $layerMsg.on('hide.bs.modal', function() {
            if ($.isFunction(events.hide)) { // modal隐藏进行中时点(未完全隐藏页面)
                events.hide();
            }
        });
        // modal隐藏结束时点(已经完全隐藏页面)
        $layerMsg.on('hidden.bs.modal', function(e) {
            // 隐藏阴影层
            $backDrop.hide(0);
            // 还原页面初始设置,以防影响下次显示页面
            $layerMsg.find(
                    '.modal-header .modal-title,.modal-body,.modal-footer')
                .removeClass('text-center');
            $layerMsg.find(
                    '.modal-footer .btn.cancel,.modal-footer .btn.confirm')
                .addClass('hidden');
            if ($.isFunction(events.hidden)) {
                // 执行自定义的事件
                events.hidden();
            }
            /* 只有当前的[modal]完全隐藏后才会执行下一个[modal] */
            layerMsgStack.executing = false;
            setTimeout(function() {
                if (layerMsgStack.stack.length > 0) {
                    commons.createLayerMsg.apply(window, layerMsgStack.stack.shift());
                }
            }, 0);
            btn_cancel.off('click', events.cancel);
            btn_confirm.off('click', events.confirm);
        });
        /* 自定义按钮事件 */
        if (commons.isArray(events)) {
            if (events.indexOf('cancel') > -1) { // cancel
                btn_cancel.removeClass('hidden');
            }
            if (events.indexOf('confirm') > -1) { // confirm
                btn_confirm.removeClass('hidden');
            }
        } else {
            if (events.hasOwnProperty('cancel')) { // cancel
                btn_cancel.removeClass('hidden');
                if ($.isFunction(events.cancel)) {
                    btn_cancel.one('click', events.cancel);
                }
            }
            if (events.hasOwnProperty('confirm')) { // confirm
                btn_confirm.removeClass('hidden');
                if ($.isFunction(events.confirm)) {
                    btn_confirm.one('click', function() {
                        var value = undefined;
                        if (msgs.hasOwnProperty('input')) {
                            value = area_body.find('input').val();
                        }
                        events.confirm(value);
                    });
                }
            }
        }
        /* 填充该页面内容信息以及设定页面layout(默认:title-left body-left buttons-right) */
        // [title] 内容文字
        var layer = _getMsgInfo('title.' + msgs.title, 'model.title');
        area_title.html(layer.msg);
        if (layer.pos) area_title.addClass('text-' + layer.pos);
        // [body] 内容文字
        layer = _getMsgInfo(msgs.body, undefined);
        area_body.html(layer.msg);
        if (layer.pos) area_body.addClass('text-' + layer.pos);
        // [input] 表明需要返回入力值
        if (msgs.hasOwnProperty('input')) {
            var input_tag = '<input type="text" class="form-control width-160-px" value="">';
            area_body.html('<p>' + layer.msg + '</p>');
            layer = _getMsgInfo(msgs.input, undefined);
            if (layer.msg) input_tag = '<span class="input-group-addon">' + layer.msg + '</span>' + input_tag;
            area_body.append($('<div class="input-group">' + input_tag + '</div>'));
        }

        // [footer] 内容文字
        layer = _getMsgInfo('footer.' + msgs.cancel, 'model.cancel');
        btn_cancel.html(layer.msg);
        if (layer.pos) btn_cancel.addClass('text-' + layer.pos);
        layer = _getMsgInfo('footer.' + msgs.confirm, 'model.confirm');
        btn_confirm.html(layer.msg);
        if (layer.pos) btn_confirm.addClass('text-' + layer.pos);

        /* 页面显示动作 */
        $layerMsg.modal('show');
    },
    /**
     * @description
     *     用于处理将机能页面显示与于Modal控件的控制
     * @param events object [可省略]
     *              {hide: function,hidden:function,show:function,
     *               shown:function,cancel: function, confirm:function}
     * @param settings [object] 各种设定
     * */
    showHashPageModal: function(events, settings) {
        var $hashModalPage = $('#hashModalPage');
        var title = $hashModalPage.find('.modal-header .modal-title'),
            model_body = $hashModalPage.find('.modal-body'),
            btn_cancel = $hashModalPage.find('.modal-footer .btn.cancel'),
            btn_confirm = $hashModalPage.find('.modal-footer .btn.confirm');
        events = events || {};
        settings = settings || {};
        // 设置信息设定
        if (settings.hasOwnProperty('title')) title.html(settings.title);
        /* 注册监听事件 */
        // modal显示进行中时点(未完全显示页面)
        $hashModalPage.on('show.bs.modal', function(e) {
            if ($.isFunction(events.show)) {
                events.show.call(this);
            }
        });
        if ($.isFunction(events.shown)) { // modal显示结束时点(已经完全显示页面)
            $hashModalPage.on('shown.bs.modal', events.shown);
        }
        // 显示
        $hashModalPage.modal('show');

        if ($.isFunction(events.hide)) { // modal隐藏进行中时点(未完全隐藏页面)
            $hashModalPage.on('hide.bs.modal', events.hide);
        }
        // modal隐藏结束时点(已经完全隐藏页面)
        $hashModalPage.on('hidden.bs.modal', function(e) {
            // 还原页面初始设置,以防影响下次显示页面
            if ($.isFunction(events.hidden)) {
                // 执行自定义的事件
                events.hidden.call(this);
            }
            // 清除掉[#hashModalPage]页面body部的内容,以免页面内容同时出现在HTML中.
            model_body.empty();
        });
        if (events.hasOwnProperty('cancel')) { // cancel
            if ($.isFunction(events.cancel)) {
                btn_cancel.one('click', events.cancel);
            }
        }
        if (events.hasOwnProperty('confirm')) { // confirm
            if ($.isFunction(events.confirm)) {
                btn_confirm.one('click', events.confirm);
            }
        }
    },
    /* 
     * @description: show confirm message to user.
     * 		use this function must import [Jquery-UI] in your html page.
     * */
    /*showLayer : function(ui_dialog, pKey, option, callback){
    	if (!ui_dialog) return false;
    	var msg = commons.renderMsg(pKey);
    	if (typeof(ui_dialog.dialog) === 'function') { // jquery-ui feather(dialog) added.
    		ui_dialog.attr("title", option.title || '');
    		ui_dialog.dialog($.extend(true,{
    			draggable : true,
    			closeOnEscape : true,
    			buttons : {
    				"确认" : function() {
    					if (callback.confirm)
    						callback.confirm();
    					$(this).dialog("close");
    				},
    				"取消" : function() {
    					if (callback.cancel)
    						callback.cancel();
    					$(this).dialog("close");
    				}
    			},
    			classes : {
    				"ui-dialog" : "highlight",
    				"ui-dialog-titlebar" : "ui-corner-all"
    			},
    			modal : true,
    			width : 500,
    			height: 300
    		}, option));
    	}
    },*/
    //////////////////////////////////image preview events start
    /**
     * @description
     *     上传图片时,预览该图片。
     * @param
     *     fileControl object - file控件封装的上传对象实体。
     *     $viewImg    object - 预览图片的html标签(string|jquery object)
     *     clickImg undefined - 图片只预览,没有别的(点击等)事件
     *              boolean - false:图片只预览,没有别的(点击等)事件, true:追加磨默认的点击事件
     *              function - 自定义点击上传预览图片时的事件
     * */
    previewImg: function(fileControl, $viewImg, clickImg) {
        var bindClick = false;
        if (clickImg) bindClick = true;
        if (bindClick) {
            clickImg = $.isFunction(clickImg) ? clickImg : commons.exchangeImgSize;
        }
        if (!fileControl) return false;
        if ($viewImg && !$viewImg.jquery) $viewImg = $($viewImg);
        // 初始化图片预览区域
        $viewImg.empty();
        var img = document.createElement('img');
        // 预览图片添加预定义的CSS类[preImage]
        $(img).attr('class', 'preImage');

        if (window.FileReader &&
            window.File &&
            window.Blob) { // HTML5 FileReader 内置对象
            var file = fileControl[0].files[0];
            var reader = new FileReader();
            if (!/image\/\w+/.test(file.type)) {
                return false;
            }
            // onload是异步操作
            reader.onload = function(e) {
                $(img).attr('src', e.target.result);
                // 图片点击事件
                if (bindClick) $(img).click(clickImg);
                $(img).appendTo($viewImg);
                $viewImg.show();
            }
            reader.readAsDataURL(file);
        } else if (fileControl[0].files) {
            var objUrl = this.getObjectURL(fileControl[0].files[0]);
            $(img).attr('src', objUrl);
            // 图片点击事件
            if (bindClick) $(img).click(clickImg);
            $(img).appendTo($viewImg);
        } else { // 浏览器不支持预览
            // 取得真实上传路径
            //          fileControl.select();
            //          var imageSrc = document.selection.createRange().text;
            var imageSrc = $(fileControl).val();
            document.selection.empty();
            $viewImg.css({
                'filter': 'progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod=scale)',
                'class': 'preImage',
                'margin-left': '10px'
            });
            $viewImg.html("当前浏览器不支持预览");
            // 图片点击事件
            if (bindClick) $viewImg.click(clickImg);
        }
    },
    /**
     * @description
     *     上传图片时,预览该图片(图片居中)。
     * @param
     *     e event - 点击预览图片时传来的点击事件对象。
     * */
    exchangeImgSize: function(e) {
        var target = e.target,
            cssStatus = target.className;
        var heightTo = 200,
            widthTo = 400;
        if (commons.lowerCase(target.tagName) === 'img') {
            if (cssStatus.indexOf('preImage') > -1) {
                target.className = '';
                target.style.position = 'absolute';
                target.style.left = '100px';
                target.style.top = '-460px';
                target.style.width = Math.min(target.naturalWidth, widthTo) + 'px';
                target.style.height = Math.min(target.naturalHeight, heightTo) + 'px';
            } else {
                target.style.cssText = '';
                target.className = 'preImage';
            }
        }
    },
    /**
     * @description
     *     创建<input type=file>上传文件的临时URL
     * @param fileObj[File] 上传文件对象
     * */
    createObjectURL: function(fileObj) {
        var url = null;
        if (window.createObjectURL !== undefined) { // basic
            url = window.createObjectURL(fileObj);
        } else if (window.URL !== undefined) { // mozilla(firefox)
            url = window.URL.createObjectURL(fileObj);
        } else if (window.webkitURL !== undefined) { // webkit or chrome
            url = window.webkitURL.createObjectURL(fileObj);
        }
        return url;
    },
    //////////////////////////////////image preview data events end
    /**
     * @description 
     *     各个机能画面保存临时数据用
     * */
    spaStorage: function(page, key, value) {
        if (!page || !key || typeof(key) !== 'string') return false;
        var data;
        if (arguments.length === 1) {
            data = hashSaveData[page];
        } else if (arguments.length === 2) {
            data = hashSaveData[page] && hashSaveData[page][key];
        } else if (arguments.length === 3) {
            if (!hashSaveData[page]) hashSaveData[page] = {};
            data = hashSaveData[page][key] = value;
        }
        return data;
    },
    /**
     * @description
     *    各个机能画面保存临时额外处理
     * */
    spaAddtionalExes: function(page, func) {
        var funcArr = [];
        if (!page || typeof(page) != 'string') return funcArr;
        if (!hashAdditionalExeFuncs[page]) hashAdditionalExeFuncs[page] = [];
        if (arguments.length === 1) { // 取得临时处理并删除备份
            funcArr = hashAdditionalExeFuncs[page];
            hashAdditionalExeFuncs[page] = [];
        } else if (arguments.length === 2) { // 更新临时处理
            hashAdditionalExeFuncs[page].push(func);
            funcArr = hashAdditionalExeFuncs[page];
        }
        return funcArr;
    },
    //////////////////////////////////html5 storage handle data events start
    /* @description
     *  在[Local/Session]Storage中追加或删除
     * */
    storage: function(key, value) {
        if (commons.isInvalidValue(key)) return undefined;
        if (typeof(value) == 'undefined') {
            try {
                return JSON.parse(storage[key]);
            } catch (err) {
                return storage[key];
            }
        }
        storage.setItem(key, JSON.stringify(value));
    },
    /* @description
     *  取得[Local/Session]Storage中指定对象的指定属性的值
     *  @param kkey [string] Storage中指定对象的key
     *  @param vkeys [string/array] Storage中指定对象的指定key
     * */
    storage2get: function(key, vkeys) {
        var value, vobj = commons.storage(key),
            copyKeys = [];
        if (!vobj) return value;
        if (commons.isString(vkeys)) {
            copyKeys.push(vkeys);
        } else if (commons.isArray(vkeys)) {
            copyKeys = vkeys;
        }
        $.each(copyKeys, function(index, vkey) {
            if (index === 0) {
                value = vobj[vkey];
                return;
            }
            if (!value) return;
            value = value[vkey];
        });
        return value;
    },
    /* @description
     *  更新[Local/Session]Storage中对象
     * */
    upStorage: function(key, info) {
        var target = commons.storage(key);
        if (commons.isInvalidValue(target)) return false;
        if (typeof(target) == 'object' &&
            typeof(info) == 'object') {
            target = $.extend(true, target, info);
            commons.storage(key, target);
            return true;
        }
    },
    /* @description
     *  清除Storage中指定key保存的对象,并返回
     * */
    rmvStorage: function(key) {
        var value = commons.storage(key);
        storage.removeItem(key);
        return value;
    },
    /* @description
     *  清除[Local/Session]Storage中所有保存的对象
     * */
    clearStorage: function() {
        storage.clear();
    },
    //////////////////////////////////html5 storage handle data events end
    //////////////////////////////////change [urlkey] to complete uri start
    interfaceUrl: function(ukey) {
        return commons.storage('server_door') + commons.storage('link_urls')[ukey];
    },
    //////////////////////////////////change [urlkey] to complete uri end
    //////////////////////////////////create date-time-picker start
    /* *
     *  @description
     *   create datetimepicker.
     *  @param
     *   -[$dom]: dom to show datetimepicker.
     *  @param
     *  -[settings]: datetimepicker settings.
     *  @return
     * */
    createDatePicker: function($dom, settings) {
        // if (!$dom) return false;
        // settings = settings || {};
        // if ($dom && !$dom.jquery) $dom = $($dom);
        // var datepicker, settings = settings || {},
        //     lang = settings.lang /* || seajs.data.vars.momentLang*/ ,
        //     dateFormat = settings.dateFormat || 'YYYY/MM/DD';
        // //branches for moment language start//
        // // seajs.on('moment_locale_changed', function() { // 语言配置文件加载完成
        // events.EventEmitter.on('moment_locale_changed', function() { // 语言配置文件加载完成
        //     createDatePicker();
        // });
        // if (lang == moment.locale(lang)) { // 不需要加载语言配置文件,直接使用
        //     createDatePicker();
        // }
        // /* else {
        //             // 改变插件显示语言
        //             moment.locale('de');
        //         }*/
        // //branches for moment language end//
        // function createDatePicker() {
        //     var options = $.extend(true, {}, moment.prototype.tooltip[lang] || {});
        //     var use_lang = moment.locale();
        //     options.locale = lang;
        //     options.format = dateFormat;
        //     if (settings.minDate) options.minDate = moment(settings.minDate).format();
        //     if (settings.maxDate) options.maxDate = moment(settings.maxDate).format();
        //     if (!options.locale) options.locale = use_lang;
        //     if (use_lang != options.locale) { // 语言不同,切换语言
        //         if (datepicker) {
        //             datepicker.data("DateTimePicker").locale(use_lang);
        //         }
        //         // 同步控件显示语言
        //         options.locale = use_lang;
        //     }
        //     /*生成日期时间控件*/
        //     if (!datepicker) {
        //         datepicker = $dom.datetimepicker(options);
        //     }
        // }
    },
    /* *
     *  @description
     *   create two linked datetimepickers.
     *  @param
     *   -[$left]:left dom to show datetimepicker.
     *  @param
     *   -[$right]:right dom to show datetimepicker.
     *  @param
     *   -[settings]: datetimepicker used settings.
     *  @return
     * */
    createLinkedDatePicker: function($left, $right, settings) {
        // if (!$left || !$right) return false;
        // if ($left && !$left.jquery) $left = $($left);
        // if ($right && !$right.jquery) $right = $($right);
        // var datepicker_left, datepicker_right, settings = settings || {};
        // var lang = settings.lang /* || seajs.data.vars.momentLang*/ ,
        //     dateFormat = settings.dateFormat || 'YYYY/MM/DD';
        // //branches for moment language start//
        // // seajs.on('moment_locale_changed', function() { // 语言配置文件加载完成
        // events.EventEmitter.on('moment_locale_changed', function() { // 语言配置文件加载完成
        //     createDatePicker();
        // });
        // if (lang == moment.locale(lang)) { // 不需要加载语言配置文件,直接使用
        //     createDatePicker();
        // }
        // /* else {
        //             // 改变插件显示语言
        //             moment.locale(moment);
        //         }*/
        // //branches for moment language end//
        // function createDatePicker() {
        //     var options = $.extend(true, {}, moment.prototype.tooltip[lang] || {});
        //     var use_lang = moment.locale();
        //     options.locale = lang;
        //     options.format = dateFormat;
        //     if (!options.locale) options.locale = use_lang;
        //     if (use_lang != options.locale) { // 语言不同,切换语言
        //         if (datepicker_left) {
        //             datepicker_left.data("DateTimePicker").locale(use_lang);
        //         }
        //         if (datepicker_right) {
        //             datepicker_right.data("DateTimePicker").locale(use_lang);
        //         }
        //         // 同步控件显示语言
        //         options.locale = use_lang;
        //     }
        //     /*生成日期时间控件*/
        //     if (!datepicker_left) {
        //         datepicker_left = $left.datetimepicker(options);
        //     }
        //     if (!datepicker_right) {
        //         datepicker_right = $right.datetimepicker(options);
        //     }
        //     /* datepicker_left.on('dp.show', function(e){ // 开始时间控件打开时点
        //      });
        //      datepicker_right.on('dp.show', function(e){ // 结束时间控件打开时点
        //      });*/
        //     // 日期区间选择的联动限制(开始时间控件选择时点)
        //     datepicker_left.on('dp.change', function(e) {
        //         // 结束时间不能比开始时间小
        //         datepicker_right.data("DateTimePicker").minDate(e.date);
        //     });
        //     // 日期区间选择的联动限制(结束时间控件选择时点)
        //     datepicker_right.on('dp.change', function(e) {
        //         // 结束时间不能比开始时间小
        //         datepicker_left.data("DateTimePicker").maxDate(e.date);
        //     });
        // }
    },
    //////////////////////////////////create date-time-picker end
    //////////////////////////////////create treeview start
    /** @description 用指定树结构数据(数组)在指定节点创建树视图。
     * @param dataTree ajax请求的success的响应数据(树节点数据数组)
     * @param nodeId 此节点为树形结构的容器Id(请加# 形如#aa) 
     *				我们约定搜索树形结构的节点按钮为 nodeId+"SearchBtn"(形如#aaSearchBtn)
     *				我们约定搜索树形结构的节点关键字为 nodeId+"SearchKey"(形如#aaSearchKey)
     *				不遵循约定 自己处理亦可
     * @param events.click 点击tree节点的响应事件 
     *				该回调函数有一个参数，为点击的节点信息
     *				形如 AA({id:XX,text:XX......})
     * @param events.nodeSelected tree节点的选中时点状态事件
     * @param events.nodeUnselected tree节点的非选中时点状态事件
     * @param events.dblclick tree节点双击事件
     * @param events.rendered 所有tree节点渲染完成时点事件
     * @param events.ready2go 构造完树形节点后需要继续完成的事情
     *				该回调函数有一个参数形如
     *		AA({
     *			klPointTree : $klPointTree,
     *			fourthLevel : 4,
     *			options : {
     *				ignoreCase : true,
     *				exactMatch : false,
     *				revealResults : true
     *			}
     *		})
     *
     */
    createKlPointTree: function(dataTree, nodeId, events) {
        events = events || {};
        dataTree = $.extend(true, [], dataTree);
        if (!commons.isArray(dataTree)) return false;
        var $treeNode = $(nodeId);
        if ($treeNode.length === 0) return false;
        var knowledge = [],
            fourthLevel = 4;
        var knowledgeStock = [{
            text: "知识点库",
            id: "0",
            nodes: []
        }];
        var options = {
            ignoreCase: true,
            exactMatch: false,
            revealResults: true
        };
        $.each(dataTree, function(index, dbNode) {
            var node = {
                id: dbNode.knowledgeId,
                parId: dbNode.parentId,
                text: dbNode.knowledgeName
            };
            if (knowledge.length == 0) {
                knowledge.push(node);
            } else {
                transform(node);
            }
        });

        function transform(searchNode) {
            var parent = undefined,
                childIndex = undefined;

            for (var i = 0; i < knowledge.length; i++) {
                if (knowledge[i].parId == searchNode.id) {
                    childIndex = i;
                    break;
                }
                if (!parent && knowledge[i].id == searchNode.parId) {
                    parent = knowledge[i];
                }
                if (!parent && knowledge[i].nodes) {
                    parent = findParentFromChildren(searchNode, knowledge[i]);
                }
            }
            if (!isNaN(childIndex)) {
                searchNode.nodes = [];
                searchNode.nodes.push($.extend(true, {}, knowledge[i]));
                knowledge[childIndex] = searchNode;
                if (parent) {
                    if (!parent.nodes) parent.nodes = [];
                    parent.nodes.push(searchNode);
                    knowledge.splice(childIndex, 1);
                    return;
                }
            }
            if (parent) {
                if (!parent.nodes) parent.nodes = [];
                parent.nodes.push(searchNode);
            }
            if (!parent && isNaN(childIndex)) {
                knowledge.push(searchNode);
            }
        }

        function findParentFromChildren(node, rangeNode) {
            if (!rangeNode.nodes) return undefined;
            var parent, children = rangeNode.nodes;
            for (var i = 0, leng = children.length; i < leng; i++) {
                if (children[i].id == node.parId) {
                    parent = children[i];
                    break;
                }
                if (children[i].nodes) {
                    parent = findParentFromChildren(node, children[i]);
                    if (parent) break;
                }
            }
            return parent;
        }
        knowledgeStock[0].nodes = knowledge;

        // 初始化知识点Tree
        var $klPointTree = $treeNode.treeview({
            backColor: "",
            color: "#428bca",
            enableLinks: true,
            showBorder: false,
            href: "",
            highlightSelected: true,
            highlightSearchResults: true,
            onhoverColor: "#cff1fe",
            expandIcon: 'glyphicon glyphicon-chevron-right',
            collapseIcon: 'glyphicon glyphicon-chevron-down',
            data: knowledgeStock
        });
        $klPointTree = $klPointTree.treeview(true);
        // 检索知识点
        $(nodeId + "SearchBtn").click(function(e) {
            // 阻止浏览器默认事件(表单提交等)
            e && e.preventDefault();
            $klPointTree.clearSearch();
            var pattern = $(nodeId + "SearchKey").val();
            $klPointTree.search(pattern, options);
        });
        //选中节点
        if ($.isFunction(events.selected)) {
            $treeNode.on('nodeSelected', function(event, data) {
                events.selected(data);
            });
        }

        //取消选中节点
        if ($.isFunction(events.unselected)) {
            $treeNode.on('nodeUnselected', function(event, data) {
                events.unselected(data);
            });
        }
        //节点树rendered事件
        if ($.isFunction(events.rendered)) {
            $treeNode.on('rendered', function(event, data) {
                events.rendered(data, $klPointTree.getSelected()[0]);
            });
        }
        /*$treeNode.on('dblclick', function() {
        	if($.isFunction(clickCallback)){
        		clickCallback(commons.storage("nodeSelectedData"));
        	}
        });*/
        // 构建树节点后继续执行的事情
        if ($.isFunction(events.ready2go)) {
            events.ready2go({
                klPointTree: $klPointTree,
                fourthLevel: 4,
                options: {
                    ignoreCase: true,
                    exactMatch: false,
                    revealResults: true
                }
            });
        }
    },
    //////////////////////////////////create treeview end
    //////////////////////////////////create context-menu start
    /**
     * @description hide mouse right click menus.
     */
    hideContextMenus: function($context_panel) {
        $context_panel = $context_panel || $('#center .contextmenus-panel').eq(0);
        $context_panel.addClass('hidden');
        $context_panel.find('.collapse.in').collapse('hide');
    },
    /**
     * @description show mouse right click menus in multi DOMs.
     * @param - menuInfo: object [{selector:'selector', menus:[]},
     *                            {selector:'selector', menus:[]}...]
     *          menuInfo.selector: HTML DOM CSS（selector）for jquery.
     *          menuInfo.menus: mouse right menus.
     */
    monitorContextkMenusExpand: function(menuInfo) {
        if (!menuInfo || !$.isArray(menuInfo)) return false;
        var $menu_model = $('#center .contextmenus-panel > .contextmenus-model').first();
        for (var index in menuInfo) {
            commons.monitorContextMenus(menuInfo[index].selector,
                menuInfo[index].menus,
                $menu_model.clone(false).removeClass('contextmenus-model'));
        }
    },
    /**
     * @description show mouse right click menus in selected DOM.
     * @param -
     *         selector: HTML DOM CSS（selector）for jquery.
     *         menus: mouse right menus.
     */
    monitorContextMenus: function(selector, menus, $menu_model) {
        if (!selector || !menus || menus.length === 0) return false;
        if (!$menu_model || !$menu_model.jquery) {
            $menu_model = $('#center .contextmenus-panel > .contextmenus-model').first()
                .clone(false).removeClass('contextmenus-model');
        }
        // 追加惨淡DOM节点
        var $contextmenus_panel = $('#center .contextmenus-panel').eq(0);
        $contextmenus_panel.append($menu_model);

        /* 初始化并取得右键菜单区域DOM */
        var contextMark = ('.' + selector.replace(/[#,>:\(\)\s\[\]]/g, '.')).replace(/\.+/g, '.');
        var $mouse_right_menus_ul = $menu_model.children('ul:eq(0)');
        $mouse_right_menus_ul.children().remove();

        var i = 0,
            length = menus.length,
            li = undefined,
            menu = undefined;
        for (; i < length; i++) {
            menu = menus[i];
            if (i % 2 === 1) {
                $mouse_right_menus_ul.append('<li role="separator" class="divider"></li>');
            }
            li = $('<li class="contextmenu list-group-item ' +
                menu.class_name.join(' ') +
                (menu.id ? '" id = "' + menu.id : '') +
                '">' +
                ($.isFunction(menu.context) ? menu.context() : menu.context) +
                '</li>');
            $mouse_right_menus_ul.append(li);
        }
        // 取消鼠标的默认右键事件,自定义右键菜单
        $(document).distinctOnEvent('contextmenu' + contextMark, selector, {
            byDom: $menu_model
        }, function(e) {
            e.preventDefault();
            var $menu_dom = e.data.byDom;
            var hidden2go = [],
                shown_collapse = $contextmenus_panel.find('.collapse.in');
            var show2User = function() {
                $contextmenus_panel.removeClass('hidden');
                $menu_dom.css({
                    'left': e.pageX,
                    // 减去[header>>>position:fixed;]的高度
                    'top': e.pageY - 70
                }).collapse('show');
            };
            if (shown_collapse.size() === 0) {
                show2User();
            } else {
                shown_collapse.collapse('hide');
                hidden2go.push(show2User);
            }

            $menu_dom.on('hidden.bs.collapse', function() {
                var exec = undefined;
                while ($.isFunction(exec = hidden2go.shift())) {
                    exec();
                }
            })
            return false;
        });

        // 注册菜单的点事件
        var $lis = $mouse_right_menus_ul.children(':not(.divider)');
        $lis.each(function(index, li) {
            $(this).bind('click', undefined, function(e) {
                if ($(li).hasClass('disabled')) return false;
                if ($.isFunction(menus[index] && menus[index].click)) {
                    menus[index].click();
                    commons.hideContextMenus($contextmenus_panel);
                }
            });
        });
        // 菜单的点击状态初始化
        $menu_model.on('show.bs.collapse', function() {
            $lis.removeClass('disabled');
            var $liItem = undefined;
            $lis.each(function(index, li) {
                $liItem = menus[index];
                if ($.isFunction($liItem && $liItem.visible)) {
                    $liItem.visible() ? $(li).removeClass('hidden') : $(li).addClass('hidden');
                }
                if ($.isFunction($liItem && $liItem.disabled)) {
                    $(li).addClass(($liItem.disabled() ? 'disabled' : ''));
                }
                if ($.isFunction($liItem && $liItem.context)) {
                    $(li).val($liItem.context());
                }
            });
            $liItem = null;
        });
        // 初期化
        //        $mouse_right_menus.collapse('hide');
    },
    //////////////////////////////////create context-menu end
    /**
     * @description
     *     用户登出是的统一处理。(触发诱因-【退出】按钮,认证失败)
     * */
    logout: function() {
        // 清除前台页面所有(localStorage)緩存数据
        commons.clearStorage();
        // 跳转回登录页面
        // window.location = seajs.data.base;
    },
    /**
     * @description remove the space in the head and tail.
     * @param s
     * @returns
     */
    trim: function(s) {
        return s.replace(/(^\s*)|(\s*$)/g, "");
    }
};

module.exports = commons;