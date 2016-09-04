// public parts of the plugin (i.e. parts that reside in the public folder and will be transfered to the client)
// must be AMD modules (RequireJS)
define(function (require) {

    // Create an Angular module for this plugin
    require('jquery');
    if (typeof Highcharts === "undefined") {
        Highcharts = require('./bower_components/highcharts');
    }

    Heatmap = require('./bower_components/highcharts/highcharts-3d');
    Heatmap(Highcharts);

    var module = require('ui/modules').get('kbn_highcharts_3dscatter', ['kibana']);

    // Add a controller to this module
    module.controller('KbnHighcharts3DScatterController', function ($scope, $element, $rootScope, Private) {
        var tabifyAggResponse = Private(require('ui/agg_response/tabify/tabify'));
        var filterManager = Private(require('ui/filter_manager'));

        // Give the points a 3D feel by adding a radial gradient
        Highcharts.getOptions().colors = $.map(Highcharts.getOptions().colors, function (color) {
            return {
                radialGradient: {
                    cx: 0.4,
                    cy: 0.3,
                    r: 0.5
                },
                stops: [
                    [0, color],
                    [1, Highcharts.Color(color).brighten(-0.2).get('rgb')]
                ]
            };
        });

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

            if (!resp) {
                return;
            }

            var xLabel = '';
            if ($scope.vis.aggs[1]._opts.params.customLabel) {
                xLabel = $scope.vis.aggs[1]._opts.params.customLabel;
            } else if ($scope.vis.aggs[1]._opts.params.field) {
                xLabel = $scope.vis.aggs[1]._opts.params.field;
            }
            var yLabel = '';
            if ($scope.vis.aggs[2]._opts.params.customLabel) {
                yLabel = $scope.vis.aggs[2]._opts.params.customLabel;
            } else if ($scope.vis.aggs[2]._opts.params.field) {
                yLabel = $scope.vis.aggs[2]._opts.params.field;
            }
            var zLabel = '';
            if ($scope.vis.aggs[3]._opts.params.customLabel) {
                zLabel = $scope.vis.aggs[3]._opts.params.customLabel;
            } else if ($scope.vis.aggs[3]._opts.params.field) {
                zLabel = $scope.vis.aggs[3]._opts.params.field;
            }
            var tableGroups = tabifyAggResponse($scope.vis, resp);
            var cells = [];

            tableGroups.tables.forEach(function (table) {
                table.rows.forEach(function (row) {
                    cells.push([row[0], row[1], row[2]])
                });
            });


            // Set up the chart
            var hc_options = {
                chart: {
                    renderTo: 'scatter_container',
                    margin: 150,
                    type: 'scatter',
                    options3d: {
                        enabled: true,
                        alpha: 10,
                        beta: 30,
                        depth: 250,
                        viewDistance: 5,
                        fitToPlot: false,
                        frame: {
                            bottom: {size: 1, color: 'rgba(0,0,0,0.02)'},
                            back: {size: 1, color: 'rgba(0,0,0,0.04)'},
                            side: {size: 1, color: 'rgba(0,0,0,0.06)'}
                        }
                    }
                },
                title: {
                    "text": ""
                },
                credits: {
                    enabled: false
                },
                plotOptions: {
                    scatter: {
                        width: 10,
                        height: 10,
                        depth: 10
                    }
                },
                tooltip: {
                    crosshairs: true,
                    shared: true,
                    borderWidth: 1,
                    shadow: false,
                    useHTML: true,
                    snap: 5,
                    style: {
                        padding: 5
                    },
                    formatter: function (chart) {
                        var p = this.point;
                        return '<b>' + xLabel + ': ' + Highcharts.numberFormat(p.x, 2) + '<br>' + yLabel + ': ' + Highcharts.numberFormat(p.z, 2) + '<br>' + zLabel + ': ' + Highcharts.numberFormat(p.y, 2) + '</b>';
                    }
                },
                yAxis: {
                    title: {text: "<b>" + yLabel + "</b>"}
                },
                xAxis: {
                    gridLineWidth: 1,
                    title: {text: "<b>" + xLabel + "</b>"}
                },
                zAxis: {
                    showFirstLabel: false,
                    title: {text: "<b>" + zLabel + "</b>"}
                },
                legend: {
                    enabled: false
                },
                series: [{
                    dashStyle: 'longdash',
                    colorByPoint: false,
                    data: cells
                    //data: [[1, 6, 5], [8, 7, 9], [1, 3, 4], [4, 6, 8], [5, 7, 7], [6, 9, 6], [7, 0, 5], [2, 3, 3], [3, 9, 8], [3, 6, 5], [4, 9, 4], [2, 3, 3], [6, 9, 9], [0, 7, 0], [7, 7, 9], [7, 2, 9], [0, 6, 2], [4, 6, 7], [3, 7, 7], [0, 1, 7], [2, 8, 6], [2, 3, 7], [6, 4, 8], [3, 5, 9], [7, 9, 5], [3, 1, 7], [4, 4, 2], [3, 6, 2], [3, 1, 6], [6, 8, 5], [6, 6, 7], [4, 1, 1], [7, 2, 7], [7, 7, 0], [8, 8, 9], [9, 4, 1], [8, 3, 4], [9, 8, 9], [3, 5, 3], [0, 2, 4], [6, 0, 2], [2, 1, 3], [5, 8, 9], [2, 1, 1], [9, 7, 6], [3, 0, 2], [9, 9, 0], [3, 4, 8], [2, 6, 1], [8, 9, 2], [7, 6, 5], [6, 3, 1], [9, 3, 1], [8, 9, 3], [9, 1, 0], [3, 8, 7], [8, 0, 0], [4, 9, 7], [8, 6, 2], [4, 3, 0], [2, 3, 5], [9, 1, 4], [1, 1, 4], [6, 0, 2], [6, 1, 6], [3, 8, 8], [8, 8, 7], [5, 5, 0], [3, 9, 6], [5, 4, 3], [6, 8, 3], [0, 1, 5], [6, 7, 3], [8, 3, 2], [3, 8, 3], [2, 1, 6], [4, 6, 7], [8, 9, 9], [5, 4, 2], [6, 1, 3], [6, 9, 5], [4, 8, 2], [9, 7, 4], [5, 4, 2], [9, 6, 1], [2, 7, 3], [4, 5, 4], [6, 8, 1], [3, 4, 0], [2, 2, 6], [5, 1, 2], [9, 9, 7], [6, 9, 9], [8, 4, 3], [4, 1, 7], [6, 2, 5], [0, 4, 9], [3, 5, 9], [6, 9, 1], [1, 9, 2]]
                }]
            };

            if (typeof $scope.vis.params.hc_options == 'string' && $scope.vis.params.hc_options.trim().length > 0) {
                var additional_options = JSON.parse($scope.vis.params.hc_options);
                hc_options = _.merge(hc_options, additional_options);
            }

            $scope.chart = new Highcharts.Chart(hc_options);

            // Add mouse events for rotation
            $($scope.chart.container).bind('mousedown.hc touchstart.hc', function (eStart) {
                eStart = $scope.chart.pointer.normalize(eStart);

                var posX = eStart.pageX,
                    posY = eStart.pageY,
                    alpha = $scope.chart.options.chart.options3d.alpha,
                    beta = $scope.chart.options.chart.options3d.beta,
                    newAlpha,
                    newBeta,
                    sensitivity = 5; // lower is more sensitive

                $(document).bind({
                    'mousemove.hc touchdrag.hc': function (e) {
                        // Run beta
                        newBeta = beta + (posX - e.pageX) / sensitivity;
                        $scope.chart.options.chart.options3d.beta = newBeta;

                        // Run alpha
                        newAlpha = alpha + (e.pageY - posY) / sensitivity;
                        $scope.chart.options.chart.options3d.alpha = newAlpha;

                        $scope.chart.redraw(false);
                    },
                    'mouseup touchend': function () {
                        $(document).unbind('.hc');
                    }
                });
            });

            _updateDimensions();

        });


    });

});