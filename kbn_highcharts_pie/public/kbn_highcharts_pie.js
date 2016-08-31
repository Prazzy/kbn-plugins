//css
require('plugins/kbn_highcharts_pie/kbn_highcharts_pie.css');
// Include the angular controller
require('plugins/kbn_highcharts_pie/kbn_highcharts_pie_controller');

function KbnHighchartsProvider(Private, config) {
    var TemplateVisType = Private(require('ui/template_vis_type/TemplateVisType'));
    var Schemas = Private(require('ui/Vis/Schemas'));

    // return the visType object, which kibana will use to display and configure new
    // Vis object of this type.
    return new TemplateVisType({
        name: 'kbn_highcharts_pie',
        title: 'Highcharts Pie Chart',
        icon: 'fa-pie-chart',
        description: 'Highcharts Pie Chart',
        template: require('plugins/kbn_highcharts_pie/kbn_highcharts_pie.html'),
        params: {
            editor: require('plugins/kbn_highcharts_pie/kbn_highcharts_pie_editor.html'), // Use this HTML as an options editor for this vis
            defaults: { // Set default values for paramters (that can be configured in the editor)
                shareYAxis: true,
                hc_options: `{
              "title": {
                "text": ""
              },
              "tooltip": {
                "pointFormat": "<b>{point.percentage:.1f}%</b><br><b>{point.y:.0f}</b>"
              },
              "plotOptions": {
                "pie": {
                  "allowPointSelect": "true",
                  "cursor": "pointer",
                  "dataLabels": {
                    "enabled": "true",
                    "format": "<b>{point.name}</b>: {point.percentage:.1f} %",
                    "style": {
                      "color": "black"
                    }
                  },
                "showInLegend": "true"
                }
              }
            }`
            }
        },
        hierarchicalData: true,
        schemas: new Schemas([
            {
                group: 'metrics',
                name: 'metric',
                title: 'Slice Size',
                min: 1,
                max: 1,
                aggFilter: ['sum', 'count', 'cardinality'],
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
                max: 2,
                aggFilter: '!geohash_grid'
            },
            {
                group: 'buckets',
                name: 'split',
                icon: 'fa fa-th',
                title: 'Split Chart',
                mustBeFirst: true,
                min: 0,
                max: 1,
                aggFilter: '!geohash_grid'
            }
        ])
    });
}

// register the provider with the visTypes registry
require('ui/registry/vis_types').register(KbnHighchartsProvider);