/**
 * H5页面管理路由
 */
var commonjs = require('ek-utils/common');
// var routeManager = seajs.router.manager;
// 路由控制配置
module.exports = {
    home2serverStats: function(){
        routeManager.renderOnceJsCss(new routeManager.renderOnceJsCssFactory(
            function() {
                //                seajs.use("styles/home/xxx.css?nowrap");
            },
            function() {
                /*if(ekMap.config.debugMode){
                    seajs.use("script/home/serverStats", function(start){
                        start();
                    });
                } else {
                    seajs.useZipedJs('home/serverStats', function(start){
                        start();
                    });
                }*/
                // routeManager.enterEntry(undefined, function(start){
                //     start();
                // });
            }
        ));
    }
};