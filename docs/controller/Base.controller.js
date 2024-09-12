sap.ui.define([
  'sap/ui/core/Theming',
  'sap/ui/core/UIComponent',
  'sap/ui/core/mvc/Controller'
], (Theming, UIComponent, Controller) => {
  return Controller.extend('tc.controller.Base', {
    getRouter() {
      return UIComponent.getRouterFor(this);
    },

    onThemeChange(event) {
      const theme = event.getParameter('selectedItem').getText();

      this.getView().getModel('themes').setProperty('/SelectedTheme', theme);
      Theming.setTheme(theme);
    },

    navTo(target) {
      this.getRouter().navTo(target);
    },
  });
});
