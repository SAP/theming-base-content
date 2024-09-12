QUnit.config.autostart = false;

sap.ui.require(['sap/ui/core/Core'], async Core => {
  await Core.ready();

  sap.ui.require([
    'tc/test/unit/controller/Base.controller.qunit',
    'tc/test/unit/controller/GettingStarted.controller.qunit',
    'tc/test/unit/controller/Icons.controller.qunit',
    'tc/test/unit/controller/Overview.controller.qunit',
    'tc/test/unit/controller/Parameters.controller.qunit',
    'tc/test/unit/model/formatter.qunit',
    'tc/test/unit/model/Icons.model.qunit',
    'tc/test/unit/model/Parameters.model.qunit',
    'tc/test/unit/model/Themes.model.qunit',
    'tc/test/unit/util/parametersGet.qunit',
    'tc/test/unit/util/uniq.qunit',
    'tc/test/unit/Component.qunit'
  ], () => {
    QUnit.start();
  });
});
