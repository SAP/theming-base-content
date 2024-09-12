'use strict';

sap.ui.define([], () => {
  /**
   * @template T
   * @param {T[]} arr
   * @return {T[]}
   */
  return function(arr) {
    return Array.from(new Set(arr));
  }
});
