/**
 * 顶层HTML的一些信息($对象)(必须先引入该文件实例化页面DOM对象，才可以进行其他处理)
 * 注意:该页面只能追加【#cental-area】之外的DOM节点对象
 *     因为【#cental-area】内部的DOM节点会随着location.hash而重新渲染,内存对象会失效
 */
var $ = require('jquery');
module.exports = {
	$winHeight : $(document).height(),
	$winWidth : $(document).width(),
	
	// [header]
	$siteHeader : $('#header .site-header'),
	$msgInboxBar : $('#header #msg_inbox_bar'), // 消息通知
    $taskInboxBar : $('#header #task_inbox_bar'), // 任务通知
    $userInboxBar : $('#header #user_inbox_bar'), // 用戶设置等
	
    // [center]
	$center : $('#center'),
    $centalArea : $('#cental-area'),
	$centalPage : $('#center .cental-page'),
	$sidebar : $('#center .side-panel.sidebar'),
	$expandCollapse : $('div.side-panel.sidebar button.expand-collapse'),
	$guideUser : $('#center .guide-user'),
	$guideMenu : $('#center .guide-menu'),
	$guideMenuTabList : $('#guide_tablist'),
	$guideMenus : $('#center .guide-menu .panel.panel-default'),
	$guidePath : $('#guide-path'),
	$divIframeArea : $('#center div.hash-view-area'),
	
    // [footer]
	$footer : $('#footer'),
};
