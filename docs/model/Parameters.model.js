'use strict';

sap.ui.define([
  'sap/ui/VersionInfo',
  'sap/ui/core/Theming',
  'sap/ui/model/json/JSONModel',
  'tc/util/parametersGet'
], (VersionInfo, Theming, JSONModel, parametersGet) => {
  /** @param {Object<string, {url: string, format: 'woff2'|'woff'|'ttf'}[]>} fontFaces */
  function updateFontFaceDefinitions(fontFaces) {
    let style = document.getElementById('tc-font-faces');
    if (!style) {
      style = document.createElement('style');
      style.id = 'tc-font-faces';
      document.head.appendChild(style);
    }

    style.textContent = Object.entries(fontFaces).map(([fontFace, srcs]) => `@font-face {
  font-family: ${fontFace};
  src: ${srcs.map(({url, format}) => `${url} format('${format}')`).join(', ')}
}`).join('\n\n');
  }

  /**
   * @example
   * await getAnnotatedThemingParameters() // =>
   * // {
   * //   sapBrandColor: {
   * //     Category: 'Main',
   * //     Tags: ['Base', 'Quick'],
   * //     …
   * //   }
   * // }
   * @return {Promise<Object<string, Object<string, string|string[]>>>}
   */
  async function getAnnotatedThemingParameters() { // NOSONAR
    const themeRoot = Theming.getThemeRoot();
    let base;
    if (themeRoot) {
      base = themeRoot.replace(/\/UI5\/?$/, '/Base/baseLib/baseTheme/base.less')
    } else {
      const {version} = await VersionInfo.load();
      const bootstrapSrc = document.getElementById('sap-ui-bootstrap').getAttribute('src');
      base = bootstrapSrc
        .replace(new RegExp(version.split('.').slice(0, 2).join('\\.')), version)
        .replace(/\/sap-ui-core\.js$/, '/sap/ui/core/themes/base/base.less');
    }

    const res = await fetch(base);
    const less = await res.text();
    /** @type {Object<string, string|string[]>} */
    const ps = {};
    /** @type {Object<string, string|string[]>} */
    let as = {};
    let inBaseTheme = false;

    for (const line of less.split('\n')) {
      if (line.includes('FILE /Base/baseLib/baseTheme/base.less')) {
        inBaseTheme = true;
      } else if (line.includes('FILE /')) {
        inBaseTheme = false;
      }
      if (inBaseTheme) {
        if (/^@sap.*?: /.test(line)) {
          const i = line.indexOf(':');
          const p = line.slice('@'.length, i).trim();

          if (Object.keys(as).length > 0) {
            if (
              p !== 'sapToBeDefined' &&
              !p.startsWith('sapDeprecated') &&
              !p.startsWith('sapDefault') &&
              !as.Deprecated
            ) {
              if (p in ps) {
                // parameter already exists
                for (const [a, v] of Object.entries(as)) {
                  if (a in ps[p]) {
                    // annotation already exists
                    ps[p][a] = (typeof ps[p][a] === 'string' ? [ps[p][a]] : ps[p][a]).concat(typeof v === 'string' ? [v] : v);
                  } else {
                    ps[p][a] = v;
                  }
                  if (Array.isArray(ps[p][a])) {
                    // remove annotation values with antivalues
                    const values = ps[p][a].filter(_ => !_.startsWith('!'));
                    const antiValues = ps[p][a].filter(_ => _.startsWith('!')).map(_ => _.slice(1));
                    ps[p][a] = ps[p][a].filter(_ => _.startsWith('!') ? !values.includes(_.slice(1))
                      : !antiValues.includes(_));
                    if (ps[p][a].length === 0) {
                      delete ps[p][a];
                    }
                  }
                }
              } else {
                ps[p] = as;
              }
            }
            as = {};
          }
        } else if (/^\/\/ \[\w+/.test(line)) {
          const l = line.slice('// ['.length);
          const i = l.indexOf(' ');
          const a = l.slice(0, i);
          const v = JSON.parse(`[${l.slice(i+1)}`);

          if (v.length === 1) {
            try {
              as[a] = JSON.parse(v[0])
            } catch {
              as[a] = v[0];
            }
          } else {
            as[a] = v;
          }
        }
      }
    }

    for (const [p, val] of Object.entries(await parametersGet(Object.keys(ps)))) {
      ps[p].Value = val;
    }

    updateFontFaceDefinitions({
      'SAP-icons-TNT': [
        {url: /** @type {string} */ (ps['sapFontUrl_SAP-icons-TNT_woff2'].Value), format: 'woff2'},
        {url: /** @type {string} */ (ps['sapFontUrl_SAP-icons-TNT_woff'].Value), format: 'woff'},
        {url: /** @type {string} */ (ps['sapFontUrl_SAP-icons-TNT_ttf'].Value), format: 'ttf'}
      ],
      'SAP-icons-Business-Suite': [
        {url: /** @type {string} */ (ps['sapFontUrl_SAP-icons-Business-Suite_woff2'].Value), format: 'woff2'},
        {url: /** @type {string} */ (ps['sapFontUrl_SAP-icons-Business-Suite_woff'].Value), format: 'woff'},
        {url: /** @type {string} */ (ps['sapFontUrl_SAP-icons-Business-Suite_ttf'].Value), format: 'ttf'}
      ]
    });

    return ps;
  }

  const parametersModel = new JSONModel({
    Parameters: [],
    Types: [],
    Categories: [],
    SelectedTypes: [],
    SelectedCategories: [],
    Search: ''
  });

  Theming.attachApplied(() => {
    const ps = parametersModel.getProperty('/Parameters');

    parametersGet(ps.map(({Parameter}) => Parameter))
      .then(values => {
        /** @type {Object<string,string>} */
        const fontUrls = {};

        for (let i = 0; i < ps.length; i++) {
          const parameter = ps[i].Parameter;
          ps[i].Value = values[parameter];
          if (parameter.startsWith('sapFontUrl_SAP-icons-')) {
            fontUrls[parameter] = values[parameter];
          }
        }

        parametersModel.setProperty('/Parameters', ps);
        if (
          'sapFontUrl_SAP-icons-TNT_woff2' in fontUrls &&
          'sapFontUrl_SAP-icons-TNT_woff' in fontUrls &&
          'sapFontUrl_SAP-icons-TNT_ttf' in fontUrls &&
          'sapFontUrl_SAP-icons-Business-Suite_woff2' in fontUrls &&
          'sapFontUrl_SAP-icons-Business-Suite_woff' in fontUrls &&
          'sapFontUrl_SAP-icons-Business-Suite_ttf' in fontUrls
        ) {
          updateFontFaceDefinitions({
            'SAP-icons-TNT': [
              {url: fontUrls['sapFontUrl_SAP-icons-TNT_woff2'], format: 'woff2'},
              {url: fontUrls['sapFontUrl_SAP-icons-TNT_woff'], format: 'woff'},
              {url: fontUrls['sapFontUrl_SAP-icons-TNT_ttf'], format: 'ttf'}
            ],
            'SAP-icons-Business-Suite': [
              {url: fontUrls['sapFontUrl_SAP-icons-Business-Suite_woff2'], format: 'woff2'},
              {url: fontUrls['sapFontUrl_SAP-icons-Business-Suite_woff'], format: 'woff'},
              {url: fontUrls['sapFontUrl_SAP-icons-Business-Suite_ttf'], format: 'ttf'}
            ]
          });
        }
      });
  });

  getAnnotatedThemingParameters()
    .then(parameters => {
      const values = Object.values(parameters);
      const types = Object.keys(Object.groupBy(values, ({Type}) => Type));
      const categories = Object.keys(Object.groupBy(values, ({Category}) => (Category ? (typeof Category === 'string' ? [Category] : Category) : ['Internal'])[0]));

      parametersModel.setData({
        Parameters: Object.entries(parameters).map(([Parameter, annotations]) => ({...annotations, Parameter})),
        Types: types.map(Type => ({Type})),
        SelectedTypes: types,
        Categories: categories.map(Category => ({Category})),
        SelectedCategories: categories,
        Search: ''
      });
    });

  return parametersModel;
});
