/**
 * side panel model
 */
var $ = require('jquery');
var $pageBasic = require('./pageDoms');
var commonjs = require('ek-utils/common');
var request = require("ek-utils/request");

// var spaRouter = seajs.router;
var ekMap = {};
var collapseHided2goStack = [];
var attachEvents = {
    collapsedTablistWidth: 55,
    $activeCollapseNode: undefined,
    /*
     * 初始化网站头部的注册事件
     * */
    _headerSettingEvents: function() {
        var $siteSettings = $pageBasic.$siteHeader.find('.site-set');

        // 取得(如果有未读)并显示消息条数
        $siteSettings.find('span.site-msg-number.badge').text(5);
        // 画面动画效果提示用户未读消息
        $siteSettings.find('#msg_inbox_bar').pulsate({
            monitor: '.site-msg-number.badge',
            interval: true,
            /*onHover: true,*/
            color: "#dd5131",
            repeat: 5
        });
        // 取得(如果有未读)并显示任务条数
        $siteSettings.find('span.site-task-number.badge').text(5);
        // 画面动画效果提示用户未完成任务
        $siteSettings.find('#task_inbox_bar').pulsate({
            monitor: '.site-task-number.badge',
            onHover: true,
            color: "#18ccbb",
            repeat: 5
        });

        $siteSettings.find('.dropdown.pulsate').on('shown.bs.dropdown', function() {
            if ($(this).pulsate('data')['interval']) {
                $(this).pulsate('pause');
            } else {
                $(this).pulsate('destroy');
                $(this).pulsate('data')['forbidden'] = true;
            }
        });
        $siteSettings.find('.dropdown.pulsate').on('hidden.bs.dropdown', function() {
            if ($(this).pulsate('data')['interval']) {
                $(this).pulsate('restart');
            } else {
                $(this).pulsate('data')['forbidden'] = false;
            }
        });
        ////////注册退出按钮事件(#exit)
        $siteSettings.find('#exit').click(function() {
            var $this = $(this);
            // 清除后台数据关联
            request.ajax({
                urlkey: 'user_logout',
                type: "post"
            }, {
                success: function(d) {
                    // 用户退出登录处理(清空用户数据)
                    commonjs.logout();
                },
                fail: function() {
                    commonjs.createLayerMsg({
                        confirm: function() {
                            $this.trigger('click');
                        },
                        cancel: undefined
                    }, {
                        body: 'common.E004',
                    });
                }
            });
        });

        ////////注册下拉列表中的事件(.dropdown)
        $siteSettings.find('li.dropdown>ul>li').each(function(index, li) {
            // to do something.

        });
    },
    /* @description
     *  [header]右部的消息数/内容显示/更新用
     * */
    _renderHeaderMsg: function() {
        //        var user = commonjs.storage("user");
        var $siteSettings = $pageBasic.$siteHeader.find('.site-set');
        var $msgInboxBar = $pageBasic.$msgInboxBar, // 消息通知
            $taskInboxBar = $pageBasic.$taskInboxBar, // 任务通知
            $userInboxBar = $pageBasic.$userInboxBar; // 用戶设置等
        // 设置用户名
        $userInboxBar.find('a>span.username').text(commonjs.storage2get('user', 'name'));
    },
    /*****取得选中菜单的完整路径  Start*****/
    _guidePathStack: function(paths, $d_node) {
        if (!$d_node || $d_node.hasClass('sidebar')) return paths || [];
        var dataLink = $d_node.attr('data-link'),
            makePathStr = function(path_info, text) {
                if (paths.length === 0) {
                    return '<li class="acrive">' + text + '</li>';
                }
                return '<li><a data-role="path" ' + path_info + text + '</a></li>';
            };
        if ($d_node[0].nodeName === 'LI' && $d_node.hasClass('list-group-item')) {
            //点击的是子菜单[li]
            paths.push(makePathStr('data-openLink="' + dataLink +
                '">', $d_node.html()));
            var labelledbyId = $d_node.parent().parent().attr('aria-labelledby');
            return attachEvents._guidePathStack(paths, $('#' + labelledbyId + ' a[role="button"]'));
        } else if ($d_node[0].nodeName === 'A') {
            if (dataLink) { //没有子菜单
                paths.push(makePathStr('data-openLink="' + dataLink +
                    '">', $d_node.find('span.title').html()));
            } else {
                paths.push(makePathStr('data-ariaControls="' + $d_node.attr('aria-controls') +
                    '">', $d_node.find('span.title').html()));
            }
            while ($d_node[0].nodeName !== 'LI' && !$d_node.hasClass('sidebar')) {
                $d_node = $d_node.parent();
            }
            return attachEvents._guidePathStack(paths, $d_node);
        }
        return paths || [];
    },
    /*****取得选中菜单的完整路径  End*******/
    _showFullGuidePath: function($d_node) {
        $pageBasic.$guidePath.html(
            '<ol class="breadcrumb">' +
            this._guidePathStack([], $d_node).reverse().join('') + '</ol>');
        // 添加Path路径的click监听事件
        $pageBasic.$guidePath.find('ol>li>a[data-role="path"]').each(function(index, aDom) {
            $(aDom).click(function() {
                var id = $(this).attr('data-openLink');
                if (id) {
                    $pageBasic.$guideMenu.find(
                            'li[data-link=' + id + ']')
                        .trigger('click');
                } else {
                    $pageBasic.$guideMenu.find(
                            'a[aria-controls=' + $(this).attr('data-ariaControls') + ']')
                        .trigger('click');
                }
            });
        });
    },
    /*****切换主显示区域的画面*****/
    // _changeHash: function() {
    //     var liLink, _this = $(this),
    //         page = _this.attr('data-link');
    //     if (!page) return false;
    //     // 背景色标红
    //     $pageBasic.$guideMenu.find('.panel .active').removeClass('active');
    //     // 标记活动中状态
    //     _this.addClass('active');
    //     _this.parent().parent().addClass('active');
    //     // 关闭非当前模块页面的活动(显示中)[collapse]
    //     $pageBasic.$guideMenu.find('.collapse').not('.active').collapse('hide');

    //     /*右侧显示选中侧三角图案*/
    //     $pageBasic.$guideMenu.find('.panel span.selected').remove();
    //     _this.append('<span class="selected collapse-hidden"></span>');

    //     // 显示菜单路径信息
    //     attachEvents._showFullGuidePath(_this);

    //     // 原则上禁止reload加载当前页面
    //     if (page == spaRouter.manager.decodePageHash(window.location.hash)) return false;

    //     // 切换到选择页面(改变hash值,触发onhashchange事件)
    //     spaRouter.go(page);

    //     // 如果浏览器不支持[onhashchange]事件则主动触发
    //     if (!spaRouter.enableHashChange) spaRouter.refresh();
    // },
    /*****为左侧导航子菜单注册点击事件*****/
    _addGuideMenuEvent: function($liList) {
        if (isNaN($liList && $liList.length) || $liList.length === 0) return false;
        $liList.each(function(index, li) {
            $(li).click(attachEvents._changeHash);
        });
    },
    _expandActiveGuidePath: function() {
        // var $ledbyTreeNode = $pageBasic.$center.find('[data-link=' + spaRouter.hash + ']');
        // $ledbyTreeNode.parents('.collapse').each(function(index, collapse) {
        //     $(collapse).collapse('show');
        // });
        // $ledbyTreeNode.trigger('click');
    },
    /******为左侧导航菜单的展开收起按钮注册点击事件  Start*****/
    _addGuideMenuExpandCollapseEvent: function() {
        $pageBasic.$guideMenus.removeClass('mouseentered');
        $pageBasic.$guideMenus.find('.collapse').collapse('hide');
        $pageBasic.$sidebar.toggleClass('sidebar-closed');
        if (!$pageBasic.$sidebar.hasClass('sidebar-closed')) { // 展开导航菜单
            ekMap.sidebarCollapsed = false;
            $pageBasic.$sidebar[0].style.cssText = '';
            $pageBasic.$centalPage[0].style.cssText = '';
            collapseHided2goStack.push(function() {
                attachEvents._expandActiveGuidePath();
            });
        } else { // 收回导航菜单场合
            ekMap.sidebarCollapsed = true;
            var dynamicWidth = $pageBasic.$sidebar[0].offsetWidth - attachEvents.collapsedTablistWidth;
            $pageBasic.$sidebar.animate({
                width: attachEvents.collapsedTablistWidth + 'px'
            }, 'fast');
            $pageBasic.$centalPage.animate({
                width: '+=' + dynamicWidth + 'px'
            }, 'fast');
            // 导航菜单的收起后mouse事件注册
            $(document).distinctOnEvent('mouseenter.sidebarclosed',
                '#center .sidebar-closed .guide-menu .panel.panel-default',
                function() {
                    var _this = $(this);
                    if (_this.hasClass('mouseentered')) return false;
                    $pageBasic.$guideMenus.removeClass('mouseentered');
                    _this.addClass('mouseentered');
                    if (_this.find('.collapse')) {
                        _this.find('.collapse').collapse('show');
                    }
                });
            $(document).distinctOnEvent('mouseenter.mousemove2central',
                '#center .cma-col-common.cental-page',
                function() {
                    $pageBasic.$guideMenus.removeClass('mouseentered');
                });
        }
    },
    /**
     * @description 根据登录用户的权限来展示对应的机能菜单,并初始化页面点击事件
     * */
    initEvents: function() {
        var _self = this;
        // 设置头部信息显示内容
        _self._renderHeaderMsg();

        // 网站header区域的动作事件注册
        _self._headerSettingEvents();

        /* 导航菜单的展开收起事件以及点击事件的注册 */
        $pageBasic.$expandCollapse.click(_self._addGuideMenuExpandCollapseEvent);

        $pageBasic.$guideMenu.find('.collapse').on('hidden.bs.collapse', function() {
            /*sidePanel的子菜单收起时的注册事件*/
            $(this).parent().find('a>span.arrow').removeClass('open');
            // collapse收回后需要执行的处理
            var execHandler = undefined;
            while (execHandler = collapseHided2goStack.shift()) {
                if ($.isFunction(execHandler)) execHandler();
            }
        }).on('show.bs.collapse', function() {
            // 标记处于活动状态的Collapse
            attachEvents.$activeCollapseNode = $(this);
            $(this).parent().find('a>span.arrow').addClass('open');
            // 关闭非当前模块页面的活动(显示中)[collapse]
            $pageBasic.$guideMenu.find('.collapse').not('.active').collapse('hide');
        });
        $pageBasic.$guideMenu
            .find('.panel .panel-heading .panel-title>a')
            .each(function(index, item) {
                var $item = $(item),
                    rstMatch = ($item.attr('href') + '').match(/^#\w+/i);
                if (rstMatch) { // 有子菜单
                    _self._addGuideMenuEvent($(rstMatch[0] + ' ul>li'));
                } else { // 没有子菜单
                    $item.click(_self._changeHash)
                }
            });
    }
};
// 暴露API
module.exports = attachEvents;