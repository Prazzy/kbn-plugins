module.exports = function(kibana) {
	return new kibana.Plugin({
		uiExports: {
			visTypes: ['plugins/highcharts_app/highcharts_app']
		}
	});
};