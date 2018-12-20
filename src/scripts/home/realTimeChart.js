import $ from 'jquery';
import React, {
	Component
} from 'react';
import ReactDom from 'react-dom';

require('highcharts/themes/dark-blue');
const commonjs = require('ek-utils/common');
const request = require('ek-utils/request');
// 加载 Highstock(包含HighCharts)
const Highcharts = require('highcharts/highstock');

class RealTimeChart extends Component {
	constructor(props) {
		super(props);

		this.state = {

		};

		this.continer = React.createRef();
		this.id = 'rtChart' + Math.random().toString(36).substr(2, 9);
	}

	componentDidMount() {
		// 取得真实节点
		let realDom = ReactDom.findDOMNode(this.continer.current);
		/**
		 * 实时监听例子
		 */
		Highcharts.setOptions({
			global: {
				useUTC: false
			}
		});
		// Create the chart
		Highcharts.stockChart(this.id, {
			chart: {
				events: {
					load: function() {
						// set up the updating of the chart each second
						var series = this.series[0];
						setInterval(function() {
							var x = (new Date()).getTime(), // current time
								y = Math.round(Math.random() * 100);
							series.addPoint([x, y], true, true);
						}, 1000);
					}
				}
			},
			rangeSelector: {
				buttons: [{
					count: 1,
					type: 'minute',
					text: '1M'
				}, {
					count: 5,
					type: 'minute',
					text: '5M'
				}, {
					type: 'all',
					text: 'All'
				}],
				inputEnabled: false,
				selected: 0
			},
			title: {
				text: 'Live random data'
			},
			tooltip: {
				split: false
			},
			exporting: {
				enabled: false
			},
			series: [{
				name: '随机数据',
				data: (function() {
					// generate an array of random data
					var data = [],
						time = (new Date()).getTime(),
						i;
					for (i = -999; i <= 0; i += 1) {
						data.push([
							time + i * 1000,
							Math.round(Math.random() * 100)
						]);
					}
					return data;
				}())
			}]
		});
	}

	componentWillUnMount() {

	}

	render() {
		return (
			<div id={this.id} style={{width:this.props.width + "px",height:this.props.height + "px"}}></div>
		);
	}
}

export default RealTimeChart