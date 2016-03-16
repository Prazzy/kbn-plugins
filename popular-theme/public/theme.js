// public parts of the plugin (i.e. parts that reside in the public folder and will be transfered to the client)
// must be AMD modules (RequireJS)
define(function(require) {

	const chrome = require('ui/chrome');

	// Include our custom CSS (LESS also works)
	require('plugins/popular-theme/theme.css');
	require('plugins/popular-theme/pana-theme.less');
	require('plugins/popular-theme/pana-theme');
	require('jquery');

	// Create an Angular module for this plugin
	var module = require('ui/modules').get('popular-theme');
	// Add a controller to this module
	module.controller('ThemeController', function($scope, $timeout) {

		var setTime = function() {
			$scope.time = Date.now();
			//$timeout(setTime, 1000);
		};
		setTime();

	});

	// The provider function must return the visualization
	function ThemeProvider(Private) {
		// Load TemplateVisType
		var TemplateVisType = Private(require('ui/template_vis_type/TemplateVisType'));

		// Return a new instance describing this visualization
		return new TemplateVisType({
			name: 'popular-theme', // the internal id of the visualization
			title: 'POPULAR Theme', // the name shown in the visualize list
			icon: 'fa-film', // the class of the font awesome icon for this
			description: 'POPULAR Theme.', // description shown to the user
			requiresSearch: false, // Cannot be linked to a search
			template: require('plugins/popular-theme/theme.html'), // Load the template of the visualization
			params: {
				editor: require('plugins/popular-theme/theme-editor.html'), // Use this HTML as an options editor for this vis
				defaults: { // Set default values for paramters (that can be configured in the editor)
					format: 'HH:mm:ss'
				}
			}
		});
	}

	// Register the above provider to the visualization registry
	require('ui/registry/vis_types').register(ThemeProvider);

	// Return the provider, so you potentially load it with RequireJS.
	// This isn't mandatory, but since all Kibana plugins do this, you might
	// want to also return the provider.
	return ThemeProvider;

});
