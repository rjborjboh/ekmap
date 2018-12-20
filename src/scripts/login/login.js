/**
 * login module
 */
 var $ = require('jquery');
 var commonjs = require('commonjs');
 var request = require('request');
 var helper = require('./helper');
 
 var React = require('react');
 var ReactDom = require('reactDom');
 
 // 手动定义登录机能页面的[hash]
 if (!seajs.router) seajs.router = {};
 seajs.router.hash = 'login';
 
 seajs.use([ 'styles/common.css?nowrap', 'styles/login.css?nowrap' ], function() {
    // 页面加载CSS结束-显示页面
    $(document.body).show(0);
	// CSS模块文件已经下载解析好
	console.log('login css files have been imported!');
 });

 // 追加site logo
 $('#site_logo>img').attr('src', 'images/home/logo.jpg');
 // 追加site name
 $('#site_name>img').attr('src', 'images/site_login_title.png');
 // 追加site img
 $('#site_img>img').attr('src', 'images/site_login_img.png');
 
 // 用户密码的查看处理
 $('.glyphicon-eye-open').click(function(){
     var $pwd = $('input[data-param=password]');
     var ispwd_status = ($pwd.attr('type') == 'password');
     $pwd.attr('type', ispwd_status ? 'text' : 'password');
 });
 
 /* [登录] 按钮的事件处理 */
 $(':submit').click(function(){
     // 登录信息
     var logInfo = $(document.body).html2Json('data-param');
	request.ajax({
		urlkey: 'user_login',
		type: 'post',
		data: logInfo
	}, {
        success : function(d) {
            var data = d && d.data;
            if (!data) {
                return this.fail();
            }
            commonjs.storage('Auth-Token', data.jwt);
            commonjs.storage('user', data.userInfo);
            helper.fetchPremission({success: function(menus){
                commonjs.storage('uMenus', menus);
                /* 当checked记住用户名和密码 */
                if ($('input[type=checkbox]').is(':checked')) {
                    // 将用户名和密码保存在cookie中(保存30天)
                    $.cookie.json = true;
                    $.cookie('np', logInfo, {expires: 30});
                }
                // 跳转到[Home]页面
                window.location.href = './screen/';
            }, fail: function(data){
                this.fail(data);
            }});
        },
        fail : function(err) {
            commonjs.createLayerMsg([ 'confirm' ], {
                title : 'login',
                body : (err && err.code == '20004') ? 'E001' :'common.E001',
            });
        }
    });
	// prevent default event of form [submit] button.
	return false;
 });
 
 // check是否保存在[cookie]中,是的话取出并初期化页面入力
 var cookieData = $.cookie('np');
 if (cookieData) {
     cookieData = JSON.parse(cookieData);
     $(document.body).json2Html('data-param', cookieData || {});
 }
 
 /*<!-- React example --> Start*/
 const e = React.createElement;
 ReactDom.render(
    e('div', null, 'Hello World'),
    document.querySelector('#reacTest')
 );
 //sss
 require('./aBabel.jsx#');
/*
------------------------------------------------
For example, this code written with JSX:
******
*HTML Need Import: <script src="https://cdn.staticfile.org/babel-standalone/6.26.0/babel.min.js"></script>
*if we want to use JSX，then <script> attribute type must set [text/babel]。
******
class Hello extends React.Component {
  render() {
    return <div>Hello {this.props.toWhat}</div>;
  }
}

ReactDOM.render(
  <Hello toWhat="World" />,
  document.getElementById('root')
);
------------------------------------------------
can be compiled to this code that does not use JSX:
class Hello extends React.Component {
  render() {
    return React.createElement('div', null, `Hello ${this.props.toWhat}`);
  }
}

ReactDOM.render(
  React.createElement(Hello, {toWhat: 'World'}, null),
  document.getElementById('root')
);
------------------------------------------------
 */
 /*<!-- React example --> End*/