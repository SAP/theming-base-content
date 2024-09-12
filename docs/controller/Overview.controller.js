sap.ui.define(['tc/controller/Base.controller'], BaseController => {
  return BaseController.extend('tc.controller.Overview', {
    navToIcons(library) {
      this.getRouter().navTo('icons', {library});
    }
  });
});
