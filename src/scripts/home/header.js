import $ from 'jquery';
import React, {
	Component
} from 'react';
import ReactDom from 'react-dom';
import {
	Timer
} from './timer';

class Header extends Component {
	constructor(props) {
		super(props);
	}

	// componentWillMount() {

	// }

	// componentWillUnMount() {

	// }
	render() {
		return (
			<div className="site-header row-fluid w-100-percent">
				<div className="navbar-header siteLabel">
					<button type="button" className="navbar-toggle collapsed"
						data-toggle="collapse" data-target="#siteHelp" aria-expanded="false"
						aria-controls="navbar">
						<span className="icon-bar"></span>
						<span className="icon-bar"></span>
						<span className="icon-bar"></span>
						<span className="icon-bar"></span>
					</button>
					<div className="navbar-brand siteLogo">
						<img className="img-responsive img-circle" src={require('../../images/home/logo.jpg')} title=""></img>
					</div>
					<div className="navbar-brand h-100-percent siteTitle">
						<p className="site-name"><label className="font-red">安全生产大字标题</label></p>
					</div>
				</div>
				<div className="navbar-collapse collapse site-set" id="siteHelp">
					<Timer format="YYYY/MM/DD HH:mm:ss"/>
				</div>
			</div>
		);
	}
}

export default Header