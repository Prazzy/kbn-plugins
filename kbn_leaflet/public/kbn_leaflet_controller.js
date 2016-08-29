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
            // if no response
            if (!resp) return;

            var map_type = $scope.vis.params.map_type;
            var size = $scope.vis.params.size;
            var lat = $scope.vis.params.lat;
            var lng = $scope.vis.params.lng;
            var tooltip_fields = [];
            if ($scope.vis.params.tooltip) tooltip_fields = $scope.vis.params.tooltip.split(",");

            var mapSearchSource = new SearchSource();
            mapSearchSource.size(size);
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

                    $scope.paths = {};
                    $scope.markers = {};
                    $scope.switchMarkers = [];
                    $scope.offlineMarkers = [];
                    $scope.onlineMarkers = [];
                    $scope.firstMarkers = [];
                    $scope.lastMarkers = [];
                    $scope.poly_list = [];
                }

                var map1 = $scope.map1;
                L.Icon.Default.imagePath = '../plugins/kbn_leaflet/images';

                (function () {
                    var control = new L.Control({position: 'topright'});
                    control.onAdd = function (map1) {
                        var azoom = L.DomUtil.create('a', 'resetzoom');
                        azoom.innerHTML = "[Reset Zoom]";
                        L.DomEvent
                            .disableClickPropagation(azoom)
                            .addListener(azoom, 'click', function () {
                                map1.fitBounds([[-90, -220], [90, 220]])
                                //map1.setView(map1.options.center, map1.options.zoom);
                            }, azoom);
                        return azoom;
                    };
                    return control;
                }())
                    .addTo(map1);

                // This could be made configurable?
                this.wms = config.get('visualization:tileMap:WMSdefaults');
                L.tileLayer.wms(this.wms.url, this.wms.options).addTo(map1);
                var markers = new L.MarkerClusterGroup({maxClusterRadius: 100});

                if (map_type === "Marker Cluster") {
                    try {
                        if ($scope.map1 && $scope.markers.getLayers()) $scope.markers.clearLayers();
                    }
                    catch (e) {
                    }


                    var markerList = [];
                    _.each(searchResp.hits.hits, function (hit, i) {
                        var es_data = hit['_source'];
                        var tooltip_text = "";
                        _.each(tooltip_fields, function (field) {
                            tooltip_text += field + " : " + es_data[field] + "<br />";
                        });
                        var marker = L.marker(new L.LatLng(es_data[lat], es_data[lng]), {
                            title: es_data[lat] + "," + es_data[lng]
                        });
                        marker.bindPopup(tooltip_text, {
                            'minWidth': '200',
                            'maxWidth': '200'
                        });
                        markerList.push(marker);
                    });

                    markers.addLayers(markerList);
                    markers.addTo(map1);
                    $scope.markers = markers;
                    map1.fitBounds([[-90, -220], [90, 220]]);
                } else {


                    //$scope.markers.clearLayers();

                    var m = $scope.map1;
                    for (var i in m._layers) {
                        if (m._layers[i]._path != undefined) {
                            try {
                                m.removeLayer(m._layers[i]);
                            }
                            catch (e) {
                                console.log("problem with " + e + m._layers[i]);
                            }
                        }
                    }

                    if ($scope.firstMarkers) {
                        $scope.firstMarkers.forEach(function (entry) {
                            $scope.map1.removeLayer(entry);
                        });
                        $scope.firstMarkers = [];
                    }

                    if ($scope.lastMarkers) {
                        $scope.lastMarkers.forEach(function (entry) {
                            $scope.map1.removeLayer(entry);
                        });
                        $scope.lastMarkers = [];
                    }

                    if ($scope.switchMarkers) {
                        $scope.switchMarkers.forEach(function (entry) {
                            $scope.map1.removeLayer(entry);
                        });
                        $scope.switchMarkers = [];
                    }

                    if ($scope.offlineMarkers) {
                        $scope.offlineMarkers.forEach(function (entry) {
                            $scope.map1.removeLayer(entry);
                        });
                        $scope.offlineMarkers = [];
                    }

                    if ($scope.onlineMarkers) {
                        $scope.onlineMarkers.forEach(function (entry) {
                            $scope.map1.removeLayer(entry);
                        });
                        $scope.onlineMarkers = [];
                    }

                    if ($scope.poly_list) {
                        $scope.poly_list.forEach(function (entry) {
                            $scope.map1.removeLayer(entry);
                        });
                        $scope.poly_list = [];
                    }


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
                        var tooltip_text = "";
                        _.each(tooltip_fields, function (field) {
                            tooltip_text += field + " : " + es_src[field] + "<br />";
                        });

                        var map_json_data = $.parseJSON(es_src.data);
                        // switch markers
                        _.each(map_json_data.switchmarkers, function (marker_i, i) {
                            var tooltip_content = tooltip_text + marker_i.content;
                            var switchMarker = L.marker([marker_i.latitude, marker_i.longitude], {icon: tealIcon}).addTo(map1);
                            switchMarker.bindPopup(tooltip_content, {'minWidth': '200', 'maxWidth': '200'});
                            $scope.switchMarkers.push(switchMarker);
                        });

                        // down markers
                        _.each(map_json_data.downmarkers, function (marker_i, i) {
                            var tooltip_content = tooltip_text + marker_i.content;
                            var offlineMarker = L.marker([marker_i.latitude, marker_i.longitude], {icon: orangeIcon}).addTo(map1);
                            offlineMarker.bindPopup(tooltip_content, {'minWidth': '200', 'maxWidth': '200'});
                            $scope.offlineMarkers.push(offlineMarker);
                        });

                        // online markers
                        _.each(map_json_data.offtoonmarkers, function (marker_i, i) {
                            var tooltip_content = tooltip_text + marker_i.content;
                            var onlineMarker = L.marker([marker_i.latitude, marker_i.longitude], {icon: yellowIcon}).addTo(map1);
                            onlineMarker.bindPopup(tooltip_content, {'minWidth': '200', 'maxWidth': '200'});
                            $scope.onlineMarkers.push(onlineMarker);
                        });

                        // first marker
                        var firstMarker = L.marker([map_json_data.markers[0].latitude, map_json_data.markers[0].longitude], {icon: greenIcon}).addTo(map1);
                        var tooltip_content = tooltip_text + map_json_data.markers[0].content;
                        firstMarker.bindPopup(tooltip_content, {'minWidth': '200', 'maxWidth': '200'});
                        $scope.firstMarkers.push(firstMarker);

                        // last marker
                        var lastMarker = L.marker([map_json_data.markers[map_json_data.markers.length - 1].latitude, map_json_data.markers[map_json_data.markers.length - 1].longitude], {icon: redIcon}).addTo(map1);
                        var tooltip_content = tooltip_text + map_json_data.markers[map_json_data.markers.length - 1].content;
                        lastMarker.bindPopup(tooltip_content, {'minWidth': '200', 'maxWidth': '200'});
                        $scope.lastMarkers.push(lastMarker);

                        // polylines
                        _.each(map_json_data.polylines, function (polyline, i) {
                            var line = L.polyline(polyline.marker, {
                                color: polyline.color,
                                opacity: polyline.opacity,
                                weight: polyline.weight
                            }).addTo(map1);
                            $scope.poly_list.push(line);
                        });
                        map1.fitBounds([[-90, -220], [90, 220]]);
                    });
                }
            });
            mapSearchSource.fetchQueued();

        });

        _updateDimensions();

    });

});