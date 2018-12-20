/**
 * home module to start.
 */
import $ from 'jquery';
// 加载CSS式样文件
import 'ek-style/home.css';
import 'ek-style/infoTable.css';
import 'ek-style/common.css';
import 'ek-style/common/layerMsg.css';
import 'ek-style/bootstrap-responsive.css';
import 'ek-libraries/jquery/plugin/limarquee/css/liMarquee.css';
/*import 'ek-libraries/jquery/plugin/limarquee/css/style.css';*/
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.min.js'

import React from 'react';
import ReactDom from 'react-dom';
import spinjs from 'spin';
import helper from "./helper";
/////////////////插件实例化区域///////////////////////Start
//取得&封装dataTable插件
// const jDataTables = require('../../libraries/jquery/plugin/datatables/js/jquery.dataTables');
// jDataTables(window, $);
import 'datatables.net/js/jquery.dataTables.js';
//取得&封装dataTable的bootstrap式样
// const bDataTables = require('../../libraries/bootstrap/plugin/datatables/js/dataTables.bootstrap');
// bDataTables(window, $);
import 'datatables-bootstrap';
// 取得&封装dataTable的bootstrap插件
// const datatables = require('../../libraries/bootstrap/plugin/datatables/js/datatables');
// datatables(window, $);
import 'datatables';

import {
    Page,
    PagesFragment
} from './fragment';
import Header from './header';
import InfoTable from './infoTable';
import ChartModel from './chartModel';
import BJHeighMap from './bjHighMap';
import GPSHeighMap from './gpsHighMap';
import RealTimeChart from './realTimeChart';

const commonjs = require('ek-utils/common');
//////////////////////////////////////////////////  End

ReactDom.render(<Header />, $('#header')[0]);
//ReactDom.render(<PagesFragment />, $('#center')[0]);
var aTableOption = {
    rowHeader: true,
    interval: 15,
    ajaxUrl: '../scripts/test/testData.json',
    sortable: true
};
ReactDom.render(<InfoTable caption="消防警报" option={aTableOption} />, $('#center> div#a-table')[0]);

var aChartOption = {
    isExclusive: true,
    container: 'div#echart',
    ajax: {
        type: 'get',
        url: '../scripts/test/chartData.json',
        data: {
            'abc': 555
        }
    }
};
ReactDom.render(<ChartModel echartId="testCaseOne" viewOption={aChartOption}/>, $('#echart')[0]);

var bjMapOption = {
    viewData: [{
        "name": "东城区",
        "value": 75
    }, {
        "name": "西城区",
        "value": 15
    }, {
        "name": "朝阳区",
        "value": 77
    }, {
        "name": "丰台区",
        "value": 38
    }, {
        "name": "石景山区",
        "value": 21
    }, {
        "name": "海淀区",
        "value": 83
    }, {
        "name": "门头沟区",
        "value": 94
    }, {
        "name": "房山区",
        "value": 45
    }, {
        "name": "通州区",
        "value": 40
    }, {
        "name": "顺义区",
        "value": 70
    }, {
        "name": "昌平区",
        "value": 44
    }, {
        "name": "大兴区",
        "value": 85
    }, {
        "name": "怀柔区",
        "value": 45
    }, {
        "name": "平谷区",
        "value": 96
    }, {
        "name": "密云区",
        "value": 12
    }, {
        "name": "延庆区",
        "value": 93
    }],
    ajax: {
        type: 'get',
        url: '../scripts/test/beijing.json',
        data: {
            'abc': 555
        }
    }
};
ReactDom.render(<BJHeighMap option={bjMapOption} width="500" height="400"/>, $('#bjHightMap')[0]);

var gpsMapOption = {
    gpsPoints: ['北京', '天津', '广州'],
    ajax: {
        type: 'get',
        url: '../scripts/test/cities.json',
        data: {
            'abc': 555
        }
    }
};
ReactDom.render(<GPSHeighMap option={gpsMapOption} width="500" height="400"/>, $('#gpsHightMap')[0]);

ReactDom.render(<RealTimeChart width="500" height="400"/>, $("#rtChart")[0]);
/**
 * @description
 *     页面所有DOM节点都加载完成后的初始化处理
 * */
var allDomsLoadedReady = function() {

    // 监听所有window.resize事件并初始化一次
    commonjs.runWindowResizeHandler();

    //处理中等待画面
    var opts = {
        lines: 12, // # of lines
        length: 15, // length of the lines
        width: 7, // width of the lines
        radius: 10, // radius of the lines
        color: 'hsl(0,0%,100%)', // line color
        speed: 1, // cycle time in second
        trail: 60, // After glow percentage
        shadow: true, // true to turn on shadow
        hwaccel: true, // Whether to use hardware acceleration
    };
    var target = null;
    $.spinner = new spinjs(opts).spin(target);
};