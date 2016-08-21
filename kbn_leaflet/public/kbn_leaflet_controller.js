// public parts of the plugin (i.e. parts that reside in the public folder and will be transfered to the client)
// must be AMD modules (RequireJS)
define(function(require) {

	// Create an Angular module for this plugin
	require('jquery');
    var L = require('leaflet');
    require('./bower_components/leaflet_js/leaflet.markercluster');
    require('./bower_components/leaflet_js//MarkerCluster.Default.css');

	var module = require('ui/modules').get('kbn_leaflet', ['kibana']);

	// Add a controller to this module
	module.controller('KbnLeafletController', function($scope, $element, $rootScope, config, Private) {
        var filterManager = Private(require('ui/filter_manager'));
        var SearchSource = Private(require('ui/courier/data_source/search_source'));

		$scope.filter = function(item) {
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
                } else {chart_width = width}
            }

            if (height) {
                if (height > delta) {
                  chart_height = height - delta;
                } else {chart_height = height}
            }
            //$scope.chart.setSize(chart_width, chart_height);
            if (chart_height) $scope.height = chart_height;
        };

        $scope.$on('change:vis', function () {
            if (_.isUndefined($scope.chart)) return;
			    _updateDimensions();
        });


		$scope.$watch('esResponse', function(resp) {

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
            mapSearchSource.size(200);
            mapSearchSource.index($scope.vis.indexPattern);
            mapSearchSource.onResults().then(function onResults(searchResp) {
                  //var map_container = $('map_container1').get(0);
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
                  var markers  = new L.MarkerClusterGroup({maxClusterRadius:100});

                var markerList = [];
                 _.each(searchResp.hits.hits, function(hit, i){
                    var es_data = hit['_source'];
                    var marker = L.marker(new L.LatLng(es_data[lat],es_data[lng]), {
                            title: es_data[lat] + "," + es_data[lng]
                        });
                    var popup = "asdasdasdasdas<br/>sadasdasdasdasdasdsadasdasdasasd<br/>";
                    marker.bindPopup(popup + es_data[lat] + "," + es_data[lng] + "popup", {'minWidth': '200','maxWidth': '200'});
                    markerList.push(marker);
                 });

                markers.addLayers(markerList);
                markers.addTo(map1);
                map1.fitBounds([[-90, -220], [90, 220]]);
            });
            mapSearchSource.fetchQueued();

        });

        _updateDimensions();

    });

});