'use strict';

sap.ui.define([
  'sap/ui/core/UIComponent',
  'tc/model/Icons.model',
  'tc/model/Parameters.model',
  'tc/model/Themes.model'
], (UIComponent, iconsModel, parametersModel, themesModel) => {
  return UIComponent.extend('tc.Component', {
    metadata: {
      interfaces: ['sap.ui.core.IAsyncContentCreation'],
      manifest: 'json'
    },

    init() {
      UIComponent.prototype.init.apply(this, arguments);

      this.setModel(iconsModel, 'icons');
      this.setModel(parametersModel, 'parameters');
      this.setModel(themesModel, 'themes');

      this.getRouter().initialize();
    }
  })
});
