/**
 * 用户登录成功后需要做的一些验证或者从后台取得数据
 */
var $ = require('jquery');
var commonjs = require('ek-utils/common');

// 后台返回的menu菜单数据
var uMenuNodes;
var helper = {
    /*
     * 根据登录用户权限生成导航菜单
     * */
    createPageMenus: function() {
        // check/初始化页面=菜单
        uMenuNodes = commonjs.storage('routerMenus') || [];
        if (uMenuNodes.length === 0) helper.convertTreeMenus();
        if (!uMenuNodes || uMenuNodes.length === 0) return false;
        // 取得导航菜单类HTML片段的模板,用以生成菜单内容
        var menusTab = $('#guide_tablist'),
            liMenuModel = menusTab.find('ul>li.hidden');
        var uMenuDomNode = undefined;

        // 初始化页面菜单HTML
        menusTab.find('ul[data-menus]>li:gt(0)').remove();

        /* 将转换后数据菜单结构数据生成菜单HTML内容展示 */
        $.each(uMenuNodes, function(index, menu) {
            uMenuDomNode = liMenuModel.clone().removeClass('hidden');
            var menuDomInner = uMenuDomNode.children('div');
            var mainALabel = menuDomInner.eq(0).attr('id', menu.pageId)
                .children('h4:first').find('a').eq(0);
            //////////再次check菜单array,如果某个菜单中只有一个子菜单的话,
            //////////则将该菜单重新调整为没有子菜单的菜单(菜单名为父菜单名)
            if (menu.nodes && menu.nodes.length === 1) {
                var only_child = menu.nodes[0];
                only_child.name = menu.name || only_child.name;
                menu = only_child;
            }

            // 修改菜单矢量图标
            mainALabel.find('i:first').addClass(helper.updateGlyphicon(menu.pageId, menusTab));
            // 父菜单名
            if (!menu.pageId && !menu.isParent) { // 无效的菜单项
                menu.name += '<span class="label label-danger">(无效)</span>';
                mainALabel.find('span:first').html(menu.name);
            } else {
                mainALabel.find('span:first').text(menu.name);
            }
            if (!commonjs.isArray(menu.nodes)) { // 没有子菜单
                // 将子菜单区域删除
                uMenuDomNode.children().eq(1).remove();
                // 将指示箭头删除
                mainALabel.find('span:last').remove();
                // 设置机能页面ID
                mainALabel.attr('data-link', menu.pageId);
            } else { // 生成子菜单
                var subMenusId = 'sub_' + (menu.pageId || new Date().getTime().toString()),
                    subMenuDomDiv = menuDomInner.eq(1),
                    subMenuDomUl = subMenuDomDiv.find('ul').first(),
                    subMenuLiModel = subMenuDomUl.children().eq(0);
                var subMenu, subLiMenuModelTmp;
                /* (bootstrap)在HTML中关联层级(父子)菜单 */
                mainALabel.attr('href', '#' + subMenusId);
                mainALabel.attr('aria-controls', subMenusId);
                subMenuDomDiv.attr('id', subMenusId);
                subMenuDomDiv.attr('aria-labelledby', menu.pageId);

                for (var i in menu.nodes) {
                    subMenu = menu.nodes[i];
                    subLiMenuModelTmp = subMenuLiModel.clone();
                    subLiMenuModelTmp.attr('data-link', subMenu.pageId);
                    if (!subMenu.pageId && !subMenu.isParent) {
                        subMenu.name += '<span class="label label-danger">(无效)</span>';
                        subLiMenuModelTmp.html(subMenu.name);
                    } else {
                        subLiMenuModelTmp.text(subMenu.name);
                    }
                    subLiMenuModelTmp.appendTo(subMenuDomUl);
                }
                subMenuLiModel.remove();
            }
            // 插入到页面
            uMenuDomNode.appendTo(liMenuModel.parent());
        });

        // 移除不需要的HTML
        liMenuModel.remove();
        menusTab.find('ul.glyphicon-menus').remove();

        // // 界面加载并初始化完成后,清除一些垃圾变量数据
        // dbMenusData = undefined;
    },
    convertTreeMenus: function() {
        uMenuNodes = [];
        var dbMenusData = commonjs.rmvStorage('uMenus');
        if (!dbMenusData || !commonjs.isArray(dbMenusData) ||
            dbMenusData.length === 0) return false;
        // 取得导航菜单类HTML片段的模板,用以生成菜单内容
        var uMenuNode = undefined,
            pageIds = [];
        /* 转换后台菜单数据为前台需要的结构 */
        $.each(dbMenusData, function(index, menu) {
            if (!menu.menuId || !menu.pageId) return false;
            pageIds.push(menu.pageId);
            if (menu.menuVisible !== 1) return;
            /* [menuVisible=1]则menu菜单需要在导航栏显示 */
            uMenuNode = {
                id: menu.menuId,
                name: menu.menuName,
                pageId: menu.pageId,
                parentId: menu.parentMenuId,
                parentPageId: menu.parentPageId,
                parentName: menu.parentMenuName,
                menuVisible: menu.menuVisible
            };
            if (!helper.updateMenusNode(uMenuNodes, uMenuNode)) {
                uMenuNodes.push(uMenuNode);
            }
        });
        // 排序以保证显示顺序不变
        commonjs.sort(uMenuNodes, false, 'id', true);
        // 保存前台menus信息(不做全局变量是为了防止页面刷新后菜单显示错误问题)
        commonjs.storage('routerMenus', uMenuNodes);
        // 保存可访问(有权限)的页面hash值
        commonjs.storage('enabledHashes', pageIds);
    },
    /**
     * 转换后台菜单数据为前台需要的结构用于生成层级菜单HTML
     * */
    updateMenusNode: function(menuNodes, node) {
        var loopNode, updated = false;
        for (var i = 0, l = menuNodes.length; i < l; i++) {
            loopNode = menuNodes[i];
            if (!commonjs.isInvalidValue(node.id)) {
                if (loopNode.isParent &&
                    loopNode.id === node.id) { // 与case[3]对应
                    loopNode.pageId = node.pageId;
                    loopNode.parentId = node.parentId;
                    loopNode.parentName = node.parentName;
                    updated = true;
                    break;
                }
                if (loopNode.parentId === node.id) { // [case 1]
                    node.nodes = [];
                    node.isParent = true;
                    node.nodes.push(loopNode);
                    menuNodes[i] = node;
                    updated = true;
                    break;
                }
            }
            if (!updated && !commonjs.isInvalidValue(node.parentId)) {
                if (loopNode.id === node.parentId) { // [case 2]
                    if (!loopNode.nodes) loopNode.nodes = [];
                    loopNode.isParent = true;
                    loopNode.nodes.push(node);
                    if (!loopNode.name) loopNode.name = node.parentName
                    updated = true;
                    break;
                } else if (loopNode.parentId === node.parentId) { // [case 3]
                    var pMenuNode = {
                        id: node.parentId,
                        name: node.parentName,
                        nodes: []
                    };
                    pMenuNode.pageId = node.parentPageId || new Date().getTime().toString();
                    pMenuNode.isParent = true;
                    pMenuNode.nodes.push(loopNode);
                    pMenuNode.nodes.push(node);
                    menuNodes[i] = pMenuNode;
                    updated = true;
                    break;
                }
            }
            // 循环子菜单创建菜单层级关系
            if (!updated && commonjs.isArray(loopNode.nodes)) {
                updated = helper.updateMenusNode(loopNode.nodes, node);
            }
            if (updated) break;
        }
        return updated;
    },
    /**
     * 更新主菜单的icon图标
     * */
    updateGlyphicon: function(pid, $menuTabs) {
        if (!$menuTabs) $menuTabs = $('#guide_tablist');
        var iconDom = $menuTabs.children('ul.glyphicon-menus').first();
        return iconDom.find('li[data-icon~=' + pid + ']').first().text();
    },
    /**
     * 根据id取得对应的menu菜单信息
     * @param ids string|array 目标menu的id(s)
     * @param multiAble boolean 是否返回多目标(true-返回多个;false-按下标取第一个有效值)
     * */
    getMenuById: function(ids, multiAble) {
        var nowId = undefined,
            targetIds = [];
        if (!ids || !(commonjs.isString(ids) ||
                commonjs.isArray(ids))) return undefined;
        if (commonjs.isString(ids)) {
            targetIds.push(ids);
        } else {
            targetIds = ids;
        }
        multiAble = !!multiAble;
        if (multiAble) {
            return commonjs.filterArray(uMenuNodes, function(menu) {
                return targetIds.indexOf(menu.id) > -1;
            }, 'nodes');
        }
        var onlyMenu = undefined,
            filtered = undefined;
        var filterMenus = function() {
            if (targetIds.length < 1) return onlyMenu;
            nowId = targetIds.shift();
            filtered = commonjs.filterArray(uMenuNodes, function(menu) {
                return menu.id === nowId;
            }, 'nodes');
            onlyMenu = (filtered.length > 0) && filtered[0];
            if (onlyMenu) return onlyMenu;
            return filterMenus();
        };
        return filterMenus();
    }
};

// 对外接口
module.exports = helper;