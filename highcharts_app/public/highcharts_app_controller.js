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
	module.controller('HighchartsAppController', function($scope) {
    	var setTime = function() {
			$scope.time = Date.now();
		};
		setTime();

		$scope.options = {
			type: 'line'
		};

		function addPoints() {
			var seriesArray = $scope.highchartsNG.series
			var rndIdx = Math.floor(Math.random() * seriesArray.length);
			seriesArray[rndIdx].data = seriesArray[rndIdx].data.concat([1, 10, 20])
		}

		function addSeries() {
			var rnd = [];
			for (var i = 0; i < 10; i++) {
				rnd.push(Math.floor(Math.random() * 20) + 1)
			}
			$scope.highchartsNG.series.push({
				data: rnd
			})
		}

		$scope.highchartsNG = {
			options: {
				chart: {
					type: 'bar'
				}
			},
			series: [{
				data: [10, 15, 12, 8, 7]
			}],
			title: {
				text: 'Hello'
			},
			loading: false
		};

		addSeries();

    });

});