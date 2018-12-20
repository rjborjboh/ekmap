/**
 * define request(ajax)
 **/
const $ = require('jquery');
const commonjs = require('./common');
var regHttp = /(http|https):\/\//im;
var _GET_POST_ = {
    get: 'GET',
    post: 'POST'
};

//暴露接口
module.exports = {
    /* 
     * @description: 非form表单形式的ajax请求处理
     * @param
     *     params  参照[transferParams]方法
     *      callback example: {success: function(){}, fail: function(){}}
     * */
    ajax: function(params, callback) {
        var _settings = this.transferParams(params);
        if (!_settings) return false;

        // beforeSend
        _settings.beforeSend = function(xhr, settings) {
            // 追加请求头认证信息
            xhr.setRequestHeader("Auth-Token", commonjs.storage("Auth-Token"));
            // 检查[content-type]头信息
            if (!settings.contentType) settings.contentType = 'application/x-www-form-urlencoded; charset=UTF-8';
            // 设置返回响应信息数据类型
            if (!settings.dataType) settings.dataType = 'json';
        };

        // 执行ajax处理
        return this.sendAjax(_settings, callback);
    },
    /* 
     * @description: 非form表单形式的ajax请求处理
     * @param 参照[ajax]方法
     * */
    sendAjax: function(settings, callback) {
        /*预备回调函数*/
        var success = this.generateCallback(callback && callback.success, 'success', settings);
        var fail = this.generateCallback(callback && callback.fail, 'fail', settings);
        // 执行请求实体
        return $.ajax(settings).then(function(resContent, request) {
            resContent = resContent || {};
            if (resContent.status == 'failed') {
                if (resContent.code == '20003') { // HTTP 401 Unauthorized
                    commonjs.createLayerMsg({
                        confirm: function() {
                            // 用户退出登录处理(清空用户数据)
                            commonjs.logout();
                        },
                        hidden: function() {
                            commonjs.logout();
                        }
                    }, {
                        title: 'title',
                        body: resContent.msg + '</br>' + commonjs.renderMsg('common.E006')
                    });
                    return false;
                }
                fail({
                    data: resContent.msg,
                    code: resContent.code
                }, 'error');
            } else {
                /**
                 * [dataTable] only can access return Object like {data : {}| []}
                 * */
                if (resContent.hasOwnProperty('data')) {
                    success.call(callback, {
                        data: resContent.data
                    }, 'success');
                } else if (resContent.hasOwnProperty('result')) {
                    success.call(callback, {
                        data: resContent.result
                    }, 'success');
                } else {
                    success.call(callback, {
                        data: resContent
                    }, 'success');
                }
            }
        }, function(xhr, errCode, responseText) {
            if (callback) {
                if (errCode == 'timeout') {
                    fail({
                        data: 'timeout',
                        msg: '后台响应超时!'
                    }, 'timeout');
                    return false;
                }
                fail({
                    data: responseText,
                    code: errCode
                }, 'error');
            }
        });
    },
    /**
     * @description
     *     form表单形式的ajax请求
     * */
    ajaxFileUpload: function(params) {
        var _settings = this.transferParams(params);
        if (!_settings) return false;
        // form表单的文件
        _settings.fileElementIds = params.fileElementIds;
        _settings.success = this.generateCallback(params.success, 'success');
        _settings.error = this.generateCallback(params.error, 'fail');

        // 执行form表单提交处理
        $.ajaxFileUpload(_settings);
    },
    /**
     * @description
     *     转换处理请求参数
     * @param: 
     *      params - ajax configuration info.
     *  params example:
     *  { type: 'post/get',
     *  location:'server/local',
     *  dataType: 'json/plain/text...',
     *  urlkey: {url:'xxx', noParse: false/true},
     *  cache： false/true
     *  data: {} }
     * */
    transferParams: function(params) {
        if (!params) {
            console.log('request.js - transferParams: 参数异常!');
            return false;
        };
        /*URL路径判断*/
        if (!params.urlkey) {
            console.log('request.js - transferParams: urlkey异常!');
            //          commonjs.createLayerMsg();
            return false;
        }
        params.data = params.data || {};
        var ajaxUrl, transfered = {};

        params.location = params.location || 'server';
        if (regHttp.test(params.urlkey)) {
            ajaxUrl = params.urlkey;
        } else {
            if (typeof(params.urlkey) === 'string') {
                ajaxUrl = this.mapInterface(params.location, params.urlkey);
            } else {
                if (typeof(params.urlkey) == 'object') {
                    ajaxUrl = params.urlkey.url;
                    if (!params.urlkey.noParse) {
                        ajaxUrl = this.mapInterface(params.location, params.urlkey.url);
                    }
                }
            }
        }
        // 请求url路径
        transfered.url = ajaxUrl;

        // 请求类型
        if (!params.type) params.type = 'get';
        transfered.type = _GET_POST_[params.type] || _GET_POST_.get;

        // 请求参数
        transfered.data = params.data || {};

        // 请求响应类型
        transfered.dataType = params.dataType || "json";

        // 请求不设置缓存
        transfered.cache = !!params.cache;

        // 设置同异步
        transfered.async = true;
        if (params.cache != undefined) {
            transfered.async = !!params.cache;
        }
        // timeout设置(默认 8秒)
        transfered.timeout = commonjs.int(params.timeout, 8000);

        // 追加局部complete函数
        transfered.complete = function() {
            // 隐藏页面遮盖层
            $('#fixedBox').hide('slow');
        };

        return transfered;
    },
    /**
     * @description
     *     ajax请求[url]路径的取得
     * @param
     *     doorKey string [local/server]
     *     uKey    string [ekMap.interfaces]文件中映射api路径的关键字
     * */
    mapInterface: function(doorKey, uKey) {
        var doorLocation = commonjs.storage(doorKey + '_door');
        var interLocation = commonjs.storage('link_urls')[uKey];
        if (doorLocation && interLocation) return doorLocation + interLocation;
        return undefined;
    },
    /**
     * @description
     *     ajax请求毁掉函数的处理
     * @param
     *     one_callback function
     *     type         string  [success/fail]
     * */
    generateCallback: function(one_callback, type, settings) {
        settings = settings || {};
        var back = function() {
            console.log('request.js: unknow callback function!!!');
        };
        if ($.isFunction(one_callback)) return one_callback;
        if (type == 'success') {
            back = function() {
                console.log('request.js: ajax ' + settings.url + ' is success answered!')
            };
        }
        if (back == 'fail') {
            back = function() {
                console.log('request.js: ajax ' + settings.url + ' is failed answered!')
            };
        }
        return back;
    }
};