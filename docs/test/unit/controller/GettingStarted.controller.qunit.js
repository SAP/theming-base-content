sap.ui.define([
  'tc/controller/Base.controller',
  'tc/controller/GettingStarted.controller'
], (BaseController, GettingStartedController) => {
  QUnit.module('GettingStarted.controller');

  QUnit.test('constructor() (UITD2-2840, UITD2-3069)', assert => {
    assert.ok(new GettingStartedController() instanceof BaseController, 'should be a BaseController');
  });
});
