require('plugins/GCS4/dashboard/index');
require('ui/timepicker');

require('plugins/kibana/dashboard/services/saved_dashboards');

const moment = require('moment-timezone');

const chrome = require('ui/chrome');
const routes = require('ui/routes');
const modules = require('ui/modules');

const kibanaLogoUrl = require('ui/images/kibana.svg');

routes.enable();

routes
.otherwise({
  redirectTo: `/${chrome.getInjected('kbnDefaultAppId', 'discover')}`
});

chrome
//.setBrand({
//  'logo': 'url(' + kibanaLogoUrl + ') left no-repeat',
//  'smallLogo': 'url(' + kibanaLogoUrl + ') left no-repeat'
//})
.setNavBackground('#08519C')
.setTabDefaults({
  resetWhenActive: true,
  lastUrlStore: window.sessionStore,
  activeIndicatorColor: '#656a76'
})
.setRootController('GCS4', function ($scope, $rootScope, courier, config) {

  function setDefaultTimezone() {
    moment.tz.setDefault("UTC");
  }


  // Hide app switcher icon
  $scope.chrome.setShowAppsLink(false);

  // wait for the application to finish loading
  $scope.$on('application.load', function () {
    courier.start();
  });

  $scope.$on('init:config', setDefaultTimezone);
  $scope.$on('change:config.dateFormat:tz', setDefaultTimezone);
});
