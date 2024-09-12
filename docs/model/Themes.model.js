sap.ui.define([
  'sap/ui/core/Theming',
  'sap/ui/model/json/JSONModel'
], (Theming, JSONModel) => {
  const themesModel = new JSONModel({
    Themes: [
      {Theme: 'sap_horizon', Avatar: null},
      {Theme: 'sap_horizon_dark', Avatar: null},
      {Theme: 'sap_horizon_hcb', Avatar: null},
      {Theme: 'sap_horizon_hcw', Avatar: null},
      {Theme: 'sap_fiori_3', Avatar: null},
      {Theme: 'sap_fiori_3_dark', Avatar: null},
      {Theme: 'sap_fiori_3_hcb', Avatar: null},
      {Theme: 'sap_fiori_3_hcw', Avatar: null}
    ],
    SelectedTheme: Theming.getTheme()
  });

  Theming.attachApplied(() => {
    themesModel.setProperty('/SelectedTheme', Theming.getTheme());
  });

  return themesModel;
});
