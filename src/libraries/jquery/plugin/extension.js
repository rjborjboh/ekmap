// JavaScript Document
//============================
var jQuery = require('jquery');
var commonjs = require('commonjs');
var request = require('request');


//十六进制颜色值域RGB格式颜色值之间的相互转换
//-------------------------------------
//十六进制颜色值的正则表达式
/* RGB颜色转换为16进制 */
String.prototype.colorHex = function(){
    var that = commonjs.lowerCase(this);
    if(that.indexOf('rgb') != -1){
        var rgb = that.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        if(rgb != null){
            function hex(x){  
                return ('0' + commonjs.int(x).toString(16)).slice(-2);
            }
            rgb = '#' + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]); 
        }else{
            rgb = 'none';
        }
        return rgb;
    } else {
        return that;
    }
};

//-------------------------------------------------

/* 16进制颜色转为RGB格式 */
String.prototype.colorRgb = function(){
    var sColor = this.toLowerCase();
    if (sColor && reg.test(sColor)){
        if(sColor.length === 4){
            var sColorNew = '#';
            for(var i = 1; i < 4; i += 1){
                sColorNew += sColor.slice(i, i+1).concat(sColor.slice(i, i+1));
            }
            sColor = sColorNew;
        }
        // 处理六位的颜色值
        var sColorChange = [];
        for(var i = 1; i < 7; i += 2){
            sColorChange.push(commonjs.int('0x' + sColor.slice(i, i+2)));
        }
        return 'RGB(' + sColorChange.join(',') + ')';
    } else {
        return sColor;
    }
};

String.prototype.equalTo = function(param){
    return (this == param);
};

/**
 * 扩展jQuery对象本身。
 */
(function ($) {
    var userAgentStr = navigator.userAgent.toLowerCase();
    $.extend({
        /**
         * @description
         *     交换类数组中两个指定位置的值（只对字符串和数组）。
         * */
        swapPos: function(arr, _this, _that){
            if (!arr || !arr.hasOwnProperty('length')
                     || isNaN(_this) || isNaN(_that)) return false;
            _this = $.locateIndex(arr, _this);
            _that = $.locateIndex(arr, _that);
            var type = typeof(arr);
//            if ("[object Array]" != Object.prototype.toString.call(arr)) {
            if (type == 'string') {
                arr = Array.prototype.join.call(arr, '^');
                arr = arr.split('^');
            }
            var tmp = arr[_this];
            arr[_this] = arr[_that];
            arr[_that] = tmp;
            if (type == 'string') return arr.join('');
        },
        locateIndex: function(_arr, pos){
            pos = commonjs.int(pos);
            if (_arr.length > pos) return pos;
            pos = pos % _arr.length;
            if (pos === 0 ) return (_arr.length - 1);
            return --pos;
        },
        isIE: function(){
            return /msie/.test(userAgentStr) && (!!window.ActiveXObject || "ActiveXObject" in window);
        },
        isSafari: function(){
            return /safari/.test(userAgentStr) && userAgentStr.indexOf("version") > -1;
        },
        isChrome: function(){
            return window.chrome && /chrome/.test(userAgentStr);
        }
    });
})(jQuery);

/**
 * 扩展注册事件。
 */
(function ($) {
    $.fn.distinctOnEvent = function(){
        var tmp_arguments = [],
            $this = $(this) || $(document),
            event = arguments[0];
        if (!event || !commonjs.isString(event)) return $this;
        $this.off(event);
        for(var i = 0, l = arguments.length; i < l; i++){
            tmp_arguments.push(arguments[i]);
        }
        $.fn.on.apply($this, tmp_arguments);
        return $this;
    }
})(jQuery);


/**
 * 取得不同浏览器，不同版本的DOM对象指定CSS属性值
 */
(function ($) {
    var browerPrefixs = ['-webkit-', '-ms-', '-moz-', '-o-'];
    var _HACK_CSS_REGEXP = new RegExp('^(' + browerPrefixs.join('|') + ')(.+)', 'i');
    $.fn.hackCss = function(cssName, cssValue){
        var $rtnCssValue = undefined;
        if (cssName && commonjs.isString(cssName)) {
            var i, length = browerPrefixs.length,
            regCssName = _HACK_CSS_REGEXP.exec(cssName);
            if (!regCssName) {
                regCssName = cssName;
            } else {
                regCssName = regCssName[2];
            }
            if (commonjs.isString(cssValue)) {// 设置css属性值
                $(this).css(regCssName, cssValue);
                for (i = 0; i < length; i++) {
                    $rtnCssValue = $(this).css(browerPrefixs[i] + regCssName, cssValue);
                }
            } else { // 取得css属性值
                if (typeof($rtnCssValue = $(this).css(regCssName)) === 'undefined') {
                    for (i = 0; i < length; i++) {
                        $rtnCssValue = $(this).css(browerPrefixs[i] + regCssName);
                        if (typeof($rtnCssValue) === 'undefined') continue;
                        break;
                    }
                }
            }
        } else if (typeof(cssName) == 'object'){
            for(var property in cssName){
                $rtnCssValue = $(this).hackCss(property, cssName[property]); 
            }
        }
        return $rtnCssValue;
    };
    
    $.fn.getCss = function(cssName){
        var cssValue = $(this).hackCss(cssName);
        if (!cssValue) cssValue = '';
        return cssValue;
    }
})(jQuery);
/**
 * 
 * DOM节点是否可见
 * 
 * 简单使用：
 * $('selector').isVisible(‘);
 */
(function ($) {
    $.fn.isVisible = function() {
    if (this.length === 0) return false;
    var computedCSS = getComputedStyle($(this)[0], null);
    
    return (computedCSS['display'] !== commonjs.lowerCase("none")
            && computedCSS['visibility'] !== commonjs.lowerCase("hidden"));
};
  
})(jQuery);

/**
 * 
 * HTML的<select>插件
 * @description
 *     用数据库中的数据来填充HTML的<select>标签内容
 * @param
 *     option         object - 一些配置和回调处理
 *     callback       functions - {success: function(){}, fail:function(){}}
 * 简单使用:
 *   <div>
 *       <select id="mySelect"> </select>
 *   </div>
 * 适用方法-
 * $('#mySelect').fillViaDBData({
 *     url: 'xx',
 *     data: {...},
 *     type: 'post'
 * },{
 *     success: function:function(d){
 *         // some code
 *     },
 *     fail: function(error){
 *         // some code
 *     }
 * });
 */
(function ($) {
  $.fn.fillViaDBData = function(options, callback) {
      if (commonjs.isString(callback.fail)) {
          var msgNo = callback.fail;
          callback.fail = function(){
              commonjs.createLayerMsg(
              ['confirm'], {
                  body : msgNo
              });
          };
      }
      request.ajax(options, callback);
  };
  
})(jQuery);

/**
 * 
 * 序列化HTML标签内容为JSON对象插件(除了file)
 * 
 * 简单使用：
 * 使用1-|||||
 *   <div id="form" class="alert alert-warning fade in">
 *       <input type="text" data-ppt="name" value="tom"/>
 *       <span data-ppt="age">26</span>
 *       <select data-ppt="score"><option selected>34<option/></select>
 *   </div>
 * $('#form').html2Json({selector:'[data-ppt]', keySelector: 'data-ppt'});
 * 返回的结果是 {name:'tom', age:26, score:34}
 * 
 * 使用1-|||||
 *   <div id="form" class="alert alert-warning fade in">
 *       <input type="text" class="abc" data-ppt="name" value="tom"/>
 *       <span class="abc" data-ppt="age">26</span>
 *       <select class="abc" data-ppt="score"><option selected>34<option/></select>
 *   </div>
 * $('#form').html2Json({selector:'.abc', keySelector: 'data-ppt'});
 * 或者
 * $('#form').html2Json(‘data-ppt’);
 * 返回的结果是 {name:'tom', age:26, score:34}
 */
(function ($) {
  $.fn.html2Json = function(o) {
      var json = {}, checkbox_flag = false;
      var selector, jsonkey;
      if (!o) return json;
      if (o && commonjs.isString(o)) {
          selector = '[' + o + ']',
          jsonkey = o;
      } else {
          selector = o.selector,
          jsonkey = o.keySelector || 'id';
      }
      if (!selector) return json;
      if (!/^\[.+\]$/.test(selector)) selector = '[' + selector + ']';
      var key, node_name;
      $(this).find(selector).each(function(index, item){
          if (item.type == 'file') return false;
          node_name = item.nodeName;
          key = $(item).attr(jsonkey);
          if (node_name) node_name = commonjs.lowerCase(node_name);
          switch(node_name){
              case 'input':
              case 'textarea':
//                 attr()函数在操作少数属性时可能会出现异常情况，例如value和tabindex属性。
//                $(item).attr('value');
                  json[key] = $(item).prop('value');
                  if (!json[key]) json[key] = $(item).val() || '';
                  break;
              case 'select':
//                尽量不要使用attr()操作表单元素的checked、selected、disabled属性。
//                对于表单元素的checked、selected、disabled等属性，
//                在jQuery 1.6之前，attr()获取这些属性的返回值为Boolean类型：如果被选中(或禁用)就返回true，否则返回false。
//                但是从1.6开始，使用attr()获取这些属性的返回值为String类型，如果被选中(或禁用)就返回checked、selected或disabled，
//                否则(即元素节点没有该属性)返回undefined。并且，在某些版本中，这些属性值表示文档加载时的初始状态值，
//                即使之后更改了这些元素的选中(或禁用)状态，对应的属性值也不会发生改变。
//                因为jQuery认为：attribute的checked、selected、disabled就是表示该属性初始状态的值，
//                property的checked、selected、disabled才表示该属性实时状态的值(值为true或false)。
//                因此，在jQuery 1.6及以后版本中，请使用prop()函数来设置或获取checked、selected、disabled等属性。
//                对于其它能够用prop()实现的操作，也尽量使用prop()函数。
                  json[key] = $(item).find(':selected').val() || '';
                  break;
              case 'checkbox':
                  checkbox_flag = true;
                  break
              default:
                  break;
          }
      });
      if (checkbox_flag) {
          var checkbox = [], key = $(this).find(':checked').first().attr(selector);
          $(this).find(':checked').each(function(index, item){
              checkbox.push($(item).val());
          });
          json[key] = checkbox;
      }
      return json;
  };
  
})(jQuery);

/**
 * 
 * 序列化HTML标签内容为JSON对象插件(除了file)
 * 
 * 简单使用：
 * 使用1-|||||
 *   <div id="form" class="alert alert-warning fade in">
 *       <input type="text" data-ppt="name" value="tom"/>
 *       <span data-ppt="age">26</span>
 *       <select data-ppt="score"><option selected>34<option/></select>
 *   </div>
 * $('#form').html2Json({selector:'[data-ppt]', keySelector: 'data-ppt'});
 * 返回的结果是 {name:'tom', age:26, score:34}
 * 
 * 使用1-|||||
 *   <div id="form" class="alert alert-warning fade in">
 *       <input type="text" class="abc" data-ppt="name" value="tom"/>
 *       <span class="abc" data-ppt="age">26</span>
 *       <select class="abc" data-ppt="score"><option selected>34<option/></select>
 *   </div>
 * $('#form').html2Json({selector:'.abc', keySelector: 'data-ppt'});
 * 或者
 * $('#form').html2Json(‘data-ppt’);
 * 返回的结果是 {name:'tom', age:26, score:34}
 */
(function ($) {
  $.fn.json2Html = function(o, json) {
      var checkbox_flag = false;
      var selector, jsonkey;
      if (!o) return false;
      json = json || {};
      if (o && commonjs.isString(o)) {
          selector = '[' + o + ']',
          jsonkey = o;
      } else {
          selector = o.selector,
          jsonkey = o.keySelector || 'id';
      }
      if (!selector) return false;
      if (!/^\[.+\]$/.test(selector)) selector = '[' + selector + ']';
      var key, node_name, json_value;
      $(this).find(selector).each(function(index, item){
          if (item.type == 'file') return false;
          node_name = item.nodeName;
          key = $(item).attr(jsonkey);
          json_value = json[key] || '';
          if (node_name) node_name = commonjs.lowerCase(node_name);
          switch(node_name){
              case 'input':
              case 'textarea':
//                  $(item).attr('value', json_value);
                  $(item).prop('value', json_value);
                  $(item).val(json_value);
                  break;
              case 'select':
                  var index = $(item).find('[value="' + json_value +'"]').index();
                  $(item)[0].selectedIndex = index;
                  break;
              case 'checkbox':
                  checkbox_flag = true;
                  break
              default:
                  break;
          }
      });
      // [checkbox]
      if (checkbox_flag) { }
  };
  
})(jQuery);

/**
 * 
 * HTML的DOM位置范围限定
 * 
 * 简单使用：
 * 
 * $('selector-A').rangeInDom($('selector-B'), {direction:
 * 'left/right/top/bottom', distance: 10});
 * 检查元素(selector-A)的位置是不是在(selector-B)的位置范围内
 * 
 */
(function ($) {
  $.fn.isInRectRange = function (domRange, moveRange) {
		if (!domRange) return false;
		var domCheck = $(this);
		var checkObjRect = domCheck[0].getBoundingClientRect();
		var wrapObjRect = domRange[0].getBoundingClientRect();
		var actionBack = false, direction = undefined,
			lt_directions = ['left', 'top'],
			rb_directions = ['right', 'bottom'];
		
		moveRange = moveRange || {};
		direction = moveRange.direction;
		if (lt_directions.indexOf(direction) > -1){
			if (!isNaN(moveRange.distance)
					&& checkObjRect[direction] < (wrapObjRect[direction] + commonjs.int(
							moveRange.distance, 0))) {
				actionBack = true;
			}
		}
		if (!actionBack && rb_directions.indexOf(direction) > -1){
			if (!isNaN(moveRange.distance)
					&& checkObjRect[direction] > (wrapObjRect[direction] - commonjs.int(
							moveRange.distance, 0))) {
				actionBack = true;
			}
		}
		return actionBack;
	};
})(jQuery);

/**
 * 
 * 模拟通知的脉动状态动画效果
 * 
 * 简单使用：
 * 
 *$(selector).pulsate({
 *     color: "#dd5131",
 *     repeat: 5
 * });
 * 
 */
(function($) {
    var pulsate = {
            init: function(setting) {
                var _settings = {
                    monitor: undefined,
                    forbidden: !1,
                    interval: 0,
                    intervalDelay: 30E3,
                    color: $(this).css('background-color'),
                    reach: 20,
                    speed: 1E3,
                    pause: 0,
                    delay: 0,
                    glow: !0,
                    repeat: !0,
                    _repeat: !0,
                    onHover: !1
                };
                if (_settings.monitor) {
                    _settings.monitor = $(this).find(_settings.monitor).first();
                }
                $(this).css({
                    '-moz-outline-radius': $(this).css('border-top-left-radius'),
                    '-webkit-outline-radius': $(this).css('border-top-left-radius'),
                    'outline-radius': $(this).css('border-top-left-radius')
                });
                setting && $.extend(_settings, setting);
                _settings.color = $("<div style='background:" + _settings.color + "'></div>").css('background-color');
                if (_settings.repeat !== !0 && !isNaN(_settings.repeat) && _settings.repeat > 0) {
                     _settings.repeat -= 1;
                     _settings._repeat = _settings.repeat;
                }
                $(this).data('_settings', $.extend({}, _settings));
                return this.each(function() {
                    if (_settings.onHover) {
                        $(this).bind('mouseover', function(e) {
                            e.stopPropagation();
                            notice($.extend({}, $(this).data('_settings')), this, 0);
                            return false;
                        }).bind('mouseout', function(e) {
                            e.stopPropagation();
                            $(this).pulsate('destroy');
                            return false;
                        });
                    }
                    notice(_settings, this, 0);
                })
            },
            data: function(name){
                if (name && commonjs.isString(name)) {
                    return $(this).data('_settings')[name];
                }
                return $(this).data('_settings');
            },
            pause: function(){
                $(this).data('_settings')['pause'] = true;
                $(this).css('outline', 0)
            },
            restart: function(){
                $(this).data('_settings')['pause'] = false;
            },
            destroy: function() {
                return this.each(function() {
                    clearTimeout(this.timer);
                    $(this).css('outline', 0)
                });
            }
        },
        notice = function(settings, node, time) {
            if (settings.interval) {
                if ($(node).data('_settings')['pause']
                    || settings.monitor && commonjs.int($(settings.monitor).text(), 0) === 0) {
                    begin($.extend({}, $(node).data('_settings')), node, 0, settings.intervalDelay);
                    return false;
                }
            } else if (settings.forbidden) {
                return false;
            }
            var _reach = settings.reach;
            time = time > _reach ? 0 : time;
            var _color = (_reach - time) / _reach, outline = settings.color.split(',');
            _color = 'rgba(' + outline[0].split('(')[1] + ',' + outline[1] + ',' + outline[2].split(')')[0] + ',' + _color + ')';
            outline = {
                outline: '2px solid ' + _color
            };
            if (settings.glow) {
                outline['box-shadow'] = '0px 0px ' + commonjs.int(time / 1.5) + 'px ' + _color,
                /webkit/.test(navigator.userAgent.toLowerCase()) && (outline['outline-offset'] = time + 'px',
                outline['outline-radius'] = '100 px');
            } else {
                outline['outline-offset'] = time + 'px';
            }
            $(node).css(outline);
            node.timer = setTimeout(function() {
                if (time >= _reach) {
                    if (settings.delay) {
                        begin(settings, node, time + 1);
                        return false;
                    } else if (!settings.repeat) {
                        if (settings.interval) {
                            begin($.extend({}, $(node).data('_settings')), node, 0, settings.intervalDelay);
                        } else {
                            $(node).pulsate('destroy');
                        }
                        return false;
                    } else if (settings.repeat !== !0
                            && !isNaN(settings.repeat)
                            && settings.repeat > 0) {
                        settings.repeat -= 1;
                    }
                }
                notice(settings, node, time + 1);
            }, settings.speed / _reach);
        },
        begin = function(settings, node, time, delay) {
            innerfunc = function() {
                notice(settings, node, time)
            };
            setTimeout(innerfunc, (delay !== !0 && !isNaN(delay) && delay > 0 && delay)
                        || settings.delay);
        };
    $.fn.pulsate = function(setting) {
        if (pulsate[setting]) {
            return pulsate[setting].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        else if (typeof setting === 'object' || !setting) {
            return pulsate.init.apply(this, arguments);
        }
        else {
            $.error('Method ' + setting + ' does not exist on jQuery.pulsate');
        }
    }
})(jQuery);

/**
 * 
 * 页面居中
 * 
 * 简单使用：
 * 
 * $('#cbox1').center();
 * 不是所有人都喜欢让某元素垂直居中，同时想要它跟随屏幕滚动的话，可以这样配置(所有在此合理配置的CSS样式都将被应用)：
 * 
 * $('#cbox2').center({position:'fixed',top:'30%'}); 要让#cobx1脱离父容器(假定它是静态定位)的话：
 * 
 * $('#cbox1').center({relative:false});
 * 
 */
(function ($) {
  $.fn.center = function (settings) {
    var style = $.extend({
      position: 'absolute', // absolute or fixed
      top     : '50%', // 50%即居中，将应用负边距计算，溢出不予考虑了。
      left    : '50%',
      zIndex  : 1000,
      relative: true // 相对于包含它的容器居中还是整个页面
    }, settings || {});

    return this.each(function () {
      var $this = $(this);

      if (style.top == '50%') style.marginTop = -$this.outerHeight() / 2;
      if (style.left == '50%') style.marginLeft = -$this.outerWidth() / 2;
      if (style.relative && !$this.parent().is('body') && $this.parent().css('position') == 'static') $this.parent().css('position', 'relative');
      delete style.relative;
      
      if (style.position == 'fixed') {
        $this.css('top', style.top);
        var absTop = commonjs.int(window.getComputedStyle($this[0], null).top);
        var ctop = (document.documentElement.clientHeight - $this.outerHeight()) / 2;
        
        /* [50]是 本项目中[header]的高度,因为[header]是【position:fixed】
         * 所以需要考虑[header]的高度的原因
         * */
       // 原始状态居中需要的margin-top
        initMarginTop = -(absTop - ctop + 50);
        // 页面显示需要的margin-top
        style.marginTop = initMarginTop + $(window).scrollTop();
        style.position = 'absolute';
        $(window).scroll(function(){
          $this.stop().animate({
            marginTop: (initMarginTop + $(window).scrollTop())
          });
        });
      }

      $this.css(style);
    });
  };
})(jQuery);

/**
 * 不使用margin 负值回去 的居中
 */
(function ($) {
  $.fn.center2 = function (settings) {
    var style = $.extend({
      position: 'absolute', // absolute or fixed
      top     : '50%', // 50%即居中，将应用负边距计算，溢出不予考虑了。
      left    : '50%',
      zIndex  : 9999,
      relative: true // 相对于包含它的容器居中还是整个页面
    }, settings || {});

    return this.each(function () {
      var $this = $(this);
      if (style.top == '50%') style.marginTop = -$this.outerHeight() / 2;
      if (style.left == '50%') style.left = ( $this.parent().width() - $this.width() ) / 2;
      // console.log(style.left<0);
      // style.left = (style.left<0?0:style.left);
      $this.css(style);

    });
  };
})(jQuery);

/**
 * selectMt 0.1 Copyright (c) 2014 MANTOU http://www.mtsee.com/ Date: 2014-08-17
 * 封装下拉菜单插件 方法名： selectMt 点击后返回选择项 结构如下：
 * 
 * css:
 * 
 * .downNav{display:inline-block; border:1px solid #e1e1e1; border-radius:2px;
 * font-size:14px; height:14px; width:92px; height:30px; float:right;
 * margin-top:13px; line-height:30px; text-indent:10px; position:relative;}
 * .downNav span{ width:100%; height:100%; display:block; cursor:pointer;
 * background:#f6f6f6;} .downNav span i{ width:10px; height:10px;
 * display:inline-block; background:url(../images/index.png) no-repeat -3px
 * -115px; margin-left:8px;} .downNav span:hover{ background:#ff6060;
 * color:#FFF; border-radius:2px;} .downNav span:hover
 * i{background:url(../images/index.png) no-repeat -3px -129px;} .downNav ul{
 * display:none; width:100%; position:absolute; top:32px; border-left:1px solid
 * #CCC; border-right:1px solid #CCC; margin:-1px; max-height:200px;
 * overflow:auto;} .downNav ul li{ float:left; width:100%; height:30px;
 * border-bottom:1px solid #CCC; line-height:30px; margin-left:0;
 * text-align:center; background:#FFF; cursor:pointer; text-indent:0;} .downNav
 * ul li:hover{background:#ff6060; color:#FFF;}
 * 
 * html:
 * 
 * <div class="downNav" id="" dataValue="默认内容"> <span>默认内容<i></i></span>
 * <ul>
 * <li>列表1</li>
 * <li>列表2</li>
 * <li>列表3</li>
 * </ul>
 * </div>
 * 
 * 使用方法：
 * 
 * $("对象ID").selectMt({callback:回调函数名称}); //回调函数名称不加括号，值返回给回调函数
 * 
 */

;(function($){ 
    $.fn.selectMt = function(setting){
        var defaults = { 
            callback : null // 默认回调函数为空
        } 
        // 如果setting为空，就取default的值
        var setting = $.extend(defaults, setting); 
        this.each(function(){ 
        // 插件实现代码
            var $this = $(this);
            var $span = $this.find("span");
            var $ul = $this.find("ul");
            var $li = $ul.find("li");

            $span.click(function(){
               if($ul.is(":hidden")){
                   $ul.css({"display":"block"});
               }
               else{
                   $ul.css({"display":"none"});   
               }
            });
            
            $li.on("click",function(){
               $ul.css({"display":"none"});
               var selectValue = $(this).html();
               $this.attr("dataValue",selectValue);
               $span.html(selectValue+"<i></i>");
               if(setting.callback != null){
                   setting.callback(selectValue);// 运行完后设置回调函数
               }
            });    
        });
    }
})(jQuery); 


/**
 * 弹窗插件 , 返回yes 表示点击了确定按钮 弹窗的窗口，对象必须是ID 页面里面必须有蒙版层 点击 class = close 关闭弹窗 box
 * 必须使用 id <!--蒙版层--> HTML: <div class="fixedBox" id="fixedBox"></div> CSS:
 * .fixedBox{ position:fixed; background:#000; opacity:0.5;
 * filter:alpha(opacity=50); -moz-opacity:0.5; width:100%; height:100%; top:0;
 * z-index:2999; display:none;}
 */
;(function($){
    $.fn.showWindow = function(setting){
        var defaults = { 
            id : null, // 默认回调函数为空
            speed : 300, // 显示速度
            center : true, // 是否居中
            callback : null, // 点击确定的回调函数
            cb : null
        } 
        if(commonjs.isInvalidValue(setting.id)){
            console.error("showWindow插件必须填入一个id参数!");
            return false;    
        }
        // 如果setting为空，就取default的值
        var setting = $.extend(defaults, setting); 
        this.each(function(){ 
            var $this = $(this);
            // 插件实现代码
            var $fixedBox = $("#fixedBox");
            var box = "#"+setting.id;
            var speed = setting.speed;
            var $loginBox = $(box);
            
            var clickFun = function($thisbtn){
                $thisbtn.parent().fadeOut(speed,function(){
                    $thisbtn.off("click");
                    $fixedBox.css({"display":"none"});
                });
            };
            
            $this.click(function(){
                $fixedBox.css({"display":"block"});
                if(setting.center === true){
                    $loginBox.center();
                }
                $loginBox.fadeIn(speed).find(".close").distinctOnEvent("click",function(){
                    clickFun($(this));
                    if(commonjs.isFunction(setting.callback)){
                        setting.callback("no");
                    }
                });
                $loginBox.find(".yes").distinctOnEvent("click",function(){
                    clickFun($(this));
                    if(commonjs.isFunction(setting.callback)){
                        setting.callback("yes");
                    }
                });
                if(commonjs.isFunction(setting.cb)){
                    setting.cb();
                }
            });
        });
    }
})(jQuery); 

/**
 * date: 2016-07-26 弹窗插件 , 返回yes 表示点击了确定按钮 弹窗的窗口，对象必须是ID 页面里面必须有蒙版层 点击 class =
 * close 关闭弹窗 box 必须使用 id <!--蒙版层--> HTML: <div class="fixedBox" id="fixedBox"></div>
 * CSS: .fixedBox{ position:fixed; background:#000; opacity:0.5;
 * filter:alpha(opacity=50); -moz-opacity:0.5; width:100%; height:100%; top:0;
 * z-index:2999; display:none;}
 */
;(function($){
    $.fn.maskWindow = function(setting){ 
        var defaults = { 
            id : null, // 默认回调函数为空
            speed : 300, // 显示速度
            center : true, // 是否居中
            actions : null, // 点击确定的回调函数
            cb : null,
            cancel: null
        }
        if(commonjs.isInvalidValue(setting.id)){
            console.error("maskWindow插件必须填入一个id参数!");
            return false;    
        }
        // 如果setting为空，就取default的值
        var setting = $.extend(defaults, setting); 
        this.each(function(){ 
            var $this = $(this);
            // 插件实现代码
            var box = "#"+setting.id;
            var speed = setting.speed;
            var $loginBox = $(box),
                $maskBox = $loginBox.find(".maskBox"),
                $conBox = $loginBox.find(".setWindowBox");
            
            var clickFun = function($thisbtn){
                $thisbtn.parent().fadeOut(speed,function(){
                    $thisbtn.off("click");
                    $maskBox.css({"display":"none"});
                    $loginBox.css({"display":"none"});
                });
            };
            
            // $this.click(function(){
            $this.distinctOnEvent("click.clickStartMask",function(){
                $maskBox.css({"display":"block"});
                $conBox.css({"display":"block"});
                $loginBox.css({"display":"block"});
                
                if(setting.center === true){
                    $conBox.center();
                }
                $conBox.fadeIn(speed).find(".close").distinctOnEvent("click.maskBtn",function(){
                    clickFun($(this));
                    if (setting.actions) {
                        if ($(this).hasClass('closebtn')) { // 【X】按钮
                            if(commonjs.isFunction(setting.actions.close)){
                                setting.actions.close($(this));
                            }
                        } else { // 【取消】按钮
                            if(commonjs.isFunction(setting.actions.cancel)){
                                setting.actions.cancel($(this));
                            }
                        }
                    }
                    // 关闭该页面之后的共同处理
                    commonjs.isFunction(setting.cancel) && setting.cancel($conBox);
                });
                $conBox.find(".yes").distinctOnEvent("click.maskBtn",function(){
                    clickFun($(this));
                    if(setting.actions && commonjs.isFunction(setting.actions.confirm)){
                        setting.actions.confirm($(this));
                    }
                });
                if(commonjs.isFunction(setting.cb)){
                    setting.cb();
                }
            });
        });
    }
})(jQuery);
/**
 * 
 * html:
 * 
 * 鼠标按下去时：drag-mousedown
 * 
 * HTML：
 * 
 * <ul id="pageListUl">
 * <li class="active"> <div class="dragdiv">第一页</div> </li>
 * <li> <div class="dragdiv">第二页</div> </li>
 * <li> <div class="dragdiv">第三页</div> </li>
 * <li> <div class="dragdiv">第四页</div> </li>
 * </ul>
 * 
 * CSS：
 * 
 * //拖动 .zIndexMax{ z-index:9999;} .drag-mousedown .dragdiv{ opacity:0;}
 * .drag-mousedown:after{ content:'+'; font-size:24px; text-shadow:none;
 * color:#999; display:block; border:1px dashed #999; margin:-1px;
 * font-weight:bolder;} .drag-sapn{ opacity:.7; visibility:visible;
 * z-index:100;}
 * 
 * //UL LI 下面的span 要是 absolute 定位的 ul{ position:relative; width:125px;
 * margin:10px;} ul li{ position:relative; width:100%; height:40px;
 * margin-bottom:10px; text-align:center; line-height:40px; color:#000;
 * text-shadow: 0 1px 2px rgba(0,0,0,0.2); cursor:pointer; transition:0.2s;} ul
 * li .dragdiv{ display:block; width:100%; height:100%; position:absolute;
 * top:0; left:0; background:#999; color:#FFF;} ul li.active
 * .dragdiv{background:#1c1c1c; color:#FFF;}
 * 
 * 使用方法：
 * 
 * $("ul对象ID").dragListMt({callback:回调函数名称,liheight:li标签的高度});
 * //回调函数名称不加括号，值返回给回调函数 带参数 start_index,end_index
 * 
 */

;(function($){
    $.fn.dragListMt = function(setting){ 
        var defaults = { 
            callback : null, // 默认回调函数为空 ，返回start_index ,end_index
            liheight : 50 , // li的拖动距离
            xfloat : 0 , // 左右浮动10px
            yfloat : 10 // 默认拖动20个像素才开始克隆移动
        } 
        // 如果setting为空，就取default的值
        var setting = $.extend(defaults, setting); 
        this.each(function(){ 
        // 插件实现代码
            var $this_obj = $(this);
            var li_len = $this_obj.find("li").length;
            // 位置
            var seat = {
                x_down : null,
                y_down : null,
                x_move : null,
                y_move : null,
                x_end : null,
                y_end : null,
                index : null,
                start_className : null
            };
            
            // 重置class
            var reSetClass = function(index,len,y,y0){
                var $li = $this_obj.find("li");
                var move_num = commonjs.int((y - y0)/setting.liheight);
                if(index + move_num <= 0){
                    $li.removeClass("drag-mousedown");
                    $li.first().addClass("drag-mousedown");
                    return false;    
                }
                if( (index + move_num) >= $li.length ){
                    $li.removeClass("drag-mousedown");
                    $li.last().addClass("drag-mousedown");
                    return false;
                }
                else {
                    $li.removeClass("drag-mousedown");
                    $li.eq(index + move_num).addClass("drag-mousedown");
                }
            };
            
            // 交换数据
            var changeDiv = function(start_index , end_index , $dragMousedown){
                var $li = $this_obj.find("li");
                var div = null;
                $li.removeClass("drag-mousedown");
                // 数据交换
                div = $li.eq(start_index).html();
                // $li.eq(start_index).html($li.eq(end_index).html());
                if(start_index != end_index){
                    $li.eq(start_index).remove();
                }
                // $li.eq(end_index).html(div);
                // console.log("开始：",start_index);
                // console.log("结束：",end_index);
                
                // 如果往上移动
                if(start_index > end_index){
                    $li.eq(end_index).before("<li>"+div+"</li>");
                }
                // 如果往下移动
                else if(start_index < end_index){
                    $li.eq(end_index).after("<li>"+div+"</li>");    
                }
                // 如果移动相同位置，不用交互
                else{
                    // $li.eq(end_index).html("<li>"+div+"</li>");
                }
                var $dragSpan = $this_obj.find(".drag-span");
                
                // 交互数据后，相对位移会发生变化，让其还原回去
                var topLen = $dragSpan.position().top;
                $dragSpan.css({top:topLen + (start_index - end_index)*setting.liheight});
                $dragSpan.animate({
                    top:0,
                    left:0
                },function(){
                    $dragSpan.remove();// 删掉克隆
                    // $dragMousedown.removeClass("drag-mousedown");//去掉拖动样式
                    // class 交换
                    $li = $this_obj.find("li");
                    $li.eq(end_index).attr("class",seat.start_className);
                });
                
                if(commonjs.isFunction(setting.callback)){
                       setting.callback(start_index,end_index);// 运行完后设置回调函数
                }
            };
            
            // clone 拖拽元素
            var cloneDragSpan = function($span,$this){
                $this.addClass("zIndexMax");
                $this.addClass("drag-mousedown");
                $this.append($span.clone().addClass("drag-span"));
                $dragSpan = $this.find(".drag-span").css({
                    "visibility" : "visible",
                    "opacity" : 0.7,
                    "z-index" : 10
                });    
            };
            
            // 事件委托 动态绑定
            $this_obj.on("mousedown.drag",".dragdiv",function(e){
                // alert($(this).html());
                // 如果动态绑定li标签
                // var $this = $(this);
                // var $span = $this.find("span");
                // 如果动态绑定span标签
                // 鼠标右键不支持拖动
                if(3 == e.which){
                    return false;
                }
                
                var $span = $(this);
                var $this = $span.parent();
                var cloneMark = 1; // 1表示要克隆 cloneDragSpan($span,$this);
                // clone 元素
                
                // 获取当前坐标
                seat.y_down = e.pageY;
                seat.x_down = e.pageX;
                seat.index = $this.index();
                
                // 获取start_className
                seat.start_className = $this.attr("class");
                $this.removeClass();
                
                // 鼠标移动事件
                $(document).on("mousemove.drag",function(e){
                    // y
                    seat.y_move = e.pageY;
                    
                    // x 移动区间在 |xfloat| 之间
                    seat.x_move=e.pageX -seat.x_down;
                    if(seat.x_move >= setting.xfloat){
                        seat.x_move = setting.xfloat;
                    }
                    if(seat.x_move <= -setting.xfloat){
                        seat.x_move = -setting.xfloat;    
                    }
                    
                    // 开始clone
                    if( (seat.y_move - seat.y_down) >= setting.yfloat || (seat.y_move - seat.y_down) <= -setting.yfloat){
                            // clone一次
                            if(cloneMark == 1){
                                cloneDragSpan($span,$this);
                                cloneMark = 0;
                            }
                        
                            // 移动clone元素
                            $dragSpan.css({
                                top: seat.y_move - seat.y_down,
                                left: seat.x_move
                            });
                            
                            // 重置class drag-mousedown，传入 当前的 index/len/y/y0
                            reSetClass(seat.index,li_len,seat.y_move,seat.y_down);
                    }
                    
                }).on("mouseup.drag",function(e){
                    $(this).off("mousemove.drag mouseup.drag");// 去掉mousemove mouseup事件
                    
                    // 如果clone了span，进行了拖动
                    if(cloneMark == 0){
                        var $dragMousedown = $this_obj.find(".drag-mousedown");
                        var index = $dragMousedown.index();// 获取当前的index

                        $this_obj.find("li").removeClass("zIndexMax");
                        // 交互数据start_index , end_index
                        changeDiv(seat.index,index,$dragMousedown);
                        cloneMark = 1;
                    }
                });
            });// end mousedown
            
        });
    }
})(jQuery); 


/**
 * 自定义 滑动 条 ($this,slider_callback,input_callback) CSS: .s-slider{ width:215px;
 * display: inline-block; margin-left:8px; -webkit-touch-callout: none;
 * -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none;
 * -ms-user-select: none; user-select: none;} .s-slider span.s-slider-tips{
 * font-size:18px; color:#ee6356; display:inline-block; margin-bottom:12px;}
 * .s-slider span.s-slider-tips i{ font-style:normal;} .s-slider .s-sliderBar{
 * width:100%; height:5px; position:relative; background:#cccccc;
 * border-radius:5px; background: #333; box-shadow: inset 0 2px 5px rgba(0, 0,
 * 0, 0.4);} .s-slider .s-sliderBar em.s-slider-bar{ display:block; height:100%;
 * background:#999; border-radius:5px;} .s-slider .s-sliderBar i.s-ico-slider{
 * cursor:pointer; position:absolute; top:-4px; margin-left:-10px; z-index:10;
 * height: 12px; width: 30px; background: #f1f1f1; display: block;
 * border-radius: 50px; text-decoration: none; background: #f5f5f5; background:
 * linear-gradient(#f5f5f5 0%, #cccccc 100%); box-shadow: 0 0 10px 0px rgba(0,
 * 0, 0, 0.35), 0 0 2px 1px rgba(0, 0, 0, 0.15), 0 3px 3px rgba(0, 0, 0, 0.2), 0
 * 7px 5px rgba(0, 0, 0, 0.1), 0 11px 10px rgba(0, 0, 0, 0.1);} .s-slider
 * .s-sliderBar i.s-ico-slider::before, .s-slider .s-sliderBar
 * i.s-ico-slider::after { content: " "; width: 2px; height: 40%; position:
 * absolute; background: transparent; border-radius: 0px; box-shadow: -1px 0px
 * 0px rgba(255, 255, 255, 0.8), 1px 0px 0px rgba(255, 255, 255, 0.8), 2px 0 0
 * rgba(0, 0, 0, 0.3), 1px 0 0 rgba(0, 0, 0, 0.3) inset;} .s-slider .s-sliderBar
 * i.s-ico-slider::before { left: 10px; top: 30%;} .s-slider .s-sliderBar
 * i.s-ico-slider::after { right: 12px; top: 30%;} .ms-pageSlider
 * .slider-input{width: 35px; height: 22px; box-shadow: inset 1px 2px 1px
 * rgba(0, 0, 0, 0.1); margin-left: 12px; line-height: 22px; border-radius: 2px;
 * border: none; display: inline-block; vertical-align: middle; text-align:
 * center; -webkit-user-select: none;}
 * 
 * HTML: <div class="ms-pageSlider">
 * <h5>缩放比例：</h5>
 * <div class="s-slider" id="zoom_pageSlider"
 * data="minData:1,maxData:200,iniData:100"> <div class="s-sliderBar">
 * <em class="s-slider-bar"></em> <i class="s-ico-slider"></i> </div> </div>
 * <input class="slider-input" type="text" value="100"> <span class="unit">%</span>
 * </div>
 * 
 * 
 */
;(function($){ 
    $.fn.sliderMt = function(setting){ 
        var defaults = { 
            slider_callback : null, // 默认回调函数为空
            input_callback : null, // 默认回调函数为空
            iniData : 0 // 默认参数 默认是0
        } 
        // 如果setting为空，就取default的值
        var setting = $.extend(defaults, setting); 
        this.each(function(){ 
            // 插件实现代码
            var $this = $(this);
            var _obj = {
                // $tips : $this.find("span.s-slider-tips"),
                $bar : $this.find("em.s-slider-bar"),
                $btn : $this.find("i.s-ico-slider"),
                data : null,// 返回是 maxData:xx,minData:xx,iniData:xx
                width : null,// slider的宽
                value : null, // 区间的值
                padding : 5, // 滑块偏移
                $input : $this.next("input.slider-input")
            };
            
            _obj.width = $this.width();
            _obj.data = eval( "({" + $this.attr("data-value") + "})" );
            // 数值转换
            _obj.data.minData = parseFloat(_obj.data.minData);
            _obj.data.maxData = parseFloat(_obj.data.maxData);
            _obj.data.iniData = setting.iniData;
            
            _obj.value = _obj.data.maxData - _obj.data.minData;

            // 初始化参数
            var iniSliderEmPosition = function(){
                var width = ((_obj.data.iniData - _obj.data.minData)/_obj.value)*_obj.width;
                _obj.$bar.width(width);
                _obj.$btn.css("left" , width - _obj.padding);
                // _obj.$tips.html("<i class='minData'>" + _obj.data.minData +
				// "</i> - <i class='endData'>" + _obj.data.iniData + "</i>");
            };
            iniSliderEmPosition();
            
            // 输入框内容变化时
            _obj.$input.distinctOnEvent("change",function(){
                var val = $(this).val();
                if(val < _obj.data.minData || val > _obj.data.maxData){
                    return;    
                };
                var moveWidth = ( val - _obj.data.minData )/(_obj.data.maxData - _obj.data.minData)*_obj.width;
                _obj.$btn.css({
                    "left" : moveWidth
                });
                _obj.$bar.width( moveWidth + _obj.padding);
                if(setting.input_callback != null){
                    setting.input_callback(val);
                }
            });
            
            // 点击事件
            _obj.$btn.distinctOnEvent("mousedown",function(e){
                var ev = {
                    x_start : null,
                    x_move : null,
                    x_end : null,
                    left_start : null,
                    moveWidth : null
                };
                
                var pData = null ;
                var mData = null ;
                    
                ev.x_start = e.pageX;
                ev.left_start = _obj.$btn.position().left;
                $(document).on("mousemove.sevenSlider",function(e){
                    ev.x_move = e.pageX - ev.x_start;
                    ev.moveWidth = ev.x_move + ev.left_start;
                    // console.log(ev.moveWidth);
                    if( ev.moveWidth >= - _obj.padding && ev.moveWidth <= _obj.width - _obj.padding){
                        _obj.$btn.css({
                            "left" : ev.moveWidth
                        });
                        _obj.$bar.width( ev.moveWidth + _obj.padding);
                    }
                    
                    // 设置 input 的值
                    pData = ((_obj.$btn.position().left + _obj.padding)/_obj.width).toFixed(2);
                    mData = parseFloat(((_obj.data.maxData - _obj.data.minData)*pData).toFixed(0)) + _obj.data.minData;
                    // _obj.$tips.html( "<i class='minData'>" +
					// _obj.data.minData + "</i> - <i class='endData'>" + mData
					// + "</i>");
                    _obj.$input.val(mData);
                    if(commonjs.isFunction(setting.slider_callback)){
                        setting.slider_callback(mData);
                    }
// pData = null ;
// mData = null ;
                    
                }).on("mouseup.sevenSlider",function(e){
                    $(document).off("mousemove.sevenSlider mouseup.sevenSlider");
                });
            });
        });
    }
})(jQuery);

/**
 * var rotation = $('img').rotationDegrees(); 返回transform:rotate 的值
 */
;(function ($) {
     $.fn.rotationDegrees = function () {
//     var matrix = this.css("-webkit-transform") ||
//     this.css("-moz-transform") ||
//     this.css("-ms-transform")  ||
//     this.css("-o-transform")  ||
//     this.css("transform");
     var matrix = this.hackCss("transform");
     if (matrix && commonjs.isString(matrix) && matrix !== 'none') {
         var values = matrix.split('(')[1].split(')')[0].split(',');
         var a = values[0];
         var b = values[1];
         var angle = a;
         var angle = Math.round(Math.atan2(b, a) * (180/Math.PI));
     } else { var angle = 0; }
         return angle;
     };
}(jQuery));

/**
 * 自定义下拉框 obj.donwSelectMt();
 */
;(function($){ 
    $.fn.donwSelectMt = function(setting){ 
        var defaults = { 
            delay : 0, // 展开速度
            callback : function(data){} // 回调函数
        } 
        // 如果setting为空，就取default的值
        var setting = $.extend(defaults, setting); 
        this.each(function(){ 
            var $thisObj = $(this);
            var sel = {
                spanId : null,
                $this : null,
                $ul : null,
                height : null,
                delay : setting.delay // 单位毫秒
            };
            
            // 初始化高度
            var iniHeight = function(){
                // console.log($thisObj.find("ul").height());
                // $thisObj.data("height",$thisObj.find("ul").height());
            };
            
            // select展开
            var openSelect = function(sel){
                sel.$this.css("z-index",9999);
                sel.$ul.css({
                    "display":"block"
                });
            };
            
            // select关闭
            var closeSelect = function(sel){
                $(document).off('click.' + sel.spanId);
                sel.$ul.css({
                    "display":"none"
                });    
                sel.$this.removeAttr("style");
            };
            
            var bindEvent = function(){
                // 自定义select框
                var $this = $thisObj.find("span");
                
                // 如果span里面的内容为空，初始placeholder参数
                if($this.html() == ""){
                    $this.html($this.attr("placeholder"));
                }
                
                // 绑定点击事件
                $this.distinctOnEvent("click.bindEvent",function(){
                    sel.$this = $this.parent();
                    sel.spanId = $this.attr("id");
                    sel.$ul = sel.$this.find("ul");
                    sel.height = sel.$this.data("height");
                    
                    // 如果隐藏才显示
                    if(sel.$ul.is(":hidden")){
                        openSelect(sel);    
                        
                        // 动态绑定
                        sel.$ul.distinctOnEvent("click.bindEventUl","li",function(){
                            $this.html($(this).html());
                            $this.attr("data-value",$(this).attr("data-value"));
                            setting.callback($(this).attr("data-value"));
                            closeSelect(sel);
                        });
                    } else {
                        closeSelect(sel);
                    }
                    
                    // 点击span区域外的区域 - 缩回菜单
                    $(document).distinctOnEvent('click.'+sel.spanId,function(e){
                        var e = e || window.event; // 浏览器兼容性
                        var elem = e.target || e.srcElement;
                        // console.log("====",elem.id);
                        if(elem.id == sel.spanId){
                            return false;
                        }
                        closeSelect(sel);
                    });
                }); // end click
            };
            
            iniHeight();
            bindEvent();
        });
    }
})(jQuery); 

// *******************************************
// 拖拽插件
;(function($){ 
    $.fn.dragMt = function(setting){ 
        var defaults = { 
            // drag_callback : null//默认回调函数为空
            dragParent : false // 拖拽父元素
        } 
        // 如果setting为空，就取default的值
        var setting = $.extend(defaults, setting); 
        this.each(function(){ 
            // 插件实现代码
            var $this = $(this);
            
            // 点击事件
            $this.on("mousedown",function(e){
                var ev = {
                    x_start : null,
                    y_start : null,
                    x_move : null,
                    y_move : null,
                    x_end : null,
                    y_end : null,
                    left : null,
                    top : null
                };
                
                if(setting.dragParent == true){
                    var $drag = $this.parent();
                }else{
                    var $drag = $this;    
                }
                    
                ev.x_start = e.pageX;
                ev.y_start = e.pageY;
                ev.left = $drag.position().left + $drag.parent().get(0).scrollLeft;
                ev.top = $drag.position().top + $drag.parent().get(0).scrollTop;
                
                $(document).on("mousemove.dragMt",function(e){
                    ev.x_move = e.pageX - ev.x_start + ev.left;
                    ev.y_move = e.pageY - ev.y_start + ev.top;
                    if(ev.y_move < 0){
                        ev.y_move = 0;    
                    }
                    if(ev.x_move < 0){
                        ev.x_move = 0;    
                    }
                    $drag.css({
                        "left" : ev.x_move,
                        "top" : ev.y_move
                    });
                }).on("mouseup.dragMt",function(e){
                    $(document).off("mousemove.dragMt mouseup.dragMt");
                });
            });
        });
    }
})(jQuery);

/*
 * zyFile.js 基于HTML5 文件上传的核心脚本 http://www.czlqibu.com by zhangyan 2014-06-21
 */

var ZYFILE = {
        fileInput : null,             // 选择文件按钮dom对象
        uploadInput : null,           // 上传文件按钮dom对象
        dragDrop: null,                  // 拖拽敏感区域
        url : "",                        // 上传action路径
        uploadFile : [],                // 需要上传的文件数组
        lastUploadFile : [],          // 上一次选择的文件数组，方便继续上传使用
        perUploadFile : [],           // 存放永久的文件数组，方便删除使用
        fileNum : 0,                  // 代表文件总个数，因为涉及到继续添加，所以下一次添加需要在它的基础上添加索引
        /* 提供给外部的接口 */
        filterFile : function(files){ // 提供给外部的过滤文件格式等的接口，外部需要把过滤后的文件返回
            return files;
        },
        onSelect : function(selectFile, files){      // 提供给外部获取选中的文件，供外部实现预览等功能
														// selectFile:当前选中的文件
														// allFiles:还没上传的全部文件
            
        },
        onDelete : function(file, files){            // 提供给外部获取删除的单个文件，供外部实现删除效果
														// file:当前删除的文件
														// files:删除之后的文件
            
        },
        onProgress : function(file, loaded, total){  // 提供给外部获取单个文件的上传进度，供外部实现上传进度效果
            
        },
        onSuccess : function(file, responseInfo){    // 提供给外部获取单个文件上传成功，供外部实现成功效果
            
        },
        onFailure : function(file, responseInfo){    // 提供给外部获取单个文件上传失败，供外部实现失败效果
        
        },
        onComplete : function(responseInfo){         // 提供给外部获取全部文件上传完成，供外部实现完成效果
            
        },
        
        /* 内部实现功能方法 */
        // 获得选中的文件
        // 文件拖放
        funDragHover: function(e) {
            e.stopPropagation();
            e.preventDefault();
            this[e.type === "dragover"? "onDragOver": "onDragLeave"].call(e.target);
            return this;
        },
        // 获取文件
        funGetFiles : function(e){  
            var self = this;
            // 取消鼠标经过样式
            this.funDragHover(e);
            // 从事件中获取选中的所有文件
            var files = e.target.files || e.dataTransfer.files;
            self.lastUploadFile = this.uploadFile;
            this.uploadFile = this.uploadFile.concat(this.filterFile(files));
            var tmpFiles = [];
            
            // 因为jquery的inArray方法无法对object数组进行判断是否存在于，所以只能提取名称进行判断
            var lArr = [];  // 之前文件的名称数组
            var uArr = [];  // 现在文件的名称数组
            $.each(self.lastUploadFile, function(k, v){
                lArr.push(v.name);
            });
            $.each(self.uploadFile, function(k, v){
                uArr.push(v.name);
            });
            
            $.each(uArr, function(k, v){
                // 获得当前选择的每一个文件 判断当前这一个文件是否存在于之前的文件当中
                if($.inArray(v, lArr) < 0){  // 不存在
                    tmpFiles.push(self.uploadFile[k]);
                }
            });
            
            // 如果tmpFiles进行过过滤上一次选择的文件的操作，需要把过滤后的文件赋值
            // if(tmpFiles.length!=0){
                this.uploadFile = tmpFiles;
            // }
            
            // 调用对文件处理的方法
            this.funDealtFiles();
            
            return true;
        },
        // 处理过滤后的文件，给每个文件设置下标
        funDealtFiles : function(){
            var self = this;
            // 目前是遍历所有的文件，给每个文件增加唯一索引值
            $.each(this.uploadFile, function(k, v){
                // 因为涉及到继续添加，所以下一次添加需要在总个数的基础上添加
                v.index = self.fileNum;
                // 添加一个之后自增
                self.fileNum++;
            });
            // 先把当前选中的文件保存备份
            var selectFile = this.uploadFile;  
            // 要把全部的文件都保存下来，因为删除所使用的下标是全局的变量
            this.perUploadFile = this.perUploadFile.concat(this.uploadFile);
            // 合并下上传的文件
            this.uploadFile = this.lastUploadFile.concat(this.uploadFile);
            
            // 执行选择回调
            this.onSelect(selectFile, this.uploadFile);
            // console.info("继续选择");
            // console.info(this.uploadFile);
            return this;
        },
        // 处理需要删除的文件 isCb代表是否回调onDelete方法
        // 因为上传完成并不希望在页面上删除div，但是单独点击删除的时候需要删除div 所以用isCb做判断
        funDeleteFile : function(delFileIndex, isCb){
            var self = this;  // 在each中this指向没个v 所以先将this保留
            
            var tmpFile = [];  // 用来替换的文件数组
            // 合并下上传的文件
            var delFile = this.perUploadFile[delFileIndex];
            // console.info(delFile);
            // 目前是遍历所有的文件，对比每个文件 删除
            $.each(this.uploadFile, function(k, v){
                if(delFile != v){
                    // 如果不是删除的那个文件 就放到临时数组中
                    tmpFile.push(v);
                }else{
                    
                }
            });
            this.uploadFile = tmpFile;
            if(isCb){  // 执行回调
                // 回调删除方法，供外部进行删除效果的实现
                self.onDelete(delFile, this.uploadFile);
            }
            
            // console.info("还剩这些文件没有上传:");
            // console.info(this.uploadFile);
            return true;
        },
        // 上传多个文件
        funUploadFiles : function(){
            var self = this;  // 在each中this指向没个v 所以先将this保留
            // 遍历所有文件 ，在调用单个文件上传的方法
            $.each(this.uploadFile, function(k, v){
                self.funUploadFile(v);
            });
        },
        // 上传单个个文件
        funUploadFile : function(file){
            var self = this;  // 在each中this指向没个v 所以先将this保留
            var formdata = new FormData();
            formdata.append("fileList", file);                     
            var xhr = new XMLHttpRequest();
            // 绑定上传事件
            // 进度
            xhr.upload.addEventListener("progress",     function(e){
                // 回调到外部
                self.onProgress(file, e.loaded, e.total);
            }, false); 
            // 完成
            xhr.addEventListener("load", function(e){
                // 从文件中删除上传成功的文件 false是不执行onDelete回调方法
                self.funDeleteFile(file.index, false);
                // 回调到外部
                self.onSuccess(file, xhr.responseText);
                if(self.uploadFile.length==0){
                    // 回调全部完成方法
                    self.onComplete("全部完成");
                }
            }, false);  
            // 错误
            xhr.addEventListener("error", function(e){
                // 回调到外部
                self.onFailure(file, xhr.responseText);
            }, false);  
            
            xhr.open("POST",self.url, true);
            // xhr.setRequestHeader("X_FILENAME", file.name);
            xhr.setRequestHeader("X_FILENAME", ((new Date()).valueOf()));
            // console.log(((new Date()).valueOf()));
            xhr.send(formdata);
        },
        // 返回需要上传的文件
        funReturnNeedFiles : function(){
            return this.uploadFile;
        },
        
        // 初始化
        init : function(){  // 初始化方法，在此给选择、上传按钮绑定事件
            var self = this;  // 克隆一个自身
            
            if (this.dragDrop) {
                this.dragDrop.addEventListener("dragover", function(e) { self.funDragHover(e); }, false);
                this.dragDrop.addEventListener("dragleave", function(e) { self.funDragHover(e); }, false);
                this.dragDrop.addEventListener("drop", function(e) { self.funGetFiles(e); }, false);
            }
            
            // 如果选择按钮存在
            if(self.fileInput){
                // 绑定change事件
                this.fileInput.addEventListener("change", function(e) {
                    self.funGetFiles(e); 
                }, false);    
            }
            
            // 如果上传按钮存在
            if(self.uploadInput){
                // 绑定click事件
                this.uploadInput.addEventListener("click", function(e) {
                    self.funUploadFiles(e); 
                }, false);    
            }
        }
};

(function($,undefined){
    $.fn.zyUpload = function(options,param){
        var otherArgs = Array.prototype.slice.call(arguments, 1);
        if (typeof options == 'string') {
            var fn = this[0][options];
            if($.isFunction(fn)){
                return fn.apply(this, otherArgs);
            }else{
                throw ("zyUpload - No such method: " + options);
            }
        }

        return this.each(function(){
            var para = {};    // 保留参数
            var self = this;  // 保存组件对象
            
            var defaults = {
                    width            : "700px",                      // 宽度
                    height           : "400px",                      // 宽度
                    itemWidth        : "140px",                     // 文件项的宽度
                    itemHeight       : "120px",                     // 文件项的高度
                    url              : "",      // 上传文件的路径
                    multiple         : true,                          // 是否可以多个文件上传
                    dragDrop         : true,                          // 是否可以拖动上传文件
                    del              : true,                          // 是否可以删除文件
                    finishDel        : false,                          // 是否在上传文件完成后删除预览
                    /* 提供给外部的接口方法 */
                    onSelect         : function(selectFiles, files){},// 选择文件的回调方法
																		// selectFile:当前选中的文件
																		// allFiles:还没上传的全部文件
                    onDelete         : function(file, files){},     // 删除一个文件的回调方法
																	// file:当前删除的文件
																	// files:删除之后的文件
                    onSuccess         : function(file){},            // 文件上传成功的回调方法
                    onFailure         : function(file){},            // 文件上传失败的回调方法
                    onComplete         : function(responseInfo){},    // 上传完成的回调方法
            };
            
            para = $.extend(defaults,options);
            
            this.init = function(){
                this.createHtml();  // 创建组件html
                this.createCorePlug();  // 调用核心js
            };
            
            /**
			 * 功能：创建上传所使用的html 参数: 无 返回: 无
			 */
            this.createHtml = function(){
                var multiple = "";  // 设置多选的参数
                para.multiple ? multiple = "multiple" : multiple = "";
                var html= '';
                
                if(para.dragDrop){
                    // 创建带有拖动的html
                    html += '<form id="uploadForm" action="'+para.url+'" method="post" enctype="multipart/form-data">';
                    html += '    <div class="upload_box">';
                    html += '        <div class="upload_main">';
                    html += '            <div class="upload_choose">';
                    html += '                <div class="convent_choice">';
                    html += '                    <div class="andArea">';
                    html += '                        <div class="filePicker"><i class="fa fa-cloud-upload"></i> 点击选择图片</div>';
                    html += '                        <input id="fileImage" type="file" size="30" name="fileselect[]" '+multiple+'>';
                    html += '                    </div>';
                    html += '                </div>';
                    html += '                <span id="fileDragArea" class="upload_drag_area">或者将图片拖到此处</span>';
                    html += '            </div>';
                    html += '            <div class="status_bar">';
                    html += '                <div id="status_info" class="info">选中0张图片，共0B。</div>';
                    html += '                <div class="btns">';
                    html += '                    <div class="webuploader_pick">继续选择</div>';
                    html += '                    <div class="upload_btn">开始上传</div>';
                    html += '                </div>';
                    html += '            </div>';
                    html += '            <div id="preview" class="upload_preview"></div>';
                    html += '        </div>';
                    html += '        <div class="upload_submit">';
                    html += '            <button type="button" id="fileSubmit" class="upload_submit_btn">确认上传图片</button>';
                    html += '        </div>';
                    html += '        <div id="uploadInf" class="upload_inf"></div>';
                    html += '    </div>';
                    html += '</form>';
                }else{
                    var imgWidth = parseInt(para.itemWidth.replace("px", ""))-15;
                    
                    // 创建不带有拖动的html
                    html += '<form id="uploadForm" action="'+para.url+'" method="post" enctype="multipart/form-data">';
                    html += '    <div class="upload_box">';
                    html += '        <div class="upload_main single_main">';
                    html += '            <div class="status_bar">';
                    html += '                <div id="status_info" class="info">选中0张图片，共0B。</div>';
                    html += '                <div class="btns">';
                    html += '                    <input id="fileImage" type="file" size="30" name="fileselect[]" '+multiple+'>';
                    html += '                    <div class="webuploader_pick">选择图片</div>';
                    html += '                    <div class="upload_btn">开始上传</div>';
                    html += '                </div>';
                    html += '            </div>';
                    html += '            <div id="preview" class="upload_preview">';
                    html += '                <div class="add_upload">';
                    html += '                    <a style="height:'+para.itemHeight+';width:'+para.itemWidth+';" title="点击添加图片" id="rapidAddImg" class="add_imgBox" href="javascript:void(0)">';
                    html += '                        <div class="uploadImg" style="width:'+imgWidth+'px">';
                    html += '                            <img class="upload_image" src="control/images/add_img.png" style="width:expression(this.width > '+imgWidth+' ? '+imgWidth+'px : this.width)" />';
                    html += '                        </div>';
                    html += '                    </a>';
                    html += '                </div>';
                    html += '            </div>';
                    html += '        </div>';
                    html += '        <div class="upload_submit">';
                    html += '            <button type="button" id="fileSubmit" class="upload_submit_btn">确认上传图片</button>';
                    html += '        </div>';
                    html += '        <div id="uploadInf" class="upload_inf"></div>';
                    html += '    </div>';
                    html += '</form>';
                }
                
                $(self).append(html).css({"width":para.width,"height":para.height});
                
                // 初始化html之后绑定按钮的点击事件
                this.addEvent();
            };
            
            /**
			 * 功能：显示统计信息和绑定继续上传和上传按钮的点击事件 参数: 无 返回: 无
			 */
            this.funSetStatusInfo = function(files){
                var size = 0;
                var num = files.length;
                $.each(files, function(k,v){
                    // 计算得到文件总大小
                    size += v.size;
                });
                
                // 转化为kb和MB格式。文件的名字、大小、类型都是可以现实出来。
                if (size > 1024 * 1024) {                    
                    size = (Math.round(size * 100 / (1024 * 1024)) / 100).toString() + 'MB';                
                } else {                    
                    size = (Math.round(size * 100 / 1024) / 100).toString() + 'KB';                
                }  
                
                // 设置内容
                $("#status_info").html("选中"+num+"张文件，共"+size+"。");
            };
            
            /**
			 * 功能：过滤上传的文件格式等 参数: files 本次选择的文件 返回: 通过的文件
			 */
            this.funFilterEligibleFile = function(files){
                var arrFiles = [];  // 替换的文件数组
                for (var i = 0, file; file = files[i]; i++) {
                    if (file.size >= 51200000) {
                        alert('您这个"'+ file.name +'"文件大小过大');    
                    } else {
                        // 在这里需要判断当前所有文件中
                        arrFiles.push(file);    
                    }
                }
                return arrFiles;
            };
            
            /**
			 * 功能： 处理参数和格式上的预览html 参数: files 本次选择的文件 返回: 预览的html
			 */
            this.funDisposePreviewHtml = function(file, e){
                var html = "";
                var imgWidth = parseInt(para.itemWidth.replace("px", ""))-15;
                
                // 处理配置参数删除按钮
                var delHtml = "";
                if(para.del){  // 显示删除按钮
                    delHtml = '<span class="file_del" data-index="'+file.index+'" title="删除"></span>';
                }
                
                // 处理不同类型文件代表的图标
                var fileImgSrc = "control/images/fileType/";
                if(file.type.indexOf("rar") > 0){
                    fileImgSrc = fileImgSrc + "rar.png";
                }else if(file.type.indexOf("zip") > 0){
                    fileImgSrc = fileImgSrc + "zip.png";
                }else if(file.type.indexOf("text") > 0){
                    fileImgSrc = fileImgSrc + "txt.png";
                }else{
                    fileImgSrc = fileImgSrc + "file.png";
                }
                
                
                // 图片上传的是图片还是其他类型文件
                if (file.type.indexOf("image") == 0) {
                    html += '<div id="uploadList_'+ file.index +'" class="upload_append_list">';
                    html += '    <div class="file_bar">';
                    html += '        <div style="padding:5px;">';
                    html += '            <p class="file_name">' + file.name + '</p>';
                    html += delHtml;   // 删除按钮的html
                    html += '        </div>';
                    html += '    </div>';
                    html += '    <a style="height:'+para.itemHeight+';width:'+para.itemWidth+';" href="#" class="imgBox">';
                    html += '        <div class="uploadImg" style="width:'+imgWidth+'px">';                
                    html += '            <img id="uploadImage_'+file.index+'" class="upload_image" src="' + e.target.result + '" style="width:expression(this.width > '+imgWidth+' ? '+imgWidth+'px : this.width)" />';                                                                 
                    html += '        </div>';
                    html += '    </a>';
                    html += '    <p id="uploadProgress_'+file.index+'" class="file_progress"></p>';
                    html += '    <p id="uploadFailure_'+file.index+'" class="file_failure">上传失败，请重试</p>';
                    html += '    <p id="uploadSuccess_'+file.index+'" class="file_success"></p>';
                    html += '</div>';
                    
                }else{
                    html += '<div id="uploadList_'+ file.index +'" class="upload_append_list">';
                    html += '    <div class="file_bar">';
                    html += '        <div style="padding:5px;">';
                    html += '            <p class="file_name">' + file.name + '</p>';
                    html += delHtml;   // 删除按钮的html
                    html += '        </div>';
                    html += '    </div>';
                    html += '    <a style="height:'+para.itemHeight+';width:'+para.itemWidth+';" href="#" class="imgBox">';
                    html += '        <div class="uploadImg" style="width:'+imgWidth+'px">';                
                    html += '            <img id="uploadImage_'+file.index+'" class="upload_image" src="' + fileImgSrc + '" style="width:expression(this.width > '+imgWidth+' ? '+imgWidth+'px : this.width)" />';                                                                 
                    html += '        </div>';
                    html += '    </a>';
                    html += '    <p id="uploadProgress_'+file.index+'" class="file_progress"></p>';
                    html += '    <p id="uploadFailure_'+file.index+'" class="file_failure">上传失败，请重试</p>';
                    html += '    <p id="uploadSuccess_'+file.index+'" class="file_success"></p>';
                    html += '</div>';
                }
                
                return html;
            };
            
            /**
			 * 功能：调用核心插件 参数: 无 返回: 无
			 */
            this.createCorePlug = function(){
                var params = {
                    fileInput: $("#fileImage").get(0),
                    uploadInput: $("#fileSubmit").get(0),
                    dragDrop: $("#fileDragArea").get(0),
                    url: $("#uploadForm").attr("action"),
                    
                    filterFile: function(files) {
                        // 过滤合格的文件
                        return self.funFilterEligibleFile(files);
                    },
                    onSelect: function(selectFiles, allFiles) {
                        para.onSelect(selectFiles, allFiles);  // 回调方法
                        self.funSetStatusInfo(ZYFILE.funReturnNeedFiles());  // 显示统计信息
                        var html = '', i = 0;
                        // 组织预览html
                        var funDealtPreviewHtml = function() {
                            file = selectFiles[i];
                            if (file) {
                                var reader = new FileReader()
                                reader.onload = function(e) {
                                    // 处理下配置参数和格式的html
                                    html += self.funDisposePreviewHtml(file, e);
                                    
                                    i++;
                                    // 再接着调用此方法递归组成可以预览的html
                                    funDealtPreviewHtml();
                                }
                                reader.readAsDataURL(file);
                            } else {
                                // 走到这里说明文件html已经组织完毕，要把html添加到预览区
                                funAppendPreviewHtml(html);
                            }
                        };
                        
                        // 添加预览html
                        var funAppendPreviewHtml = function(html){
                            // 添加到添加按钮前
                            if(para.dragDrop){
                                $("#preview").append(html);
                            }else{
                                $(".add_upload").before(html);
                            }
                            // 绑定删除按钮
                            funBindDelEvent();
                            funBindHoverEvent();
                        };
                        
                        // 绑定删除按钮事件
                        var funBindDelEvent = function(){
                            if($(".file_del").length>0){
                                // 删除方法
                                $(".file_del").click(function() {
                                    ZYFILE.funDeleteFile(parseInt($(this).attr("data-index")), true);
                                    return false;
                                });
                            }
                            
                            if($(".file_edit").length>0){
                                // 编辑方法
                                $(".file_edit").click(function() {
                                    // 调用编辑操作
                                    // ZYFILE.funEditFile(parseInt($(this).attr("data-index")),
									// true);
                                    return false;    
                                });
                            }
                        };
                        
                        // 绑定显示操作栏事件
                        var funBindHoverEvent = function(){
                            $(".upload_append_list").hover(
                                function (e) {
                                    $(this).find(".file_bar").addClass("file_hover");
                                },function (e) {
                                    $(this).find(".file_bar").removeClass("file_hover");
                                }
                            );
                        };
                        
                        funDealtPreviewHtml();        
                    },
                    onDelete: function(file, files) {
                        // 移除效果
                        $("#uploadList_" + file.index).fadeOut();
                        // 重新设置统计栏信息
                        self.funSetStatusInfo(files);
                        // console.info("剩下的文件");
                        // console.info(files);
                        para.onDelete(file, files);  // 回调方法
                    },
                    onProgress: function(file, loaded, total) {
                        var eleProgress = $("#uploadProgress_" + file.index), percent = (loaded / total * 100).toFixed(2) + '%';
                        if(eleProgress.is(":hidden")){
                            eleProgress.show();
                        }
                        eleProgress.css("width",percent);
                    },
                    onSuccess: function(file, response) {
                        $("#uploadProgress_" + file.index).hide();
                        $("#uploadSuccess_" + file.index).show();
                        // $("#uploadInf").append("<p>上传成功，文件地址是：" + response +
						// "</p>");
                        // 根据配置参数确定隐不隐藏上传成功的文件
                        if(para.finishDel){
                            // 移除效果
                            $("#uploadList_" + file.index).fadeOut();
                            // 重新设置统计栏信息
                            self.funSetStatusInfo(ZYFILE.funReturnNeedFiles());
                        };
                        para.onSuccess(file,response);// 回调方法
                    },
                    onFailure: function(file) {
                        $("#uploadProgress_" + file.index).hide();
                        $("#uploadSuccess_" + file.index).show();
                        $("#uploadInf").append("<p>文件" + file.name + "上传失败！</p>");    
                        // $("#uploadImage_" + file.index).css("opacity", 0.2);
                        para.onFailure(file);
                    },
                    onComplete: function(response){
                        // console.info(response);
                        para.onComplete(response); // 回调方法
                    },
                    onDragOver: function() {
                        $(this).addClass("upload_drag_hover");
                    },
                    onDragLeave: function() {
                        $(this).removeClass("upload_drag_hover");
                    }

                };
                
                ZYFILE = $.extend(ZYFILE, params);
                ZYFILE.init();
            };
            
            /**
			 * 功能：绑定事件 参数: 无 返回: 无
			 */
            this.addEvent = function(){
                // 如果快捷添加文件按钮存在
                if($(".filePicker").length > 0){
                    // 绑定选择事件
                    $(".filePicker").bind("click", function(e){
                        $("#fileImage").click();
                    });
                }
                
                // 绑定继续添加点击事件
                $(".webuploader_pick").bind("click", function(e){
                    $("#fileImage").click();
                });
                
                // 绑定上传点击事件
                $(".upload_btn").bind("click", function(e){
                    // 判断当前是否有文件需要上传
                    if(ZYFILE.funReturnNeedFiles().length > 0){
                        $("#fileSubmit").click();
                    }else{
                        alert("请先选中文件再点击上传");
                    }
                });
                
                // 如果快捷添加文件按钮存在
                if($("#rapidAddImg").length > 0){
                    // 绑定添加点击事件
                    $("#rapidAddImg").bind("click", function(e){
                        $("#fileImage").click();
                    });
                }
            };
            
            
            // 初始化上传控制层插件
            this.init();
        });
    };
})(jQuery);


/*
 * ! Copyright (c) 2013 Brandon Aaron (http://brandon.aaron.sh) Licensed under
 * the MIT License (LICENSE.txt).
 * 
 * Version: 3.1.12
 * 
 * Requires: jQuery 1.2.2+
 */
//!function(a){"function"==typeof define&&define.amd?define(["jquery"],a):"object"==typeof exports?module.exports=a:a(jQuery)}(function(a){function b(b){var g=b||window.event,h=i.call(arguments,1),j=0,l=0,m=0,n=0,o=0,p=0;if(b=a.event.fix(g),b.type="mousewheel","detail"in g&&(m=-1*g.detail),"wheelDelta"in g&&(m=g.wheelDelta),"wheelDeltaY"in g&&(m=g.wheelDeltaY),"wheelDeltaX"in g&&(l=-1*g.wheelDeltaX),"axis"in g&&g.axis===g.HORIZONTAL_AXIS&&(l=-1*m,m=0),j=0===m?l:m,"deltaY"in g&&(m=-1*g.deltaY,j=m),"deltaX"in g&&(l=g.deltaX,0===m&&(j=-1*l)),0!==m||0!==l){if(1===g.deltaMode){var q=a.data(this,"mousewheel-line-height");j*=q,m*=q,l*=q}else if(2===g.deltaMode){var r=a.data(this,"mousewheel-page-height");j*=r,m*=r,l*=r}if(n=Math.max(Math.abs(m),Math.abs(l)),(!f||f>n)&&(f=n,d(g,n)&&(f/=40)),d(g,n)&&(j/=40,l/=40,m/=40),j=Math[j>=1?"floor":"ceil"](j/f),l=Math[l>=1?"floor":"ceil"](l/f),m=Math[m>=1?"floor":"ceil"](m/f),k.settings.normalizeOffset&&this.getBoundingClientRect){var s=this.getBoundingClientRect();o=b.clientX-s.left,p=b.clientY-s.top}return b.deltaX=l,b.deltaY=m,b.deltaFactor=f,b.offsetX=o,b.offsetY=p,b.deltaMode=0,h.unshift(b,j,l,m),e&&clearTimeout(e),e=setTimeout(c,200),(a.event.dispatch||a.event.handle).apply(this,h)}}function c(){f=null}function d(a,b){return k.settings.adjustOldDeltas&&"mousewheel"===a.type&&b%120===0}var e,f,g=["wheel","mousewheel","DOMMouseScroll","MozMousePixelScroll"],h="onwheel"in document||document.documentMode>=9?["wheel"]:["mousewheel","DomMouseScroll","MozMousePixelScroll"],i=Array.prototype.slice;if(a.event.fixHooks)for(var j=g.length;j;)a.event.fixHooks[g[--j]]=a.event.mouseHooks;var k=a.event.special.mousewheel={version:"3.1.12",setup:function(){if(this.addEventListener)for(var c=h.length;c;)this.addEventListener(h[--c],b,!1);else this.onmousewheel=b;a.data(this,"mousewheel-line-height",k.getLineHeight(this)),a.data(this,"mousewheel-page-height",k.getPageHeight(this))},teardown:function(){if(this.removeEventListener)for(var c=h.length;c;)this.removeEventListener(h[--c],b,!1);else this.onmousewheel=null;a.removeData(this,"mousewheel-line-height"),a.removeData(this,"mousewheel-page-height")},getLineHeight:function(b){var c=a(b),d=c["offsetParent"in a.fn?"offsetParent":"parent"]();return d.length||(d=a("body")),parseInt(d.css("fontSize"),10)||parseInt(c.css("fontSize"),10)||16},getPageHeight:function(b){return a(b).height()},settings:{adjustOldDeltas:!0,normalizeOffset:!0}};a.fn.extend({mousewheel:function(a){return a?this.bind("mousewheel",a):this.trigger("mousewheel")},unmousewheel:function(a){return this.unbind("mousewheel",a)}})});

