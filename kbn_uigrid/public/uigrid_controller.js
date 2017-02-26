define(function (require) {

  require('jquery');
  require('./lib/angular-touch');
  require('./lib/ui-grid.min.css');
  require('./lib/ui-grid.min');
  require('./lib/autoFitColumns.min');

  var module = require('ui/modules').get('kbn_uigrid', ['kibana', 'ngTouch', 'ui.grid', 'ui.grid.autoFitColumns', 'ui.grid.autoResize', 'ui.grid.resizeColumns', 'ui.grid.moveColumns',
    'ui.grid.selection', 'ui.grid.exporter', 'ui.grid.pagination']);

  module.controller('KbnUIGridController', function ($scope, $element, $rootScope, Private) {
    var filterManager = Private(require('ui/filter_manager'));
    var SearchSource = Private(require('ui/courier/data_source/search_source'));

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

    //$scope.data = [];
    //$scope.vis.params.enableAutoFitColumns = false;
    //$scope.gridOptions = {};
    $scope.$watch('esResponse', function (resp) {
      if (!resp) {
          return;
      }

      // let gridId = $('#uigrid_' + $scope.$id);
      // if (gridId) {
        //gridId.remove(); 
      if ($scope.gridOptions) delete $scope.gridOptions;
      $scope.gridOptions = {
        paginationPageSizes: [25, 50, 100, 200, 500],
        paginationPageSize: 500,
        enableSorting: true,
        enableColumnResizing: true,
        enableGridMenu: true,
        enableSelectAll: true,
        exporterMenuPdf: false,
        gridMenuShowHideColumns: false,
        //showGridFooter: true,
        //enableAutoFitColumns: false,
        exporterCsvFilename: 'download.csv',
        onRegisterApi: function(gridApi){
          $scope.gridApi = gridApi;
        },
        columnDefs: [],
        data: []
      };
      //} 
      //if (!_.isUndefined($scope.vis.params.enableAutoFitColumns)) $scope.gridOptions.enableAutoFitColumns = $scope.vis.params.enableAutoFitColumns;

      var mapSearchSource = new SearchSource();
      mapSearchSource.set('filter', mapSearchSource.getOwn('filter'));
      mapSearchSource.set('query', mapSearchSource.getOwn('query'));
      mapSearchSource.size(10);
      mapSearchSource.index($scope.vis.indexPattern);
      mapSearchSource.onResults().then(function onResults(searchResp) {
        // let colsSize = _.keys(searchResp.hits.hits[0]['_source']).length;
        // let colWidth = $scope.getColWidth(colsSize);
        _.each(_.keys(searchResp.hits.hits[0]['_source']), function (field, j) {
            $scope.gridOptions.columnDefs.push({id: field, name: field, enableColumnMenu: false, displayName: field,
            cellTemplate:'<div class="ui-grid-cell-contents" ng-click="grid.appScope.addFilter(row, col)">{{COL_FIELD CUSTOM_FILTERS}}</div>'});
        });

        let data = [];
        _.each(searchResp.hits.hits, function (hit, i) {
          data.push(hit['_source']);
        });
        $scope.gridOptions.data = data;
        _updateDimensions();
      });
      mapSearchSource.fetchQueued();
    });
  });
});

