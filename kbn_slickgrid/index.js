//module.exports = function(kibana) {
//	return new kibana.Plugin({
//		uiExports: {
//			visTypes: ['plugins/kbn_slickgrid/kbn_slickgrid']
//		}
//	});
//};

import api from './server/routes';

export default function (kibana) {
  return new kibana.Plugin({
    require: ['kibana', 'elasticsearch'],

    uiExports: {
      visTypes: ['plugins/kbn_slickgrid/kbn_slickgrid']
    },

    // The init method will be executed when the Kibana server starts and loads
    // this plugin. It is used to set up everything that you need.
    init(server, options) {
      // Just call the api module that we imported above (the server/routes.js file)
      // and pass the server to it, so it can register several API interfaces at the server.
      api(server);
    }

  });
};