// Include the angular controller
require('plugins/flight_map/flight_map.css');
require('plugins/flight_map/flight_map_controller');

function FlightMapProvider(Private, config) {
    var TemplateVisType = Private(require('ui/template_vis_type/TemplateVisType'));
    var geoJsonConverter = Private(require('ui/agg_response/geo_json/geo_json'));
    var Schemas = Private(require('ui/Vis/Schemas'));
    var supports = require('ui/utils/supports');

    return new TemplateVisType({
      name: 'flight_map',
      title: 'Flight map',
      icon: 'fa-map-marker',
      description: 'Flight Map Visualization',
      template: require('plugins/flight_map/flight_map.html'),
      params: {
				editor: require('plugins/flight_map/flight_map_editor.html'), // Use this HTML as an options editor for this vis
				defaults: { // Set default values for paramters (that can be configured in the editor)
					handleNoResults: true
				}
			},
      requiresSearch: true
    });
}

require('ui/registry/vis_types').register(FlightMapProvider);