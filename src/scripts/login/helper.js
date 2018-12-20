/**
 * 用户登录成功后需要做的一些验证或者从后台取得数据
 */
var $ = require('jquery');
//var commonjs = require('commonjs');
var request = require("request");

module.exports = {
    fetchPremission: function(callback){
        /* 取得登录用户的权限机能页面 */
        request.ajax({
            urlkey: 'user_permission',
            type: "post"
        }, {
            success: function(d){
                d = d && d.data;
                if (!d || d.length < 1) return this.fail();
                if ($.isFunction(callback && callback.success)) {
                    callback.success(d);
                }
            },
            fail: function(err){
                if ($.isFunction(callback && callback.fail)) {
                    callback.fail(err);
                }
            }
        });
    }
};
