require('plugins/kbn_uigrid/uigrid.css');
require('plugins/kbn_uigrid/uigrid_controller');
require('plugins/kbn_uigrid/uigrid_editor');

function KbnUIGridProvider(Private, config) {
    var TemplateVisType = Private(require('ui/template_vis_type/TemplateVisType'));
    var Schemas = Private(require('ui/Vis/Schemas'));

    return new TemplateVisType({
        name: 'kbn_uigrid',
        title: 'Angular UI Grid',
        icon: 'fa-table',
        description: 'Angular UI Grid',
        template: require('plugins/kbn_uigrid/uigrid.html'),
        params: {
            editor: '<uigrid-vis-params></uigrid-vis-params>', // Use this HTML as an options editor for this vis
            defaults: { // Set default values for paramters (that can be configured in the editor)
              rowsCount: 1000,
              gridColumns: '',
              enableSorting: true,
              enableColumnResizing: true,
              enableGridMenu: true,
              exporterCsvFilename:'download.csv',
              paginationPageSize: 500
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

require('ui/registry/vis_types').register(KbnUIGridProvider);
