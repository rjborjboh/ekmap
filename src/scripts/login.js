/**
 * login module
 */
import $ from 'jquery';

import 'ek-style/common.css';
import 'ek-style/login.css';
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.min.js'

import React from 'react';
import ReactDOM from 'react-dom';
// import App from '../App.jsx';
import spin from 'spin';
import * as serviceWorker from '../serviceWorker';

import {
	SiteHeader,
	SiteInfo,
	LayerMsg
} from './loginRender.js';
import {
	HelloMsg
} from './test/test';
import {
	ToDoApp
} from './test/app';


ReactDOM.render(<SiteHeader />, $('#siteHeader')[0]);
ReactDOM.render(<SiteInfo />, $('#siteInfo')[0]);
ReactDOM.render(<LayerMsg />, $('#layerMsg')[0]);

ReactDOM.render(<HelloMsg />, $('#tick')[0]);
ReactDOM.render(<ToDoApp />, $('#app')[0]);
// ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();

var config = require('ek-config/ekMap.config');
$(function() {
	/*追加site logo*/
	$('#site_logo>img').attr('src', '../images/home/logo.jpg');

	/*追加site name*/
	$('#site_name>img').attr('src', '../images/site_login_title.png');

	/*追加site img*/
	$('#site_img>img').attr('src', '../images/site_login_img.png');

	// if successed login, then redirect to home page.
	$(':submit').click(function() {
		window.location.href = "./screen/index.html";
		// prevent default event of browser.
		return false;
	});
	// show view.
	$(document.body).show();
});