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
	module.controller('HighchartsAppController', function($scope, Private) {
		var filterManager = Private(require('ui/filter_manager'));

		$scope.highchartsNG = {
			options: {
				chart: {
					type: 'column'
				}
			},
			series: [],
			title: {
				text: 'Highchart Column Chart'
			},
			loading: false
		};

		$scope.$watch('esResponse', function(resp) {

		//function addPoints() {
		//	var seriesArray = $scope.highchartsNG.series
		//	var rndIdx = Math.floor(Math.random() * seriesArray.length);
		//	seriesArray[rndIdx].data = seriesArray[rndIdx].data.concat([1, 10, 20])
		//}
        //
		//function addSeries() {
		//	var rnd = [];
		//	for (var i = 0; i < 10; i++) {
		//		rnd.push(Math.floor(Math.random() * 20) + 1)
		//	}
		//	$scope.highchartsNG.series.push({
		//		data: rnd
		//	})
		//}
        //
        //$scope.highchartsNG = {
			//options: {
			//	chart: {
			//		type: 'column'
			//	}
			//},
			//series: [{
			//		name: 'Tokyo',
			//		data: [49.9]
        //
			//	}, {
			//		name: 'New York',
			//		data: [83.6]
        //
			//	}, {
			//		name: 'London',
			//		data: [48.9]
        //
			//	}, {
			//		name: 'Berlin',
			//		data: [42.4]
        //
			//	}],
			//title: {
			//	text: 'Highchart Column Chart'
			//},
			//loading: false
        //};

		if (!resp) {
    		//$scope.highchartsNG.series.push({data: [10, 15, 12, 8, 7]});
    		return;
  		}

		debugger;
		// Retrieve the id of the configured aggregation
  		var aggId = $scope.vis.aggs.bySchemaName['segment'][0].id;
		// Retrieve the metrics aggregation configured
		var metricsAgg = $scope.vis.aggs.bySchemaName['metric'][0];
		// Get the buckets of that aggregation
  		var buckets = resp.aggregations[aggId].buckets;
  		// Transform all buckets into objects
  		//var results = buckets.map(function(bucket) {
			//return {
			//  name: bucket.key,
			//  data: [bucket.doc_count]
			//};
        //});
		//$scope.highchartsNG.series.push(results);
		$scope.highchartsNG.series = [];
        _.each(buckets, function(bucket, i){
			// Use the getValue function of the aggregation to get the value of a bucket
			var value = metricsAgg.getValue(bucket);
			$scope.highchartsNG.series.push({
							name: bucket.key,
							data: [value]
							});
        });
		//debugger;

		//addSeries();
		});

    });

});