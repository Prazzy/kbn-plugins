module.exports = function (kibana) {
  return new kibana.Plugin({

    config: function (Joi) {
      return Joi.object({
        enabled: Joi.boolean().default(true),
        defaultAppId: Joi.string().default('dashboard'),
        index: Joi.string().default('.kibana')
      }).default();
    },

    uiExports: {
      app: {
        title: 'GCS4',
        description: 'the GCS4 you know and love',
        //icon: 'plugins/kibana/settings/sections/about/barcode.svg',
        main: 'plugins/GCS4/GCS4',
        uses: [
          'visTypes',
          'spyModes'
        ],

        autoload: kibana.autoload.require.concat(
          'plugins/kibana/discover',
          'plugins/kibana/visualize',
          'plugins/GCS4/dashboard',
          'plugins/kibana/settings',
          'plugins/kibana/settings/sections',
          'plugins/kibana/doc',
          'plugins/kibana/settings/sections',
          'ui/vislib',
          'ui/agg_response',
          'ui/agg_types',
          'leaflet'
        ),

        injectVars: function (server, options) {
          let config = server.config();

          return {
            kbnDefaultAppId: config.get('GCS4.defaultAppId'),
            tilemap: config.get('tilemap')
          };
        }
      }
    }
  });

};
