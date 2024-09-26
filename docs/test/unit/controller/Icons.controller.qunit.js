sap.ui.define([
  'tc/controller/Icons.controller'
], IconsController => {
  QUnit.module('Icons.controller');

  QUnit.test('onInit() (UITD2-2840, UITD2-3069)', assert => {
    const iconsController = new IconsController();
    const MATCHED_HANDLER = [];
    iconsController.getRouter = () => ({
      getRoute: () => ({
        attachMatched: (fn, ctx) => MATCHED_HANDLER.push({fn, ctx})
      })
    });
    iconsController.onInit();

    assert.equal(MATCHED_HANDLER[0].fn, iconsController.onRouteMatched, 'should register the onRouteMatched function');
    assert.equal(MATCHED_HANDLER[0].ctx, iconsController, 'should register the iconsController');
  });

  QUnit.test('onRouteMatched() (UITD2-2840, UITD2-3069)', assert => {
    const iconsPage = {
      styleClass: ['tcIcons--SAP-icons-TNT']
    };
    const model = {
      'SAP-icons': {},
      'SAP-icons-TNT': {}
    };
    let filter = null;
    const iconsController = new IconsController();
    iconsController.getView = () => ({
      getModel: () => ({
        getData: () => model,
        setProperty: (path, value) => model[path.split('/')[1]][path.split('/')[2]] = value
      }),
      byId: id => {
        switch (id) {
          case 'iconsPage':
            return {
              removeStyleClass: _ => iconsPage.styleClass = iconsPage.styleClass.filter(it => it !== _),
              addStyleClass: _ => iconsPage.styleClass.push(_)
            };
          case 'icons':
            return {
              getBinding: () => ({
                filter: _ => filter = _
              })
            };
        }
      },
      bindElement: () => {}
    });
    let target = null;
    iconsController.getRouter = () => ({
      navTo: _ => target = _
    });

    iconsController.onRouteMatched({
      getParameter: () => ({})
    });
    assert.equal(target, 'overview', '"" should navTo("overview") if library not found');

    iconsController.onRouteMatched({
      getParameter: () => ({
        library: 'SAP-icons'
      })
    });
    assert.deepEqual(iconsPage.styleClass, ['tcIcons--SAP-icons'], '"?library=SAP-icons" should update the page styleClass to the matched library');
    assert.equal(model['SAP-icons'].SelectedGroup, null, '"?library=SAP-icons" should default the selected group to null');
    assert.equal(model['SAP-icons'].Search, '', '"?library=SAP-icons" should default the search to ""');

    iconsController.onRouteMatched({
      getParameter: () => ({
        library: 'SAP-icons-TNT',
        '?query': {
          search: 'arrow',
          group: 'arrows'
        }
      })
    });
    assert.deepEqual(iconsPage.styleClass, ['tcIcons--SAP-icons-TNT'], '"?library=SAP-icons-TNT#search=arrow&group=arrows" should update the page styleClass to the matched library');
    assert.equal(model['SAP-icons-TNT'].SelectedGroup, 'arrows', '"?library=SAP-icons-TNT#search=arrow&group=arrows" should update the SelectedGroup of the matched library');
    assert.equal(model['SAP-icons-TNT'].Search, 'arrow', '"?library=SAP-icons-TNT#search=arrow&group=arrows" should update the Search of the matched library');
    assert.equal(filter.length, 2, '"?library=SAP-icons-TNT#search=arrow&group=arrows" should filter the items binding');
  });

  QUnit.test('pushState() (UITD2-2840, UITD2-3069)', assert => {
    let route = null;
    const iconsController = new IconsController();
    iconsController.getRouter = () => ({
      navTo: (target, args) => route = {target, args}
    });
    iconsController.library = 'SAP-icons'
    const model = {}
    iconsController.getView = () => ({
      getModel: () => ({
        getProperty: _ => model[_]
      })
    });

    iconsController.pushState();
    assert.deepEqual(route, {target: 'icons', args: {
      library: 'SAP-icons',
      '?query': {search: '', group: ''}
    }}, 'pushState() should default to search="" group=""');
    
    iconsController.pushState({})
    assert.deepEqual(route, {target: 'icons', args: {
      library: 'SAP-icons',
      '?query': {search: '', group: ''}
    }}, 'pushState({}) should default to search="" group=""');

    Object.assign(model, {'/SAP-icons-TNT/Search': 'search', '/SAP-icons-TNT/SelectedGroup': 'group'});
    iconsController.library = 'SAP-icons-TNT';
    iconsController.pushState({});
    assert.deepEqual(route, {target: 'icons', args: {
      library: 'SAP-icons-TNT',
      '?query': {search: 'search', group: 'group'}
    }}, 'pushState({}) should default to the values of the icons model');

    iconsController.pushState({search: 'mysearch', group: 'mygroup'});
    assert.deepEqual(route, {target: 'icons', args: {
      library: 'SAP-icons-TNT',
      '?query': {search: 'mysearch', group: 'mygroup'}
    }}, 'pushState({search: "mysearch", group: "mygroup"}) should use the given values');
  });

  QUnit.test('onSearch() (UITD2-2840, UITD2-3069)', assert => {
    let state = null;
    const iconsController = new IconsController();
    iconsController.pushState = _ => state = _;

    iconsController.onSearch({
      getParameter: () => 'mysearch'
    });
    assert.deepEqual(state, {search: 'mysearch'}, 'should push the search to the state');
  });

  QUnit.test('onGroupChange() (UITD2-2840, UITD2-3069)', assert => {
    let state = null;
    const iconsController = new IconsController();
    iconsController.pushState = _ => state = _;

    iconsController.onGroupChange({
      getParameter: () => ({
        getText: () => 'mygroup'
      })
    });
    assert.deepEqual(state, {group: 'mygroup'}, 'should push the group to the state');
  });
});
