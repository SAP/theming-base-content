sap.ui.define([
  'sap/m/GroupHeaderListItem',
  'tc/controller/Parameters.controller'
], (GroupHeaderListItem, ParametersController) => {
  QUnit.module('Parameters.controller');

  QUnit.test('compareCategory() (UITD2-2840, UITD2-3069)', assert => {
    const parametersController = new ParametersController();

    for (const [a, b, expected] of [
      ['Main', 'Button', -1],
      ['Main', 'main', 0],
      ['aaa', 'main', 1],
      ['internal', 'zzz', 1],
      ['internal', 'Internal', 0],
      ['zzz', 'Internal', -1],
      ['Button > Standard', 'Button > Warning', -1],
    ]) {
      assert.equal(parametersController.compareCategory(a, b), expected, `compareCategory("${a}", "${b}"): ${expected}`);
    }
  });

  QUnit.test('selectedCategories() (UITD2-2840, UITD2-3069)', assert => {
    const parametersController = new ParametersController();

    let calls = 0;
    parametersController.getView = () => ({
      getModel: () => ({
        getProperty: _ => {
          calls++;
          return _ === '/SelectedCategories' ? ['Main', 'Button', 'Internal'] : [];
        }
      })
    });
      
    assert.deepEqual(parametersController.selectedCategories(), ['main', 'button', 'internal'], 'should return /SelectedCategories of the model');
    assert.equal(calls, 1, 'should call getProperty() the first time');

    parametersController.selectedCategories();
    assert.equal(calls, 1, 'should cache the getProperty() result');
  });

  QUnit.test('filterType() (UITD2-2840, UITD2-3069)', assert => {
    const parametersController = new ParametersController();

    parametersController.selectedTypes = () => ['button'];

    assert.ok(parametersController.filterType('Button'), 'should return true if type is in selectedTypes()');
    assert.ok(!parametersController.filterType('Standard'), 'should return false if type is not in selectedTypes()');
  });

  QUnit.test('compareParameter() (UITD2-2840, UITD2-3069)', assert => {
    const parametersController = new ParametersController();

    assert.equal(parametersController.compareParameter('sapButton_Background', 'sapField_Background'), -1, 'should compare parameters by string');
    assert.equal(parametersController.compareParameter('sapLegendColor10', 'sapLegendColor9'), 1, 'should compare parameters of same namespace by number');
    assert.equal(parametersController.compareParameter('sapAvatar_1_Background', 'sapAvatar_1_BorderColor'), -1, 'should compare parameters of same namespace and number by string');
  });

  QUnit.test('getGroup() (UITD2-2840, UITD2-3069)', assert => {
    const parametersController = new ParametersController();

    assert.equal(parametersController.getGroup({getProperty: _ => _ === 'Category' ? 'Group' : null}), 'Group', 'should return the Category of the context');
  });

  QUnit.test('getGroupHeader() (UITD2-2840, UITD2-3069)', assert => {
    const parametersController = new ParametersController();

    const groupHeader = parametersController.getGroupHeader({key: 'Group'});

    assert.ok(groupHeader instanceof GroupHeaderListItem, 'should return a GroupHeaderListItem');
    assert.equal(groupHeader.getProperty('title'), 'Group', 'should set the title to the group key');
  });

  QUnit.test('pushState() (UITD2-2840, UITD2-3069)', assert => {
    const parametersController = new ParametersController();

    let nav = null;
    parametersController.getRouter = () => ({
      navTo: (target, args) => nav = {target, args}
    });
    const model = {
      '/Search': 'search',
      '/SelectedTypes': ['color', 'fontWeight'],
      '/SelectedCategories': ['Main', 'Button']
    };
    parametersController.getView = () => ({
      getModel: () => ({getProperty: _ => model[_]})
    });

    parametersController.pushState();
    assert.deepEqual(nav, {
      target: 'parameters',
      args: {
        '?query': {
          search: 'search',
          types: 'color,fontWeight',
          categories: 'Main,Button'
        }
      }
    }, 'should default to the model values');

    parametersController.pushState({search: 'newSearch', types: ['color'], categories: ['Main']});
    assert.deepEqual(nav, {
      target: 'parameters',
      args: {
        '?query': {
          search: 'newSearch',
          types: 'color',
          categories: 'Main'
        }
      }
    }, 'should use the passed values');
  });

  QUnit.test('onInit() (UITD2-2840, UITD2-3069)', assert => {
    const parametersController = new ParametersController();

    let matchedHandler = null;
    parametersController.getRouter = () => ({
      getRoute: _ => _ === 'parameters' ? ({
        attachMatched: (fn, ctx) => matchedHandler = {fn, ctx}
      }) : null
    });

    parametersController.onInit();
    assert.equal(matchedHandler.fn, parametersController.onRouteMatched, 'should attach onRouteMatched to the parameters route');
    assert.equal(matchedHandler.ctx, parametersController, 'should attach onRouteMatched with the controller as context');
  });

  QUnit.test('onSearch() (UITD2-2840, UITD2-3069)', assert => {
    const parametersController = new ParametersController();

    let state = null;
    parametersController.pushState = _ => state = _;
    
    parametersController.onSearch({getParameter: () => 'query'});
    assert.deepEqual(state, {search: 'query'}, 'should push the search query');
  });

  QUnit.test('onCategoriesSelectionChange() (UITD2-2840, UITD2-3069)', assert => {
    const parametersController = new ParametersController();

    let state = null;
    parametersController.pushState = _ => state = _;
    const model = {
      '/Categories': [{Category: 'Main'}, {Category: 'Button'}],
      '/SelectedCategories': ['Main']
    };
    parametersController.getView = () => ({
      getModel: () => ({getProperty: _ => model[_]})
    });

    parametersController.onCategoriesSelectionChange({
      getParameters: () => ({selectAll: true, selected: true})
    });
    assert.deepEqual(state, {categories: ['Main', 'Button']}, 'should select all categories');

    parametersController.onCategoriesSelectionChange({
      getParameters: () => ({selectAll: true, selected: false})
    });
    assert.deepEqual(state, {categories: []}, 'should deselect all categories');

    parametersController.onCategoriesSelectionChange({
      getParameters: () => ({selectAll: false, selected: true, changedItem: {getKey: () => 'Button'}})
    });
    assert.deepEqual(state, {categories: ['Main', 'Button']}, 'should select a category');

    model['/SelectedCategories'] = ['Main', 'Button'];
    parametersController.onCategoriesSelectionChange({
      getParameters: () => ({selectAll: false, selected: false, changedItem: {getKey: () => 'Button'}})
    });
    assert.deepEqual(state, {categories: ['Main']}, 'should deselect a category');
  });

  QUnit.test('onCategoriesSelectionFinish() (UITD2-2840, UITD2-3069)', assert => {
    const parametersController = new ParametersController();

    let state = null;
    parametersController.pushState = _ => state = _;

    parametersController.onCategoriesSelectionFinish({
      getParameters: () => ({selectedItems: [{getKey: () => 'Main'}]})
    });
    assert.deepEqual(state, {categories: ['Main']}, 'should push the selected categories');
  });

  QUnit.test('onTypesSelectionChange() (UITD2-2840, UITD2-3069)', assert => {
    const parametersController = new ParametersController();

    let state = null;
    parametersController.pushState = _ => state = _;
    const model = {
      '/Types': [{Type: 'color'}, {Type: 'fontWeight'}],
      '/SelectedTypes': ['color']
    };
    parametersController.getView = () => ({
      getModel: () => ({getProperty: _ => model[_]})
    });

    parametersController.onTypesSelectionChange({
      getParameters: () => ({selectAll: true, selected: true})
    });
    assert.deepEqual(state, {types: ['color', 'fontWeight']}, 'should select all types');

    parametersController.onTypesSelectionChange({
      getParameters: () => ({selectAll: true, selected: false})
    });
    assert.deepEqual(state, {types: []}, 'should deselect all types');

    model['/SelectedTypes'] = [];
    parametersController.onTypesSelectionChange({
      getParameters: () => ({selectAll: false, selected: true, changedItem: {getKey: () => 'fontWeight'}})
    });
    assert.deepEqual(state, {types: ['fontWeight']}, 'should select a type');

    model['/SelectedTypes'] = ['color', 'fontWeight'];
    parametersController.onTypesSelectionChange({
      getParameters: () => ({selectAll: false, selected: false, changedItem: {getKey: () => 'fontWeight'}})
    });
    assert.deepEqual(state, {types: ['color']}, 'should deselect a type');
  });

  QUnit.test('onTypesSelectionFinish() (UITD2-2840, UITD2-3069)', assert => {
    const parametersController = new ParametersController();

    let state = null;
    parametersController.pushState = _ => state = _;

    parametersController.onTypesSelectionFinish({
      getParameters: () => ({selectedItems: [{getKey: () => 'color'}]})
    });
    assert.deepEqual(state, {types: ['color']}, 'should push the selected types');
  });

  QUnit.test('onRouteMatched() (UITD2-2840, UITD2-3069)', assert => {
    const parametersController = new ParametersController();

    let state = null;
    parametersController.pushState = _ => state = _;

    const model = {
      '/Types': [{Type: 'color'}, {Type: 'fontWeight'}],
      '/Categories': [{Category: 'Main'}, {Category: 'Button'}]
    };
    let filter = null;
    parametersController.getView = () => ({
      getModel: _ => _ === 'parameters' ? {
        getProperty: _ => model[_],
        setProperty: (key, value) => model[key] = value
      } : null,
      byId: _ => _ === 'parameters' ? {
        getBinding: _ => _ === 'items' ? {
          filter: _ => filter = _
        } : null
      } : null
    });

    parametersController.onRouteMatched({getParameter: () => ({})});
    assert.deepEqual(state, {search: '', types: ['color', 'fontWeight'], categories: ['Main', 'Button']}, 'should default to pushing the model values as state');

    parametersController.onRouteMatched({getParameter: () => ({
      '?query': {search: 'mysearch'}
    })});
    assert.deepEqual(state, {search: 'mysearch', types: ['color', 'fontWeight'], categories: ['Main', 'Button']}, 'should push the partial values (search) with the model values as state');

    parametersController.onRouteMatched({getParameter: () => ({
      '?query': {types: 'color'}
    })});
    assert.deepEqual(state, {search: '', types: ['color'], categories: ['Main', 'Button']}, 'should push the partial values (types) with the model values as state');

    parametersController.onRouteMatched({getParameter: () => ({
      '?query': {categories: 'Main,Main'}
    })});
    assert.deepEqual(state, {search: '', types: ['color', 'fontWeight'], categories: ['Main']}, 'should push the partial values (categories) with the model values as state');

    state = null;
    parametersController.onRouteMatched({getParameter: () => ({
      '?query': {search: 'mysearch', types: 'color', categories: 'Main'}
    })});
    assert.equal(state, null, 'should not update the state if all values are passed');
    assert.equal(model['/Search'], 'mysearch', 'should update /Search of the model');
    assert.deepEqual(model['/SelectedTypes'], ['color'], 'should update /SelectedTypes of the model');
    assert.deepEqual(model['/SelectedCategories'], ['Main'], 'should update /SelectedCategories of the model');
    assert.equal(filter.length, 3, 'should filter the items');
  });
});
