【引入方式】
<link rel="stylesheet" type="text/css" href="XX/datatables.min.css"/>
<script type="text/javascript" src="XX/datatables.min.js"></script>
 这等同于CDN上的引入方式
<link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/v/bs/dt-1.10.15/b-colvis-1.3.1/cr-1.3.3/fc-3.2.2/fh-3.1.2/kt-2.2.1/r-2.1.1/rg-1.0.0/rr-1.2.0/sc-1.4.2/se-1.2.2/datatables.min.css"/>
<script type="text/javascript" src="https://cdn.datatables.net/v/bs/dt-1.10.15/b-colvis-1.3.1/cr-1.3.3/fc-3.2.2/fh-3.1.2/kt-2.2.1/r-2.1.1/rg-1.0.0/rr-1.2.0/sc-1.4.2/se-1.2.2/datatables.min.js"></script>
或者
<link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/colreorder/1.3.3/css/colReorder.bootstrap.css"/>
<link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/fixedcolumns/3.2.2/css/fixedColumns.bootstrap.css"/>
<link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/fixedheader/3.1.2/css/fixedHeader.bootstrap.css"/>
<link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/responsive/2.1.1/css/responsive.bootstrap.css"/>
<link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/rowgroup/1.0.0/css/rowGroup.bootstrap.css"/>
<link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/scroller/1.4.2/css/scroller.bootstrap.css"/>
<link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/select/1.2.2/css/select.bootstrap.css"/>
 
<script type="text/javascript" src="https://cdn.datatables.net/colreorder/1.3.3/js/dataTables.colReorder.js"></script>
<script type="text/javascript" src="https://cdn.datatables.net/fixedcolumns/3.2.2/js/dataTables.fixedColumns.js"></script>
<script type="text/javascript" src="https://cdn.datatables.net/fixedheader/3.1.2/js/dataTables.fixedHeader.js"></script>
<script type="text/javascript" src="https://cdn.datatables.net/responsive/2.1.1/js/dataTables.responsive.js"></script>
<script type="text/javascript" src="https://cdn.datatables.net/rowgroup/1.0.0/js/dataTables.rowGroup.js"></script>
<script type="text/javascript" src="https://cdn.datatables.net/scroller/1.4.2/js/dataTables.scroller.js"></script>
<script type="text/javascript" src="https://cdn.datatables.net/select/1.2.2/js/dataTables.select.js"></script>
【功能效果】
效果为引入bootstrap样式的dataTable插件：
【1】需要引入jQuery库文件
【2】需要引入bootstrap的css式样文件
【3】加入了下记功能：
--ColReorder：ColReorder adds the ability for the end user to click and drag column headers to reorder a table as they see fit, to DataTables.
--FixedColumns：FixedColumns provides the ability to fix one or more columns to the left and / or right hand side of a DataTable that scrolls along the x-axis. This can be used if the columns show grouping, index or similar information.
--FixedHeader：When displaying large amounts of data in a table, it can often be useful for the end user to have the column titles always visible. This is particularly true if using DataTables with pagination disabled, or the display length is set to a high value. The FixedHeader extension provides this ability.
--Responsive：In the modern world of responsive web design tables can often cause a particular problem for designers due to their row based layout. Responsive is an extension for DataTables that resolves that problem by optimising the table's layout for different screen sizes through the dynamic insertion and removal of columns from the table.
--RowGroup：RowGroup adds the ability to easily group rows in a DataTable by a given data point. The grouping is shown as an inserted row either before or after the group.
--Scroller：Scroller is a virtual rendering plug-in for DataTables which allows large datasets to be drawn on screen very quickly. 
--Select：Select provides table item selection capabilities - rows, columns and cells can be selected individually or collectively.

上记具体功能(可扩展,可定制)的API可参照下记官方文档：
https://datatables.net/download/index