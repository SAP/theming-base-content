sap.ui.define(['tc/util/uniq'], uniq => {
  QUnit.module('uniq');

  QUnit.test('unique values (UITD2-2840, UITD2-3069)', assert => {
    assert.deepEqual(uniq([1, 2, 3, 4, 5]), [1, 2, 3, 4, 5], 'should return the same array');
  });

  QUnit.test('duplicate values (UITD2-2840, UITD2-3069)', assert => {
    assert.deepEqual(uniq([1, 2, 2, 3, 3, 4, 5]), [1, 2, 3, 4, 5], 'should remove duplicates');
  });
});
