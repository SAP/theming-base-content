sap.ui.define([
  'tc/controller/Overview.controller'
], OverviewController => {
  QUnit.module('Overview.controller');

  QUnit.test('navToIcons() (UITD2-2840, UITD2-3069)', assert => {
    let route = null;
    const overviewController = new OverviewController();
    overviewController.getRouter = () => ({
      navTo: (target, args) => route = {target, args}
    });

    overviewController.navToIcons('SAP-icons');
    assert.deepEqual(route, {target: 'icons', args: {library: 'SAP-icons'}}, 'should navTo("icons", {library: "${library}"})');
  });
});
