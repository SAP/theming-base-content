sap.ui.define([
  'sap/ui/core/Theming',
  'sap/ui/core/theming/Parameters'
], (Theming, Parameters) => {
  const DATA = {
    Parameters: [{
      Parameter: 'sapBrandColor',
      Label: 'Brand Color',
      Description: 'The color which builds your brand.',
      Tags: ['Quick', 'Base', 'Color', 'Mobile', 'Protected'],
      Protected: true,
      Category: 'Main',
      Type: 'color',
      Value: '#0070f2'
    }, {
      Parameter: 'sapHighlightColor',
      Label: 'Highlight Color',
      Description: 'The color which is used to highlight screen elements.',
      Tags: ['Quick', 'Base', 'Content', 'Color', 'Protected'],
      Protected: true,
      Category: 'Main',
      Type: 'color',
      Value: '#0064d9'
    }, {
      Parameter: 'sapFontUrl_SAP-icons-TNT_woff2',
      Category: 'Internal',
      Type: 'asset',
      Value: 'url("https://example.com/SAP-icons-TNT.woff2")',
    }, {
      Parameter: 'sapFontUrl_SAP-icons-TNT_woff',
      Category: 'Internal',
      Type: 'asset',
      Value: 'url("https://example.com/SAP-icons-TNT.woff")',
    }, {
      Parameter: 'sapFontUrl_SAP-icons-TNT_ttf',
      Category: 'Internal',
      Type: 'asset',
      Value: 'url("https://example.com/SAP-icons-TNT.ttf")',
    }, {
      Parameter: 'sapFontUrl_SAP-icons-Business-Suite_woff2',
      Category: 'Internal',
      Type: 'asset',
      Value: 'url("https://example.com/SAP-icons-Business-Suite.woff2")',
    }, {
      Parameter: 'sapFontUrl_SAP-icons-Business-Suite_woff',
      Category: 'Internal',
      Type: 'asset',
      Value: 'url("https://example.com/SAP-icons-Business-Suite.woff")',
    }, {
      Parameter: 'sapFontUrl_SAP-icons-Business-Suite_ttf',
      Category: 'Internal',
      Type: 'asset',
      Value: 'url("https://example.com/SAP-icons-Business-Suite.ttf")',
    }],
    Search: ''
  };
  DATA.SelectedTypes = Array.from(new Set(DATA.Parameters.map(({Type}) => Type)));
  DATA.Types = DATA.SelectedTypes.map(Type => ({Type}));
  DATA.SelectedCategories = Array.from(new Set(DATA.Parameters.map(({Category}) => Category)));
  DATA.Categories = DATA.SelectedCategories.map(Category => ({Category}));
  
  QUnit.module('Parameters.model');

  let parametersGet;
  let attachApplied;
  for (const [test, {}] of Object.entries({
    'theming-base-content from UI5': {}
  }))
  QUnit.test(`${test} (UITD2-2840, UITD2-3069)`, async assert => {
    // before
    sap.ui.loader._.unloadResources('tc/model/Parameters.model.js', false, true, true);

    const windowFetch = window.fetch;
    window.fetch = async (url, options) => {
      if (
        url.endsWith('/Base/baseLib/baseTheme/base.less') ||
        url.endsWith('/sap/ui/core/themes/base/base.less')
      ) {
        return {text: () => DATA.Parameters.map(_ => `// ===== FILE /Base/baseLib/baseTheme/base.less =====
${Object.entries(_)
  .filter(([k]) => k !== 'Parameter' && k !== 'Value')
  .map(([k, v]) => `// [${k} ${Array.isArray(v) ? v.map(_ => JSON.stringify(_)).join(', ') : JSON.stringify(v)}]`)
  .join('\n')}
@${_.Parameter}: ${_.Value};`).join('\n\n')};
      } else {
        return windowFetch(url, options);
      }
    };

    parametersGet = Parameters.get;
    Parameters.get = ({name: _}) => Object.fromEntries((Array.isArray(_) ? _ : [_]).map(_ => [_, DATA.Parameters.find(({Parameter}) => Parameter === _).Value]));

    let appliedHandler;
    attachApplied = Theming.attachApplied;
    Theming.attachApplied = _ => appliedHandler = _;

    const parametersModel = await new Promise(res => sap.ui.require(['tc/model/Parameters.model'], _ => res(_)));
    let data = null;
    const setDataPromise = new Promise(res => parametersModel.setData = _=> {
      data = _;
      res();
    });
    let properties = {
      '/Parameters': DATA.Parameters
    };
    parametersModel.getProperty = prop => properties[prop];
    const setPropertyPromise = new Promise(res => parametersModel.setProperty = (prop, val) => {
      properties[prop] = val;
      res();
    });

    // 1. empty
    
    assert.deepEqual(parametersModel.getData(), {...DATA, Parameters: [], Types: [], Categories: [], SelectedTypes: [], SelectedCategories: []}, 'should be initialized with empty values');

    // 2. initialized

    await setDataPromise;
    assert.deepEqual(data, DATA, 'should contain the parsed data');

    const tcFontFaces = document.getElementById('tc-font-faces');
    DATA.Parameters
      .filter(({Parameter}) => Parameter.startsWith('sapFontUrl_'))
      .forEach(({Parameter, Value}) => {
        assert.ok(tcFontFaces.textContent.includes(Value), `should add an @font-face definition containing @${Parameter}`);
      });

    // 3. updated

    DATA.Parameters
      .filter(({Parameter}) => Parameter.startsWith('sapFontUrl_'))
      .forEach(_ => _.Value = _.Value.replace('example.com', 'example.org'));
    appliedHandler();

    await setPropertyPromise;
    assert.deepEqual(properties['/Parameters'], DATA.Parameters, 'should update the parameters');
    DATA.Parameters
      .filter(({Parameter}) => Parameter.startsWith('sapFontUrl_'))
      .forEach(({Parameter, Value}) => {
        assert.ok(tcFontFaces.textContent.includes(Value), `should update the @font-face definition containing @${Parameter}`);
      });

    // after

    Parameters.get = parametersGet;
    window.fetch = windowFetch;
  });
});
