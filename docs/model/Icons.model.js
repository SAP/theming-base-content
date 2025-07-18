'use strict';

/** @typedef {Object<string, string>} IconMapping maps icon ids to glyphs */
/** @typedef {{groups: {name: string, text: string, icons: {name: string}[]}[]}} Groups lists name/text/list of icon ids of groups */
/** @typedef {Object<string, {tags: string[]}>} Tags maps icon ids to tags */

sap.ui.define([
  'sap/ui/VersionInfo',
  'sap/ui/core/IconPool',
  'sap/ui/core/Theming',
  'sap/ui/model/json/JSONModel',
  'tc/util/uniq'
], (VersionInfo, IconPool, Theming, JSONModel, uniq) => {
  /**
   * @example
   * await getIcons() // =>
   * // {
   * //   'SAP-icons': {
   * //     '0xe000': {
   * //       names: ['accidental-leave'],
   * //       groups: [],
   * //       tags: ['leave'],
   * //       rtl: 'flip'
   * //     },
   * //     …
   * //   },
   * //   …
   * // }
   * @return {Promise<Object<string, Object<string, {names: string[], groups: string[], tags: string[], rtl: 'flip'|'rotate'|'none'}>>>}
   */
  async function getIconLibraries() {
    if (Theming.getThemeRoot()) {
      // new icons
      const fonts = Theming.getThemeRoot()
        .replace(/\/UI5\/?$/, '/Base/baseLib/baseTheme/fonts')
        .replace('/themeroot/', '/sap-themes/');
      const [icons, tnt, bs] = await Promise.all(['SAP-icons', 'SAP-icons-TNT', 'BusinessSuiteInAppSymbols'].map(_ => fetch(`${fonts}/${_}.json`)
        .then(_ => _.json())
      ));

      return {
        'SAP-icons': icons,
        'SAP-icons-TNT': tnt,
        'SAP-icons-Business-Suite': bs
      };
    } else {
      // legacy icons
      const {version} = await VersionInfo.load();
      const ui5Root = document.getElementById('sap-ui-bootstrap').getAttribute('src')
        .replace(new RegExp(version.split('.').slice(0, 2).join('\\.')), version)
        .replace(/\/resources\/sap-ui-core\.js$/, '');
      const [tnt, bs, iconsGroups, iconsTags, tntGroups, tntTags, bsGroups, bsTags] =
      /** @type {[{config: {path: Object<string,string>}, icons: IconMapping}, IconMapping, Groups, Tags, Groups, Tags, Groups, Tags]} */ (await Promise.all([
        'resources/sap/tnt/themes/base/fonts/SAP-icons-TNT.json',
        'resources/sap/ushell/themes/base/fonts/BusinessSuiteInAppSymbols.json',
        'test-resources/sap/m/demokit/iconExplorer/webapp/model/SAP-icons/groups.json',
        'test-resources/sap/m/demokit/iconExplorer/webapp/model/SAP-icons/tags.json',
        'test-resources/sap/m/demokit/iconExplorer/webapp/model/SAP-icons-TNT/groups.json',
        'test-resources/sap/m/demokit/iconExplorer/webapp/model/SAP-icons-TNT/tags.json',
        'test-resources/sap/m/demokit/iconExplorer/webapp/model/BusinessSuiteInAppSymbols/groups.json',
        'test-resources/sap/m/demokit/iconExplorer/webapp/model/BusinessSuiteInAppSymbols/tags.json',
      ].map(url => fetch(`${ui5Root}/${url}`).then(res => res.json()))));

      return {
        'SAP-icons': Object.fromEntries(IconPool.getIconNames().map(name => {
          const info = IconPool.getIconInfo(name);

          return [`0x${info.content.charCodeAt(0).toString(16)}`, {
            names: [name],
            groups: iconsGroups.groups.filter(({icons}) => icons.map(({name}) => name).includes(name)).map(({name}) => name),
            tags: iconsTags[name]?.tags || iconsTags[name.toLowerCase()]?.tags || [],
            rtl: 'flip'
          }]
        })),
        'SAP-icons-TNT': Object.fromEntries(Object.entries(tnt.icons).map(([name, glyph]) => [glyph, {
          names: [name],
          groups: tntGroups.groups.filter(({icons}) => icons.map(({name}) => name).includes(name)).map(({name}) => name),
          tags: tntTags[name]?.tags || tntTags[name.toLowerCase()]?.tags || [],
          rtl: 'flip'
        }])),
        'SAP-icons-Business-Suite': Object.fromEntries(Object.entries(bs.icons).map(([name, glyph]) => [glyph, {
          names: [name],
          groups: bsGroups.groups.filter(({icons}) => icons.map(({name}) => name).includes(name)).map(({name}) => name),
          tags: bsTags[name]?.tags || bsTags[name.toLowerCase()]?.tags || [],
          rtl: 'flip'
        }]))
      };
    }
  }
  
  const iconsModel = new JSONModel(Object.fromEntries(
    ['SAP-icons', 'SAP-icons-TNT', 'SAP-icons-Business-Suite'].map(Library => [Library, {
      Library,
      Groups: [],
      SelectedGroup: null,
      Tags: [],
      SelectedTag: null,
      Icons: [],
      Search: ''
    }])
  ));

  getIconLibraries().then(libraries => {
    iconsModel.setData(Object.fromEntries(Object.entries(libraries).map(([Library, icons]) => {
      const iconEntries = Object.entries(icons);
      
      return [Library, {
        Library,
        Groups: [null].concat(uniq(iconEntries.map(([, {groups}]) => groups).flat()).map(Group => ({Group}))),
        SelectedGroup: null,
        Tags: [null].concat(uniq(iconEntries.map(([, {tags}]) => tags).flat()).map(Tag => ({Tag}))),
        SelectedTag: null,
        Icons: iconEntries.map(([Glyph, {names, groups, tags}]) => ({
          Glyph,
          Name: names[0],
          Groups: groups.map(Group => ({Group})),
          Tags: tags.map(Tag => ({Tag}))
        })),
        Search: ''
      }];
    })));
  });

  return iconsModel;
});
