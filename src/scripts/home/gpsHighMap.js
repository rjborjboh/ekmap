 import $ from 'jquery';
 import React, {
 	Component
 } from 'react';
 import ReactDOM from 'react-dom';
 /**
  *  参照https://www.hcharts.cn/docs/highmaps-started
  */
 // 加载 proj4，用于将经纬度转换成坐标值
 window.proj4 = require('ek-libraries/proj4/proj4');

 const commonjs = require('ek-utils/common');
 const request = require('ek-utils/request');

 // 加载 Highmaps
 const Highcharts = require('highcharts/highmaps.src.js');
 const chinaMapData = require('../test/china');

 class GPSHeighMap extends Component {
 	constructor(props) {
 		super(props);
 		let interval = commonjs.int(props.option.interval, 5);
 		interval = interval * 1000;
 		this.state = {
 			ajaxUrl: props.option.ajax.url, // data api
 			ajaxData: props.option.ajax.data || {}, // data
 			ajaxFrequency: interval,
 			mapData: {}, // map data
 			gpsPoints: props.option.gpsPoints || {}, //view data
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
 				// ----------------------test data
 				var example = [{
 					// 经纬度查询请到 http://www.gpsspg.com/maps.htm
 					lat: 30.2741702308,
 					lon: 120.1551656314,
 					color: 'red',
 					value: '200',
 					name: '杭州'
 				}];
 				// ----------------------test data
 				$.each(_self.state.gpsPoints, function(index, point) {
 					if (_self.state.mapData[point]) {
 						example.push({
 							// 直接用转换好的坐标位置
 							x: _self.state.mapData[point].x,
 							y: -_self.state.mapData[point].y,
 							name: _self.state.mapData[point].name,
 							value: '200',
 							color: 'blue',
 						});
 					}
 				});
 				// 初始化图表 参照https://api.hcharts.cn/6/highmaps/
 				_self.map = new Highcharts.Map(_self.mapID, {
 					title: {
 						align: 'center',
 						style: {
 							color: "#ffffff",
 							fontSize: "18px"
 						},
 						text: '通过经纬度描点'
 					},
 					subtitle: {
 						text: '<a href="https://img.hcharts.cn/mapdata/index.html">China地图数据：</a>'
 					},
 					credits: {
 						enabled: false
 					},
 					legend: {
 						enabled: false,
 						align: 'center',
 						floating: true,
 						title: {
 							text: '图例'
 						},
 						itemStyle: {
 							color: 'white',
 							fontSize: '12px',
 							fontWeight: 'bold',
 							textOverflow: 'ellipsis'
 						},
 						verticalAlign: 'top',
 						y: 25,
 						// x: -200,
 						borderWidth: 0,
 						backgroundColor: '#241c41'
 					},
 					chart: { // General options for the chart.
 						backgroundColor: '#241c41', // The background color or gradient for the outer chart area.
 						borderColor: '#1d214a', // The color of the outer chart border.
 						borderWidth: 2,
 						className: '', // A CSS class name to apply to the charts container div, allowing unique CSS styling for each chart.
 						description: '这是一个经纬度定位地方的Map', // A text description of the chart.
 						height: null, // An explicit height for the chart.
 						width: null, // An explicit width for the chart.
 						map: undefined, //String, Array.<Object> Default mapData for all series... (eq to series - mapData)
 						margin: undefined, //Array The margin between the outer edge of the chart and the plot area. ...	
 						// plotBackgroundColor: '#0f0c3a', // The background color or gradient for the plot area.
 						// plotBackgroundImage: null,
 						// plotBorderColor: '#263566',
 						plotBorderWidth: 0,
 						plotShadow: false, // Requires that plotBackgroundColor be set.
 						reflow: true, // Whether to reflow the chart to fit the width of the container div on resizing the window.
 						spacing: [10, 10, 10, 10], // Array.<Number>The distance between the outer edge of the chart and the content
 					},
 					mapNavigation: {
 						enabled: true, // 开启地图导航器，默认是 false
 						buttonOptions: {
 							verticalAlign: 'bottom'
 						}
 					},
 					tooltip: {
 						useHTML: true,
 						formatter: function() {
 							return this.point.name;
 						}
 					},
 					plotOptions: { // 默认所有[series]数组中的对象配置
 						//The plotOptions is a wrapper object for config objects for each series type. 
 						//The config objects for each series can also be overridden for each series item as given in the series array.
 						series: {
 							dataLabels: {
 								enabled: true,
 								color: 'white',
 								dataLabels: {
 									enabled: true,
 									format: '{point.name}',
 									style: {
 										width: '80px' // force line-wrap
 									}
 								},
 								tooltip: {
 									headerFormat: '',
 									pointFormat: '{point.name}'
 								}
 							},
 							marker: {
 								radius: 3
 							}
 						},
 						mappoint: {
 							// shared options for all mappoint series
 							dataLabels: {
 								enabled: true,
 								color: '#FFFFFF',
 								style: {
 									fontWeight: 'bold'
 								},
 								format: null,
 								// format: '{point.name}: {point.value}'
 								formatter: function() {
 									if (this.point.value) {
 										return this.point.name;
 									}
 								}
 							}
 						}
 					},
 					series: [{
 						// 空数据列，用于展示空地图
 						type: 'map',
 						name: '中国地图',
 						mapData: chinaMapData,
 						showInLegend: false,
 						joinBy: null,
 						colorAxis: {
 							min: 0,
 							stops: [
 								[0, '#EFEFFF'],
 								[0.5, Highcharts.getOptions().colors[0]],
 								[1, Highcharts.Color(Highcharts.getOptions().colors[0]).brighten(-0.5).get()]
 							]
 						},
 						// data: [{
 						// 	name: "Land",
 						// 	color: "#f4e2ba",
 						// 	path: ''
 						// }]
 					}, {
 						type: 'mappoint',
 						cursor: 'pointer',
 						animation: true,
 						name: '通过经纬度描点',
 						data: example,
 						name: '坐标位置',
 						dataLabels: {
 							enabled: true,
 							color: '#FF0FFF',
 							style: {
 								fontWeight: 'bold'
 							},
 							format: null,
 							// format: '{point.name}: {point.value}'
 							formatter: function() {
 								if (this.point.value) {
 									return this.point.name;
 								}
 							}
 						},
 						marker: {
 							enabled: true,
 							lineWidth: 0,
 							lineColor: "#ffffff",
 							enabledThreshold: 2,
 							radius: 3,
 							states: {
 								normal: {
 									animation: true
 								},
 								hover: {
 									animation: {
 										duration: 50
 									},
 									enabled: true,
 									radiusPlus: 2,
 									lineWidthPlus: 1
 								},
 								select: {
 									fillColor: "#cccccc",
 									lineColor: "#000000",
 									lineWidth: 2
 								}
 							}
 						},
 						// tooltip: {
 						// 	valueSuffix: ''
 						// }
 					}]
 				});
 			}
 		});
 	}

 	componentDidMount() {
 		// one time
 		this.refresh();
 		// every 
 		// this.intervalAjax = setInterval(() => this.refresh(), this.state.ajaxFrequency);
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

 export default GPSHeighMap