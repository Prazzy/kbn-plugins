//css
require('plugins/kbn_leaflet/kbn_leaflet.css');
// Include the angular controller
require('plugins/kbn_leaflet/kbn_leaflet_controller');

function KbnLeafletProvider(Private, config) {
    var TemplateVisType = Private(require('ui/template_vis_type/TemplateVisType'));
    var Schemas = Private(require('ui/Vis/Schemas'));
    const _ = require('lodash');
    const supports = require('ui/utils/supports');

    // return the visType object, which kibana will use to display and configure new
    // Vis object of this type.
    return new TemplateVisType({
      name: 'kbn_leaflet',
      title: 'Leaflet Plugin',
      icon: 'fa fa-fw fa-map-marker',
      description: 'Leaflet Plugin',
      template: require('plugins/kbn_leaflet/kbn_leaflet.html'),
      params: {
				editor: require('plugins/kbn_leaflet/kbn_leaflet_editor.html'), // Use this HTML as an options editor for this vis
				defaults: { // Set default values for paramters (that can be configured in the editor)

				},
                canDesaturate: !supports.cssFilters
			},
      schemas: new Schemas([
        {
          group: 'metrics',
          name: 'metric',
          title: 'Value',
          min: 0,
          max: 0,
          aggFilter: ['count', 'avg', 'sum', 'min', 'max', 'cardinality'],
          defaults: [
            { schema: 'metric', type: 'count' }
          ]
        },
        {
          group: 'buckets',
          name: 'segment',
          title: 'Geo Coordinates',
          aggFilter: 'geohash_grid',
          min: 0,
          max: 0
        }
      ])
    });
}

// register the provider with the visTypes registry
require('ui/registry/vis_types').register(KbnLeafletProvider);