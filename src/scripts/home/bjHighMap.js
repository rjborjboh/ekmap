 import $ from 'jquery';
 import React, {
 	Component
 } from 'react';
 import ReactDOM from 'react-dom';

 const commonjs = require('ek-utils/common');
 const request = require('ek-utils/request');

 // 加载 Highmaps
 const Highcharts = require('highcharts/highmaps.src.js');
 /**
  *  参照https://www.hcharts.cn/docs/highmaps-started
  */
 // 加载 proj4，用于将经纬度转换成坐标值
 // var proj4 = require('./proj4.js');

 class HeighMap extends Component {
 	constructor(props) {
 		super(props);
 		let interval = commonjs.int(props.option.interval, 5);
 		interval = interval * 1000;
 		this.state = {
 			ajaxUrl: props.option.ajax.url, // data api
 			ajaxData: props.option.ajax.data || {}, // data
 			ajaxFrequency: interval,
 			mapData: {}, // map data
 			viewData: props.option.viewData || {}, //view data
 		};

 		this.container = React.createRef();
 		// update data api
 		this.refresh = this.refresh.bind(this);
 		this.mapID =
 			'map-' + Math.random().toString(36).substr(2, 9);
 	}

 	refresh() { // update map & show
 		var _self = this;
 		request.ajax({
 			type: 'get',
 			urlkey: {
 				noParse: true,
 				url: _self.state.ajaxUrl
 			},
 			data: _self.state.ajaxData,
 			dataType: 'json'
 		}, {
 			success: function(result) {
 				if (!result.data) return false;
 				_self.setState({
 					mapData: result.data
 				});
 				// 初始化图表
 				_self.map = new Highcharts.Map(_self.mapID, {
 					title: {
 						text: '北京市'
 					},
 					subtitle: {
 						text: '<a href="https://img.hcharts.cn/mapdata/index.html">北京市地图数据：</a>'
 					},
 					mapNavigation: {
 						enabled: true,
 						buttonOptions: {
 							verticalAlign: 'bottom'
 						}
 					},
 					colorAxis: {
 						min: 0,
 						stops: [
 							[0, '#EFEFFF'],
 							[0.5, Highcharts.getOptions().colors[0]],
 							[1, Highcharts.Color(Highcharts.getOptions().colors[0]).brighten(-0.5).get()]
 						]
 					},
 					series: [{
 						data: _self.state.viewData,
 						name: '随机数据',
 						mapData: _self.state.mapData,
 						joinBy: 'name', // 根据 name 属性进行关联 
 						states: {
 							hover: {
 								color: '#a4edba'
 							}
 						},
 						dataLabels: {
 							enabled: false,
 							format: '{point.name}'
 						}
 					}]
 				});
 			}
 		});
 	}

 	componentDidMount() {
 		// let container = ReactDOM.findDOMNode(this.container.current);
 		// every 
 		this.intervalAjax = setInterval(() => this.refresh(), this.state.ajaxFrequency);
 	}

 	componentWillUnMount() {
 		clearInterval(this.intervalAjax);
 	}

 	render() {
 		return (
 			<div id={this.mapID} style={{width:this.props.width + "px",height:this.props.height + "px"}}></div>
 		);
 	}
 }

 export default HeighMap