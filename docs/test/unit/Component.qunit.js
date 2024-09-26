sap.ui.define([
  'sap/ui/core/Theming',
  'sap/ui/core/theming/Parameters'
], (Theming, Parameters) => {
  let get;
  let getThemeRoot;
  let getTheme;
  let windowFetch;
  
  QUnit.module('Component', {
    before() {
      get = Parameters.get;
      Parameters.get = () => ({
        'sapFontUrl_SAP-icons-TNT_woff2': '/sap/tnt/themes/base/fonts/SAP-icons-TNT.woff2',
        'sapFontUrl_SAP-icons-TNT_woff': '/sap/tnt/themes/base/fonts/SAP-icons-TNT.woff',
        'sapFontUrl_SAP-icons-TNT_ttf': '/sap/tnt/themes/base/fonts/SAP-icons-TNT.ttf',
        'sapFontUrl_SAP-icons-Business-Suite_woff2': '/sap/tnt/themes/base/fonts/SAP-icons-Business-Suite.woff2',
        'sapFontUrl_SAP-icons-Business-Suite_woff': '/sap/tnt/themes/base/fonts/SAP-icons-Business-Suite.woff',
        'sapFontUrl_SAP-icons-Business-Suite_ttf': '/sap/tnt/themes/base/fonts/SAP-icons-Business-Suite.ttf'
      });
    
      getThemeRoot = Theming.getThemeRoot;
      Theming.getThemeRoot = () => '/themeroot/UI5'; 
      getTheme = Theming.getTheme;
      Theming.getTheme = () => 'my_horizon';
    
      windowFetch = window.fetch;
      window.fetch = async url => {
        if ([
          '/sap-themes/Base/baseLib/baseTheme/fonts/SAP-icons.json',
          '/sap-themes/Base/baseLib/baseTheme/fonts/SAP-icons-TNT.json',
          '/sap-themes/Base/baseLib/baseTheme/fonts/BusinessSuiteInAppSymbols.json'
        ].includes(url)) {
          return {json: () => ({})};
        } else if (url === '/themeroot/Base/baseLib/baseTheme/base.less') {
          return {text: () => ''};
        } else {
          return windowFetch(url);
        }
      };
    },
    after() {
      window.fetch = windowFetch;
      Theming.getTheme = getTheme;
      Theming.getThemeRoot = getThemeRoot;
      Parameters.get = get;
    }
  });

  QUnit.test('init() (UITD2-2840, UITD2-3069)', async assert => {
    ['Icons', 'Parameters', 'Themes'].forEach(_ =>
      sap.ui.loader._.unloadResources(`tc/model/${_}.model.js`, false, true, true)
    );

    const [iconsModel, parametersModel, themesModel, Component] = await new Promise(resolve => sap.ui.require([
      'tc/model/Icons.model',
      'tc/model/Parameters.model',
      'tc/model/Themes.model',
      'tc/Component'
    ], (...modules) => resolve(modules)));

    const component = new Component();
    const models = {};
    component.setModel = (model, name) => models[name] = model;
    let routerInitialized = false;
    component.getRouter = () => ({initialize: () => routerInitialized = true});

    component.init();

    assert.equal(models.icons, iconsModel, 'should initialize the icons model');
    assert.equal(models.parameters, parametersModel, 'should initialize the parameters model');
    assert.equal(models.themes, themesModel, 'should initialize the themes model');
    assert.ok(routerInitialized, 'should initialize the router');
  });
});