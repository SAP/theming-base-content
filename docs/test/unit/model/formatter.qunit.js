sap.ui.define(['tc/model/formatter'], formatter => {
  QUnit.module('formatter');

  QUnit.test('glyphToEntity()', assert => {
    assert.equal(formatter.glyphToEntity('0x1234'), '&#1234;', 'should convert 0x1234 to &#1234;');
  });

  QUnit.test('glyphToContent()', assert => {
    assert.equal(formatter.glyphToContent('0x1234'), '\\1234', 'should convert 0x1234 to \\1234');
  });

  QUnit.test('glyphToUnicode()', assert => {
    assert.equal(formatter.glyphToUnicode('0x1234'), 'ሴ', 'should convert 0x1234 to ሴ');
  });
});
