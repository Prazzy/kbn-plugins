define(function (require) {

    // Create an Angular module for this plugin
    require('jquery');
    if (typeof Highcharts === "undefined") {
        Highcharts = require('./bower_components/highcharts');
    }
    var module = require('ui/modules').get('kbn_highcharts', ['kibana']);

    // Add a controller to this module
    module.controller('KbnHighchartsPieController', function ($scope, $element, $rootScope, Private) {
        var filterManager = Private(require('ui/filter_manager'));

        $scope.filter = function (item) {
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

        var chart_width, chart_height;

        var _updateDimensions = function () {
            var delta = 18;
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
                if (height > delta) {
                    chart_height = height - delta;
                } else {
                    chart_height = height
                }
            }
            $scope.chart.setSize(chart_width, chart_height);
        };

        $scope.$on('change:vis', function () {
            if (_.isUndefined($scope.chart)) return;
            _updateDimensions();
        });

        $scope.$watch('esResponse', function (resp) {

            if (!resp || !resp.aggregations) {
                return;
            }


            // Retrieve the id of the configured aggregation
            var aggId = $scope.vis.aggs.bySchemaName['segment'][0].id;
            // Retrieve the metrics aggregation configured
            var metricsAgg = $scope.vis.aggs.bySchemaName['metric'][0];
            // Get the buckets of that aggregation
            var buckets = resp.aggregations[aggId].buckets;
            var categories = [];
            var results = buckets.map(function (bucket) {

                // Use the getValue function of the aggregation to get the value of a bucket
                var value = metricsAgg.getValue(bucket);
                categories.push(bucket.key);
                return [bucket.key, value];
                //return {name: bucket.key,
                //        y: value,
                //        x: bucket.key}

            });
            console.log(results);

            var hc_options = {
                chart: {
                    renderTo: 'container',
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false
                },
                credits: {
                    enabled: false
                },
                series: [{
                    type: 'pie',
                    data: results,
                    point: {
                        events: {
                            click: function (event) {
                                $scope.filter(event.point.name);
                            }
                        }
                    }
                }]
            };

            if (typeof $scope.vis.params.hc_options == 'string' && $scope.vis.params.hc_options.trim().length > 0) {
                var additional_options = JSON.parse($scope.vis.params.hc_options);
                hc_options = _.merge(hc_options, additional_options);
            }

            $scope.chart = new Highcharts.Chart(hc_options);


            _updateDimensions();

        });


    });

});
