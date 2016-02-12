// Include the angular controller
require('plugins/highcharts_app/highcharts_app_controller');
//require('plugins/tr-k4p-tagcloud/tagcloud.css');

function HighchartsAppProvider(Private, config) {
    var TemplateVisType = Private(require('ui/template_vis_type/TemplateVisType'));
    var geoJsonConverter = Private(require('ui/agg_response/geo_json/geo_json'));
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
					format: 'HH:mm:ss'
				}
			},
      requiresSearch: false
    });
}

require('ui/registry/vis_types').register(HighchartsAppProvider);