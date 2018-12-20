/**
 * 【统计分析】功能eChart图表用
 */

;
(function(global, factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        // For CommonJS and CommonJS-like environments where a proper `window`
        // is present, execute the factory and get jQuery.
        // For environments that do not have a `window` with a `document`
        // (such as Node.js), expose a factory as module.exports.
        // This accentuates the need for the creation of a real `window`.
        // e.g. var jQuery = require("jquery")(window);
        // See ticket #14549 for more info.
        module.exports = global.document ?
            factory(global) :
            function(w) {
                if (!w.document) {
                    throw new Error("jQuery requires a window with a document");
                }
                return factory(w);
            };
    } else {
        factory(global);
    }

})(typeof window !== "undefined" ? window : this, function(window) {
    'use strict';

    var $ = require('jquery');
    var echarts = require('echarts');
    var doc = window.document;

    /**
     * 该属性控制多个echart图表的共存/排他显示行为
     * true --  echart统计图具有排他性,即页面每次只能显示唯一一个图表(radio)
     * false -- echart统计图具有共存性,即页面可以共存显示多个图表(动态添加/删除)(checkbox)
     */
    var isChartExclusive = false,
        exclusiveId = undefined;
    // 统计图实例对象临时变量
    var aModalChart = undefined;
    // 保存动态创建echart图的容器DIV
    var eChartContainer = $(doc);

    // [isExclusive=false]多个echart统计图实现用---Start
    var chartFactory = function() {
        /** object { // 
         *      classes: [] 生成统计图DOM节点的自定义class属性
         *      container: string 创建echart图表的DOM所在的上级DOM属性id值
         *   }
         */
        this.option = undefined;
        /**
         * 当前统计图的自定义配置项(可扩展)
         *    例: {
         *       title: {
         *         text: '', // 统计图标题
         *         left: 'center'
         *       }
         *       legend: {}...
         *     }
         */
        this.chartOption = undefined;
    };
    chartFactory.prototype = {
        /* 初始化指定echarts实例对象(如果存在) */
        initChartIns: function(domId) {
            aModalChart = factoryInstances[domId];
            if (!aModalChart) return false;
            // 清空本地数据缓存
            aModalChart.initChartIns();
            aModalChart = undefined;
        },
        /* 初始化echarts实例对象(如果存在)
         * domId string 销毁eChart实例对应的DOM节点Id
         */
        clearChartIns: function(domId) {
            if (domId) {
                aModalChart = factoryInstances[domId];
                if (!aModalChart) return false;
                // 清空本地数据缓存
                aModalChart.clearChartIns();
                aModalChart = undefined;
            } else {
                /* 如果每次只显示一个echart图的话,需要删除之前显示的echart图表
                        并初始化factoryInstances对象,默认[isExclusive=true]情况下
                        生成的排他性echart统计图表不会放在factoryInstances对象内存中
                        只有[isExclusive=false]情况下才会将每次新规的chart实例放进该数组内存*/
                for (var key in factoryInstances) {
                    var aInstance = factoryInstances[key];
                    if (!aInstance) return false;
                    // 清空本地数据缓存
                    aInstance.clearChartIns();
                }
            }
        },
        /**
         * 销毁统计图实例,释放资源
         * domId string 销毁eChart实例对应的DOM节点Id
         */
        destroyEchartIns: function(domId) {
            if (domId) {
                aModalChart = factoryInstances[domId];
                if (!aModalChart) return false;
                aModalChart.destroyEchartIns();
                // 从factoryInstances中删除记录
                delete factoryInstances[domId];
                aModalChart = undefined;
            } else {
                for (var key in factoryInstances) {
                    aModalChart = factoryInstances[key];
                    if (aModalChart) aModalChart.destroyEchartIns();
                }
                factoryInstances = {};
            }
        },
        /**
         * 多个eChart实例调用指定方法
         * arrChartKeys array|string
         * params array
         */
        resize: function(arrChartKeys, params) {
            var aChartInstance = undefined,
                chartPro = modalChart.prototype;
            params = chartPro.ensureArray(params);
            arrChartKeys = chartPro.ensureArray(arrChartKeys);
            $.each(arrChartKeys, function(index, aKey) {
                if (!(aChartInstance = factoryInstances[aKey])) return false;
                aChartInstance.resize.apply(aChartInstance, params);
            });
        }
    };
    var factoryInstances = new chartFactory();
    // [isExclusive=false]多个echart统计图实现用---End

    /**该对象是用于取得并生成eChart柱状图数据模板用*/
    var aBarOption = {
        title: {
            left: 'left', // left/center/right
            backgroundColor: '#C1FFC1'
        },
        color: ['#3398DB'],
        tooltip: {
            trigger: 'axis',
            axisPointer: { // 坐标轴指示器，坐标轴触发有效
                type: 'shadow' // 默认为直线，可选为:'line' | 'shadow'
            }
        },
        series: [{
            name: '',
            type: 'bar',
            label: {
                normal: {
                    show: true,
                    position: 'inside'
                }
            },
            markPoint: {
                symbol: 'pin', // 标记的图形。
                // 提供的标记类型包括 'circle', 'rect', 'roundRect', 'triangle', 'diamond', 'pin', 'arrow'
                data: [{
                    type: 'max',
                    name: '最大值',
                    itemStyle: {
                        normal: {
                            opacity: 0.7
                        }
                    },
                    label: {
                        normal: {
                            show: true,
                            position: 'inside'
                        }
                    }
                }, {
                    type: 'min',
                    name: '最小值',
                    itemStyle: {
                        normal: {
                            opacity: 0.7
                        }
                    },
                    label: {
                        normal: {
                            show: true,
                            position: 'inside'
                        }
                    }
                }]
            },
            barWidth: '60%',
            data: []
        }]
    };
    /**该对象是用于取得并生成eChart饼状图数据模板用*/
    var aPieOption = {
        //backgroundColor: '#2c343c', // 饼状图画布背景色
        title: {
            left: 'left', // left/center/right
            backgroundColor: '#C1FFC1'
        },
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        series: [{
            name: '统计信息',
            type: 'pie',
            radius: '55%',
            center: ['50%', '50%'],
            data: [], // 饼状图显示数据
            itemStyle: {
                emphasis: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            },
            animationType: 'scale',
            animationEasing: 'elasticOut',
            animationDelay: function(idx) {
                return Math.random() * 200;
            }
        }]
    };

    /**该对象是用于取得并生成eChart折线图数据模板用*/
    var aLineOption = {
        title: {
            left: 'left', // left/center/right
            backgroundColor: '#C1FFC1'
        },
        tooltip: {
            trigger: 'axis'
        },
        series: [{ // 第一条折线
            name: '折线名字',
            type: 'line',
            data: [], // 第一条折线数据
            label: {
                normal: {
                    show: true,
                    position: 'bottom'
                }
            },
            markPoint: {
                data: [{
                    type: 'max',
                    name: '最大值',
                    itemStyle: {
                        normal: {
                            opacity: 0.7
                        }
                    },
                    label: {
                        normal: {
                            show: true,
                            position: 'inside'
                        }
                    }
                }, {
                    type: 'min',
                    name: '最小值',
                    itemStyle: {
                        normal: {
                            opacity: 0.7
                        }
                    },
                    label: {
                        normal: {
                            show: true,
                            position: 'inside'
                        }
                    }
                }]
            },
            markLine: {
                precision: 0,
                data: [{
                        type: 'average',
                        name: '平均值'
                    },
                    [{
                        symbol: 'none',
                        x: '90%',
                        yAxis: 'max'
                    }, {
                        symbol: 'circle',
                        label: {
                            normal: {
                                position: 'end',
                                formatter: '最大值'
                            }
                        },
                        type: 'max',
                        name: '最高点'
                    }]
                ]
            }
        }]
    };

    /* --以下为单个统计图的实现处理-- */
    function modalChart(option) {
        /**  object { // 统计图初期设置
         *      isExclusive: boolean 是否创建具有排他性的echart图表
         *      classes: [] 生成统计图DOM节点的自定义class属性
         *      container: string 创建echart图表的DOM所在的上级DOM属性id值,
         *      ajax: {
         *          url: {},
         *          data: {}
         *      }
         *   }
         */
        this.option = option || {};
        /**
         * 当前统计图的配置项(可扩展)
         *     例: {
         *       title: {
         *         text: '', // 统计图标题
         *         left: 'center'
         *       }
         *     }
         */
        this.chartOption = undefined;
        /**
         * 当前统计图对应的DOM节点ID
         */
        this.eChartId = '';
        /**
         * 当前统计图的实例对象
         */
        this.eChart = undefined;
        /**
         * 当前统计图的类型(bar/line/pie)
         */
        this.eChartType = undefined;
        /**
         * 当前统计图的最新后台响应数据
         */
        this.eChartServerData = [];
    };
    modalChart.prototype = {
        /**
         * 将传入参数转换为Array类型
         */
        ensureArray: function(para) {
            var aArray = [];
            if (!$.isArray(para)) {
                aArray.push(para);
            } else {
                aArray = para;
            }
            return aArray;
        },
        createChartFactory: function(option, chartOption) {
            factoryInstances.option = option;
            factoryInstances.chartOption = chartOption;

            if (option && option.container) eChartContainer = $(option.container);
            if (eChartContainer.length === 0) eChartContainer = $(doc);
            return factoryInstances;
        },
        /**
         * 初始化页面变量,该工具的入口函数
         * domId string 当前选择创建echart图表的DOM属性id值
         * option 
         *   object {
         *       isExclusive: boolean 是否创建具有排他性的echart图表
         *       container: string 创建echart图表的DOM所在的上级DOM属性id值
         *       type: string bar/line/pine 统计图显示类型
         *   }
         */
        init: function(domId, option, aChartOption) {
            option = option || {};
            aChartOption = aChartOption || {};
            this.option = option;
            this.chartOption = aChartOption;
            this.eChartId = domId;

            var container = option.container || aChartOption.container;

            if (domId && typeof(domId) == 'string') {
                domId = domId.replace(/\#/g, '');
            }
            if (isChartExclusive = (typeof(option.isExclusive) === 'undefined' || !!option.isExclusive)) {
                if (domId) exclusiveId = domId;
            }
            if (container) eChartContainer = $(container);
            if (eChartContainer.length === 0) eChartContainer = $(doc);
            if (domId) this.createChart(domId, option);

            if (isChartExclusive) return this;

            // 多统计图共存显示情况下(isChartExclusive=false)
            // 返回保存[modalChart]实例的容器对象
            return factoryInstances;
        },
        /**
         * ([div#echartContainer]容器内)动态创建echart统计图
         * domId string 当前选择的统计方向flag
         * option object 生成统计图DOM的配置
         */
        createChart: function(domId, option) {
            if (!domId) return false;
            if (typeof(domId) === 'string') {
                domId = domId.replace(/\#/g, '');
            } else {
                return false;
            }
            var _self = this;
            this.eChartId = domId;
            this.eChartServerData = [];

            if (isChartExclusive) {
                // 切换为[exclusiveId]参数
                if (exclusiveId) domId = exclusiveId;
                if (!domId) {
                    return false;
                }
                /* [isExclusive=true]情况下,currentEchart的指向唯一且不变 */
                if (!_self.eChart) {
                    _self.eChart = this.newEchartInstance(domId, option);
                } else {
                    _self.eChart.clear();
                }
                return _self;
            }
            // --- 以下是[isExclusive===false]情况的处理逻辑 ---
            // 如果已存在该chartCase对应的echart统计图,则初始化它
            // 默认eChartContainer中有domId对应的DOM则认为已经它已经初始化过了
            var $thisDom = eChartContainer.find('div#' + domId);
            if ($thisDom.length > 0 && (aModalChart = factoryInstances[domId])) {
                if (aModalChart.eChart) aModalChart.eChart.clear();
                aModalChart = undefined;
            } else {
                _self.eChart = _self.newEchartInstance(domId, option);
                factoryInstances[domId] = _self;
            }
            return factoryInstances;
        },
        /**
         * 动态追加echart图表节点并返回echart图表实例对象
         * id string 指定追加的DOM节点ID值
         * option object 生成统计图DOM的配置
         */
        newEchartInstance: function(domId, option) {
            if (!domId) return false;
            var aIns = this.aEchartIns(domId);
            if (aIns) { // 已经有该节点的eChart实例了
                aIns.clear();
                return aIns;
            }
            option = !$.isEmptyObject(option) && option ||
                !$.isEmptyObject(this.option) && this.option ||
                !isChartExclusive && factoryInstances.option || {};
            // 如果不存在则追加当前对应echart图的DOM节点
            if ($.isArray(option.classes)) {
                // 追加自定义class属性(例:一行多个chart -> col-md-*/col-lg-*)
                eChartContainer.append('<div id="' +
                    domId +
                    '" class="' +
                    option.classes.join(' ') +
                    '"></div>');
            } else { // 默认一行只显示一个chart
                eChartContainer.append('<div id="' +
                    domId +
                    '" class="col-lg-12 aEchart"></div>');
            }
            // 显示并实例化当前选择的radio对应统计图的实例
            var $thisDom = eChartContainer.find('div#' + domId).first();
            $thisDom.addClass('active');
            return echarts.init($thisDom.get(0));
        },
        /* 取得指定domId的echarts实例对象 */
        aEchartIns: function(domId) {
            if (!!isChartExclusive) {
                return this.eChart;
            } else {
                return domId && factoryInstances[domId] && factoryInstances[domId].eChart;
            }
        },
        /**
         * eChart实例resize方法
         * opts object { width?: number|string,
         *               height?: number|string,
         *               silent?: boolean}
         */
        resize: function(opts) {
            if (!this.eChart) return false;
            this.eChart.resize(opts);
        },
        /* 初始化指定echarts实例对象(如果存在) */
        initChartIns: function() {
            // 清空本地数据缓存
            this.eChartType = undefined;
            this.eChartServerData = [];
            this.showEchartView();
        },
        /* 初始化echarts实例对象(如果存在)
         */
        clearChartIns: function() {
            // 清空本地数据缓存
            this.eChartType = undefined;
            this.eChartServerData = [];
            this.eChart && this.eChart.clear();
        },
        /**
         * 销毁统计图实例,释放资源
         */
        destroyEchartIns: function() {
            // 清空本地数据缓存
            this.eChartId = undefined;
            this.eChartType = undefined;
            this.eChartServerData = [];
            var insEchart = this.eChart;
            if (!insEchart) return false;
            var dom = insEchart.getDom();
            // 销毁实例，实例销毁后无法再被使用。
            insEchart.dispose();
            // 从容器中移除该释放资源的实例对应的DON节点
            $(dom).remove();
        },
        /**
         * 处理ajax请求参数并返回处理结果
         * params object 异步请求参数
         * callback object 回调逻辑处理
         */
        ajaxGenerate: function(params, callback) {
            var _settings = {};
            params = params || {};
            params.data = params.data || {};

            // 请求方式
            if (typeof params.async === "boolean") {
                _settings.async = params.async;
            }
            // 请求url路径
            _settings.url = params.url;
            // 请求类型
            _settings.type = params.type || 'get';
            // 请求参数
            _settings.data = params.data || {};
            // 请求响应类型
            _settings.dataType = params.dataType || "json";
            // 请求不设置缓存
            _settings.cache = false;
            // timeout设置(默认 8秒)
            _settings.timeout = params.timeout || 30000;
            // 回调处理
            if ($.isFunction(params.success)) _settings.success = params.success;
            if ($.isFunction(params.error)) _settings.error = params.error;
            if (!$.isEmptyObject(callback)) { // 指定传来的回调优先级高
                if ($.isFunction(callback.success)) _settings.success = callback.success;
                if ($.isFunction(callback.error)) _settings.error = callback.error;
            }
            return _settings;
        },
        /**
         * 真实执行ajax异步请求处理
         * params object 异步请求参数
         *  { url:xx,
         *     data:xx,
         *     type: xx,
         *     success: function(){...},
         *     ... }
         * callback object-{success: function, error: function} 回调逻辑处理
         */
        doAjax: function(params, callback) {
            if (!params.url) return false;
            var _self = this;
            params.data = params.data || {};
            // 声明默认的统计用请求用ajax参数对象
            var settings = {
                type: 'post',
                async: true, //异步请求
                success: function(data) {
                    _self.eChartServerData = [];
                    //保存并根据取得的后台数据生成数据图表
                    if ($.isArray(data)) {
                        _self.eChartServerData = data;
                    } else if ($.isArray(data && data.dataList)) {
                        _self.eChartServerData = data.dataList;
                    }
                    _self.showEchartView.call(_self, _self.eChartServerData);
                },
                error: function(xhr, textStatus, errorThrown) {
                    if (xhr.readyState == 4) { // 一直等待到服务端响应完全
                        // parent.layer.alert('请求后台统计数据失败,错误状态: ' + textStatus, {
                        //     icon: 0
                        // });
                    }
                }
            };
            params = $.extend(true, settings, params);
            $.ajax(_self.ajaxGenerate(params, callback));
        },
        /**
         * 根据取得的后台数据生成数据图表(step1)
         * dataParams ajax从后台取得的数据
         * chartCase string 统计方向flag
         */
        showConditionChart: function(dataParams, chartCase) {
            chartCase = chartCase || this.eChartId;
            if (!chartCase) return false;
            var _self = this;
            // 执行ajax请求后台统计数据
            this.doAjax({
                type: _self.option.ajax.type,
                url: _self.option.ajax.url,
                data: _self.option.ajax.data
            });
        },
        /**
         * 改变当前统计图的种类(柱状/饼状/折线)
         * type string 切换统计图为目标类型
         */
        achieveChartApi: function(type) {
            var _self = this,
                proName;
            if (type || typeof(type) == 'string') {
                var chCodeAt = type[0].charCodeAt(0);
                if ([98, 108, 112].indexOf(chCodeAt) > -1) {
                    // b / l / p 首字符变为 B / L / P
                    type = type.replace(type[0], String.fromCharCode(chCodeAt - 32));
                }
                proName = 'pack' + type + 'ChartOption';
                this.eChartType = type;
            }
            if (proName && $.isFunction(_self[proName])) return _self[proName];

            // 默认初期显示柱状图
            this.eChartType = 'Bar';
            return _self.packBarChartOption;
        },
        /**
         * 延迟指定时间后生成统计图
         */
        delayEchartView: function(serverData, delay, type) {
            var _self = this;
            delay = !isNaN(delay) ? Math.abs(delay) : 300;
            setTimeout(function() {
                _self.showEchartView(serverData, type);
            }, delay);
        },
        /**
         * 根据指定下标取得series数据
         */
        getSeriesData: function(index) {
            var target = [],
                allSeriesData = this.eChart.getOption().series;
            if (isNaN(index)) return undefined;
            if ($.isArray(allSeriesData)) {
                $.each(allSeriesData, function(aIndex, aData) {
                    target.push(aData.data[index]);
                });
            }
            return target;
        },
        /**
         * 根据取得的后台数据生成数据图表(step2)
         * serverData ajax从后台取得的数据
         * type string 'Bar':柱状图 'Pie':饼状图 'Line':折线图
         */
        showEchartView: function(serverData, type) {
            type = type || this.eChartType || this.option.type || 'Bar';

            var _self = this,
                echartOption = {},
                conditionValue = this.eChartId;
            var aAchieveChartApi = this.achieveChartApi(type);
            var currentEchart = this.eChart;
            serverData = serverData || this.eChartServerData;

            if (conditionValue == 'testCaseOne') {
                echartOption = aAchieveChartApi(serverData, {
                    x: 'Name',
                    y: 'Count'
                }, {
                    title: {
                        text: '标题One'
                    },
                    tooltip: {
                        formatter: ['项目名称:  {b}',
                            '数量: {c}'
                        ].join('<br>')
                    },
                    yAxis: [{
                        name: '数量'
                    }]
                });
            } else if (conditionValue == 'testCaseTwo') {
                echartOption = aAchieveChartApi(serverData, {
                    x: 'Name',
                    y: [{
                        name: '已完成整改数',
                        value: 'CompleteCount'
                    }, {
                        name: '未完成整改数',
                        value: 'IncompleteCount'
                    }]
                }, {
                    title: {
                        text: '按项目统计整改'
                    },
                    tooltip: {
                        formatter: function(seriesDatas) {
                            var name = '',
                                total = 0;
                            if (_self.eChartType == 'Pie') {
                                seriesDatas = _self.getSeriesData(seriesDatas.dataIndex);
                            }
                            if (seriesDatas && seriesDatas.length > 0) {
                                name = seriesDatas[0].name;
                                $.each(seriesDatas, function(index, item) {
                                    total += ($.isNumeric(item.value) ? parseInt(item.value, 10) : 0);
                                });
                            }
                            return [('项目: ' + name), ('总整改个数: ' + total)].join('<br>');
                        }
                    },
                    yAxis: [{
                        name: '整改数'
                    }]
                });
            } else {
                return false;
            }
            // 添加图表控制工具
            if (!$.isEmptyObject(this.chartOption)) $.extend(true, echartOption, this.chartOption);
            this.setChartFeature(echartOption, type);
            if (!isChartExclusive && !$.isEmptyObject(factoryInstances.chartOption)) {
                $.extend(true, echartOption, factoryInstances.chartOption);
            }
            // 根据传来的数据显示统计图内容
            currentEchart.clear();
            // title文字朝向
            if (echartOption.title.direction == 'vertical') {
                //垂直朝向
                echartOption.title.text = echartOption.title.text.split(/\B/).join('\n');
            }
            if (this.eChartType == 'Pie') { // 如果是pie的话,图例必须垂直表示
                if (echartOption.xAxis) delete echartOption.xAxis; // [Pie]不能出现xAxis
                echartOption.legend.type = 'scroll';
                echartOption.legend.orient = 'vertical';
                if (!isNaN(echartOption.legend.myPieTop)) {
                    echartOption.legend.top = echartOption.legend.myPieTop;
                }
                if (echartOption.yAxis) delete echartOption.yAxis;
                if (isChartExclusive) { // 统计图具有排他性(不能共存)且是饼状图
                    $.each(echartOption.series, function(index, aSeries) {
                        aSeries.label = {
                            normal: {
                                formatter: '{a|{a}}\n{h|}\n  {b|{b}：}{c}  {p|{d}%}',
                                backgroundColor: '#eee',
                                borderColor: '#aaa',
                                borderWidth: 1,
                                borderRadius: 4,
                                rich: {
                                    a: {
                                        color: '#999',
                                        lineHeight: 22,
                                        align: 'center'
                                    },
                                    h: {
                                        borderColor: '#aaa',
                                        width: '100%',
                                        borderWidth: 0.5,
                                        height: 0
                                    },
                                    b: {
                                        fontSize: 16,
                                        lineHeight: 33
                                    },
                                    p: {
                                        color: '#eee',
                                        backgroundColor: '#334455',
                                        padding: [2, 4],
                                        borderRadius: 2
                                    }
                                }
                            }
                        };
                    });
                }
            }
            setTimeout(function() { // 保证线程安全
                currentEchart.setOption(echartOption);
            }, 0);
        },
        /**
         * 设置图表显示各工具配置项
         * chartOption object 统计图表配置设定
         * type string 生成图表的种类
         */
        setChartFeature: function(chartOption, type) {
            var _self = this,
                range = ['pie', 'bar', 'line'];
            var aDelBox = {
                    myDelChart: { //自定义按钮属性(必须为[my]开头)
                        show: true, //是否显示
                        title: '移除', //鼠标移动上去显示的文字
                        icon: 'path://M512,32C246.4,32,32,246.4,32,512s214.4,480,480,480,480-214.4,480-480S777.6,32,512,32m201.6,681.6c-12.8,12.8-35.2,12.8-48,0L512,560l-153.6,153.6c-12.8,12.8-35.2,12.8-48,0-12.8-12.8-12.8-35.2,0-48l153.6-153.6-153.6-153.6c-12.8-12.8-12.8-35.2,0-48,12.8-12.8,35.2-12.8,48,0l153.6,153.6,153.6-153.6c12.8-12.8,35.2-12.8,48,0,12.8,12.8,12.8,35.2,0,48L560,512l153.6,153.6c16,12.8,16,35.2,0,48m0,0z', //删除
                        onclick: function(option, apiIns) {
                            //点击事件,这里的option是chart的option信息,apiIns是该chart接口实例对象
                            // parent.layer.confirm('是否删除该统计图表?', {
                            //     icon: 3,
                            //     title: '提示'
                            // }, function(index) {
                            // [echartOption.onDestroy]必是(自定义)函数类型
                            chartOption.onDestroy(_self, option);
                            // 删除统计图并释放资源
                            _self.destroyEchartIns();
                            //     // 关闭确认页面
                            //     parent.layer.close(index);
                            // });
                        }
                    }
                },
                aBarBox = {
                    myBarChart: { //自定义按钮属性(必须为[my]开头)
                        show: true, //是否显示
                        title: '切换为柱状图', //鼠标移动上去显示的文字
                        icon: 'path://M6.7,22.9h10V48h-10V22.9zM24.9,13h10v35h-10V13zM43.2,2h10v46h-10V2zM3.1,58h53.7', //柱状
                        onclick: function(option) { //点击事件,这里的option1是chart的option信息
                            _self.showEchartView(undefined, 'Bar');
                        }
                    }
                },
                aPieBox = {
                    myPieChart: { //自定义按钮属性(必须为[my]开头)
                        show: true, //是否显示
                        title: '切换为饼状图', //鼠标移动上去显示的文字
                        icon: 'path://M512.613,510.535m-446.667,0a446.667,446.667,0,1,0,893.334,0,446.667,446.667,0,1,0-893.334,0Z M512.613,63.868c-246.687,0-446.667,199.979-446.667,446.667h446.667V63.868z M511.802,510.535L903.96,298.196C828.669,159.118,681.719,64.515,512.613,63.879l-0.811,446.656z', //饼状
                        onclick: function(option) { //点击事件,这里的option是chart的option信息
                            _self.showEchartView(undefined, 'Pie');
                        }
                    }
                },
                aLineBox = {
                    myLineChart: { //自定义按钮属性(必须为[my]开头)
                        show: true, //是否显示
                        title: '切换为折线图', //鼠标移动上去显示的文字
                        icon: 'path://M4.1,28.9h7.1l9.3-22l7.4,38l9.7-19.7l3,12.8h14.9M4.1,58h51.4', //折线
                        onclick: function(option) { //点击事件,这里的option是chart的option信息
                            _self.showEchartView(undefined, 'Line');
                        }
                    }
                };
            type = ('' + type).toLowerCase();
            chartOption = chartOption || {};
            if (!type || range.indexOf(type) < 0) return false;
            // 追加图例配置
            $.extend(true, chartOption, {
                legend: {
                    show: true,
                    left: '6%', // 图例组件离容器左侧的距离(与grid的[left]大小有关)
                    orient: 'vertical', // 图例列表的布局朝向(horizontal/vertical)
                    itemGap: 15, //图例每项之间的间隔
                    formatter: function(name) { // 图例文字限制长度
                        return (name.length > 16 ? (name.slice(0, 16) + "...") : name);
                    }
                }
            });
            // 追加工具栏配置
            $.extend(true, chartOption, {
                toolbox: {
                    show: true,
                    right: '5%', // 工具栏组件离容器右侧的距离。
                    orient: 'horizontal', // 工具栏 icon 的布局朝向(horizontal/vertical)
                    itemSize: 15, // 工具栏 icon 的大小
                    itemGap: 15 // 工具栏 icon 每项之间的间隔
                }
            });
            // 工具栏公用的 icon 样式设置
            $.extend(true, chartOption.toolbox, {
                iconStyle: {
                    emphasis: { // 工具栏 icon图形的颜色
                        color: { //  径向渐变，前三个参数分别是圆心 x, y 和半径，取值同线性渐变
                            type: 'radial',
                            x: 0.5,
                            y: 0.5,
                            r: 0.5,
                            colorStops: [{
                                offset: 0,
                                color: 'red' // 0% 处的颜色
                            }, {
                                offset: 1,
                                color: 'blue' // 100% 处的颜色
                            }],
                            globalCoord: false // 缺省为 false
                        },
                        borderType: 'dashed', // 支持 'solid', 'dashed', 'dotted'
                        shadowColor: 'rgba(0, 0, 0, 0.5)',
                        shadowBlur: 10
                    }
                }
            });
            // 各工具配置项
            $.extend(true, chartOption.toolbox, {
                itemSize: 25, // 工具栏 icon 的大小[ default: 15 ]
                itemGap: 15, // 工具栏 icon 每项之间的间隔[ default: 10 ]
                feature: {
                    dataZoom: { // 数据区域缩放默认不显示
                        show: false
                    },
                    restore: { // 配置项还原默认不显示
                        show: false
                    },
                    dataView: { // 数据视图工具默认不显示
                        show: false
                    },
                    magicType: { // 动态类型切换默认不显示
                        show: false
                    }
                }
            });
            // 自定义图形切换按钮
            $.extend(true, chartOption.toolbox.feature, aBarBox, aPieBox, aLineBox);
            if (range[0] != type) { // 为柱状和折线图添加工具条
                //$.extend(true, chartOption.toolbox.feature, aLineBox, aPieBox, {
                $.extend(true, chartOption.toolbox.feature, {
                    //magicType: { show: false}, // 显示自定义图形切换按钮
                    dataZoom: { // 不显示纵轴的区域缩放
                        show: false,
                        yAxisIndex: 'none' // 不显示纵轴的
                    },
                    restore: {
                        show: false
                    } // 配置项还原默认工具
                });
                // 添加区域缩放
                $.extend(true, chartOption, {
                    dataZoom: [{ // 这个dataZoom组件，默认控制x轴。
                        type: 'slider', // 这个 dataZoom 组件是 slider 型 dataZoom 组件
                        filterMode: 'filter',
                        start: 1, // 初始左边在 1% 的位置。
                        end: 98, // 初始右边在 100% 的位置。
                        showDetail: false, // 是否显示detail，即拖拽时候显示详细数值信息。
                        //height: 40,//组件高度
                        borderColor: '', // 边框颜色
                        fillerColor: 'rgba(167,183,204,0.2)', // 选中范围的填充颜色
                        handleColor: '#000000', //h滑动图标的颜色
                        handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                        //backgroundColor: '#fefefe',//两边未选中的滑动条区域的颜色
                        handleSize: '80%',
                        handleStyle: {
                            color: '#fff',
                            shadowBlur: 3,
                            shadowColor: 'rgba(0, 0, 0, 0.6)',
                            shadowOffsetX: 2,
                            shadowOffsetY: 2
                        }
                    }, { // 这个dataZoom组件，也控制x轴。
                        type: 'inside', // 这个 dataZoom 组件是 inside 型 dataZoom 组件
                        start: 0, // 左边在 0% 的位置。
                        end: 100 // 右边在 100% 的位置。
                    }]
                });

                // 横纵坐标刻度内容格式
                $.extend(true, chartOption, {
                    xAxis: [{
                        nameLocation: 'middle',
                        nameGap: 35,
                        type: 'category',
                        data: [],
                        axisLabel: {
                            interval: 0, //横轴信息全部显示
                            rotate: 15, //横坐标文字角度倾斜显示
                            formatter: function(params) {
                                if (!params) return '未知名称';
                                if (params.length > 32) { // 限制文字最大长度
                                    params = params.substring(0, 29) + '...';
                                }
                                var newParamsName = ''; // 最终拼接成的字符串
                                var aLineNumber = 16; // 每行能显示的字的个数
                                /*
                                 * 判断标签的个数是否大于规定的个数，
                                 * 如果大于，则进行换行处理; 如果等于或小于，就返回原标签
                                 */
                                var rule = new RegExp('.{' + aLineNumber + '}', 'ig');
                                newParamsName = params.match(rule);
                                if (newParamsName) {
                                    newParamsName = newParamsName.join('\n');
                                } else {
                                    newParamsName = params;
                                }

                                //将最终的字符串返回
                                return newParamsName;
                            }
                        },
                        axisLine: { //设置坐标轴字体颜色
                            lineStyle: {
                                color: '#0c0e14'
                            }
                        }
                    }],
                    yAxis: [{
                        show: true,
                        nameLocation: 'middle',
                        nameGap: 50,
                        nameRotate: 70,
                        type: 'value',
                        data: [],
                        axisLine: { //设置坐标轴字体颜色
                            lineStyle: {
                                color: '#0c0e14'
                            }
                        },
                        axisLabel: { // 纵坐标
                            formatter: '{value}'
                            // formatter: '{value} °C' // 可以在纵坐标上追加后缀
                        }
                    }]
                });
            }
            // 默认显示一些工具
            var imgTitle = chartOption.title.text || '保存为图片';
            $.extend(true, chartOption.toolbox.feature, {
                saveAsImage: {
                    show: true,
                    type: 'png', // 保存的图片格式。支持 'png' 和 'jpeg'
                    title: imgTitle,
                    lang: ['保存到本地'],
                    backgroundColor: 'rgb(255, 255, 255)', //保存的图片背景色。
                    excludeComponents: ['toolbox'], // 保存为图片时忽略的组件列表，默认忽略工具栏
                    pixelRatio: 1 // 保存图片的分辨率比例，默认跟容器相同大小，如果需要保存更高分辨率的，可以设置为大于 1 的值，例如 2。
                }
            });
            // 工具条按钮[销毁]
            if ($.isFunction(chartOption.onDestroy)) {
                $.extend(true, chartOption.toolbox.feature, aDelBox);
            }
            // grid 组件离容器上/下/左/右侧的距离
            $.extend(true, chartOption, {
                grid: {
                    show: true,
                    left: '5%',
                    right: '5%',
                    top: 60,
                    bottom: '10%',
                    containLabel: true, // grid 区域是否包含坐标轴的刻度标签(用于『防止标签溢出』的场景)
                    backgroundColor: 'transparent' // 网格背景色
                }
            });
        },
        /**
         * 生成柱状图表显示数据
         * fetchData array ajax取得的后台返回数据(***暂且只考虑一维数组,二维待有需要再扩展***)
         * kvOption object 从[fetchData]中取得横纵坐标的数据对象属性
         * viewOption object 图表需要现实的tooltip内容
         */
        packBarChartOption: function(fetchData, kvOption, viewOption) {
            var xArray = [],
                yArray = [],
                legendArray = [],
                seriesItem = [];
            var xAxis = kvOption['x'],
                yAxis = kvOption['y'];
            var barPoint = {
                label: {
                    normal: {
                        show: true,
                        position: 'inside'
                    }
                },
                markPoint: {
                    data: [{
                        type: 'max',
                        name: '最大值',
                        itemStyle: {
                            normal: {
                                opacity: 0.7
                            }
                        },
                        label: {
                            normal: {
                                show: true,
                                color: '#F00',
                                position: 'inside'
                            }
                        }
                    }, {
                        type: 'min',
                        name: '最小值',
                        itemStyle: {
                            normal: {
                                opacity: 0.7
                            }
                        },
                        label: {
                            normal: {
                                show: true,
                                color: '#F00',
                                position: 'inside'
                            }
                        }
                    }]
                },
                markLine: {
                    precision: 0,
                    data: [{
                        type: 'average',
                        name: '平均值'
                    }]
                }
            };
            if ($.isArray(fetchData)) {
                if ($.isArray(yAxis)) {
                    // 柱条（K线蜡烛）宽度
                    var bwh = Math.ceil(100 / Math.ceil(yAxis.length * 1.5)) + '%';
                    $.each(yAxis, function(index, item) {
                        xArray = [];
                        yArray = [];
                        legendArray.push(item.name); // 图例
                        fetchData.forEach(function(aItem, aIndex) {
                            xArray.push(aItem[xAxis]);
                            yArray.push(item.value && aItem[item.value] || '0');
                        });
                        seriesItem.push($.extend(true, {}, {
                            name: item.name,
                            type: 'bar',
                            barWidth: bwh,
                            data: yArray
                        }, barPoint));
                    });
                } else {
                    $.each(fetchData, function(index, aItem) {
                        xArray.push(aItem[xAxis]);
                        yArray.push(aItem[yAxis] || '0');
                    });
                    seriesItem.push($.extend(true, {}, {
                        data: yArray
                    }, barPoint));
                }
            }
            var dataOption = $.extend(true, viewOption, {
                legend: { // 统计图图例
                    top: '0',
                    data: legendArray
                },
                xAxis: [{
                    data: xArray
                }],
                series: seriesItem
            });
            return $.extend(true, {}, aBarOption, dataOption);
        },
        /**
         * 生成饼状图表显示数据
         * fetchData object ajax取得的后台返回数据
         * kvOption object 从[fetchData]中取得横纵坐标的数据对象属性
         * viewOption object 图表需要现实的tooltip内容
         */
        packPieChartOption: function(fetchData, kvOption, viewOption) {
            var dataArray = [],
                yArray = [],
                legendArray = [],
                seriesItem = [];
            var xAxis = kvOption['x'],
                yAxis = kvOption['y'];
            if ($.isArray(fetchData)) {
                if ($.isArray(yAxis)) {
                    /* 计算每个饼状图的位置坐标 */
                    var i = 10,
                        locations = [],
                        len = yAxis.length,
                        per = Math.ceil(100 / (len * 2 + 1));
                    while (len > 0) {
                        i += per;
                        locations.push(i + '%');
                        i += per;
                        locations.push('50%');
                        len--;
                    }
                    $.each(yAxis, function(index, item) {
                        yArray = [];
                        legendArray = [];
                        fetchData.forEach(function(aItem, aIndex) {
                            legendArray.push(aItem[xAxis] || '未知名称');
                            yArray.push({
                                value: (item.value && aItem[item.value] || '0'),
                                name: (aItem[xAxis] || '未知名称')
                            });
                        });
                        seriesItem.push({
                            type: 'pie',
                            name: item.name,
                            radius: [35, 110],
                            center: locations.splice(0, 2),
                            data: yArray
                        });
                    });
                } else {
                    $.each(fetchData, function(index, aItem) {
                        legendArray.push(aItem[xAxis] || '未知名称');
                        dataArray.push({
                            value: (aItem[yAxis] || '0'),
                            name: (aItem[xAxis] || '未知名称')
                        });
                    });
                    seriesItem.push({
                        type: 'pie',
                        data: dataArray
                    });
                }
            }
            var dataOption = $.extend(true, viewOption, {
                legend: { // 统计图图例
                    top: 80, // 图例组件离容器上侧的距离
                    type: 'scroll', // 可滚动翻页的图例。当图例数量较多时可以使用。缺省就是普通图例plain
                    orient: 'vertical',
                    data: legendArray
                },
                series: seriesItem
            });
            if (dataOption.yAxis) delete dataOption.yAxis;
            if (dataOption.xAxis) delete dataOption.xAxis;
            return $.extend(true, {}, aPieOption, dataOption);
        },
        /**
         * 生成折线图表显示数据
         * fetchData object ajax取得的后台返回数据
         * kvOption object 从[fetchData]中取得横纵坐标的数据对象属性
         * viewOption object 图表需要现实的tooltip内容
         */
        packLineChartOption: function(fetchData, kvOption, viewOption) {
            var xArray = [],
                yArray = [],
                legendArray = [],
                seriesItem = [];
            var xAxis = kvOption['x'],
                yAxis = kvOption['y'];
            var linePoint = {
                label: {
                    normal: {
                        show: true,
                        position: 'bottom'
                    }
                },
                markPoint: {
                    data: [{
                        type: 'max',
                        name: '最大值',
                        itemStyle: {
                            normal: {
                                opacity: 0.7
                            }
                        },
                        label: {
                            normal: {
                                show: true,
                                color: '#F00',
                                position: 'inside'
                            }
                        }
                    }, {
                        type: 'min',
                        name: '最小值',
                        itemStyle: {
                            normal: {
                                opacity: 0.7
                            }
                        },
                        label: {
                            normal: {
                                show: true,
                                color: '#F00',
                                position: 'inside'
                            }
                        }
                    }]
                },
                markLine: {
                    precision: 0,
                    data: [{
                            type: 'average',
                            name: '平均值'
                        },
                        [{
                            symbol: 'none',
                            x: '90%',
                            yAxis: 'max'
                        }, {
                            symbol: 'circle',
                            label: {
                                normal: {
                                    position: 'end',
                                    formatter: '最大值'
                                }
                            },
                            type: 'max',
                            name: '最高点'
                        }]
                    ]
                }
            };
            if ($.isArray(fetchData)) {
                if ($.isArray(yAxis)) {
                    $.each(yAxis, function(index, item) {
                        xArray = [];
                        yArray = [];
                        legendArray.push(item.name); // 图例
                        fetchData.forEach(function(aItem, aIndex) {
                            xArray.push(aItem[xAxis]);
                            yArray.push(item.value && aItem[item.value] || '0');
                        });
                        seriesItem.push($.extend(true, {}, {
                            name: item.name,
                            type: 'line',
                            data: yArray
                        }, linePoint));
                    });
                } else {
                    $.each(fetchData, function(index, aItem) {
                        xArray.push(aItem[xAxis]);
                        yArray.push(aItem[yAxis] || '0');
                    });
                    seriesItem.push($.extend(true, {}, {
                        data: yArray
                    }, linePoint));
                }
            }
            var dataOption = $.extend(true, viewOption, {
                legend: { // 统计图图例
                    top: '0',
                    data: legendArray
                },
                xAxis: [{
                    data: xArray
                }],
                series: seriesItem
            });
            return $.extend(true, {}, aLineOption, dataOption);
        }
    };

    // 暴露创建统计图工具到global对象下 
    return modalChart;

})