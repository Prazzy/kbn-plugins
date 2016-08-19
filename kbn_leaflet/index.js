module.exports = function(kibana) {
	return new kibana.Plugin({
		uiExports: {
			visTypes: ['plugins/kbn_leaflet/kbn_leaflet']
		}
	});
};