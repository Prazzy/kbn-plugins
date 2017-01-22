define(function (require) {

    // Create an Angular module for this plugin
    require('jquery');
    require('./bower_components/jquery-ui.min');
    //require('./bower_components/jquery.event.drag');
    require('./bower_components/SlickGrid/slick.core');
    require('./bower_components/SlickGrid/slick.editors');
    require('./bower_components/SlickGrid/slick.grid');
    require('./bower_components/SlickGrid/slick.grid.css');

    //const elasticsearch = require('elasticsearch');

    var module = require('ui/modules').get('kbn_slickgrid', ['kibana']);

    // Add a controller to this module
    module.controller('KbnSlickGridController', function ($scope, $element, $rootScope, Private, es, $http) {
        var filterManager = Private(require('ui/filter_manager'));
        var SearchSource = Private(require('ui/courier/data_source/search_source'));

        $scope.es = es;
        $scope.http = $http;

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

            //var grid;
            //var columns = [
            //    {id: "title", name: "Title", field: "title"},
            //    {id: "duration", name: "Duration", field: "duration"},
            //    {id: "%", name: "% Complete", field: "percentComplete"},
            //    {id: "start", name: "Start", field: "start"},
            //    {id: "finish", name: "Finish", field: "finish"},
            //    {id: "effort-driven", name: "Effort Driven", field: "effortDriven"}
            //];
            //var options = {
            //    enableCellNavigation: true,
            //    enableColumnReorder: false
            //};
            //var data = [];
            //for (var i = 0; i < 500; i++) {
            //    data[i] = {
            //        title: "Task " + i,
            //        duration: "5 days",
            //        percentComplete: Math.round(Math.random() * 100),
            //        start: "01/01/2009",
            //        finish: "01/05/2009",
            //        effortDriven: (i % 5 == 0)
            //    };
            //}
            //grid = new Slick.Grid("#myGrid", data, columns, options);


            if (!resp) {
                return;
            }

            var mapSearchSource = new SearchSource();
            mapSearchSource.size(1000);
            mapSearchSource.index($scope.vis.indexPattern);
            //searchSource.index($scope.searchSource.get('index'));
            mapSearchSource.onResults().then(function onResults(searchResp) {
                var data = [];
                var columns = [];
                _.each(_.keys(searchResp.hits.hits[0]['_source']), function (field, j) {
                    columns.push({id: field, name: field, field: field, editor: Slick.Editors.Text});
                });

                _.each(searchResp.hits.hits, function (hit, i) {
                    var es_data = hit['_source'];
                    es_data['_id'] = hit['_id'];
                    es_data['_index'] = hit['_index'];
                    es_data['_type'] = hit['_type'];
                    data.push(es_data);
                });

                var options = {
                    editable: true,
                    enableAddRow: false,
                    enableCellNavigation: true,
                    asyncEditorLoading: false,
                    rowHeight: 30
                };
                if (_.isUndefined($scope.grid)) {
                    $scope.grid = new Slick.Grid("#myGrid", data, columns, options);
                } else {
                    $scope.grid.invalidate();
                    $scope.grid.render();
                }

                $scope.grid.onCellChange.subscribe(function (e, args) {
                    $scope.http.post('../api/kbn_slickgrid/update_row', args.item).then(function (resp) {
                        console.log('DEBUG ALARMS:',resp);
                    });

                    //$scope.es.update({
                    //        index: 'fcc_map_data-2016.02',
                    //        type: 'fcc_map_data_data',
                    //        id: 'AVQcX5OyIcVLgnONOyN2',
                    //        //body: args.item
                    //        body: {
                    //            doc: {
                    //                depart: 'XYZ'
                    //            }
                    //        }
                    //    })
                    //    .then(function (resp) {
                    //        console.log(resp);
                    //        console.log('updated');
                    //        //return redirectHandler('updated');
                    //    });

                    //console.log(args.item);
                    //delete args.item._id;
                    //delete args.item._index;
                    //delete args.item._type;
                    //$scope.es.update({
                    //        index: args.item._index,
                    //        type: args.item._type,
                    //        id: args.item._id,
                    //        //body: args.item
                    //        body: {
                    //            doc: {
                    //                depart: 'AAA'
                    //            }
                    //        }
                    //    })
                    //    .then(function (resp) {
                    //        console.log(resp);
                    //        console.log('updated');
                    //        //return redirectHandler('updated');
                    //    });

                });

                //grid.onClick.subscribe(function (e) {
                //    var cell = grid.getCellFromEvent(e);
                //    if (grid.getColumns()[cell.cell].id == "priority") {
                //        if (!grid.getEditorLock().commitCurrentEdit()) {
                //            return;
                //        }
                //        var states = {"Low": "Medium", "Medium": "High", "High": "Low"};
                //        data[cell.row].priority = states[data[cell.row].priority];
                //        grid.updateRow(cell.row);
                //        e.stopPropagation();
                //    }
                //});
            });


            //// Retrieve the id of the configured aggregation
            //var aggId = $scope.vis.aggs.bySchemaName['segment'][0].id;
            //// Retrieve the metrics aggregation configured
            //var metricsAgg = $scope.vis.aggs.bySchemaName['metric'][0];
            //// Get the buckets of that aggregation
            //var buckets = resp.aggregations[aggId].buckets;
            //var categories = [];
            //var results = buckets.map(function (bucket) {
            //
            //    // Use the getValue function of the aggregation to get the value of a bucket
            //    var value = metricsAgg.getValue(bucket);
            //    categories.push(bucket.key);
            //    return [bucket.key, value];
            //    //return {name: bucket.key,
            //    //        y: value,
            //    //        x: bucket.key}
            //
            //});
            //console.log(results);
            //
            //var hc_options = {
            //    chart: {
            //        renderTo: 'highcharts_pie_' + $scope.$id,
            //        plotBackgroundColor: null,
            //        plotBorderWidth: null,
            //        plotShadow: false
            //    },
            //    credits: {
            //        enabled: false
            //    },
            //    series: [{
            //        type: 'pie',
            //        data: results,
            //        point: {
            //            events: {
            //                click: function (event) {
            //                    $scope.filter(event.point.name);
            //                }
            //            }
            //        }
            //    }]
            //};
            //
            //if (typeof $scope.vis.params.hc_options == 'string' && $scope.vis.params.hc_options.trim().length > 0) {
            //    var additional_options = JSON.parse($scope.vis.params.hc_options);
            //    hc_options = _.merge(hc_options, additional_options);
            //}
            //
            //$scope.chart = new Highcharts.Chart(hc_options);


            //_updateDimensions();

        });


    });

})
;

