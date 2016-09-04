//css
require('plugins/kbn_highcharts_3dscatter/kbn_highcharts_3dscatter.css');
// Include the angular controller
require('plugins/kbn_highcharts_3dscatter/kbn_highcharts_3dscatter_controller');

function KbnHighcharts3DScatterProvider(Private, config) {
    var TemplateVisType = Private(require('ui/template_vis_type/TemplateVisType'));
    var Schemas = Private(require('ui/Vis/Schemas'));

    // return the visType object, which kibana will use to display and configure new
    // Vis object of this type.
    return new TemplateVisType({
        name: 'kbn_highcharts_3dscatter',
        title: 'Highcharts 3D Scatter Chart',
        icon: 'fa fa-bars',
        description: 'Highcharts 3D Scatter Chart',
        template: require('plugins/kbn_highcharts_3dscatter/kbn_highcharts_3dscatter.html'),
        params: {
            editor: require('plugins/kbn_highcharts_3dscatter/kbn_highcharts_3dscatter_editor.html'), // Use this HTML as an options editor for this vis
            defaults: { // Set default values for paramters (that can be configured in the editor)
                showMetricsAtAllLevels: false,
                hc_options: `{"yAxis": {
                                "min": "-200",
                                "max": "0"
                            },
                            "xAxis": {
                                "min": "0",
                                "max": "10000"
                            },
                            "zAxis": {
                                "min": "0",
                                "max": "100"
                            }}`
            }
        },
        hierarchicalData: function (vis) {
            return Boolean(vis.params.showPartialRows || vis.params.showMetricsAtAllLevels);
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
                name: 'segment',
                icon: 'fa fa-scissors',
                title: 'Split Slices',
                min: 0,
                max: 3,
                aggFilter: '!geohash_grid'
            }
        ])
    });
}

// register the provider with the visTypes registry
require('ui/registry/vis_types').register(KbnHighcharts3DScatterProvider);