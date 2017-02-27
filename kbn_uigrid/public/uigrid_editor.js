define(function (require) {
  const _ = require('lodash');

  require('ui/modules').get('kibana/kbn_uigrid')
  .directive('uigridVisParams', function () {
    return {
      restrict: 'E',
      template: require('plugins/kbn_uigrid/uigrid_editor.html'),
      controller: function ($scope, $route) {
        if ($route.current.locals.savedVis) { 
          $scope.columns = $route.current.locals.savedVis.savedSearch.columns;
          $scope.columns = _.difference($scope.columns, $scope.vis.indexPattern.metaFields)
          if (!$scope.vis.params.gridColumns.length) $scope.vis.params.gridColumns = $scope.columns.join();
        }
      }
    };
  });
});