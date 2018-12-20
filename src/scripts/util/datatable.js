/**
 * jQuery dataTable creator Module.
 */
var $ = require('jquery');
var commonjs = require('./common');

var jTable = {
    /* *
     *  @description
     *   create jQuery dataTable.
     *  @param
     *   -[page]: string hash page id
     *  @param
     *   -[selector]: string table selector
     *  @param
     *   -[options]: object user settings info.
     *   @param
     *   -[additions]: additional call-back functions.
     *  @return
     *   -jQuery dataTable instance.
     * */
    tableSettings: function(page, selector, options, additions) {
        if (!page || !selector) return options;
        options = options || {};
        additions = additions || {};

        var $page = $(page);
        var settings = {
            stateSave: false, //  store state information such as pagination position, display length,
            // filtering and sorting. When the end user reloads the page,
            // the table's state will be altered to match what they had previously set up.
            ordering: true, // Enable column order.
            responsive: true, // Enable Responsive
            select: { // Disable selection summary information from being shown in the table information element.
                style: 'os', // api |single |multi |os |multi+shif
                items: 'rows', // row/rows |column/columns |cell/cells
                info: true // info: ${number} rows selected.
            },
            fixedHeader: true, // Enable FixedHeader
            orderClasses: true,
            serverSide: false, // Feature control DataTables' server-side processing mode.
            //  - where filtering, paging and sorting calculations are all performed by a server
            processing: false, // Enable or disable the display of a 'processing' indicator when the table is being processed (e.g. a sort).
            dom: "<'row'<'col-xs-6 col-sm-6 col-md-6 col-lg-6 text-left'>" + // length changing input control
                "<'col-xs-6 col-sm-6 col-md-6 col-lg-6'f>>" + // filtering input
                "<'row'<'col-xs-12 col-sm-12 col-md-12 col-lg-12'tr>>" + // [t]-table <tr> && [r]-processing display element
                "<'row'<'col-xs-5 col-sm-5 col-md-5 col-lg-5'i>" + // table information summary
                "<'col-xs-7 col-sm-7 col-md-7 col-lg-7'p>>", // pagination control
            paging: true, // 是否分页
            pageLength: 25, // 一页显示数据行数
            lengthChange: false,
            pagingType: "full_numbers",
            scrollX: true, // 横滚动条显示
            scrollY: false, // 纵滚动条显示
            destroy: true,
            searching: false, // 查询功能
            language: {
                emptyTable: '没有数据。',
                zeroRecords: '没有数据。',
                loadingRecords: '加载中...',
                lengthMenu: '每页 _MENU_ 件',
                paginate: {
                    first: '首页',
                    last: '末页',
                    next: '下一页',
                    previous: '上一页'
                },
                info: '第 _PAGE_ 页 / 总 _PAGES_ 页',
                infoEmpty: ''
            },
            ajax: {
                data: function(param) {
                    jTable.ganerateAjaxData(param, $page);
                },
                dataSrc: function(response) {
                    if ($.isArray(response)) return response;
                    if (!response.data) return [];
                    return response.data;
                }
            },
            //             stateSaveCallback: function(settings,data) {
            //                 commonjs.storage('DataTables_' + settings.sInstance, JSON.stringify(data));
            //             },
            //             stateLoadCallback: function(settings) {
            //                 return JSON.parse(commonjs.storage('DataTables_' + settings.sInstance) || '{}');
            //             },
            drawCallback: function(settings) {
                /*It can be useful to take an action on every draw event of the table - 
                 * for example you might want to update an external control with the newly displayed data,
                 * or with server-side processing is enabled you might want to assign events to the newly created elements.
                 * This callback is designed for exactly that purpose and will execute on every draw.*/
                // 更新数据显示区域的高度
                var $scrollBody = $page.find('div.dataTables_scrollBody'),
                    dataNumber = settings.aoData && settings.aoData.length;
                if (dataNumber === 0) {
                    $scrollBody.addClass('height-50-px');
                } else {
                    $scrollBody.removeClass('height-50-px');
                }
                // table 内容显示居中
                $scrollBody.addClass('text-center');
                // resize view height.
                commonjs.triggerWindowResizeBy('cental.resize', page);
                // 执行额外的回调处理
                if ($.isFunction(additions.drawCallback)) additions.drawCallback(settings);
                /* 取得DataTables API instance */
                var tableInstance = new $.fn.dataTable.Api(selector);
                if (tableInstance.page() > 0 &&
                    tableInstance.rows()[0].length === 0) { // 返回上一页(当前页不是首页)
                    tableInstance.page('previous').draw('page');
                }
                /* $page.find(selector).on( 'length.dt', function ( e, settings, len ) {
                	 if (len === savediDisplayLength) return false;
                	 savediDisplayLength = len;
                     tableInstance.clearPipeline().clear();
                     // 再次生成初始数据列表
                     tableInstance.ajax.reload(null, false);
                 } );*/
            },
            initComplete: function(settings, json) {
                savediDisplayLength = settings._iDisplayLength;
                /*It can often be useful to know when your table has fully been initialised,
                 * data loaded and drawn, so this callback is provided to let you know
                 * when the data is fully loaded.*/
                $(selector + ' tbody').distinctOnEvent('click', 'tr', function(e) {
                    $(this).toggleClass('selected');
                    // 隐藏右键菜单
                    commonjs.hideContextMenus();
                });
                // resize view height.
                commonjs.triggerWindowResizeBy('cental.resize', page);
                // 执行额外的回调处理
                if ($.isFunction(additions.initComplete)) additions.initComplete(settings, json);
            }
        };

        /* length change 处理 */
        if (options.lengthChange === true) {
            var menu = commonjs.int(options.pageLength, 0),
                allMenu = [-1, 'All'];
            var lengthMenus = [
                [10, 25, 50],
                [10, 25, 50]
            ] /*, savediDisplayLength*/ ;
            $.each(lengthMenus, function(index, menus) {
                if (menu > 0 && menus.indexOf(menu) < 0) {
                    menus.push(menu);
                    commonjs.sort(menus, false);
                }
                menus.push(allMenu[index]);
            });
            options.lengthMenu = lengthMenus;
        }
        return $.extend(true, settings, options);
    },
    ganerateAjaxData: function(param, $page) {
        if (!$page.jquery) $page = $($page);
        var newOrder = "",
            allColums = param.columns;
        comma = "";
        if ($page) {
            var inputs = $page.html2Json('data-param');
            $.extend(param, inputs);
        }
        if (param.order && param.order.length > 0) {
            $.each(param.order, function(index, item) {
                if (index > 0) comma = ", ";
                if (allColums[item.column]) {
                    newOrder += comma + commonjs.reverseCamelCase(allColums[item.column].data) + " " + item.dir;
                }
            });
            param.order = newOrder;
        }
    },
    /**
     * @description
     *     dataTable插件生成表格中,额外追加的[操作]一列的做成
     * */
    renderActionColumn: function(classes, rowKey, location, name, disableFunc) {
        return "<a role='button' class='btn-link " + classes.join(' ') +
            ($.isFunction(disableFunc) && disableFunc() ? " disabled" : "") +
            "' data-row-index='" + location.row + "' data-col-index='" +
            location.col + "' data-row-key='" + rowKey + "'>" + name +
            "</a>"
    },
    /**
     * @description
     *     一次请求只预加载缓存指定页面长度的数据并分页显示
     * */
    pipeline: function() {
        if ($.fn.dataTable.pipeline) {
            return $.fn.dataTable.pipeline;
        }

        var cacheLastJson = null;
        $.fn.dataTable.pipeline = function(opts, $page, requestFinc) {
            // Configuration options
            var conf = $.extend({
                pages: 5, // number of pages to cache
                url: '', // script url
                data: function(param) {
                    jTable.ganerateAjaxData(param, $page);
                    if ($.isFunction(requestFinc)) requestFinc(param);
                },
                // matching how `ajax.data` works in DataTables
                method: 'GET' // Ajax HTTP method
            }, opts);

            // Private variables for storing the cache
            var cacheLower = -1;
            var cacheUpper = null;
            var cacheLastRequest = null;

            return function(request, drawCallback, settings) {
                var ajax = false;
                var requestStart = request.start;
                var drawStart = request.start;
                var requestLength = request.length;
                var requestEnd = requestStart + requestLength;

                if (settings.clearCache) {
                    // API requested that the cache be cleared
                    ajax = true;
                    settings.clearCache = false;
                } else if (cacheLower < 0 || requestStart < cacheLower || requestEnd > cacheUpper) {
                    // outside cached data - need to make a request
                    ajax = true;
                } else if (JSON.stringify(request.order) !== JSON.stringify(cacheLastRequest.order) ||
                    JSON.stringify(request.columns) !== JSON.stringify(cacheLastRequest.columns) ||
                    JSON.stringify(request.search) !== JSON.stringify(cacheLastRequest.search)
                ) {
                    // properties changed (ordering, columns, searching)
                    ajax = true;
                }

                // Store the request for checking next time around
                cacheLastRequest = $.extend(true, {}, request);

                if (ajax) {
                    // Need data from the server
                    if (requestStart < cacheLower) {
                        requestStart = requestStart - (requestLength * (conf.pages - 1));

                        if (requestStart < 0) {
                            requestStart = 0;
                        }
                    }

                    cacheLower = requestStart;
                    cacheUpper = requestStart + (requestLength * conf.pages);

                    request.start = requestStart;
                    request.length = requestLength * conf.pages;
                    request.pageSize = request.length;
                    request.pageNum = Math.floor(drawStart / request.length) + 1;

                    cacheLower = (request.pageNum - 1) * request.pageSize;
                    cacheUpper = cacheLower + request.pageSize;

                    // Provide the same `data` options as DataTables.
                    if ($.isFunction(conf.data)) {
                        // As a function it is executed with the data object as an arg
                        // for manipulation. If an object is returned, it is used as the
                        // data object to submit
                        var d = conf.data(request);
                        if (d) {
                            $.extend(request, d);
                        }
                    } else if ($.isPlainObject(conf.data)) {
                        // As an object, the data given extends the default
                        $.extend(request, conf.data);
                    }

                    settings.jqXHR = $.ajax({
                        "type": conf.method,
                        "url": conf.url,
                        "data": request,
                        "dataType": "json",
                        "cache": false,
                        "beforeSend": function(xhr, settings) {
                            // 追加请求头认证信息
                            xhr.setRequestHeader("Auth-Token", commonjs.storage("Auth-Token"));
                            // 检查[content-type]头信息
                            if (!settings.contentType) settings.contentType = 'application/x-www-form-urlencoded; charset=UTF-8';
                            // 设置返回响应信息数据类型
                            settings.dataType = 'json';
                        },
                        "success": function(json) {
                            if (!json || json.status != 'success' || !json.data) {
                                if (json.code == '20003') { // HTTP 401 Unauthorized
                                    commonjs.createLayerMsg({
                                        confirm: function() {
                                            // 用户退出登录处理(清空用户数据)
                                            commonjs.logout();
                                        }
                                    }, {
                                        title: 'title',
                                        body: json.msg + '</br>' + commonjs.renderMsg('common.E006')
                                    });
                                    return false;
                                }
                                commonjs.createLayerMsg(['confirm'], {
                                    body: 'common.E002'
                                });
                                return false;
                            }
                            // 缓存本次从后台检索取得数据
                            cacheLastJson = $.extend(true, {}, json);
                            // 记录本次缓存开始的行数下标位置
                            cacheLastJson.start = request.start;
                            if (cacheLower != drawStart) {
                                json.data.splice(0, drawStart - cacheLower);
                            }
                            if (requestLength >= -1) {
                                json.data.splice(requestLength, json.data.length);
                            }

                            drawCallback(json);
                        },
                        error: function(xhr, errCode, responseText) {
                            commonjs.createLayerMsg(['confirm'], {
                                body: 'common.E002'
                            });
                        }
                    });
                } else {
                    json = $.extend(true, {}, cacheLastJson);
                    json.draw = request.draw; // Update the echo for each response
                    json.data.splice(0, requestStart - cacheLower);
                    json.data.splice(requestLength, json.data.length);

                    drawCallback(json);
                }
            }
        };

        // Register an API method that will empty the pipelined data, forcing an Ajax
        // fetch on the next draw (i.e. `table.clearPipeline().draw()`)
        $.fn.dataTable.Api.register('clearPipeline()', function() {
            return this.iterator('table', function(settings) {
                settings.clearCache = true;
            });
        });

        // Register an API method that will remove the pipelined data by index, in case that
        // cached data trigger draw error when delete row.
        // (i.e. `table.removePipeline(index).rows(index).remove().draw(false)`)
        $.fn.dataTable.Api.register('removePipeline()', function(index_row_onepage) {
            return this.iterator('table', function(settings) {
                var cachedLine, row_indexes = [],
                    page_ingo = this.page.info();
                // 定位本次缓存实际开始行数的位置
                var start_row = page_ingo.page * page_ingo.length - cacheLastJson.start;
                if (!Array.isArray(index_row_onepage)) {
                    if (isNaN(index_row_onepage)) return false;
                    row_indexes.push(index_row_onepage);
                } else {
                    row_indexes = index_row_onepage;
                }
                commonjs.sort(row_indexes);
                $.each(row_indexes, function(index, row_index) {
                    cachedLine = start_row + commonjs.int(row_index, 0) - index;
                    cacheLastJson.data.splice(cachedLine, 1);
                    cacheLastJson.recordsFiltered--;
                    cacheLastJson.recordsTotal--;
                });
            });
        });
        // Register an API method that will return the pipelined data by indexs
        $.fn.dataTable.Api.register('selectedPipelines()', function(selectedIndexes) {
            var items = [],
                page_ingo = this.page.info();
            // 定位本次缓存实际开始行数的位置
            var start_row = page_ingo.page * page_ingo.length - cacheLastJson.start;
            var cachedLine, loop_rows = [];
            $.each(selectedIndexes, function(index, row_index) {
                cachedLine = start_row + commonjs.int(row_index, 0);
                if (loop_rows.indexOf(cachedLine) < 0) {
                    items.push(cacheLastJson.data[cachedLine]);
                    loop_rows.push(cachedLine);
                }
            });
            return items;
        });
        // Register an API method that will update the pipelined data by index, in case that
        // cached data trigger draw error when update row.
        // (i.e. `table.updatePipeline(index, data).data(index).draw(false)`)
        $.fn.dataTable.Api.register('updatePipeline()', function(index_row_onepage, updateData) {
            return this.iterator('table', function(settings) {
                var page_ingo = this.page.info();
                var cachedLine = page_ingo.page * page_ingo.length + commonjs.int(index_row_onepage, 0);
                cacheLastJson.data[cachedLine] = updateData;
            });
        });

        // return [cacheLastJson] object.
        $.fn.dataTable.Api.register('cachedPipeJson()', function() {
            return cacheLastJson;
        });

        return $.fn.dataTable.pipeline;
    }
};

// export apis.
module.exports = jTable;