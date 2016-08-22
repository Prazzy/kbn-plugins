// public parts of the plugin (i.e. parts that reside in the public folder and will be transfered to the client)
// must be AMD modules (RequireJS)
define(function (require) {

    // Create an Angular module for this plugin
    require('jquery');
    var L = require('leaflet');
    require('./bower_components/leaflet_js/leaflet.markercluster');
    require('./bower_components/leaflet_js//MarkerCluster.Default.css');

    var module = require('ui/modules').get('kbn_leaflet', ['kibana']);

    // Add a controller to this module
    module.controller('KbnLeafletController', function ($scope, $element, $rootScope, config, Private) {
        var filterManager = Private(require('ui/filter_manager'));
        var SearchSource = Private(require('ui/courier/data_source/search_source'));

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
            //$scope.chart.setSize(chart_width, chart_height);
            if (chart_height) $scope.height = chart_height;
        };

        $scope.$on('change:vis', function () {
            if (_.isUndefined($scope.chart)) return;
            _updateDimensions();
        });


        $scope.$watch('esResponse', function (resp) {

            //var marker = L.marker(new L.LatLng(39.74, 39.89), {
            //  title: "hello"
            //  });
            //marker.bindPopup("hello");
            //markers.addLayer(marker);
            //map.addLayer(markers);
//            delete $scope.map1;
            var lat = $scope.vis.params.lat;
            var lng = $scope.vis.params.lng;

            var mapSearchSource = new SearchSource();
            mapSearchSource.size(20);
            mapSearchSource.index($scope.vis.indexPattern);
            mapSearchSource.onResults().then(function onResults(searchResp) {
                if (typeof $scope.map1 === 'undefined') {
                    $scope.map1 = new L.map("map_container1", {
                        scrollWheelZoom: true,
                        //center: [40, -86],
                        minZoom: 2,
                        maxZoom: 18,
                        noWrap: true,
                        fadeAnimation: false
                    });
                }

                var map1 = $scope.map1;
                L.Icon.Default.imagePath = '../plugins/kbn_leaflet/images';

                // This could be made configurable?
                this.wms = config.get('visualization:tileMap:WMSdefaults');
                L.tileLayer.wms(this.wms.url, this.wms.options).addTo(map1);
                var markers = new L.MarkerClusterGroup({maxClusterRadius: 100});

                //var markerList = [];
                //_.each(searchResp.hits.hits, function (hit, i) {
                //    var es_data = hit['_source'];
                //    var marker = L.marker(new L.LatLng(es_data[lat], es_data[lng]), {
                //        title: es_data[lat] + "," + es_data[lng]
                //    });
                //    marker.bindPopup(es_data[lat] + "," + es_data[lng] + "popup", {
                //        'minWidth': '200',
                //        'maxWidth': '200'
                //    });
                //    markerList.push(marker);
                //});
                //
                //markers.addLayers(markerList);
                //markers.addTo(map1);
                //map1.fitBounds([[-90, -220], [90, 220]]);

                $scope.paths = {};
                $scope.markers = {};
                var tealIcon = L.icon({
                    iconUrl: '../plugins/kbn_leaflet/images/teal-dot.png',
                    iconAnchor: [10, 30]
                });

                var orangeIcon = L.icon({
                    iconUrl: '../plugins/kbn_leaflet/images/orange-dot.png',
                    iconAnchor: [10, 30]
                });

                var yellowIcon = L.icon({
                    iconUrl: '../plugins/kbn_leaflet/images/yellow-dot.png',
                    iconAnchor: [10, 30]
                });

                var greenIcon = L.icon({
                    iconUrl: '../plugins/kbn_leaflet/images/green-dot.png',
                    iconAnchor: [10, 30]
                });

                var redIcon = L.icon({
                    iconUrl: '../plugins/kbn_leaflet/images/red-dot.png',
                    iconAnchor: [10, 30]
                });

                _.each(searchResp.hits.hits, function (hit, i) {
                    var es_src = hit['_source'];
                    var map_json_data = $.parseJSON(es_src.data);
                    // switch markers
                    _.each(map_json_data.switchmarkers, function (marker_i, i) {
                        var tooltip_content = marker_i.content;
                        var switchMarker = L.marker([marker_i.latitude, marker_i.longitude], {icon: tealIcon}).addTo(map1);
                        switchMarker.bindPopup(tooltip_content, {'minWidth': '200', 'maxWidth': '200'});
                        //switchMarkers.push(switchMarker);
                    });

                    // down markers
                    _.each(map_json_data.downmarkers, function (marker_i, i) {
                        var tooltip_content = marker_i.content;
                        var offlineMarker = L.marker([marker_i.latitude, marker_i.longitude], {icon: orangeIcon}).addTo(map1);
                        offlineMarker.bindPopup(tooltip_content, {'minWidth': '200', 'maxWidth': '200'});
                        //switchMarkers.push(switchMarker);
                    });

                    // online markers
                    _.each(map_json_data.offtoonmarkers, function (marker_i, i) {
                        var tooltip_content = marker_i.content;
                        var onlineMarker = L.marker([marker_i.latitude, marker_i.longitude], {icon: yellowIcon}).addTo(map1);
                        onlineMarker.bindPopup(tooltip_content, {'minWidth': '200', 'maxWidth': '200'});
                        //switchMarkers.push(switchMarker);
                    });

                    // first marker
		            var firstMarker = L.marker([map_json_data.markers[0].latitude,map_json_data.markers[0].longitude],{icon: greenIcon}).addTo(map1);
                    var tooltip_content = map_json_data.markers[0].content;
           	        firstMarker.bindPopup(tooltip_content,{'minWidth': '200','maxWidth': '200'});
                    //firstMarkers.push(firstMarker);

                    // last marker
		            var lastMarker = L.marker([map_json_data.markers[map_json_data.markers.length - 1].latitude,map_json_data.markers[map_json_data.markers.length - 1].longitude],{icon: redIcon}).addTo(map1);
		            var tooltip_content = map_json_data.markers[map_json_data.markers.length - 1].content;
    	 	        lastMarker.bindPopup(tooltip_content,{'minWidth': '200','maxWidth': '200'});
                    //lastMarkers.push(lastMarker);

                    // polylines
                    _.each(map_json_data.polylines, function (polyline, i) {
                        L.polyline(polyline.marker, {
                            color: polyline.color,
                            opacity: polyline.opacity,
                            weight: polyline.weight
                        }).addTo(map1);
                        //poly_list.push(line);
                    });
                    map1.fitBounds([[-90, -220], [90, 220]]);
                });
            });
            mapSearchSource.fetchQueued();

        });

        _updateDimensions();

    });

});