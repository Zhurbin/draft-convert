'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _draftJs = require('draft-js');

var _encodeBlock = require('./encodeBlock');

var _encodeBlock2 = _interopRequireDefault(_encodeBlock);

var _convertEntity = require('./convertEntity');

var _convertEntity2 = _interopRequireDefault(_convertEntity);

var _blockInnerHTML = require('./blockInnerHTML');

var _blockInnerHTML2 = _interopRequireDefault(_blockInnerHTML);

var _defaultBlockHTML = require('./default/defaultBlockHTML');

var _defaultBlockHTML2 = _interopRequireDefault(_defaultBlockHTML);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import Immutable from 'immutable'; // eslint-disable-line no-unused-vars
var NESTED_BLOCK_TYPES = ['ordered-list-item', 'unordered-list-item'];

var defaultEntityToHTML = function defaultEntityToHTML(entity, originalText) {
  return originalText;
};

var convertToHTML = function convertToHTML(_ref) {
  var _ref$styleToHTML = _ref.styleToHTML;
  var styleToHTML = _ref$styleToHTML === undefined ? {} : _ref$styleToHTML;
  var _ref$blockToHTML = _ref.blockToHTML;
  var blockToHTML = _ref$blockToHTML === undefined ? {} : _ref$blockToHTML;
  var _ref$entityToHTML = _ref.entityToHTML;
  var entityToHTML = _ref$entityToHTML === undefined ? defaultEntityToHTML : _ref$entityToHTML;
  return function (contentState) {
    (0, _invariant2.default)(contentState !== null && contentState !== undefined, 'Expected contentState to be non-null');

    var blockHTML = Object.assign({}, _defaultBlockHTML2.default, blockToHTML);
    var rawState = (0, _draftJs.convertToRaw)(contentState);

    var listStack = [];

    var result = rawState.blocks.map(function (block) {
      var type = block.type;
      var depth = block.depth;


      var closeNestTags = '';
      var openNestTags = '';

      if (NESTED_BLOCK_TYPES.indexOf(type) === -1) {
        // this block can't be nested, so reset all nesting if necessary
        closeNestTags = listStack.reduceRight(function (string, nestType) {
          return string + blockHTML[nestType].nestEnd;
        }, '');
        listStack = [];
      } else {
        while (depth + 1 !== listStack.length || type !== listStack[depth]) {
          if (depth + 1 === listStack.length) {
            // depth is right but doesn't match type
            var typeToClose = listStack[depth];
            closeNestTags += blockHTML[typeToClose].nestEnd;
            openNestTags += blockHTML[type].nestStart;
            listStack[depth] = type;
          } else {
            if (depth + 1 < listStack.length) {
              var _typeToClose = listStack[listStack.length - 1];
              closeNestTags += blockHTML[_typeToClose].nestEnd;
              listStack = listStack.slice(0, -1);
            } else {
              openNestTags += blockHTML[type].nestStart;
              listStack.push(type);
            }
          }
        }
      }

      var innerHTML = (0, _blockInnerHTML2.default)((0, _convertEntity2.default)((0, _encodeBlock2.default)(block), rawState.entityMap, entityToHTML), styleToHTML);

      var html = blockHTML[type].start + innerHTML + blockHTML[type].end;
      if (innerHTML.length === 0 && blockHTML[type].hasOwnProperty('empty')) {
        html = blockHTML[type].empty;
      }

      return closeNestTags + openNestTags + html;
    }).join('');

    result = listStack.reduce(function (res, nestType) {
      return res + blockHTML[nestType].nestEnd;
    }, result);

    return result;
  };
};

exports.default = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  if (args.length === 1 && args[0].hasOwnProperty('_map') && args[0].getBlockMap != null) {
    // skip higher-order function and use defaults
    return convertToHTML({}).apply(undefined, args);
  }

  return convertToHTML.apply(undefined, args);
};