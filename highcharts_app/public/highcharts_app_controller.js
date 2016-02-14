// public parts of the plugin (i.e. parts that reside in the public folder and will be transfered to the client)
// must be AMD modules (RequireJS)
define(function(require) {

	// Include our custom CSS (LESS also works)
	//require('plugins/tr-k4p-clock/clock.css');

	// Create an Angular module for this plugin
	var module = require('ui/modules').get('highcharts_app', ['kibana']);
    require('jquery');
	require('highcharts-ng');
	//require('highcharts/modules/exporting')(Highcharts);

	// Add a controller to this module
	module.controller('HighchartsAppController', function($scope, $element, $rootScope, Private) {
		var filterManager = Private(require('ui/filter_manager'));

		$scope.filter = function(item) {
			// Add a new filter via the filter manager
			filterManager.add(
				// The field to filter for, we can get it from the config
				$scope.vis.aggs.bySchemaName['segment'][0].params.field,
				// The value to filter for, we will read out the bucket key from the tag
				item,
				// Whether the filter is negated. If you want to create a negated filter pass '-' here
				null,
				// The index pattern for the filter
				$scope.vis.indexPattern.title
			);
		};

		$scope.highchartsNG = {
			options: {
				chart: {
					type: 'column'
				}
			},
			//series: [],
			title: {
				text: 'Highchart Column Chart'
			},
			loading: false
		};


		var _updateDimensions = function () {
		  var delta = 18;
		  var width = $element.parent().width();
		  var height = $element.parent().height();
		  $scope.highchartsNG.size = {width: width, height: height}
		  if (width) {
			if (width > delta) {
			  width -= delta;
			}
			$scope.highchartsNG.size.width = width;
		  }
		  if (height) {
			if (height > delta) {
			  height -= delta;
			}
			if (height > 1) $scope.highchartsNG.size.height = height;
		  }
		};

		//var off = $rootScope.$on('change:vis', function () {
		//  _updateDimensions();
		//});
		//$scope.$on('$destroy', off);
        //
        //$scope.$watch('vis', function () {
			//_updateDimensions();
        //});

		//$scope.$on('change:vis', function () {
		//	_updateDimensions();
		//});

		$scope.$watch('esResponse', function(resp) {
		//_updateDimensions();

		if (!resp) {
    		return;
  		}

		// Retrieve the id of the configured aggregation
  		var aggId = $scope.vis.aggs.bySchemaName['segment'][0].id;
		// Retrieve the metrics aggregation configured
		var metricsAgg = $scope.vis.aggs.bySchemaName['metric'][0];
		// Get the buckets of that aggregation
  		var buckets = resp.aggregations[aggId].buckets;
		var categories = [];
		var results = buckets.map(function(bucket) {

				// Use the getValue function of the aggregation to get the value of a bucket
				var value = metricsAgg.getValue(bucket);
				categories.push(bucket.key);
				return [bucket.key, value];

			});
			$scope.highchartsNG.xAxis = {categories: categories};
 			$scope.highchartsNG.series = [{data: results, events: {
						click: function click(e) {
							$scope.filter(e.point.name);
						}
					}}];

		});

    });

});