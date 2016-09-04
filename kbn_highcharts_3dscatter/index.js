module.exports = function(kibana) {
	return new kibana.Plugin({
		uiExports: {
			visTypes: ['plugins/kbn_highcharts_3dscatter/kbn_highcharts_3dscatter']
		}
	});
};
