import Promise from 'bluebird';

module.exports = function (kibana) {
  const kbnBaseUrl = '/app/GCS5';
  return new kibana.Plugin({
    require: ['elasticsearch', 'kibana'],
    id: 'GCS5',
    config: function (Joi) {
      return Joi.object({
        enabled: Joi.boolean().default(true),
        defaultAppId: Joi.string().default('dashboard'),
        index: Joi.string().default('.kibana')
      }).default();
    },

    uiExports: {
      app: {
        id: 'GCS5',
        title: 'GCS5',
        listed: false,
        description: 'Custom GCS5 kibana app',
        main: 'plugins/GCS5/app',
        uses: [
          'visTypes',
          'spyModes',
          'fieldFormats',
          'navbarExtensions',
          'managementSections',
          'devTools',
          'docViews'
        ],

        injectVars: function (server, options) {
          const serverConfig = server.config();
          
          //DEPRECATED SETTINGS
          //if the url is set, the old settings must be used.
          //keeping this logic for backward compatibilty.
          const configuredUrl = server.config().get('tilemap.url');
          const isOverridden = typeof configuredUrl === 'string' && configuredUrl !== '';
          const tilemapConfig = serverConfig.get('tilemap');
          return {
            kbnDefaultAppId: serverConfig.get('GCS5.defaultAppId'),
            tilemapsConfig: {
              deprecated: {
                isOverridden: isOverridden,
                config: tilemapConfig,
              },
              manifestServiceUrl: serverConfig.get('tilemap.manifestServiceUrl')
            },
          };
        },
      },

      links: [
        {
          id: 'GCS5:dashboard',
          title: 'GCS5',
          order: -1001,
          url: `${kbnBaseUrl}#/dashboard`,
          description: 'compose visualizations for much win', // TODO: change the description
          icon: 'plugins/GCS5/assets/plane.svg', // TODO: change icon
        }
      ],
      injectDefaultVars(server, options) {
        return {
          kbnIndex: options.index,
          kbnBaseUrl
        };
      }
    }
  });

};
