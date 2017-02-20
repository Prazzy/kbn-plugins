import api from './server/routes';

module.exports = function (kibana) {
  return new kibana.Plugin({
  	require: ['elasticsearch'],

    uiExports: {
      visTypes: [
        'plugins/kbn_autocomplete/kbn_autocomplete'
      ]
    },

    init(server, options) {
      api(server);
    }
});
};
