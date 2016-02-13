// Include the angular controller
require('plugins/highcharts_app/highcharts_app_controller');
//require('plugins/tr-k4p-tagcloud/tagcloud.css');

function HighchartsAppProvider(Private, config) {
    var TemplateVisType = Private(require('ui/template_vis_type/TemplateVisType'));
    var Schemas = Private(require('ui/Vis/Schemas'));
    var supports = require('ui/utils/supports');

    return new TemplateVisType({
      name: 'highcharts_app',
      title: 'Highcharts App',
      icon: 'fa fa-bars',
      description: 'Highcharts App Visualization',
      template: require('plugins/highcharts_app/highcharts_app.html'),
      params: {
				editor: require('plugins/highcharts_app/highcharts_app_editor.html'), // Use this HTML as an options editor for this vis
				defaults: { // Set default values for paramters (that can be configured in the editor)
					        shareYAxis: true,
                            addTooltip: true,
                            addLegend: true,
                            scale: 'linear',
                            mode: 'stacked',
                            times: [],
                            addTimeMarker: false,
                            defaultYExtents: false,
                            setYExtents: false,
                            yAxis: {}
				},
                scales: ['linear', 'log', 'square root'],
                modes: ['stacked', 'percentage', 'grouped']
			},
      schemas: new Schemas([
          {
            group: 'metrics',
            name: 'metric',
            title: 'Y-Axis',
            min: 1,
            aggFilter: '!std_dev',
            defaults: [
              { schema: 'metric', type: 'count' }
            ]
          },
          {
            group: 'buckets',
            name: 'segment',
            title: 'X-Axis',
            min: 0,
            max: 1,
            aggFilter: '!geohash_grid'
          },
          {
            group: 'buckets',
            name: 'group',
            title: 'Split Bars',
            min: 0,
            max: 1,
            aggFilter: '!geohash_grid'
          },
          {
            group: 'buckets',
            name: 'split',
            title: 'Split Chart',
            min: 0,
            max: 1,
            aggFilter: '!geohash_grid'
          }
        ])
    });
}

require('ui/registry/vis_types').register(HighchartsAppProvider);