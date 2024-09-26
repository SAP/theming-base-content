sap.ui.define(['tc/model/formatter'], formatter => {
  QUnit.module('formatter');

  QUnit.test('glyphToEntity() (UITD2-2840, UITD2-3069)', assert => {
    assert.equal(formatter.glyphToEntity('0x1234'), '&#1234;', 'should convert 0x1234 to &#1234;');
  });

  QUnit.test('glyphToContent() (UITD2-2840, UITD2-3069)', assert => {
    assert.equal(formatter.glyphToContent('0x1234'), '\\1234', 'should convert 0x1234 to \\1234');
  });

  QUnit.test('glyphToUnicode() (UITD2-2840, UITD2-3069)', assert => {
    assert.equal(formatter.glyphToUnicode('0x1234'), 'ሴ', 'should convert 0x1234 to ሴ');
  });
});
