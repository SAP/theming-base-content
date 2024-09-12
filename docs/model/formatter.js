'use strict';

/** @typedef {string} Glyph matching /^0x[0-9a-f]{4}$/i */
/** @typedef {string} Entity matching /^&#[0-9a-f]{4};$/i */
/** @typedef {string} Content matching /^\\[0-9a-f]{4}$/i */
/** @typedef {string} Unicode */

sap.ui.define([], () => {
  return {
    /**
     * @param {Glyph} glyph 
     * @return {Entity}
     */
    glyphToEntity(glyph) {
      return `&#${glyph.slice('0x'.length)};`;
    },

    /**
     * @param {Glyph} glyph 
     * @return {Content}
     */
    glyphToContent(glyph) {
      return `\\${glyph.slice('0x'.length)}`;
    },

    /**
     * @param {Glyph} glyph 
     * @return {Unicode}
     */
    glyphToUnicode(glyph) {
      return String.fromCharCode(glyph);
    }
  }
});
