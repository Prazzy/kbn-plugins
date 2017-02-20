// Create an Angular module for this plugin
require('jquery');
var L = require('leaflet');
require('./bower_components/leaflet_js/leaflet.markercluster');
require('./bower_components/leaflet_js/mq-map');
require('./bower_components/leaflet_js/MarkerCluster.Default.css');

var module = require('ui/modules').get('kbn_leaflet', ['kibana']);

// Add a controller to this module
module.controller('KbnLeafletController', function ($scope, $element, $rootScope, $http, config, Private) {
  var filterManager = Private(require('ui/filter_manager'));
  var SearchSource = Private(require('ui/courier/data_source/search_source'));

  $scope.filter = function (value) {
    filterManager.add($scope.vis.params.filterField, value, null, $scope.vis.indexPattern.title);
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

  var _clearLayers = function () {
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
  };

  var _removeMarkers = function () {
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

    if ($scope.polyList) {
      $scope.polyList.forEach(function (entry) {
        $scope.map1.removeLayer(entry);
      });
      $scope.polyList = [];
    }
  };

  var tealIcon, orangeIcon, yellowIcon, greenIcon, redIcon, airplaneIcon;
  var _mapIcons = function () {
    tealIcon = L.icon({
      iconUrl: '../plugins/kbn_leaflet/images/teal-dot2.png',
      iconAnchor: [10, 30]
    });

    orangeIcon = L.icon({
      iconUrl: '../plugins/kbn_leaflet/images/orange-dot2.png',
      iconAnchor: [10, 30]
    });

    yellowIcon = L.icon({
      iconUrl: '../plugins/kbn_leaflet/images/yellow-dot2.png',
      iconAnchor: [10, 30]
    });

    greenIcon = L.icon({
      iconUrl: '../plugins/kbn_leaflet/images/green-dot2.png',
      iconAnchor: [10, 30]
    });

    redIcon = L.icon({
      iconUrl: '../plugins/kbn_leaflet/images/red-dot3.png',
      iconAnchor: [10, 30]
    });

    airplaneIcon = L.icon({
      iconUrl: '../plugins/kbn_leaflet/images/airplane.png',
      iconAnchor: [10, 30],
    });
  };

  var markerOnClick = function (e) {
    if ($scope.vis.params.filterField) $scope.filter(e.target.options[$scope.vis.params.filterField]);
  };

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
    mapSearchSource.set('filter', mapSearchSource.getOwn('filter'));
    mapSearchSource.set('query', mapSearchSource.getOwn('query'));
    mapSearchSource.size(size);
    mapSearchSource.index($scope.vis.indexPattern);
    mapSearchSource.onResults().then(function onResults(searchResp) {
      if (typeof $scope.map1 === 'undefined') {
        $scope.map1 = new L.map('leaflet_' + $scope.$id, {
            scrollWheelZoom: true,
            //center: [40, -86],
            minZoom: 2,
            maxZoom: 18,
            noWrap: true,
            fadeAnimation: false,
            layers: MQ.mapLayer()
        });

        $scope.paths = {};
        $scope.markers = {};
        $scope.switchMarkers = [];
        $scope.offlineMarkers = [];
        $scope.onlineMarkers = [];
        $scope.firstMarkers = [];
        $scope.lastMarkers = [];
        $scope.polyList = [];
      }

      var map1 = $scope.map1;
      L.Icon.Default.imagePath = '../plugins/kbn_leaflet/images';

      //(function () {
      //    var control = new L.Control({position: 'topright'});
      //    control.onAdd = function (map1) {
      //        var azoom = L.DomUtil.create('a', 'resetzoom');
      //        azoom.innerHTML = "[Reset Zoom]";
      //        L.DomEvent
      //            .disableClickPropagation(azoom)
      //            .addListener(azoom, 'click', function () {
      //                map1.fitBounds([[-90, -220], [90, 220]])
      //                //map1.setView(map1.options.center, map1.options.zoom);
      //            }, azoom);
      //        return azoom;
      //    };
      //    return control;
      //}())
      //    .addTo(map1);

      let beams = '';
      if (map_type === "Marker Cluster") {
        try {
          if ($scope.map1 && $scope.markers.getLayers()) $scope.markers.clearLayers();
        } catch (e) {
        }
        var markers = new L.MarkerClusterGroup({maxClusterRadius: 100});
        var markerList = [];
        _.each(searchResp.hits.hits, function (hit, i) {
          var es_data = hit['_source'];
          var tooltip_text = "";
          _.each(tooltip_fields, function (field) {
              tooltip_text += field + " : " + es_data[field] + "<br />";
          });
          if (es_data[lat] && es_data[lng]) {   
            var marker = L.marker(new L.LatLng(es_data[lat], es_data[lng]), {
               title: es_data[lat] + "," + es_data[lng]
            });
            marker.bindPopup(tooltip_text, {
               maxWidth: 500
            });
            markerList.push(marker);
          } 
        });

        markers.addLayers(markerList);
        markers.addTo(map1);
        $scope.markers = markers;
        map1.fitBounds([[-90, -220], [90, 220]]);
      } else {
        _clearLayers();
        _removeMarkers();
        _mapIcons();

        _.each(searchResp.hits.hits, function (hit, i) {
          var es_src = hit['_source'];
          if (es_src.Beams) beams += es_src.Beams + ',';
          var filterField = $scope.vis.params.filterField;
          var filterValue = '';
          if (filterField) filterValue = es_src[filterField];
          var tooltip_text = '';
          _.each(tooltip_fields, function (field) {
              tooltip_text += field + " : " + es_src[field] + "<br />";
          });

          if (typeof es_src.data != 'undefined') {  
            var map_json_data = $.parseJSON(es_src.data);
            // switch markers
            _.each(map_json_data.switchmarkers, function (marker_i, i) {
                var markerOptions = {icon: tealIcon};
                markerOptions[filterField] = filterValue;
                var tooltip_content = tooltip_text + marker_i.content;
                var switchMarker = L.marker([marker_i.latitude, marker_i.longitude], markerOptions).on('click', markerOnClick).addTo(map1);
                switchMarker.bindPopup(tooltip_content, {maxWidth: 500});
                switchMarker.on('mouseover', function (e) {
                  this.openPopup();
                });
                switchMarker.on('mouseout', function (e) {
                  this.closePopup();
                });
                $scope.switchMarkers.push(switchMarker);
            });

            // down markers
            _.each(map_json_data.downmarkers, function (marker_i, i) {
                var markerOptions = {icon: orangeIcon};
                markerOptions[filterField] = filterValue;
                var tooltip_content = tooltip_text + marker_i.content;
                var offlineMarker = L.marker([marker_i.latitude, marker_i.longitude], markerOptions).on('click', markerOnClick).addTo(map1);
                offlineMarker.bindPopup(tooltip_content, {maxWidth: 500});
                offlineMarker.on('mouseover', function (e) {
                  this.openPopup();
                });
                offlineMarker.on('mouseout', function (e) {
                  this.closePopup();
                });
                $scope.offlineMarkers.push(offlineMarker);
            });

            // online markers
            _.each(map_json_data.offtoonmarkers, function (marker_i, i) {
                var markerOptions = {icon: yellowIcon};
                markerOptions[filterField] = filterValue;
                var tooltip_content = tooltip_text + marker_i.content;
                var onlineMarker = L.marker([marker_i.latitude, marker_i.longitude], markerOptions).on('click', markerOnClick).addTo(map1);
                onlineMarker.bindPopup(tooltip_content, {maxWidth: 500});
                onlineMarker.on('mouseover', function (e) {
                  this.openPopup();
                });
                onlineMarker.on('mouseout', function (e) {
                  this.closePopup();
                });
                $scope.onlineMarkers.push(onlineMarker);
            });

            // first marker
            var markerOptions = {icon: greenIcon};
            markerOptions[filterField] = filterValue;
            var firstMarker = L.marker([map_json_data.markers[0].latitude, map_json_data.markers[0].longitude], markerOptions).on('click', markerOnClick).addTo(map1);
            var tooltip_content = tooltip_text + map_json_data.markers[0].content;
            firstMarker.bindPopup(tooltip_content, {maxWidth: 500});
            firstMarker.on('mouseover', function (e) {
              this.openPopup();
            });
            firstMarker.on('mouseout', function (e) {
              this.closePopup();
            });
            $scope.firstMarkers.push(firstMarker);

            // last marker
            if (es_src.InFlight) {
              var markerOptions = {icon: airplaneIcon};
              markerOptions[filterField] = filterValue;
              var lastMarker = L.marker([map_json_data.markers[map_json_data.markers.length - 1].latitude, 
                map_json_data.markers[map_json_data.markers.length - 1].longitude], markerOptions).on('click', markerOnClick).addTo(map1); 
            } else {
              var markerOptions = {icon: redIcon};
              markerOptions[filterField] = filterValue;
              var lastMarker = L.marker([map_json_data.markers[map_json_data.markers.length - 1].latitude, 
                map_json_data.markers[map_json_data.markers.length - 1].longitude], markerOptions).on('click', markerOnClick).addTo(map1);
            }                      
            var tooltip_content = tooltip_text + map_json_data.markers[map_json_data.markers.length - 1].content;
            lastMarker.bindPopup(tooltip_content, {maxWidth: 500});
            lastMarker.on('mouseover', function (e) {
              this.openPopup();
            });
            lastMarker.on('mouseout', function (e) {
              this.closePopup();
            });
            $scope.lastMarkers.push(lastMarker);

            // polylines
            _.each(map_json_data.polylines, function (polyline, i) {
                var polylineOptions = {
                    color: polyline.color,
                    opacity: polyline.opacity,
                    weight: polyline.weight
                };
                polylineOptions[filterField] = filterValue;
                var line = L.polyline(polyline.marker, polylineOptions).on('click', markerOnClick).addTo(map1);
                $scope.polyList.push(line);
            });
          }
          map1.fitBounds([[-90, -220], [90, 220]]);
        });

        // Beam layers
        if ($scope.controlLayers) {
          $scope.map1.removeControl($scope.controlLayers);
          delete $scope.controlLayers;
        } 
        if ($scope.vis.params.beam_enabled) {
          // get beam names
          const kmlSourceIndexName = $scope.vis.params.beam.index;
          const beamNames = _.uniq(beams.split(',')); 
          $scope.controlLayers = L.control.layers(null, [], { collapsed: true }).addTo(map1);
          const highlightStyle = {
              weight: 2,
              opacity: 0.6
          };

          // get co-ordinates
          _.each(beamNames, function (beam, i) {
            let params = {
              index: kmlSourceIndexName,
              beamName: beam
            };

            $http.post('../api/kbn_leaflet/geojson', params)
            .then(function (resp) {
              if (resp.data.length > 0) {
                let geojson_data = JSON.parse(resp.data[0]._source.GeoJSON);
                let beamLayer = L.geoJson(geojson_data, {
                  onEachFeature: function (feature, layer) {
                    layer.bindPopup(feature.properties.name);
                    layer.on("mouseover", function (e) {
                      layer.setStyle(highlightStyle);
                    });               
                  },
                  weight: 1
                });
                map1.addLayer(beamLayer);
                $scope.controlLayers.addOverlay(beamLayer, geojson_data.properties.name);
              }
            });
          }); 
        } // Beam layers
      }
    });
    mapSearchSource.fetchQueued();

  });

  _updateDimensions();

});
