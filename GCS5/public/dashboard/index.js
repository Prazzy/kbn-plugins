import _ from 'lodash';
import $ from 'jquery';
import angular from 'angular';
import chrome from 'ui/chrome';
import 'ui/courier';
import 'ui/config';
import 'ui/notify';
import 'ui/typeahead';
import 'ui/share';
import 'plugins/kibana/dashboard/directives/grid';
import 'plugins/kibana/dashboard/directives/dashboard_panel';
import 'plugins/kibana/dashboard/services/saved_dashboards';
import 'plugins/GCS5/dashboard/styles/main.less';
import FilterBarQueryFilterProvider from 'ui/filter_bar/query_filter';
import DocTitleProvider from 'ui/doc_title';
import stateMonitorFactory  from 'ui/state_management/state_monitor_factory';
import uiRoutes from 'ui/routes';
import uiModules from 'ui/modules';
import indexTemplate from 'plugins/GCS5/dashboard/index.html';
import shareTemplate from 'plugins/GCS5/dashboard/templates/custom_share.html';

require('ui/saved_objects/saved_object_registry').register(require('plugins/kibana/dashboard/services/saved_dashboard_register'));

const app = uiModules.get('app/dashboard', [
  'elasticsearch',
  'ngRoute',
  'kibana/courier',
  'kibana/config',
  'kibana/notify',
  'kibana/typeahead'
]);

uiRoutes
.defaults(/dashboard/, {
  requireDefaultIndex: true
})
.when('/dashboard', {
  template: indexTemplate,
  resolve: {
    dash: function (savedDashboards, config) {
      return savedDashboards.get();
    }
  }
})
.when('/dashboard/:id', {
  template: indexTemplate,
  resolve: {
    dash: function (savedDashboards, Notifier, $route, $location, courier) {
      return savedDashboards.get($route.current.params.id)
      .catch(courier.redirectWhenMissing({
        'dashboard' : '/dashboard'
      }));
    }
  }
});

uiModules.get('kibana').config(function ($provide) {
  $provide.decorator('shareDirective', function($delegate, $controller, $timeout) {
    let directive = $delegate[0];
    directive.template = shareTemplate;
    let link = directive.link;
    directive.compile = function() {
      return function (scope, element, attrs) {
        $timeout(function() {
          scope.share.toggleShortSnapshotUrl();
        }, 0);
      };
    };
    return $delegate;
  });
});

app.directive('dashboardApp', function (Notifier, courier, AppState, timefilter, kbnUrl) {
  return {
    restrict: 'E',
    controllerAs: 'dashboardApp',
    controller: function ($scope, $rootScope, $route, $routeParams, $location, Private, getAppState, savedDashboards) {

      const queryFilter = Private(FilterBarQueryFilterProvider);

      const notify = new Notifier({
        location: 'Dashboard'
      });

      const dash = $scope.dash = $route.current.locals.dash;

      // PAC Feature: code for filter and search bar lock
      function sticky_relocate() {
        let window_top = $(window).scrollTop();
        let div_top = $('#sticky-anchor').offset().top;
        if (window_top > div_top) {
          $('#sticky').addClass('stick');
          $('#sticky-anchor').height($('#sticky').outerHeight());
        } else {
          $('#sticky').removeClass('stick');
          $('#sticky-anchor').height(0);
        }
      }

      $(function () {
        $(window).scroll(sticky_relocate);
        sticky_relocate();
      });
      // PAC Feature: code for filter and search bar lock    


      // PAC Feature: custom menu tabs showing dashboards 
      $scope.isActiveTab = function (tab) {
        return dash.title === tab.title;
      }
      $scope.tabs = [];

      function getDashList(params) {
        var filters = queryFilter.getGlobalFilters();
        var filter_operator = '';
        var filter_menu_group = '';
        if (!_.isUndefined(filters) && filters.length) {
            if (filters[0].meta.key == 'acl_filter_code' || filters[0].meta.key == 'query') {
                filter_operator = filters[0].meta.value;
                filter_menu_group = filters[1].meta.value;
            } else {
                filter_menu_group = filters[0].meta.value;
            }
        }

        var appTitle = $scope.chrome.getAppTitle();
        var appTitle_lst = appTitle.split('_');
        var app = appTitle_lst[0];
        var multiple_operators = 0;
        if (filter_operator && filter_operator != 'ALL') {
            filter_operator = filter_operator.split(" ");
            if (filter_operator instanceof Array && filter_operator.length > 1) {
                multiple_operators = 1;
            } else {
                filter_operator = filter_operator[0];
            } 
        }

        var es_res = params.hits;
        es_res = _.filter(es_res, function (hit) {
            var options = JSON.parse(hit.optionsJSON);
            var tab_order = parseInt(options.order);
            var menu_group = !_.isUndefined(options.menu_group_name) ? options.menu_group_name : 'UNK';
            var isPublished = 0;
            if (options.isPublished) isPublished = 1;
            // External dashboards
            if (filters.length > 1 && isPublished) {
                // Multiple operators
                if (multiple_operators && filter_operator.length > 1) {
                    var not_exists = 0;
                    _.forEach(filter_operator, function (op) {
                        if (!_.contains(options.operator.split(","), op)) {
                            not_exists = 1;
                            return
                        }
                    });
                    if (!not_exists) {
                        return options.app == app && tab_order && filter_menu_group == menu_group;
                    }
                    else {
                        return false;
                    }
                } else {
                    // Single operator
                    if (filter_operator == 'ALL') return options.app == app && tab_order && filter_menu_group == menu_group;
                    else return _.contains(options.operator.split(","), filter_operator) && options.app == app && tab_order && filter_menu_group == menu_group;
                }
            }
            else {
                // Internal dashboards
                return options.app == app && tab_order && filter_menu_group == menu_group;
            }
        });

        es_res = _.sortBy(es_res, function (item) {
            return parseInt(JSON.parse(item.optionsJSON).order)
        });

        return es_res;
      }
      // PAC Feature: custom menu tabs showing dashboards

      if (dash.timeRestore && dash.timeTo && dash.timeFrom && !getAppState.previouslyStored()) {
        timefilter.time.to = dash.timeTo;
        timefilter.time.from = dash.timeFrom;
        if (dash.refreshInterval) {
          timefilter.refreshInterval = dash.refreshInterval;
        }
      }

      const matchQueryFilter = function (filter) {
        return filter.query && filter.query.query_string && !filter.meta;
      };

      const extractQueryFromFilters = function (filters) {
        const filter = _.find(filters, matchQueryFilter);
        if (filter) return filter.query;
      };

      const stateDefaults = {
        title: dash.title,
        panels: dash.panelsJSON ? JSON.parse(dash.panelsJSON) : [],
        options: dash.optionsJSON ? JSON.parse(dash.optionsJSON) : {},
        uiState: dash.uiStateJSON ? JSON.parse(dash.uiStateJSON) : {},
        query: extractQueryFromFilters(dash.searchSource.getOwn('filter')) || {query_string: {query: '*'}},
        filters: _.reject(dash.searchSource.getOwn('filter'), matchQueryFilter),
      };

      let stateMonitor;
      const $state = $scope.state = new AppState(stateDefaults);
      const $uiState = $scope.uiState = $state.makeStateful('uiState');
      const $appStatus = $scope.appStatus = this.appStatus = {};

      $scope.$watchCollection('state.options', function (newVal, oldVal) {
        if (!angular.equals(newVal, oldVal)) $state.save();
      });

      $scope.$watch('state.options.darkTheme', setDarkTheme);

      $scope.topNavMenu = [{
        key: 'open',
        description: 'Open Saved Dashboard',
        template: require('plugins/kibana/dashboard/partials/load_dashboard.html'),
        testId: 'dashboardOpenButton',
      }, {
        key: 'share',
        description: 'Share Dashboard',
        template: require('plugins/kibana/dashboard/partials/share.html'),
        testId: 'dashboardShareButton',
      }];
      $scope.refresh = _.bindKey(courier, 'fetch');

      timefilter.enabled = true;
      $scope.timefilter = timefilter;
      $scope.$listen(timefilter, 'fetch', $scope.refresh);

      courier.setRootSearchSource(dash.searchSource);

      function init() {
        updateQueryOnRootSource();

        const docTitle = Private(DocTitleProvider);
        if (dash.id) {
          docTitle.change(dash.title);
        }

        initPanelIndices();

        // watch for state changes and update the appStatus.dirty value
        stateMonitor = stateMonitorFactory.create($state, stateDefaults);
        stateMonitor.onChange((status) => {
          $appStatus.dirty = status.dirty;
        });

        $scope.$on('$destroy', () => {
          stateMonitor.destroy();
          dash.destroy();

          // Remove dark theme to keep it from affecting the appearance of other apps.
          setDarkTheme(false);
        });

        $scope.$emit('application.load');
      }

      function initPanelIndices() {
        // find the largest panelIndex in all the panels
        let maxIndex = getMaxPanelIndex();

        // ensure that all panels have a panelIndex
        $scope.state.panels.forEach(function (panel) {
          if (!panel.panelIndex) {
            panel.panelIndex = maxIndex++;
          }
        });
      }

      function getMaxPanelIndex() {
        let index = $scope.state.panels.reduce(function (idx, panel) {
          // if panel is missing an index, add one and increment the index
          return Math.max(idx, panel.panelIndex || idx);
        }, 0);
        return ++index;
      }

      function updateQueryOnRootSource() {
        const filters = queryFilter.getFilters();
        if ($state.query) {
          dash.searchSource.set('filter', _.union(filters, [{
            query: $state.query
          }]));
        } else {
          dash.searchSource.set('filter', filters);
        }

        // PAC Feature: custom menu tabs showing dashboards 
        savedDashboards.find().then(function (params) {
            //var es_res = getDashList(params);
            let subUrl = _.find($scope.chrome.getNavLinks(), {'id':'GCS5:dashboard'}).lastSubUrl;
            $scope.chrome.setLastUrlFor(dash.title, subUrl);
            let esRes = [{
                id: 'Dashboard1',
                title: 'Dashboard1',
                order: 1,
                url: `#/dashboard/dfd0b180-e9b4-11e6-af9c-133269a38460`
              },
              {
                id: 'GCS5:dashboard2',
                title: 'Dashboard2',
                order: 2,
                url: `#/dashboard/Dashboard2`
              },
              {
                id: 'Dashboard3',
                title: 'Dashboard3',
                order: 3,
                url: `#/dashboard/e9b0c500-e9b4-11e6-af9c-133269a38460`
              }
            ]
            _.map(esRes, function (res) {
              if (res.title === dash.title) res.url = subUrl;
              else {
                let prevUrl = $scope.chrome.getLastUrlFor(res.title);
                if (prevUrl) res.url = prevUrl;
              }
            });  
            $scope.tabs = esRes;

            // var dashboard_array = [];
            // es_res.forEach(function (row) {
            //     dashboard_array.push({id: "dashboard/".concat(row.id), title: row.title})
            // });

            // $scope.tabs = dashboard_array;
        });
        // PAC Feature: custom menu tabs showing dashboards 
      }

      function setDarkTheme(enabled) {
        const theme = Boolean(enabled) ? 'theme-dark' : 'theme-light';
        chrome.removeApplicationClass(['theme-dark', 'theme-light']);
        chrome.addApplicationClass(theme);
      }

      // update root source when filters update
      $scope.$listen(queryFilter, 'update', function () {
        updateQueryOnRootSource();
        $state.save();
      });

      // update data when filters fire fetch event
      $scope.$listen(queryFilter, 'fetch', $scope.refresh);

      $scope.newDashboard = function () {
        kbnUrl.change('/dashboard', {});
      };

      $scope.filterResults = function () {
        updateQueryOnRootSource();
        $state.save();
        $scope.refresh();
      };

      $scope.save = function () {
        $state.title = dash.id = dash.title;
        $state.save();

        const timeRestoreObj = _.pick(timefilter.refreshInterval, ['display', 'pause', 'section', 'value']);
        dash.panelsJSON = angular.toJson($state.panels);
        dash.uiStateJSON = angular.toJson($uiState.getChanges());
        dash.timeFrom = dash.timeRestore ? timefilter.time.from : undefined;
        dash.timeTo = dash.timeRestore ? timefilter.time.to : undefined;
        dash.refreshInterval = dash.timeRestore ? timeRestoreObj : undefined;
        dash.optionsJSON = angular.toJson($state.options);

        dash.save()
        .then(function (id) {
          stateMonitor.setInitialState($state.toJSON());
          $scope.kbnTopNav.close('save');
          if (id) {
            notify.info('Saved Dashboard as "' + dash.title + '"');
            if (dash.id !== $routeParams.id) {
              kbnUrl.change('/dashboard/{{id}}', {id: dash.id});
            }
          }
        })
        .catch(notify.fatal);
      };

      let pendingVis = _.size($state.panels);
      $scope.$on('ready:vis', function () {
        if (pendingVis) pendingVis--;
        if (pendingVis === 0) {
          $state.save();
          $scope.refresh();
        }
      });

      // listen for notifications from the grid component that changes have
      // been made, rather than watching the panels deeply
      $scope.$on('change:vis', function () {
        $state.save();
      });

      // called by the saved-object-finder when a user clicks a vis
      $scope.addVis = function (hit) {
        pendingVis++;
        $state.panels.push({ id: hit.id, type: 'visualization', panelIndex: getMaxPanelIndex() });
      };

      $scope.addSearch = function (hit) {
        pendingVis++;
        $state.panels.push({ id: hit.id, type: 'search', panelIndex: getMaxPanelIndex() });
      };

      // Setup configurable values for config directive, after objects are initialized
      $scope.opts = {
        dashboard: dash,
        ui: $state.options,
        save: $scope.save,
        addVis: $scope.addVis,
        addSearch: $scope.addSearch,
        timefilter: $scope.timefilter
      };

      init();
    }
  };
});
