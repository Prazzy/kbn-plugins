module.exports = function(kibana) {
	return new kibana.Plugin({
		uiExports: {
			visTypes: ['plugins/kbn_highcharts_hm/kbn_highcharts_hm']
		}
	});
};