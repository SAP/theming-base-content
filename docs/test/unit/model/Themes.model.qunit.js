sap.ui.define(['sap/ui/core/Theming'], Theming => {
  QUnit.module('Themes.model');

  QUnit.test('constructor() (UITD2-2840, UITD2-3069)', async assert => {
    // before
    sap.ui.loader._.unloadResources('tc/model/Themes.model.js', false, true, true);

    let theme = 'sap_horizon_dark';
    const getTheme = Theming.getTheme;
    Theming.getTheme = () => theme;
  
    let appliedHandler;
    const attachApplied = Theming.attachApplied;
    Theming.attachApplied = _ => appliedHandler = _;

    const themesModel = await new Promise(res => sap.ui.require(['tc/model/Themes.model'], _ => res(_)));

    // 1. initial

    assert.equal(themesModel.getProperty('/SelectedTheme'), 'sap_horizon_dark', 'should mirror Theming.getTheme() (sap_horizon_dark) in /SelectedTheme');
    assert.deepEqual(themesModel.getProperty('/Themes'), [
      'sap_horizon', 'sap_horizon_dark', 'sap_horizon_hcb', 'sap_horizon_hcw',
      'sap_fiori_3', 'sap_fiori_3_dark', 'sap_fiori_3_hcb', 'sap_fiori_3_hcw'
    ].map(Theme => ({Theme, Avatar: null})), 'should contain all Horizon and Quartz themes as /Themes');

    // 2. change

    theme = 'sap_fiori_3';
    appliedHandler();

    assert.equal(themesModel.getProperty('/SelectedTheme'), 'sap_fiori_3', 'should mirror Theming.getTheme() (sap_fiori_3) in /SelectedTheme');

    // after

    Theming.attachApplied = attachApplied;
    Theming.getTheme = getTheme;
  });
});
