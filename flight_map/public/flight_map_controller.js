// public parts of the plugin (i.e. parts that reside in the public folder and will be transfered to the client)
// must be AMD modules (RequireJS)
define(function(require) {

	// Include our custom CSS (LESS also works)
	//require('plugins/tr-k4p-clock/clock.css');

	// Create an Angular module for this plugin
	var module = require('ui/modules').get('flight_map', ['kibana']);
    var L = require('leaflet');
    require('angular-leaflet-directive');
    require('jquery');

    module.config(function($logProvider){
      $logProvider.debugEnabled(false);
    });

	// Add a controller to this module
	module.controller('FlightMapController', function($scope, $element, $rootScope, Private) {
        var SearchSource = Private(require('ui/courier/data_source/search_source'));

        var _updateDimensions = function () {
          $scope.options = {width: 400};
          $scope.options = {height:400};
          //var delta = 18;
          //var width = $element.parent().width();
          //var height = $element.parent().height();
          //console.log(height);
          //if (width) {
          //  if (width > delta) {
          //    width -= delta;
          //  }
          //  $scope.width = width;
          //}
          //if (height) {
          //  if (height > delta) {
          //    height -= delta;
          //  }
          //  if (height > 1) $scope.height = height;
          //}
        };

        //var off = $rootScope.$on('change:vis', function () {
        //    _updateDimensions();
        //});
        //$scope.$on('$destroy', off);

		_.extend($scope, {
                center: {
                    lat: 48,
                    lng: 4,
                    zoom: 2
                },
                defaults: {
                    tileLayer: "https://otile1-s.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpg",
                    zoomControlPosition: 'topright',
                    tileLayerOptions: {
                        opacity: 2.0,
                        detectRetina: true,
                        reuseTiles: true
                    }
                },
            markers: {},
            paths: {}
        });

        $scope.$watch('esResponse', function(resp) {
            var mapSearchSource = new SearchSource();
            mapSearchSource.size(20);
            mapSearchSource.index($scope.vis.indexPattern);
            mapSearchSource.onResults().then(function onResults(searchResp) {
                $scope.paths = {};
                $scope.markers = {};

                _.each(searchResp.hits.hits, function(hit, i){
                    var es_src = hit['_source'];
                    var map_json_data = $.parseJSON(es_src.data);
                            // markers
                    _.each(map_json_data.switchmarkers, function(marker, i){
                            $scope.markers['sm'+i] = {lat: marker.latitude,
                                                    lng: marker.longitude,
                                                    message: marker.content,
                                                    focus: false,
                                                    draggable: false,
                                                    icon: {iconUrl: '../plugins/flight_map/images/teal-dot.png',
                                                        iconAnchor: [10, 30]}
                                                }
                    });

                    // markers
                    _.each(map_json_data.downmarkers, function(marker, i){
                            $scope.markers['dm'+i] = {lat: marker.latitude,
                                                    lng: marker.longitude,
                                                    message: marker.content,
                                                    focus: false,
                                                    draggable: false,
                                                    icon: {iconUrl: '../plugins/flight_map/images/orange-dot.png',
                                                        iconAnchor: [10, 30]}
                                                }
                    });

                    // markers
                    _.each(map_json_data.offtoonmarkers, function(marker, i){
                            $scope.markers['om'+i] = {lat: marker.latitude,
                                                    lng: marker.longitude,
                                                    message: marker.content,
                                                    focus: false,
                                                    draggable: false,
                                                    icon: {iconUrl: '../plugins/flight_map/images/yellow-dot.png',
                                                        iconAnchor: [10, 30]}
                                                }
                    });

                    // markers
                    $scope.markers['fm'] = {lat: map_json_data.markers[0].latitude,
                                            lng: map_json_data.markers[0].longitude,
                                            message: map_json_data.markers[0].content,
                                            focus: false,
                                            draggable: false,
                                            icon: {iconUrl: '../plugins/flight_map/images/green-dot.png',
                                                iconAnchor: [10, 30]}
                                        };

                    var last_marker = map_json_data.markers[map_json_data.markers.length - 1];
                    $scope.markers['lm'] = {lat: last_marker.latitude,
                                            lng: last_marker.longitude,
                                            message: last_marker.content,
                                            focus: false,
                                            draggable: false,
                                            icon: {iconUrl: '../plugins/flight_map/images/red-dot.png',
                                                iconAnchor: [10, 30]}
                                        };

                    // polylines
                    _.each(map_json_data.polylines, function(polyline, i) {
                        $scope.paths[es_src['flight_id']+i] = {
                            type: "polyline", color: polyline.color, weight:polyline.weight,
                            opacity: polyline.opacity, latlngs: polyline.marker
                        };
                    });

                });
            });
            mapSearchSource.fetchQueued();
        });

    });

});
