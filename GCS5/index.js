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
          let config = server.config();
          return {
            kbnDefaultAppId: config.get('GCS5.defaultAppId'),
            tilemap: config.get('tilemap')
          };
        },
      },

      links: [
        {
          id: 'GCS5:dashboard',
          title: 'Dashboard',
          order: -1001,
          url: `${kbnBaseUrl}#/dashboard`,
          description: 'compose visualizations for much win', // TODO: change the description
          icon: 'plugins/GCS5/assets/wrench.svg', // TODO: change icon
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
