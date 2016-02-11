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
	module.controller('FlightMapController', function($scope) {

		var setTime = function() {
			$scope.time = Date.now();
		};
		setTime();

		_.extend($scope, {
                center: {
                    lat: 48,
                    lng: 4,
                    zoom: 4
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


        var map_data = '{ "markers": [{ "latitude": 28.4, "longitude": -81.11,  "content": "timestamp: 2016-02-08 20:45:29<br>lat: 28.4<br>lng: -81.11<br>alt: 10248.0<br>eirp: -2.0<br>satlong: -116.8 (SATMEX8)<br>rxsnr: 4.12<br>tx_power: -19.0"  },{ "latitude": 40.17, "longitude": -103.86,  "content": "timestamp: 2016-02-09 00:14:40<br>lat: 40.17<br>lng: -103.86<br>alt: 18439.0<br>eirp: 40.51<br>satlong: -116.8 (SATMEX8)<br>rxsnr: 5.33<br>tx_power: -27.0"  }], "switchmarkers": [], "downmarkers": [], "offtoonmarkers": [ { "latitude": 28.44, "longitude": -81.1, "content": "timestamp: 2016-02-08 20:45:59<br>lat: 28.44<br>lng: -81.1<br>alt: 11443.0<br>eirp: -7.0<br>satlong: -116.8 (SATMEX8)<br>rxsnr: 2.9<br>tx_power: -22.0"}], "polylines": [{ "opacity": 1.0, "weight": 2,  "color": "#FF0000", "marker": [[28.4, -81.11],[28.44, -81.1]] }, { "opacity": 1.0, "weight": 2,  "color": "#00FF33", "marker": [[28.44, -81.1],[28.49, -81.11],[28.52, -81.13],[28.56, -81.15],[28.59, -81.17],[28.63, -81.19],[28.67, -81.21],[28.7, -81.24],[28.74, -81.26],[28.78, -81.28],[28.81, -81.31],[28.85, -81.33],[28.89, -81.36],[28.93, -81.38],[28.98, -81.4],[29.03, -81.41],[29.08, -81.42],[29.13, -81.42],[29.19, -81.43],[29.24, -81.43],[29.3, -81.44],[29.36, -81.45],[29.42, -81.45],[29.48, -81.46],[29.54, -81.46],[29.6, -81.48],[29.66, -81.5],[29.72, -81.51],[29.77, -81.53],[29.83, -81.55],[29.89, -81.56],[29.95, -81.58],[30.01, -81.6],[30.06, -81.61],[30.12, -81.63],[30.18, -81.65],[30.23, -81.66],[30.29, -81.68],[30.35, -81.7],[30.41, -81.71],[30.46, -81.73],[30.52, -81.75],[30.58, -81.76],[30.64, -81.78],[30.69, -81.8],[30.75, -81.82],[30.81, -81.84],[30.85, -81.87],[30.9, -81.9],[30.94, -81.94],[30.98, -81.97],[31.03, -82.01],[31.07, -82.05],[31.12, -82.08],[31.16, -82.12],[31.2, -82.15],[31.25, -82.19],[31.29, -82.22],[31.33, -82.25],[31.37, -82.29],[31.41, -82.32],[31.45, -82.35],[31.49, -82.38],[31.53, -82.42],[31.57, -82.45],[31.61, -82.48],[31.65, -82.51],[31.69, -82.54],[31.72, -82.57],[31.76, -82.6],[31.8, -82.64],[31.84, -82.67],[31.88, -82.7],[31.92, -82.73],[31.96, -82.76],[32.0, -82.8],[32.04, -82.83],[32.08, -82.86],[32.12, -82.9],[32.16, -82.93],[32.2, -82.97],[32.25, -83.0],[32.29, -83.04],[32.33, -83.07],[32.38, -83.11],[32.42, -83.15],[32.47, -83.19],[32.51, -83.22],[32.56, -83.26],[32.6, -83.3],[32.65, -83.34],[32.69, -83.38],[32.74, -83.42],[32.79, -83.45],[32.83, -83.49],[32.88, -83.53],[32.93, -83.57],[32.97, -83.61],[33.02, -83.65],[33.07, -83.69],[33.11, -83.73],[33.16, -83.77],[33.21, -83.81],[33.26, -83.85],[33.3, -83.89],[33.35, -83.93],[33.4, -83.97],[33.44, -84.01],[33.49, -84.05],[33.54, -84.09],[33.59, -84.13],[33.63, -84.17],[33.68, -84.21],[33.73, -84.25],[33.78, -84.28],[33.82, -84.32],[33.87, -84.36],[33.92, -84.4],[33.97, -84.44],[34.01, -84.48],[34.06, -84.52],[34.11, -84.56],[34.16, -84.6],[34.2, -84.65],[34.25, -84.69],[34.29, -84.74],[34.33, -84.78],[34.37, -84.83],[34.42, -84.87],[34.46, -84.92],[34.5, -84.97],[34.55, -85.01],[34.59, -85.06],[34.63, -85.1],[34.67, -85.15],[34.72, -85.2],[34.76, -85.24],[34.81, -85.29],[34.85, -85.34],[34.89, -85.39],[34.94, -85.44],[34.98, -85.48],[35.03, -85.53],[35.07, -85.58],[35.11, -85.63],[35.16, -85.67],[35.2, -85.72],[35.24, -85.77],[35.29, -85.82],[35.33, -85.87],[35.38, -85.91],[35.42, -85.96],[35.46, -86.01],[35.51, -86.06],[35.55, -86.11],[35.6, -86.16],[35.64, -86.21],[35.69, -86.26],[35.73, -86.31],[35.77, -86.35],[35.82, -86.4],[35.86, -86.45],[35.91, -86.5],[35.95, -86.55],[35.99, -86.6],[36.04, -86.65],[36.08, -86.7],[36.11, -86.76],[36.14, -86.82],[36.17, -86.88],[36.2, -86.94],[36.23, -87.0],[36.26, -87.07],[36.28, -87.13],[36.31, -87.19],[36.34, -87.26],[36.37, -87.32],[36.4, -87.38],[36.43, -87.45],[36.45, -87.51],[36.48, -87.57],[36.51, -87.64],[36.54, -87.7],[36.57, -87.77],[36.6, -87.83],[36.63, -87.89],[36.65, -87.96],[36.68, -88.02],[36.71, -88.08],[36.74, -88.15],[36.77, -88.21],[36.79, -88.28],[36.82, -88.34],[36.85, -88.4],[36.88, -88.47],[36.91, -88.53],[36.93, -88.6],[36.96, -88.66],[36.99, -88.73],[37.02, -88.79],[37.05, -88.86],[37.07, -88.92],[37.1, -88.99],[37.13, -89.05],[37.16, -89.12],[37.19, -89.18],[37.21, -89.25],[37.24, -89.32],[37.27, -89.38],[37.3, -89.45],[37.32, -89.51],[37.35, -89.58],[37.38, -89.64],[37.41, -89.71],[37.43, -89.77],[37.46, -89.84],[37.49, -89.9],[37.51, -89.97],[37.54, -90.03],[37.57, -90.1],[37.59, -90.16],[37.62, -90.23],[37.65, -90.29],[37.68, -90.36],[37.71, -90.42],[37.74, -90.49],[37.77, -90.55],[37.8, -90.61],[37.83, -90.68],[37.86, -90.74],[37.88, -90.8],[37.91, -90.87],[37.94, -90.93],[37.97, -91.0],[38.0, -91.06],[38.03, -91.12],[38.06, -91.19],[38.09, -91.25],[38.12, -91.32],[38.15, -91.38],[38.17, -91.45],[38.2, -91.51],[38.23, -91.57],[38.26, -91.64],[38.29, -91.7],[38.32, -91.77],[38.34, -91.83],[38.37, -91.89],[38.4, -91.96],[38.43, -92.02],[38.46, -92.09],[38.48, -92.15],[38.51, -92.22],[38.53, -92.28],[38.56, -92.35],[38.58, -92.42],[38.6, -92.48],[38.63, -92.55],[38.65, -92.62],[38.68, -92.69],[38.7, -92.75],[38.73, -92.82],[38.75, -92.89],[38.77, -92.96],[38.8, -93.02],[38.82, -93.09],[38.85, -93.16],[38.87, -93.23],[38.89, -93.3],[38.92, -93.36],[38.94, -93.43],[38.97, -93.5],[38.99, -93.57],[39.01, -93.63],[39.04, -93.7],[39.06, -93.77],[39.08, -93.83],[39.1, -93.9],[39.13, -93.97],[39.15, -94.03],[39.17, -94.1],[39.2, -94.17],[39.22, -94.23],[39.23, -94.3],[39.25, -94.37],[39.27, -94.44],[39.29, -94.51],[39.31, -94.58],[39.33, -94.65],[39.35, -94.73],[39.36, -94.8],[39.38, -94.87],[39.4, -94.94],[39.42, -95.01],[39.44, -95.08],[39.46, -95.15],[39.48, -95.22],[39.49, -95.29],[39.51, -95.36],[39.53, -95.43],[39.55, -95.5],[39.57, -95.57],[39.58, -95.64],[39.6, -95.71],[39.62, -95.79],[39.63, -95.86],[39.64, -95.94],[39.65, -96.01],[39.65, -96.09],[39.66, -96.16],[39.67, -96.24],[39.67, -96.31],[39.68, -96.39],[39.69, -96.46],[39.7, -96.54],[39.7, -96.61],[39.71, -96.69],[39.72, -96.76],[39.72, -96.84],[39.73, -96.91],[39.74, -96.98],[39.74, -97.06],[39.75, -97.13],[39.76, -97.21],[39.76, -97.29],[39.77, -97.36],[39.78, -97.44],[39.78, -97.51],[39.8, -97.58],[39.82, -97.65],[39.84, -97.72],[39.86, -97.78],[39.88, -97.84],[39.9, -97.9],[39.92, -97.96],[39.94, -98.02],[39.96, -98.08],[39.97, -98.14],[39.99, -98.2],[40.01, -98.26],[40.03, -98.32],[40.05, -98.38],[40.07, -98.44],[40.09, -98.51],[40.11, -98.57],[40.13, -98.63],[40.15, -98.7],[40.17, -98.76],[40.19, -98.82],[40.21, -98.89],[40.23, -98.95],[40.25, -99.01],[40.27, -99.07],[40.28, -99.14],[40.3, -99.2],[40.31, -99.27],[40.32, -99.35],[40.32, -99.42],[40.33, -99.49],[40.33, -99.56],[40.33, -99.64],[40.34, -99.71],[40.34, -99.79],[40.35, -99.86],[40.35, -99.93],[40.36, -100.01],[40.36, -100.09],[40.37, -100.16],[40.37, -100.24],[40.38, -100.31],[40.38, -100.39],[40.38, -100.46],[40.39, -100.54],[40.39, -100.61],[40.4, -100.69],[40.4, -100.76],[40.41, -100.84],[40.41, -100.91],[40.41, -100.99],[40.42, -101.06],[40.42, -101.14],[40.42, -101.22],[40.43, -101.29],[40.43, -101.37],[40.44, -101.44],[40.44, -101.52],[40.44, -101.6],[40.45, -101.67],[40.45, -101.75],[40.45, -101.83],[40.46, -101.9],[40.46, -101.98],[40.46, -102.06],[40.47, -102.13],[40.47, -102.21],[40.47, -102.29],[40.46, -102.37],[40.44, -102.45],[40.43, -102.53],[40.42, -102.61],[40.4, -102.69],[40.39, -102.77],[40.37, -102.85],[40.36, -102.92],[40.34, -103.0],[40.33, -103.08],[40.31, -103.16],[40.3, -103.23],[40.28, -103.31],[40.27, -103.39],[40.25, -103.46],[40.24, -103.53],[40.23, -103.6],[40.21, -103.67],[40.2, -103.74],[40.19, -103.8],[40.17, -103.86]] }] }';
        map_json_data = $.parseJSON(map_data);

        // markers
        _.each(map_json_data.switchmarkers, function(marker, i){
                $scope.markers['sm'+i] = {lat: marker.latitude,
                                        lng: marker.longitude,
                                        message: marker.content,
                                        focus: true,
                                        draggable: false,
                                        icon: {iconUrl: url('/plugins/flight_map/images/teal-dot.png'),iconAnchor: [10, 30]}

                                    }
        });

        // markers
        _.each(map_json_data.downmarkers, function(marker, i){
                $scope.markers['dm'+i] = {lat: marker.latitude,
                                        lng: marker.longitude,
                                        message: marker.content,
                                        focus: true,
                                        draggable: false,
                                        icon: {iconUrl: '/plugins/flight_map/images/teal-dot.png',iconAnchor: [10, 30]}
                                    }
        });


        // markers
        _.each(map_json_data.offtoonmarkers, function(marker, i){
                $scope.markers['om'+i] = {lat: marker.latitude,
                                        lng: marker.longitude,
                                        message: marker.content,
                                        focus: true,
                                        draggable: false,
                                        icon: {iconUrl: '/plugins/flight_map/images/teal-dot.png',iconAnchor: [10, 30]}
                                    }
        });

        // markers
        $scope.markers['fm'] = {lat: map_json_data.markers[0].latitude,
                                lng: map_json_data.markers[0].longitude,
                                message: map_json_data.markers[0].content,
                                focus: true,
                                draggable: false,
                                icon: {iconUrl: '/plugins/flight_map/images/teal-dot.png',iconAnchor: [10, 30]}
                            };

        var last_marker = map_json_data.markers[map_json_data.markers.length - 1];
        $scope.markers['lm'] = {lat: last_marker.latitude,
                                lng: last_marker.longitude,
                                message: last_marker.content,
                                focus: true,
                                draggable: false,
                                icon: {iconUrl: '/plugins/flight_map/images/teal-dot.png',iconAnchor: [10, 30]}
                            };

        // polylines
        _.each(map_json_data.polylines, function(polyline, i) {
            $scope.paths['p'+i] = {
                type: "polyline", color: polyline.color, weight:polyline.weight,
                opacity: polyline.opacity, latlngs: polyline.marker
            };
        });

    });

});