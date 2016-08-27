//css
require('plugins/kbn_highcharts_hm/kbn_highcharts_hm.css');
// Include the angular controller
require('plugins/kbn_highcharts_hm/kbn_highcharts_hm_controller');

function KbnHighchartsHmProvider(Private, config) {
    var TemplateVisType = Private(require('ui/template_vis_type/TemplateVisType'));
    var Schemas = Private(require('ui/Vis/Schemas'));

    // return the visType object, which kibana will use to display and configure new
    // Vis object of this type.
    return new TemplateVisType({
        name: 'kbn_highcharts_hm',
        title: 'Highcharts Heatmap',
        icon: 'fa fa-bars',
        description: 'Highcharts Heatmap',
        template: require('plugins/kbn_highcharts_hm/kbn_highcharts_hm.html'),
        params: {
            editor: require('plugins/kbn_highcharts_hm/kbn_highcharts_hm_editor.html'), // Use this HTML as an options editor for this vis
            defaults: { // Set default values for paramters (that can be configured in the editor)
            }
        },
        schemas: new Schemas([
            {
                group: 'metrics',
                name: 'metric',
                title: 'Cell',
                min: 1,
                aggFilter: ['avg', 'sum', 'count', 'min', 'max', 'median', 'cardinality'],
                defaults: [
                    {schema: 'metric', type: 'count'}
                ]
            },
            {
                group: 'buckets',
                name: 'columns',
                icon: 'fa fa-ellipsis-v',
                title: 'X',
                min: 0,
                max: 1,
                aggFilter: '!geohash_grid'
            },
            {
                group: 'buckets',
                name: 'rows',
                icon: 'fa fa-ellipsis-h',
                title: 'Y',
                min: 0,
                max: 1,
                aggFilter: '!geohash_grid'
            }
        ])
    });
}

// register the provider with the visTypes registry
require('ui/registry/vis_types').register(KbnHighchartsHmProvider);