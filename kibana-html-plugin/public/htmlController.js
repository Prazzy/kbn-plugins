define(function (require) {
  var module = require('ui/modules').get('kibana/kibana-html-plugin', ['kibana', 'ui.ace']);

  module.controller('KbnHtmlEditController', ['$scope', function($scope) {
    $scope.aceLoaded = function(_editor){
      _editor.$blockScrolling = Infinity;
    };
  }]);

  module.controller('KbnHtmlVisController', function ($scope, $sce) {
    $scope.$watch('vis.params.html', function (html) {
      if (!html) return;
      $scope.html = $sce.trustAsHtml(html);
    });
  });
});
