sap.ui.define([
  'sap/ui/model/Filter',
  'sap/ui/model/FilterOperator',
  'tc/model/formatter',
  'tc/controller/Base.controller'
], (Filter, {Contains}, formatter, BaseController) => {
  return BaseController.extend('tc.controller.Icons', {
    formatter,

    onInit() {
      this.getRouter().getRoute('icons').attachMatched(this.onRouteMatched, this);
    },

    onRouteMatched(event) {
      const args = event.getParameter('arguments');
      const query = args['?query'] || {};
      const library = args.library;
      const view = this.getView();
      const libraries = Object.keys(view.getModel('icons').getData());

      if (libraries.includes(library)) {
        this.library = library;
        const iconsPage = view.byId('iconsPage');

        libraries.forEach(lib => iconsPage.removeStyleClass(`tcIcons--${lib}`));
        iconsPage.addStyleClass(`tcIcons--${library}`);

        const search = query.search || '';
        const group = query.group || null;
        const iconsModel = view.getModel('icons');

        iconsModel.setProperty(`/${this.library}/SelectedGroup`, group);
        iconsModel.setProperty(`/${this.library}/Search`, search);

        view.bindElement({
          path: `/${library}`,
          model: 'icons'
        });

        view.byId('icons').getBinding('items').filter([
          new Filter({path: 'Groups', test: gs => !group || gs.some(({Group}) => Group === group)}),
          new Filter({
            filters: [
              new Filter({path: 'Name', operator: Contains, value1: search}),
              new Filter({path: 'Glyph', operator: Contains, value1: search}),
              new Filter({path: 'Groups', test: gs => gs.some(({Group}) => Group.includes(search))}),
              new Filter({path: 'Tags', test: ts => ts.some(({Tag}) => Tag.includes(search))})
            ],
            and: false
          })
        ]);
      } else {
        this.getRouter().navTo('overview');
      }
    },

    pushState({search = null, group = null} = {}) {
      this.getRouter().navTo('icons', {
        library: this.library,
        '?query': {
          search: search || this.getView().getModel('icons').getProperty(`/${this.library}/Search`) || '',
          group: group || this.getView().getModel('icons').getProperty(`/${this.library}/SelectedGroup`) || ''
        }
      });
    },

    onSearch(event) {
      this.pushState({search: event.getParameter('query')});
    },

    onGroupChange(event) {
      this.pushState({group: event.getParameter('selectedItem').getText()});
    }
  });
});
