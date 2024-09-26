sap.ui.define([
  'sap/ui/core/Theming',
  'sap/ui/core/theming/Parameters',
  'tc/util/parametersGet'
], (Theming, Parameters, parametersGet) => {
  QUnit.module('parametersGet()');

  QUnit.test('should resolve with the requested parameters (UITD2-2840, UITD2-3069)', async assert => {
    const get = Parameters.get;

    Parameters.get = () => ({sapBrandColor: 'lime'});
    assert.deepEqual(await parametersGet('sapBrandColor'), {sapBrandColor: 'lime'}, 'should resolve with synchronous result');

    Parameters.get = ({callback}) => {
      setTimeout(() => callback({sapBrandColor: 'pink'}));
      return null;
    };
    assert.deepEqual(await parametersGet('sapBrandColor'), {sapBrandColor: 'pink'}, 'should resolve with asynchronous result');
    
    Parameters.get = ({callback}) => {
      setTimeout(() => callback({sapBrandColor: 'green'}));
      return {sapBrandColor: 'blue'};
    };
    assert.deepEqual(await parametersGet('sapBrandColor'), {sapBrandColor: 'blue'}, 'should resolve with the synchronous result if both synchronous and asynchronous are available');

    const getThemeRoot = Theming.getThemeRoot;
    Theming.getThemeRoot = () => null;
    
    Parameters.get = () => ({
      'sapFontUrl_SAP-icons-TNT_woff2': 'url("/sap/ui/core/themes/base/fonts/SAP-icons-TNT.woff2")',
      'sapFontUrl_SAP-icons-Business-Suite_woff2': 'url("/sap/ui/core/themes/base/fonts/SAP-icons-Business-Suite.woff2")'
    });
    assert.deepEqual(await parametersGet(['sapFontUrl_SAP-icons-TNT_woff2', 'sapFontUrl_SAP-icons-Business-Suite_woff2']), {
      'sapFontUrl_SAP-icons-TNT_woff2': 'url("/sap/tnt/themes/base/fonts/SAP-icons-TNT.woff2")',
      'sapFontUrl_SAP-icons-Business-Suite_woff2': 'url("/sap/ushell/themes/base/fonts/SAP-icons-Business-Suite.woff2")'
    }, 'should rewrite wrong font URLs in UI5 for SAP-icons-TNT and SAP-icons-Business-Suite');

    Theming.getThemeRoot = getThemeRoot;
    Parameters.get = get;
  });
});