/**
 * configuration messages.
 */
var ekMap = {};
if (!ekMap.config) ekMap.config = {};

/* *
 * 设置Web Storage Data的存储方式
 * localStorage 持久级本地存储(除非主动删除,否则页面关闭也不会删除)
 * sessionStorage 会话级存储(数据只有在同一个会话中的页面才能访问并且当会话结束后数据也随之销毁)
 * */
ekMap.config.storage = localStorage;

/* *
 * 设置后台服务的访问域信息
 * */
ekMap.config.serverDomain = 'http://localhost:8080/';

/* *
 * 设置生产模式和线上模式切换 
 * true 生产(开发)模式
 * false 线上(部署)模式
 * */
ekMap.config.debugMode = true;


ekMap.interUrls = require('./ekMap.interfaces')(ekMap.config);
ekMap.phrases = require('./ekMap.phrases');

module.exports = ekMap;