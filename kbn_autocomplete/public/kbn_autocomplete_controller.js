define(function (require) {
  var _ = require('lodash');
  require('plugins/kbn_autocomplete/lib/angucomplete-alt.min');
  const module = require('ui/modules').get('kibana/kbn_autocomplete', 
    ['kibana', 'angucomplete-alt']);

  module.controller('KbnAutocompleteVisController', function ($scope, Private, $http) {
    let filterManager = Private(require('ui/filter_manager'));

    $scope.results = [];
    $scope.searchField = $scope.vis.params.autocompleteField;
    let getData = function () {
      let params = {
        index: $scope.vis.params.indexName,
        searchField: $scope.vis.params.autocompleteField
      };
      $http.post('../api/kbn_autocomplete/search', params)
      .then(function (resp) {
        if (resp.data) {
          $scope.results = resp.data;
        }
      });      
    };

    $scope.filter = function (value) {
      filterManager.add($scope.vis.params.autocompleteField, value, null, $scope.vis.params.indexName);
    };    

    $scope.selectedValue = function(selected) {
      if (selected) {
        $scope.filter(selected.title);
      }
    };

    $scope.$watch('vis.params.autocompleteField', function (field) {
      if (!field) return;
      getData();
    });

    if ($scope.vis.params.autocompleteField) getData();
  });
});
