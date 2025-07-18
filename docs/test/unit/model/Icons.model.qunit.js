sap.ui.define([
  'sap/ui/core/IconPool',
  'sap/ui/core/Theming'
], (IconPool, Theming) => {
  const METADATA = {
    'SAP-icons': {
      Library: 'SAP-icons',
      Groups: [null, {Group: 'med'}, {Group: 'status'}],
      SelectedGroup: null,
      Tags: [null, {Tag: 'accidental'}, {Tag: 'leave'}],
      SelectedTag: null,
      Icons: [{
        Glyph: '0xe000',
        Name: 'accidental-leave',
        Groups: [{Group: 'med'}, {Group: 'status'}],
        Tags: [{Tag: 'accidental'}, {Tag: 'leave'}]
      }],
      Search: ''
    },
    'SAP-icons-TNT': {
      Library: 'SAP-icons-TNT',
      Groups: [null, {Group: 'technical'}],
      SelectedGroup: null,
      Tags: [null, {Tag: 'system'}, {Tag: 'hexagon'}],
      SelectedTag: null,
      Icons: [{
        Glyph: '0xe000',
        Name: 'technicalsystem',
        Groups: [{Group: 'technical'}],
        Tags: [{Tag: 'system'}, {Tag: 'hexagon'}]
      }],
      Search: ''
    },
    'SAP-icons-Business-Suite': {
      Library: 'SAP-icons-Business-Suite',
      Groups: [null, {Group: 'objects'}, {Group: 'medical'}],
      SelectedGroup: null,
      Tags: [null, {Tag: 'heart'}, {Tag: 'medical'}],
      SelectedTag: null,
      Icons: [{
        Glyph: '0xe000',
        Name: 'icon-heart',
        Groups: [{Group: 'objects'}, {Group: 'medical'}],
        Tags: [{Tag: 'heart'}, {Tag: 'medical'}]
      }],
      Search: ''
    }
  };
  const EMPTY_METADATA = Object.fromEntries(Object.entries(METADATA).map(([k, v]) => [k, {...v, Groups: [], Tags: [], Icons: []}]));

  /**
   * @param {keyof METADATA} lib 
   * @return {Object<string, {names: string[], groups: string[], tags: string[], rtl: 'flip'}>}
   */
  function libFromMetadata(lib) {
    return Object.fromEntries(METADATA[lib].Icons.map(({Glyph, Name, Groups, Tags}) => [Glyph, {
      names: [Name],
      groups: Groups.map(({Group}) => Group),
      tags: Tags.map(({Tag}) => Tag),
      rtl: 'flip'
    }]));
  }

  /**
   * @param {keyof METADATA} lib 
   * @return {{groups: {name: string, text: string, icons: {name: string}[]}[]}}
   */
  function groupsFromMetadata(lib) {
    return ({
      groups: METADATA[lib].Groups.filter(Boolean).map(({Group}) => ({
        name: Group,
        text: Group,
        icons: METADATA[lib].Icons.filter(({Groups}) => Groups.some(({Group: _}) => _ === Group)).map(({Name}) => ({name: Name}))
      }))
    })
  }

  /**
   * @param {keyof METADATA} lib 
   * @return {Object<string, {tags: [string]}>}
   */
  function tagsFromMetadata(lib) {
    return Object.fromEntries(METADATA[lib].Icons.map(({Name, Tags}) => [Name, {tags: Tags.map(({Tag}) => Tag)}]))
  }

  QUnit.module('Icons.model');

  let getIconNames;
  let getIconInfo;
  let getThemeRoot;
  for (const [test, {before, after, responses}] of Object.entries({
    'legacy metadata': {
      before: () => {
        getIconNames = IconPool.getIconNames;
        IconPool.getIconNames = () => METADATA['SAP-icons'].Icons.map(({Name}) => Name);
  
        getIconInfo = IconPool.getIconInfo;
        IconPool.getIconInfo = _ => ({content: String.fromCharCode(parseInt(METADATA['SAP-icons'].Icons.find(({Name}) => Name === _).Glyph))})},
      after: () => {
        IconPool.getIconInfo = getIconInfo;
        IconPool.getIconNames = getIconNames;
      },
      responses: {
        '/sap/tnt/themes/base/fonts/SAP-icons-TNT.json': {
          config: {path: {'^sap_horizon.*': 'sap/tnt/themes/base/fonts/horizon'}},
          icons: Object.fromEntries(METADATA['SAP-icons-TNT'].Icons.map(({Glyph, Name}) => [Name, Glyph]))
        },
        '/sap/ushell/themes/base/fonts/BusinessSuiteInAppSymbols.json': {
          config: {},
          icons: Object.fromEntries(METADATA['SAP-icons-Business-Suite'].Icons.map(({ Glyph, Name }) => [Name, Glyph]))
        },
        '/SAP-icons/groups.json': groupsFromMetadata('SAP-icons'),
        '/SAP-icons/tags.json': tagsFromMetadata('SAP-icons'),
        '/SAP-icons-TNT/groups.json': groupsFromMetadata('SAP-icons-TNT'),
        '/SAP-icons-TNT/tags.json': tagsFromMetadata('SAP-icons-TNT'),
        '/BusinessSuiteInAppSymbols/groups.json': groupsFromMetadata('SAP-icons-Business-Suite'),
        '/BusinessSuiteInAppSymbols/tags.json': tagsFromMetadata('SAP-icons-Business-Suite')
      }
    },
    'base content metadata': {
      before: () => {
        getThemeRoot = Theming.getThemeRoot;
        Theming.getThemeRoot = () => '/themeroot/UI5/';
      },
      after: () => Theming.getThemeRoot = getThemeRoot,
      responses: {
        '/Base/baseLib/baseTheme/fonts/SAP-icons.json': libFromMetadata('SAP-icons'),
        '/Base/baseLib/baseTheme/fonts/SAP-icons-TNT.json': libFromMetadata('SAP-icons-TNT'),
        '/Base/baseLib/baseTheme/fonts/BusinessSuiteInAppSymbols.json': libFromMetadata('SAP-icons-Business-Suite')
      }
    }
  })) {
    QUnit.test(`${test} (UITD2-2840, UITD2-3069)`, async assert => {
      sap.ui.loader._.unloadResources('tc/model/Icons.model.js', false, true, true);

      const windowFetch = window.fetch;
      window.fetch = async (url, options) => {
        for (const [responseUrl, response] of Object.entries(responses)) {
          if (url.endsWith(responseUrl)) {
            return {json: () => response};
          }
        }
        return windowFetch(url, options);
      };
      before();

      const iconsModel = await new Promise(res => sap.ui.require(['tc/model/Icons.model'], _ => res(_)));
      let data = null;
      const setDataPromise = new Promise(res => iconsModel.setData = _ => {
        data = _;
        res();
      });

      assert.deepEqual(iconsModel.getData(), EMPTY_METADATA, 'should be initialized with empty default values');

      await setDataPromise;
      assert.deepEqual(data, METADATA, 'should contain the parsed metadata');

      after();
      window.fetch = windowFetch;
    });
  }
});
