module.exports = function(kibana) {
	return new kibana.Plugin({
		uiExports: {
			visTypes: ['plugins/kbn_uigrid/uigrid']
		}
	});
};