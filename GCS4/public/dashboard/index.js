define(function (require) {
    const _ = require('lodash');
    const $ = require('jquery');
    const angular = require('angular');
    const ConfigTemplate = require('ui/ConfigTemplate');
    const chrome = require('ui/chrome');

    require('ui/directives/config');
    require('ui/courier');
    require('ui/config');
    require('ui/notify');
    require('ui/typeahead');
    require('ui/share');

    require('plugins/kibana/dashboard/directives/grid');
    require('plugins/kibana/dashboard/components/panel/panel');
    require('plugins/kibana/dashboard/services/saved_dashboards');
    require('plugins/kibana/dashboard/styles/main.less');
    require('plugins/GCS4/dashboard/styles/main.less');

    require('ui/saved_objects/saved_object_registry').register(require('plugins/kibana/dashboard/services/saved_dashboard_register'));


    const app = require('ui/modules').get('app/dashboard', [
        'elasticsearch',
        'ngRoute',
        'kibana/courier',
        'kibana/config',
        'kibana/notify',
        'kibana/typeahead'
    ]);


    require('ui/routes')
        .when('/dashboard', {
            template: require('plugins/GCS4/dashboard/index.html'),
            resolve: {
                dash: function (savedDashboards, config) {
                    return savedDashboards.get();
                }
            }
        })
        .when('/dashboard/:id', {
            template: require('plugins/GCS4/dashboard/index.html'),
            resolve: {
                dash: function (savedDashboards, Notifier, $route, $location, courier) {
                    return savedDashboards.get($route.current.params.id)
                        .catch(courier.redirectWhenMissing({
                            'dashboard': '/dashboard'
                        }));
                }
            }
        });

    app.directive('dashboardApp', function (Notifier, courier, AppState, timefilter, kbnUrl) {
        return {
            controller: function ($scope, $rootScope, $route, $routeParams, $location, Private, getAppState, savedDashboards, es, kbnIndex, $sce) {

                var services = Private(require('ui/saved_objects/saved_object_registry')).byLoaderPropertiesName;
                var service = services['visualizations'];

                // lapuza - code for filter and search bar lock
                function sticky_relocate() {
                    var window_top = $(window).scrollTop();
                    var div_top = $('#sticky-anchor').offset().top;
                    if (window_top > div_top) {
                        $('#tabs-sticky').addClass('top-stick');
                        $('#sticky').addClass('stick');
                        $('#sticky-anchor').height($('#tabs-sticky').outerHeight());
                    } else {
                        $('#tabs-sticky').removeClass('top-stick');
                        $('#sticky').removeClass('stick');
                        $('#sticky-anchor').height(0);
                    }
                }

                $(function () {
                    $(window).scroll(sticky_relocate);
                    sticky_relocate();
                });
                // lapuza - code for filter and search bar lock

                const queryFilter = Private(require('ui/filter_bar/query_filter'));

                const notify = new Notifier({
                    location: 'Dashboard'
                });


                const dash = $scope.dash = $route.current.locals.dash;
                if (_.isUndefined(dash.id)) {
                    savedDashboards.find().then(function (params) {
                        var es_res = getDashList(params);
                        kbnUrl.change('/dashboard/'.concat(es_res[0].id));
                        //return savedDashboards.get(es_res[0].id);
                    });
                }

                // dash.dash_helptext = '';
                // service.find($scope.dash.title + " Notes").then(function (hits) {
                //     if (hits.total) dash.dash_helptext = $sce.trustAsHtml(JSON.parse(hits.hits[0].visState).params.html);
                // });

                // dash.general_helptext = '';

                if (dash.timeRestore && dash.timeTo && dash.timeFrom && !getAppState.previouslyStored()) {
                    timefilter.time.to = dash.timeTo;
                    timefilter.time.from = dash.timeFrom;
                    if (dash.refreshInterval) {
                        timefilter.refreshInterval = dash.refreshInterval;
                    }
                }

                $scope.resetDashboard = function () {
                    kbnUrl.change('/dashboard/'.concat(dash.id));
                };

                $scope.$on('$destroy', dash.destroy);

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

                const $state = $scope.state = new AppState(stateDefaults);
                const $uiState = $scope.uiState = $state.makeStateful('uiState');

                $scope.$watchCollection('state.options', function (newVal, oldVal) {
                    if (!angular.equals(newVal, oldVal)) $state.save();
                });
                $scope.$watch('state.options.darkTheme', setDarkTheme);

                $scope.configTemplate = new ConfigTemplate({
                    save: require('plugins/kibana/dashboard/partials/save_dashboard.html'),
                    load: require('plugins/kibana/dashboard/partials/load_dashboard.html'),
                    share: require('plugins/kibana/dashboard/partials/share.html'),
                    pickVis: require('plugins/kibana/dashboard/partials/pick_visualization.html'),
                    options: require('plugins/kibana/dashboard/partials/options.html'),
                    //help: require('./help.html')
                });

                $scope.refresh = _.bindKey(courier, 'fetch');

                timefilter.enabled = true;
                $scope.timefilter = timefilter;
                $scope.$listen(timefilter, 'fetch', $scope.refresh);

                courier.setRootSearchSource(dash.searchSource);

                function init() {
                    updateQueryOnRootSource();

                    const docTitle = Private(require('ui/doc_title'));
                    if (dash.id) {
                        docTitle.change(dash.title);
                    }

                    initPanelIndices();

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

                        // External dashboards
                        if (filters.length > 1) {
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

                function updateQueryOnRootSource() {
                    const filters = queryFilter.getFilters();
                    if ($state.query) {
                        dash.searchSource.set('filter', _.union(filters, [{
                            query: $state.query
                        }]));
                    } else {
                        dash.searchSource.set('filter', filters);
                    }

                    savedDashboards.find().then(function (params) {
                        var es_res = getDashList(params);

                        var dashboard_array = [];
                        es_res.forEach(function (row) {
                            dashboard_array.push({id: "dashboard/".concat(row.id), title: row.title})
                        });

                        chrome.setTabs(dashboard_array);
                    });

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
                            $scope.configTemplate.close('save');
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
                    $state.panels.push({id: hit.id, type: 'visualization', panelIndex: getMaxPanelIndex()});
                };

                $scope.addSearch = function (hit) {
                    pendingVis++;
                    $state.panels.push({id: hit.id, type: 'search', panelIndex: getMaxPanelIndex()});
                };


                // Setup configurable values for config directive, after objects are initialized
                $scope.opts = {
                    dashboard: dash,
                    ui: $state.options,
                    save: $scope.save,
                    addVis: $scope.addVis,
                    addSearch: $scope.addSearch
                };

                init();
            }
        };
    });
});
