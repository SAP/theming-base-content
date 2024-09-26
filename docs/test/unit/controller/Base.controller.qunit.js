sap.ui.define([
  'sap/ui/core/Theming',
  'sap/ui/core/UIComponent',
  'tc/controller/Base.controller'
], (Theming, UIComponent, BaseController) => {
  QUnit.module('Base.controller');

  QUnit.test('getRouter() (UITD2-2840, UITD2-3069)', assert => {
    const ROUTER = Symbol('router');
    const getRouterFor = UIComponent.getRouterFor;
    UIComponent.getRouterFor = () => ROUTER;
    assert.equal(new BaseController().getRouter(), ROUTER, 'should return what UIComponent.getRouterFor(this) returns');
    UIComponent.getRouterFor = getRouterFor;
  });

  QUnit.test('onThemeChange() (UITD2-2840, UITD2-3069)', assert => {
    const THEME = 'my_theme';
    
    let actualTheme = null;
    const setTheme = Theming.setTheme;
    Theming.setTheme = _ => actualTheme = _;
    
    const modelUpdates = [];
    const baseController = new BaseController();
    baseController.getView = () => ({
      getModel: model => ({
        setProperty: (path, value) => modelUpdates.push({model, path, value})
      })
    });

    baseController.onThemeChange({
      getParameter: () => ({
        getText: () => THEME
      })
    });

    Theming.setTheme = setTheme;

    assert.ok(modelUpdates.some(({model, path, value}) => model === 'themes' && path === '/SelectedTheme' && value === THEME), 'should update /SelectedTheme of the themes model');
    assert.equal(actualTheme, THEME, 'should call Theming.setTheme()');
  });

  QUnit.test('navTo() (UITD2-2840, UITD2-3069)', assert => {
    let target = null;
    const getRouterFor = UIComponent.getRouterFor;
    UIComponent.getRouterFor = () => ({
      navTo: _ => target = _
    });

    const TARGET = 'my-target';
    new BaseController().navTo(TARGET);

    assert.equal(target, TARGET, 'should call navTo() on the underlying router');

    UIComponent.getRouterFor = getRouterFor;
  });
});
