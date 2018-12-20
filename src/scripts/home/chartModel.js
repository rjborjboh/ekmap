import React, {
	Component
} from 'react';
import ReactDOM from 'react-dom';

const commonjs = require('ek-utils/common');
const chartModel = require('ek-utils/chartModel');
// 创建生成统计图工具实例对象
const analyseChart = new chartModel();

class ChartModel extends Component {
	constructor(props) {
		super(props);

		let interval = commonjs.int(props.interval, 5000);
		this.state = {
			ajaxFrequency: interval, // refresh
		};

		this.container = new React.createRef();
	}

	refresh() { // show echart
		if (analyseChart.eChart) {
			return analyseChart.showConditionChart();
		}
		let container = ReactDOM.findDOMNode(this.container.current);
		// 实例化图表实例
		analyseChart.init(container.id, this.props.viewOption);

		// 初期化显示echart
		analyseChart.eChartType = this.props.chartType || 'Bar';
		analyseChart.delayEchartView();
	}

	componentDidMount() {
		this.refresh();
		this.interval = setInterval(() => this.refresh(), this.state.ajaxFrequency);
	}

	componentWillUnMount() {
		clearInterval(this.interval);
	}

	render() {
		return (
			<div id={this.props.echartId} ref={this.container}></div>
		);
	}
}

export default ChartModel