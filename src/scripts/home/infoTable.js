 import $ from 'jquery';
 import React, {
 	Component
 } from 'react';
 import ReactDOM from 'react-dom';

 const commonjs = require('ek-utils/common');
 const request = require('ek-utils/request');
 const liMarquee = require('ek-libraries/jquery/plugin/limarquee/js/jquery.liMarquee');

 const Arrow = props => {
 	let ascending = props.sortDir === 'ascending';
 	return (
 		<svg viewBox="0 0 100 200" width="100" height="200">
      {!(!ascending && props.isCurrent) && (
        <polyline points="20 50, 50 20, 80 50" />
      )}
      <line x1="50" y1="20" x2="50" y2="180" />
      {!(ascending && props.isCurrent) && (
        <polyline points="20 150, 50 180, 80 150" />
      )}
    </svg>
 	);
 };

 class InfoTable extends Component {
 	constructor(props) {
 		super(props);
 		let interval = commonjs.int(props.option.interval, 5);
 		interval = interval * 1000;
 		this.state = {
 			tabIndex: null, // tabindex
 			ajaxUrl: props.option.ajaxUrl, // data api
 			ajaxData: props.option.ajaxData || {}, // data
 			ajaxFrequency: interval,
 			rows: [], // list data (by api)
 			headers: [], // header data (by api)
 			rowHeader: props.option.rowHeader, // rowHeader 
 			sortable: props.option.sortable, // sortable 
 			sortedBy: null, // sort by header
 			sortDir: 'none' // sort direction
 		};
 		this.container = React.createRef();
 		// update data api
 		this.refresh = this.refresh.bind(this);
 		this.sortedBy = this.sortBy.bind(this);
 		this.marquee = this.marquee.bind(this);

 		this.didMarquee = false;
 		this.captionID =
 			'caption-' + Math.random().toString(36).substr(2, 9);
 	}

 	refresh() { // update table & show
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
 					rows: result.data.rows,
 					headers: result.data.headers,
 					sortedBy: null,
 					sortDir: 'none'
 				});
 				// marquee
 				setTimeout(function() {
 					_self.marquee();
 				}, 1500);
 			}
 		});
 	}

 	marquee() {
 		if (!this.didMarquee) {
 			this.didMarquee = true;
 			$('.table-container').liMarquee({
 				direction: 'up'
 			});
 		} else {
 			$('.table-container').liMarquee('update');
 		}
 	}

 	sortBy(i) {
 		let sortDir;
 		let ascending = this.state.sortDir === 'ascending';
 		if (i === this.state.sortedBy) {
 			sortDir = !ascending ? 'ascending' : 'descending';
 		} else {
 			sortDir = 'ascending';
 		}
 		this.setState(prevState => ({
 			rows: prevState.rows.slice(0).sort((a, b) => {
 				if (sortDir === 'ascending') {
 					return a[i] > b[i] ? 1 : a[i] < b[i] ? -1 : 0;
 				} else {
 					return a[i] < b[i] ? 1 : a[i] > b[i] ? -1 : 0;
 				}
 			}),
 			sortedBy: i,
 			sortDir: sortDir
 		}));
 		// refresh marquee
 		this.marquee();
 	}

 	componentDidMount() {
 		let container = ReactDOM.findDOMNode(this.container.current);
 		let scrollable = container.scrollWidth > container.clientWidth;
 		this.setState({
 			tabIndex: scrollable ? '0' : null
 		});
 		this.refresh();
 		// every 
 		this.intervalAjax = setInterval(() => this.refresh(), this.state.ajaxFrequency);
 	}

 	componentWillUnMount() {
 		clearInterval(this.intervalAjax);
 	}

 	render() {
 		return (
 			<div className="tables-container">
 			<div>
				<table>
	 				<caption id={this.captionID}>
	 					{this.props.caption}
	 					{this.state.tabIndex === '0' && (
			                <div>
			                  <small>(scroll to see more)</small>
			                </div>
			            )}
	 				</caption>
	 				<tbody className={this.captionID}>
		 				<tr>
							{this.state.headers.map((header, i) => 
								<th
								 role="columnheader"
								 scope="col"
								 aria-sort={
				                    this.state.sortedBy === i ? this.state.sortDir : 'none'
				                 }
								 key={i}>
								{header}
								{this.state.sortable && (
				                      <button onClick={() => this.sortBy(i)}>
				                        <Arrow
				                          sortDir={this.state.sortDir}
				                          isCurrent={this.state.sortedBy === i}
				                        />
				                        <span className="visually-hidden">
				                          sort by {header} in
				                          {this.state.sortDir !== 'ascending'
				                            ? 'ascending'
				                            : 'descending'}
				                          order
				                        </span>
				                      </button>
				                    )}
								</th>
							)}
		 				</tr>
	 				</tbody>
	 			</table>
 			</div>
	        <div
	          className="table-container"
	          ref={this.container}
	          tabIndex={this.state.tabIndex}
	          aria-labelledby={this.captionID}
	          role="group">
 			<table>
 				<tbody className={this.captionID}>
	 				{this.state.rows.map((row, i) => 
	 					<tr key={i}>
	 						{row.map((cell, i) => 
	 							(this.state.rowHeader && i < 1) ?
	 								(<th scope="row" key={i}>{cell}</th>) : 
	 								(<td scope="row" key={i}>{cell}</td>)
	 						)}
	 					</tr>
	 				)}
 				</tbody>
 			</table>
 			</div>
	        <div className="lists-container">
	          <h2>{this.props.caption}</h2>
	          {this.state.rows.map((row, i) => (
	            <div key={i}>
	              <h3>{row[0]}</h3>
	              <dl>
	                {this.state.headers.map(
	                  (header, i) =>
	                    i > 0 && (
	                      <React.Fragment key={i}>
	                        <dt>{header}</dt>
	                        <dd>{row[i]}</dd>
	                      </React.Fragment>
	                    )
	                )}
	              </dl>
	            </div>
	          ))}
	        </div>
	    	</div>
 		);
 	}
 }

 export default InfoTable