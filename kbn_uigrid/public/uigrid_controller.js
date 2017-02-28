define(function (require) {

  require('jquery');
  require('./lib/angular-touch');
  require('./lib/ui-grid.min.css');
  require('./lib/ui-grid.min');
  require('./lib/autoFitColumns.min');
  require('ui/doc_viewer');

  var module = require('ui/modules').get('kibana/kbn_uigrid', ['kibana', 'ngTouch', 'ui.grid', 'ui.grid.autoFitColumns', 'ui.grid.autoResize', 'ui.grid.resizeColumns', 'ui.grid.moveColumns',
    'ui.grid.selection', 'ui.grid.exporter', 'ui.grid.pagination', 'ngSanitize', 'ui.bootstrap']);

  module.controller('KbnUIGridController', function ($scope, $element, $rootScope, Private, $route, config, Notifier) {
    var filterManager = Private(require('ui/filter_manager'));
    var SearchSource = Private(require('ui/courier/data_source/search_source'));
    var notify = new Notifier();

    $scope.columns = [];
    if ($route.current.locals.savedVis) { 
      $scope.columns = $route.current.locals.savedVis.savedSearch.columns;
      $scope.columns = _.difference($scope.columns, $scope.vis.indexPattern.metaFields)
      if (!$scope.vis.params.gridColumns.length) $scope.vis.params.gridColumns = $scope.columns.join();
    } else {
      $scope.columns = $scope.vis.params.gridColumns.split(',');
    }

    $scope.filter = function (field, value) {
      filterManager.add(field, value, null, $scope.vis.indexPattern.title);
    };

    var chart_width, chart_height;

    var _updateDimensions = function () {
        var delta = 1;
        var heightDelta = 20;
        var width = $element.parent().width();
        var height = $element.parent().height();

        if (width) {
            if (width > delta) {
                chart_width = width - delta;
            } else {
                chart_width = width
            }
        }

        if (height) {
            if (height > heightDelta) {
                chart_height = height - heightDelta;
            } else {
                chart_height = height
            }
        }
        //$scope.chart.setSize(chart_width, chart_height);
        //if (chart_height) $scope.height = chart_height;
        $('.myGrid').css('height', chart_height);
        $('.myGrid').css('width', chart_width);         
        //if ($scope.grid) $scope.grid.resizeCanvas(); 
    };

    $scope.$on('change:vis', function () {
        //if (_.isUndefined($scope.grid)) return;
        _updateDimensions();
    });

    $scope.getColWidth = function (colsSize) {
      return $element.parent().width() / colsSize;
    };

    $scope.addFilter = function(row, col){
      let cellValue = row.grid.getCellValue(row, col);
      $scope.filter(col.field, cellValue);
    };

    // $scope.vis.params.enableSorting = true;
    // $scope.vis.params.enableColumnResizing = true;
    // $scope.vis.params.enableGridMenu = true;
    // $scope.vis.params.exporterCsvFilename = 'download.csv';
    // $scope.vis.params.paginationPageSize = 500;

    $scope.$watch('esResponse', function (resp) {
      if (!resp) {
          return;
      }

      if ($scope.gridOptions && $scope.vis.params.enableAutoFitColumns) delete $scope.gridOptions;
      if (!$scope.gridOptions) {
        $scope.gridOptions = {
          paginationPageSizes: [25, 50, 100, 200, 500],
          // paginationPageSize: $scope.vis.params.paginationPageSize,
          // enableSorting: $scope.vis.params.enableSorting,
          // enableColumnResizing: $scope.vis.params.enableColumnResizing,
          // enableGridMenu: $scope.vis.params.enableGridMenu,
          enableSelectAll: true,
          exporterMenuPdf: false,
          gridMenuShowHideColumns: false,
          //showGridFooter: true,
          //exporterCsvFilename: $scope.vis.params.exporterCsvFilename,
          onRegisterApi: function(gridApi){
            $scope.gridApi = gridApi;
          },
          columnDefs: [],
          data: []
        };
      }
      $scope.gridOptions.paginationPageSize = parseInt($scope.vis.params.paginationPageSize);
      $scope.gridOptions.enableSorting = $scope.vis.params.enableSorting;
      $scope.gridOptions.enableColumnResizing = $scope.vis.params.enableColumnResizing;
      $scope.gridOptions.enableGridMenu = $scope.vis.params.enableGridMenu;
      $scope.gridOptions.exporterCsvFilename = $scope.vis.params.exporterCsvFilename;

      var searchSource = new SearchSource();
      searchSource.set('filter', searchSource.getOwn('filter'));
      searchSource.set('query', searchSource.getOwn('query'));
      searchSource.size($scope.vis.params.rowsCount);
      searchSource.index($scope.vis.indexPattern);
      //searchSource.index($scope.searchSource.get('index'));
      searchSource.onResults().then(function onResults(searchResp) {
        // let colsSize = _.keys(searchResp.hits.hits[0]['_source']).length;
        // let colWidth = $scope.getColWidth(colsSize);
        if ($scope.columns) {
          _.each($scope.columns, function (field, j) {
              $scope.gridOptions.columnDefs.push({id: field, name: field, enableColumnMenu: false, displayName: field,
              cellTemplate:require('plugins/kbn_uigrid/cell_template.html')});
          });
        } else {
          _.each(_.keys(searchResp.hits.hits[0]['_source']), function (field, j) {
              $scope.gridOptions.columnDefs.push({id: field, name: field, enableColumnMenu: false, displayName: field,
              cellTemplate:require('plugins/kbn_uigrid/cell_template.html')});
          });
        }

        let data = [];
        _.each(searchResp.hits.hits, function (hit, i) {
          if (_.intersection(_.keys(hit['_source']), $scope.columns).length > 0) {
            hit = $scope.vis.indexPattern.formatHit(hit);
            data.push(hit);
            //data.push(hit['_source']);
          }
        });
        $scope.gridOptions.data = data;
        _updateDimensions();
      });
      searchSource.fetchQueued();
    });

    $scope.exportAsCsv = function () {
      $scope.showSpinner = true;
      var searchSource = new SearchSource();
      searchSource.set('filter', searchSource.getOwn('filter')); 
      searchSource.set('query', searchSource.getOwn('query'));
      searchSource.size(10000);
      searchSource.index($scope.vis.indexPattern);
      searchSource.onResults().then(function onResults(resp) {

        // Abort if something changed
        //if ($scope.searchSource !== $scope.searchSource) return;
        var csv = new Blob([$scope.toCsv(true, resp.hits.hits)], { type: 'text/plain' });
        $scope.showSpinner = false;
        $scope._saveAs(csv, 'download.csv');

      }).catch(notify.fatal);
      searchSource.fetchQueued();
    };

    $scope._saveAs = require('@spalger/filesaver').saveAs;
    $scope.csv = {
      separator: config.get('csv:separator'),
      quoteValues: config.get('csv:quoteValues')
    };

    $scope.toCsv = function (formatted, rows) {
      var csv = [];
      //var rows = $scope.hits;
      var columns = $scope.columns;
      var nonAlphaNumRE = /[^a-zA-Z0-9]/;
      var allDoubleQuoteRE = /"/g;

      function escape(val) {
        if (!formatted && _.isObject(val)) val = val.valueOf();
        val = String(val);
        if ($scope.csv.quoteValues && nonAlphaNumRE.test(val)) {
          val = '"' + val.replace(allDoubleQuoteRE, '""') + '"';
        }
        return val;
      }

      csv.push(_.map(columns, function (col) {
        return escape(col);
      }).join(","));

      _.forEach(rows, function (row) {
        //row = $scope.indexPattern.formatHit(row);
        csv.push(_.map(columns, function (col) {
          return escape(row._source[col]);
        }).join(","));
      });
      return csv.join("\r\n") + "\r\n";
    };
  });
});

