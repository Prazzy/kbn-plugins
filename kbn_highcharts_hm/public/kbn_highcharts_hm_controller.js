// public parts of the plugin (i.e. parts that reside in the public folder and will be transfered to the client)
// must be AMD modules (RequireJS)
define(function (require) {

    // Create an Angular module for this plugin
    require('jquery');
    if (typeof Highcharts === "undefined") {
        Highcharts = require('./bower_components/highcharts');
    }

    Heatmap = require('./bower_components/highcharts/heatmap');
    Heatmap(Highcharts);

    var module = require('ui/modules').get('kbn_highcharts_hm', ['kibana']);

    // Add a controller to this module
    module.controller('KbnHighchartsHmController', function ($scope, $element, $rootScope, Private) {
        var tabifyAggResponse = Private(require('ui/agg_response/tabify/tabify'));
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

        var _updateDimensions = function () {
            var delta = 18;
            var width = $element.parent().width();
            var height = $element.parent().height();

            if (width) {
                if (width > delta) {
                    width -= delta;
                }
            }

            if (height) {
                if (height > delta) {
                    height -= delta;
                }
            }
            $scope.chart.setSize(width, height);
        };

        $scope.$on('change:vis', function () {
            if (_.isUndefined($scope.chart)) return;
            _updateDimensions();
        });

        function processTableGroups(tableGroups, $scope) {
            var columnAggId = _.first(_.pluck($scope.vis.aggs.bySchemaName['columns'], 'id'));
            var rowAggId = _.first(_.pluck($scope.vis.aggs.bySchemaName['rows'], 'id'));
            var metricsAggId = _.first(_.pluck($scope.vis.aggs.bySchemaName['metric'], 'id'));
            var dataLabels = {[columnAggId]: 'x', [rowAggId]: 'y', [metricsAggId]: 'value'};

            var cells = [];

            tableGroups.tables.forEach(function (table) {
                table.rows.forEach(function (row, i) {
                    var cell = {};

                    table.columns.forEach(function (column, i) {
                        var fieldFormatter = table.aggConfig(column).fieldFormatter();
                        // Median metric aggs use the parentId and not the id field
                        var key = column.aggConfig.parentId ? dataLabels[column.aggConfig.parentId] : dataLabels[column.aggConfig.id];

                        if (key) {
                            cell[key] = key !== 'value' ? fieldFormatter(row[i]) : row[i];
                            //if (key == 'x') {
                            //    cell['x'] = j;
                            //    cell['x_label'] = fieldFormatter(row[i]);
                            //}
                            //if (key == 'y') {
                            //    cell['y'] = i;
                            //    cell['y_label'] = fieldFormatter(row[i]);
                            //}
                            //if (key === 'value') cell['value'] = row[i];
                        }
                    });

                    // if no columns or rows, then return '_all'
                    if (!cell.x && !cell.y) {
                        cell['x'] = '_all';
                    }

                    cells.push(cell);
                });
            });

            //var new_cells = [];
            //var col_field_type = $scope.vis.aggs.bySchemaName['columns'][0].params.field.type;
            //var col_field_orderby = $scope.vis.aggs.bySchemaName['columns'][0].params.orderBy;
            //var col_field_order = $scope.vis.aggs.bySchemaName['columns'][0].params.order.val;
            //
            //var row_field_type = $scope.vis.aggs.bySchemaName['rows'][0].params.field.type;
            //var row_field_orderby = $scope.vis.aggs.bySchemaName['rows'][0].params.orderBy;
            //var row_field_order = $scope.vis.aggs.bySchemaName['rows'][0].params.order.val;
            //
            //if (col_field_orderby === '_term' && col_field_orderby === '_term') {
            //
            //    var cols = _.uniq(_.map(cells, 'x_label'));
            //    cols = orderBy(cols, col_field_type, col_field_order);
            //    var rows = _.uniq(_.map(cells, 'y_label'));
            //    rows = orderBy(rows, row_field_type, row_field_order);
            //
            //    rows.forEach(function (row) {
            //        cols.forEach(function (col) {
            //            var value = _.filter(cells, {"col": col, "row": row});
            //            if (!value.length) {
            //                value = 0;
            //            } else {
            //                value = value[0].value;
            //            }
            //            var cell = {};
            //            cell['x'] = col;
            //            cell['y'] = row;
            //            cell['value'] = value;
            //            new_cells.push(cell);
            //        });
            //    });
            //    return new_cells;
            //}

            return cells;
        }

        $scope.$watch('esResponse', function (resp) {

            if (!resp) {
                return;
            }
            var columnAggId = _.first(_.pluck($scope.vis.aggs.bySchemaName['columns'], 'id'));
            var rowAggId = _.first(_.pluck($scope.vis.aggs.bySchemaName['rows'], 'id'));
            var metricsAggId = _.first(_.pluck($scope.vis.aggs.bySchemaName['metric'], 'id'));
            //var dataLabels = {[columnAggId]: 'x', [rowAggId]: 'y', [metricsAggId]: 'value'};
            // Retrieve the id of the configured aggregation
            //var aggId = $scope.vis.aggs.bySchemaName['segment'][0].id;
            // Retrieve the metrics aggregation configured
            var metricsAgg = $scope.vis.aggs.bySchemaName['metric'][0];
            // Get the buckets of that aggregation
            var buckets = resp.aggregations[columnAggId].buckets;
            var categories = [];
            var cells = [];
            buckets.forEach(function (row, i) {

                if (rowAggId) {
                    row[rowAggId].buckets.forEach(function (col, j) {
                        var cell = {};
                        cell['x'] = i;
                        cell['x_label'] = row.key;
                        cell['y'] = j;
                        cell['y_label'] = col.key;
                        cell['value'] = metricsAgg.getValue(col);
                        cells.push(cell);
                    });
                } else {
                    var cell = {};
                    cell['x'] = i;
                    cell['x_label'] = row.key;
                    cell['y'] = 0;
                    cell['y_label'] = '';
                    cell['value'] = metricsAgg.getValue(row);
                    cells.push(cell);
                }
            });

            //var cnt = 0;
            //var results = buckets.map(function (bucket) {
            //
            //    // Use the getValue function of the aggregation to get the value of a bucket
            //    var value = metricsAgg.getValue(bucket);
            //    categories.push(bucket.key);
            //
            //    //return {name: bucket.key,
            //    cells.push([cnt, 0, value]);
            //    //       y: value}
            //    cnt += 1;
            //    return [bucket.key, value];
            //
            //});
            //console.log(results);

            //var cells = processTableGroups(tabifyAggResponse($scope.vis, resp), $scope);
            var x_categories = _.uniq(_.map(cells, 'x_label'));
            var y_categories = _.uniq(_.map(cells, 'y_label'));
            $scope.hc_options = {
                chart: {
                    renderTo: 'container',
                    type: 'heatmap',
                    marginTop: 20,
                    marginBottom: 20,
                    plotBorderWidth: 1
                },
                xAxis: {
                    categories: x_categories
                },
                yAxis: {
                    categories: y_categories
                },
                colorAxis: {
                    min: 0,
                    minColor: '#FFFFFF',
                    maxColor: Highcharts.getOptions().colors[0]
                },
                legend: {
                    align: 'right',
                    layout: 'vertical',
                    margin: 0,
                    verticalAlign: 'top',
                    y: 25,
                    symbolHeight: 280
                },
                tooltip: {
                    formatter: function () {
                        return '<b>' + this.series.xAxis.categories[this.point.x] + this.point.value + this.series.yAxis.categories[this.point.y] + '</b>';
                    }
                },
                series: [{
                    name: 'heatmap',
                    borderWidth: 1,
                    data: cells,
                    dataLabels: {
                        enabled: true,
                        color: '#000000'
                    }
                }]


            };

            //debugger;
            // var additional_options = JSON.parse(JSON.stringify(eval("(" + $scope.vis.params.hc_options + ")")));
            $scope.chart = new Highcharts.Chart($scope.hc_options);
            //var additional_options = JSON.parse(JSON.stringify(eval("(" + $scope.vis.params.hc_options + ")")));
            //$scope.chart = new Highcharts.Chart(_.merge($scope.hc_options, additional_options));
            _updateDimensions();

        });


    });

});