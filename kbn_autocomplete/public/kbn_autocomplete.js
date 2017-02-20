define(function (require) {
  require('plugins/kbn_autocomplete/kbn_autocomplete.less');
  require('plugins/kbn_autocomplete/kbn_autocomplete_controller');
  require('ui/registry/vis_types').register(AutocompleteVisProvider);

  function AutocompleteVisProvider(Private) {
    const TemplateVisType = Private(require('ui/template_vis_type/TemplateVisType'));
    const Schemas = Private(require('ui/Vis/Schemas'));

    return new TemplateVisType({
      name: 'autocomplete',
      title: 'Autocomplete',
      description: 'Autocomplete Input',
      icon: 'fa-keyboard-o',
      template: require('plugins/kbn_autocomplete/kbn_autocomplete.html'),
      params: {
        defaults: {
          },
        editor: require('plugins/kbn_autocomplete/kbn_autocomplete_params.html')
      },
      requiresSearch: false
    });
  }

  // export the provider so that the visType can be required with Private()
  return AutocompleteVisProvider;
});
