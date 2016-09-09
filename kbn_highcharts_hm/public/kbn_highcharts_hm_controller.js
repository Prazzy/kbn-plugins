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

        $scope.filter = function (item, type) {
            if (type === 'x_label') {
                filterManager.add($scope.vis.aggs.bySchemaName['columns'][0].params.field, item, null,
                    $scope.vis.indexPattern.title
                );
            } else if (type === 'y_label') {
                filterManager.add($scope.vis.aggs.bySchemaName['rows'][0].params.field, item, null,
                    $scope.vis.indexPattern.title
                );
            }
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

        function orderBy(arr, type, order) {
            if (type === 'number') {
                arr = _.sortBy(_.map(arr, function (i) {
                    return parseInt(i);
                }));
                if (order === 'desc') arr.reverse();
                arr = _.map(arr, function (i) {
                    return i.toString();
                });
                return arr;
            } else {
                arr = _.sortBy(arr);
                if (order === 'desc') return arr.reverse();
                return arr;
            }
        }

        $scope.$watch('esResponse', function (resp) {

            if (!resp) {
                return;
            }
            var columnAggId = _.first(_.pluck($scope.vis.aggs.bySchemaName['columns'], 'id'));
            var rowAggId = _.first(_.pluck($scope.vis.aggs.bySchemaName['rows'], 'id'));
            var metricsAggId = _.first(_.pluck($scope.vis.aggs.bySchemaName['metric'], 'id'));
            var colLabel = '';
            if ($scope.vis.aggs.bySchemaName['columns']) {
                colLabel = $scope.vis.aggs.bySchemaName['columns'][0]._opts.params.customLabel;
                if (_.isUndefined(colLabel) || colLabel == '') colLabel = $scope.vis.aggs.bySchemaName['columns'][0].params.field.displayName;
            }

            var rowLabel = '';
            if ($scope.vis.aggs.bySchemaName['rows']) {
                rowLabel = $scope.vis.aggs.bySchemaName['rows'][0]._opts.params.customLabel;
                if (_.isUndefined(rowLabel) || rowLabel == '') rowLabel = $scope.vis.aggs.bySchemaName['rows'][0].params.field.displayName;
            }
            var metricLabel = $scope.vis.aggs.bySchemaName['metric'][0].params.customLabel;
            if (_.isUndefined(metricLabel) || metricLabel == '') metricLabel = 'Value';
            var metricsAgg = $scope.vis.aggs.bySchemaName['metric'][0];
            var buckets = resp.aggregations[columnAggId].buckets;
            var categories = [];
            var cells = [];
            buckets.forEach(function (row, i) {

                if (rowAggId) {
                    row[rowAggId].buckets.forEach(function (col, j) {
                        var cell = {};
                        cell['x'] = i;
                        cell['x_label'] = row.key.toString();
                        cell['y'] = j;
                        cell['y_label'] = col.key.toString();
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

            var x_categories = _.uniq(_.map(cells, 'x_label'));
            var y_categories = _.uniq(_.map(cells, 'y_label'));
            var new_cells = [];
            var col_field_type = $scope.vis.aggs.bySchemaName['columns'][0].params.field.type;
            var col_field_orderby = $scope.vis.aggs.bySchemaName['columns'][0].params.orderBy;
            var col_field_order = $scope.vis.aggs.bySchemaName['columns'][0].params.order.val;

            var row_field_type = $scope.vis.aggs.bySchemaName['rows'][0].params.field.type;
            var row_field_orderby = $scope.vis.aggs.bySchemaName['rows'][0].params.orderBy;
            var row_field_order = $scope.vis.aggs.bySchemaName['rows'][0].params.order.val;

            if (col_field_orderby === '_term' && col_field_orderby === '_term') {

                x_categories = orderBy(x_categories, col_field_type, col_field_order);
                y_categories = orderBy(y_categories, row_field_type, row_field_order);

                x_categories.forEach(function (x_row, i) {
                    y_categories.forEach(function (y_row, j) {
                        var value = _.filter(cells, {"x_label": x_row, "y_label": y_row});
                        if (!value.length) {
                            value = 0;
                        } else {
                            value = value[0].value;
                        }
                        var cell = {};
                        cell['x'] = i;
                        cell['x_label'] = x_row;
                        cell['y'] = j;
                        cell['y_label'] = y_row;
                        cell['value'] = value;
                        new_cells.push(cell);
                    });
                });
                cells = new_cells;
            }


            var hc_options = {
                chart: {
                    renderTo: 'highcharts_hm_' + $scope.$id,
                    type: 'heatmap',
                    marginTop: 20,
                    marginBottom: 60,
                    plotBorderWidth: 1
                },
                title: {
                    "text": ""
                },
                credits: {
                    enabled: false
                },
                xAxis: {
                    categories: x_categories,
                    title: {
                        enabled: true,
                        text: colLabel
                    }
                },
                yAxis: {
                    categories: y_categories,
                    title: {
                        enabled: true,
                        text: rowLabel
                    }
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
                        return colLabel + ': <b>' + this.series.xAxis.categories[this.point.x] + '</b><br/>' +
                            rowLabel + ': <b>' + this.series.yAxis.categories[this.point.y] + '</b><br/>' +
                            metricLabel + ': <b>' + this.point.value + '</b>';
                    }
                },
                plotOptions: {
                    series: {
                        cursor: 'pointer',
                        events: {
                            click: function (event) {
                                $scope.filter(event.point.x_label, 'x_label');
                                $scope.filter(event.point.y_label, 'y_label');
                            }
                        }
                    }
                },
                series: [{
                    name: 'heatmap',
                    borderWidth: 1,
                    data: cells,
                    dataLabels: {
                        enabled: false,
                        color: '#000000'
                    }
                }]
            };

            if ($scope.vis.params.dataLabel) {
                hc_options.series[0].dataLabels.enabled = true;
            }

            if (typeof $scope.vis.params.hc_options == 'string' && $scope.vis.params.hc_options.trim().length > 0) {
                var additional_options = JSON.parse($scope.vis.params.hc_options);
                hc_options = _.merge(hc_options, additional_options);
            }

            $scope.chart = new Highcharts.Chart(hc_options);

            _updateDimensions();

        });


    });

});