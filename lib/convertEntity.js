'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _updateMutation = require('./util/updateMutation');

var _updateMutation2 = _interopRequireDefault(_updateMutation);

var _rangeSort = require('./util/rangeSort');

var _rangeSort2 = _interopRequireDefault(_rangeSort);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var converter = function converter() {
  var entity = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  var originalText = arguments[1];

  switch (entity.type) {
    case 'mergeTag':
      return '{{ ' + entity.data.prefix + '.' + entity.data.property + ' }}';
    case 'LINK':
      return '<a href="' + entity.data.url + '">' + originalText + '</a>';
    case 'IMAGE':
      return '<img src="' + entity.data.src + '"/>';
    default:
      return originalText;
  }
};

exports.default = function (block, entityMap) {
  var entityConverter = arguments.length <= 2 || arguments[2] === undefined ? converter : arguments[2];

  var resultText = block.text;

  if (block.hasOwnProperty('entityRanges') && block.entityRanges.length > 0) {
    var entities = block.entityRanges.sort(_rangeSort2.default);

    var styles = block.inlineStyleRanges;

    var _loop = function _loop(index) {
      var entityRange = entities[index];
      var entity = entityMap[entityRange.key];

      var originalText = resultText.substr(entityRange.offset, entityRange.length);

      var converted = entityConverter(entity, originalText) || originalText;

      var updateLaterMutation = function updateLaterMutation(mutation, mutationIndex) {
        if (mutationIndex >= index || mutation.hasOwnProperty('style')) {
          return (0, _updateMutation2.default)(mutation, entityRange.offset, entityRange.length, converted.length);
        }
        return mutation;
      };

      entities = entities.map(updateLaterMutation);
      styles = styles.map(updateLaterMutation);

      resultText = resultText.substring(0, entityRange.offset) + converted + resultText.substring(entityRange.offset + entityRange.length);
    };

    for (var index = 0; index < entities.length; index++) {
      _loop(index);
    }

    return Object.assign({}, block, {
      text: resultText,
      inlineStyleRanges: styles,
      entityRanges: entities
    });
  }

  return block;
};