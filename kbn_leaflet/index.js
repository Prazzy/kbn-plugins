import api from './server/routes';

module.exports = function(kibana) {
	return new kibana.Plugin({
		require: ['elasticsearch'],
		
		uiExports: {
			visTypes: ['plugins/kbn_leaflet/kbn_leaflet']
		},

		init(server, options) {
	      api(server);
	    }
	});
};