'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _updateMutation = require('./util/updateMutation');

var _updateMutation2 = _interopRequireDefault(_updateMutation);

var _rangeSort = require('./util/rangeSort');

var _rangeSort2 = _interopRequireDefault(_rangeSort);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ENTITY_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '`': '&#x60;'
};

exports.default = function (block) {
  var blockText = block.text;

  var entities = block.entityRanges.sort(_rangeSort2.default);
  var styles = block.inlineStyleRanges.sort(_rangeSort2.default);
  var resultText = '';

  var _loop = function _loop(index) {
    var char = blockText[index];

    if (ENTITY_MAP[char] !== undefined) {
      (function () {
        var encoded = ENTITY_MAP[char];
        resultText += encoded;

        var updateForChar = function updateForChar(mutation) {
          return (0, _updateMutation2.default)(mutation, index, char.length, encoded.length);
        };

        entities = entities.map(updateForChar);
        styles = styles.map(updateForChar);
      })();
    } else {
      resultText += char;
    }
  };

  for (var index = 0; index < blockText.length; index++) {
    _loop(index);
  }

  return Object.assign({}, block, {
    text: resultText,
    inlineStyleRanges: styles,
    entityRanges: entities
  });
};