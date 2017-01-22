//css
require('plugins/kbn_slickgrid/kbn_slickgrid.css');
// Include the angular controller
require('plugins/kbn_slickgrid/kbn_slickgrid_controller');

function KbnHighchartsProvider(Private, config) {
    var TemplateVisType = Private(require('ui/template_vis_type/TemplateVisType'));
    var Schemas = Private(require('ui/Vis/Schemas'));

    // return the visType object, which kibana will use to display and configure new
    // Vis object of this type.
    return new TemplateVisType({
        name: 'kbn_slickgrid',
        title: 'Slick Grid',
        icon: 'fa-pie-chart',
        description: 'Slick Grid',
        template: require('plugins/kbn_slickgrid/kbn_slickgrid.html'),
        params: {
            editor: require('plugins/kbn_slickgrid/kbn_slickgrid_editor.html'), // Use this HTML as an options editor for this vis
            defaults: { // Set default values for paramters (that can be configured in the editor)
            }
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
require('ui/registry/vis_types').register(KbnHighchartsProvider);
