sap.ui.define([
  'sap/ui/core/Theming',
  'sap/ui/core/theming/Parameters'
], (Theming, Parameters) => {
  return async function(parameters) {
    let resolve;
    const deferred = new Promise(_ => resolve = _);
    let values = {};
    values = Parameters.get({
      name: parameters,
      callback: _ => {
        values = _ || {};
        resolve();
      }
    });
    if (!values) {
      await deferred;
    }

    if (!Theming.getThemeRoot()) {
      for (const [p, val] of Object.entries(values)) {
        if (p.startsWith('sapFontUrl_SAP-icons-TNT_')) {
          values[p] = val.replace('/sap/ui/core/', '/sap/tnt/')
            .replace('/baseTheme/', '/base/')
            .replace('/sap_horizon/fonts/', '/base/fonts/horizon/');
        }
        if (p.startsWith('sapFontUrl_SAP-icons-Business-Suite_')) {
          values[p] = val.replace('sap/ui/core', 'sap/ushell')
            .replace('/baseTheme/', '/base/')
            .replace('/sap_horizon/fonts/', '/base/fonts/');
        }
      }
    }

    return values;
  }
});
