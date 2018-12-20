import $ from 'jquery';
import React, {
	Component
} from 'react';

const commons = require('ek-utils/common');

class PagesFragment extends Component {
	constructor(props) {
		super(props);
		this.state = {};
		this.state.pages = [{
			id: 'sidePanel',
			url: 'home/sidePanel.html'
		}, {
			id: 'footer',
			url: 'home/footer.html'
		}, {
			id: 'context',
			url: 'common/contextMenu.html'
		}, {
			id: 'popMsg',
			url: 'common/layerMsg.html'
		}, {
			id: 'modalPage',
			url: 'common/hashModalPage.html'
		}];
	}

	render() {
		return (
			<div className="row-fluid w-100-percent">
				{this.state.pages.map(page => (
                    <Page key={page.id} path={page.url}/>
                ))}
			</div>
		);
	}
}

class Page extends Component {
	constructor(state) {
		super(state);
	}

	load() {
		var dom = $(this.refs.pDom);
		var node, pageUrl = this.props.path;
		if (!pageUrl) return;
		node = document.createElement('div');
		this.serverRequest = $(node).load(pageUrl, undefined, function(data) {
			data = commons.compressorHTML(data);
			dom.replaceWith(data);
		}).bind(this);
	}

	componentDidMount() {
		this.load();
		if (this.props.didMount) this.props.didMount();
	}

	componentWillUnMount() {
		this.serverRequest.abort();
	}

	render() {
		return (
			<div className="page" ref="pDom"></div>
		);
	}
}

export {
	Page,
	PagesFragment
};