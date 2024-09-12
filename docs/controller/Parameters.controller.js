/** @typedef {null|string|string[]} Category */

sap.ui.define([
  'sap/ui/model/Filter',
  'sap/ui/model/FilterOperator',
  'sap/m/GroupHeaderListItem',
  'tc/controller/Base.controller',
  'tc/util/uniq'
], (Filter, {Contains}, GroupHeaderListItem, BaseController, uniq) => {
  /**
   * @param {Category} c 
   * @return {string}
   */
  function categoryToString(c) {
    return typeof c === 'string' ? c
      : Array.isArray(c) ? c.join(' > ')
      : 'Internal';
  }
  
  return BaseController.extend('tc.controller.Parameters', {
    /** @type {Object<string, Filter>} */
    filters: {},

    /**
     * @param {Category} a 
     * @param {Category} b 
     * @return {number}
     */
    compareCategory(a, b) {
      const cA = categoryToString(a).toLowerCase();
      const cB = categoryToString(b).toLowerCase();

      return cA === 'main' ? (cB === 'main' ? 0 : -1)
        : cB === 'main' ? (cA === 'main' ? 0 : 1)
        : cA === 'internal' ? (cB === 'internal' ? 0 : 1)
        : cB === 'internal' ? (cA === 'internal' ? 0 : -1)
        : cA.localeCompare(cB);
    },

    selectedCategories() {
      if (!this._selectedCategories) {
        this._selectedCategories = uniq(this.getView().getModel('parameters').getProperty('/SelectedCategories').map(_ => _.toLowerCase()));
      }

      return this._selectedCategories;
    },

    filterCategory(category) {
      const cat = categoryToString(category).toLowerCase();
      const cats = this.selectedCategories();

      return cats.length > 0 && cats.some(_ => cat.startsWith(_));
    },

    selectedTypes() {
      if (!this._selectedTypes) {
        this._selectedTypes = this.getView().getModel('parameters').getProperty('/SelectedTypes').map(_ => _.toLowerCase());
      }

      return this._selectedTypes;
    },

    filterType(t) {
      const types = this.selectedTypes();
      
      return types.length > 0 && types.includes(t.toLowerCase());
    },
    
    /**
     * @param {string} a 
     * @param {string} b 
     * @return {number}
     */
    compareParameter(a, b) {
      if (a.replace(/\d.*/g, '') === b.replace(/\d.*/g, '')) {
        const diff = parseInt(a.replace(/[^\d]/g, '')) - parseInt(b.replace(/[^\d]/g, ''));

        if (diff !== 0) {
          return diff;
        }
      }
      
      return a.localeCompare(b);
    },
    
    getGroup(context) {
      return categoryToString(context.getProperty('Category'));
    },

    getGroupHeader(group) {
      return new GroupHeaderListItem({
        title: group.key,
        count: `{categories>/Categories/${group.key}}`
      });
    },

    pushState({search = null, types = null, categories = null} = {}) {
      this.getRouter().navTo('parameters', {
        '?query': {
          search: search || this.getView().getModel('parameters').getProperty('/Search'),
          types: uniq(types || this.getView().getModel('parameters').getProperty('/SelectedTypes')).join(','),
          categories: uniq(categories || this.getView().getModel('parameters').getProperty('/SelectedCategories')).join(',')
        }
      });
    },

    onInit() {
      this.getRouter().getRoute('parameters').attachMatched(this.onRouteMatched, this);
    },

    onSearch(event) {
      this.pushState({search: event.getParameter('query')});
    },

    onCategoriesSelectionChange(event) {
      const {selectAll, selected, changedItem} = event.getParameters();

      delete this._selectedCategories;
      this.pushState({categories: selectAll
        ? (selected
          ? this.getView().getModel('parameters').getProperty('/Categories').map(({Category}) => Category)
          : [])
        : (selected
          ? uniq(this.getView().getModel('parameters').getProperty('/SelectedCategories').concat([changedItem.getKey()]))
          : this.getView().getModel('parameters').getProperty('/SelectedCategories').filter(_ => _ !== changedItem.getKey()))});
    },

    onCategoriesSelectionFinish(event) {
      delete this._selectedCategories;
      this.pushState({categories: event.getParameters().selectedItems.map(_ => _.getKey())});
    },

    onTypesSelectionChange(event) {
      const {selectAll, selected, changedItem} = event.getParameters();

      delete this._selectedTypes;
      this.pushState({types: selectAll
        ? (selected
          ? this.getView().getModel('parameters').getProperty('/Types').map(({Type}) => Type)
          : [])
        : (selected
          ? uniq(this.getView().getModel('parameters').getProperty('/SelectedTypes').concat([changedItem.getKey()]))
          : this.getView().getModel('parameters').getProperty('/SelectedTypes').filter(_ => _ !== changedItem.getKey()))});
    },

    onTypesSelectionFinish(event) {
      delete this._selectedTypes;
      this.pushState({types: event.getParameters().selectedItems.map(_ => _.getKey())});
    },

    onRouteMatched(event) {
      const query = event.getParameter('arguments')['?query'];
      const parametersModel = this.getView().getModel('parameters');

      if (
        query &&
        typeof query.types === 'string' &&
        typeof query.categories === 'string' &&
        typeof query.search === 'string'
      ) {
        const search = query.search;

        delete this._selectedTypes;
        parametersModel.setProperty('/SelectedTypes', uniq(query.types.split(',').filter(Boolean).map(_ => _.trim())));
        delete this._selectedCategories;
        parametersModel.setProperty('/SelectedCategories', uniq(query.categories.split(',').filter(Boolean).map(_ => _.trim())));
        parametersModel.setProperty('/Search', search);
        
        this.getView().byId('parameters').getBinding('items').filter([
          new Filter({path: 'Type', test: c => this.filterType(c)}),
          new Filter({path: 'Category', test: c => this.filterCategory(c)}),
          new Filter({
            filters: [
              new Filter({path: 'Parameter', operator: Contains, value1: search}),
              new Filter({path: 'Label', operator: Contains, value1: search}),
              new Filter({path: 'Description', operator: Contains, value1: search})
            ],
            and: false
          })
        ]);
      } else {
        this.pushState({
          search: query?.search
            ? query.search
            : '',
          types: query?.types
            ? uniq(query.types.split(',').filter(Boolean).map(_ => _.trim()))
            : this.getView().getModel('parameters').getProperty('/Types').map(({Type}) => Type),
          categories: query?.categories
            ? uniq(query.categories.split(',').filter(Boolean).map(_ => _.trim()))
            : this.getView().getModel('parameters').getProperty('/Categories').map(({Category}) => Category)
        });
      }
    }
  });
});
