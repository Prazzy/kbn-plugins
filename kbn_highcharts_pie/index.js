module.exports = function(kibana) {
	return new kibana.Plugin({
		uiExports: {
			visTypes: ['plugins/kbn_highcharts_pie/kbn_highcharts_pie']
		}
	});
};
