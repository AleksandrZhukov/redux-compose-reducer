'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var DELIMITER = '/';
var isDev = process.env.NODE_ENV !== 'production';
var namespacedActionType = function namespacedActionType(namespace, type) {
  return namespace === '' ? type : "" + namespace + DELIMITER + type;
};
var isObject = function isObject(o) {
  return o instanceof Object && !Array.isArray(o);
};
var isFunction = function isFunction(o) {
  return typeof o === 'function';
};
var createCapturedError = function createCapturedError(message, cst) {
  var error = new Error(message);
  if (cst && Error.captureStackTrace) Error.captureStackTrace(error, cst);
  return error;
};
var checkStateShape = function checkStateShape(next, prev, action) {
  var missingKeys = [];
  Object.keys(next).forEach(function (key) {
    if (key in prev) return;
    missingKeys.push(key);
  });

  if (missingKeys.length > 0) {
    console.warn("Reducer for action '" + action.type + "' produced new keys: [" + missingKeys.join(',') + "]");
  }
};

var createTypes = function createTypes(namespace, types) {
  if (types === void 0) {
    types = [];
  }

  if (Array.isArray(namespace)) {
    types = namespace;
    namespace = '';
  }

  if (typeof namespace !== 'string' || !Array.isArray(types) || types.length === 0) throw createError(ARGUMENT_ERROR);
  var result = {};
  types.forEach(function (type) {
    result[type] = namespacedActionType(namespace, type);
  });
  return result;
};

var createError = function createError(message) {
  return createCapturedError(message, createTypes);
};

var ARGUMENT_ERROR = 'Expected first argument to be a string (for namespaced actions) or non empty array (types)' + 'or/and second argument (types) to be a non empty array.';

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

var composeReducer = function composeReducer() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var _prepareParams = prepareParams(args),
      _prepareParams$namesp = _prepareParams.namespace,
      namespace = _prepareParams$namesp === void 0 ? '' : _prepareParams$namesp,
      types = _prepareParams.types,
      initialState = _prepareParams.initialState,
      _prepareParams$reduce = _prepareParams.reducers,
      reducers = _prepareParams$reduce === void 0 ? {} : _prepareParams$reduce,
      globalReducer = _prepareParams.globalReducer;

  if (types !== undefined && !isObject(types) || types === undefined && typeof namespace !== 'string' || !isObject(initialState) || !isObject(reducers) || globalReducer !== undefined && !isFunction(globalReducer)) throw createError$1(ARGUMENT_ERROR$1);
  var typeToReducerMap = types ? createMapFromTypes(types, reducers) : createMapFromNamespace(namespace, reducers);
  return function (state, action) {
    if (state === void 0) {
      state = initialState;
    }

    var reduce = typeToReducerMap[action.type];
    if (reduce) state = reduce(state, action);
    if (globalReducer) state = globalReducer(state, action);
    if (isDev) checkStateShape(state, initialState, action);
    return state;
  };
};

var prepareParams = function prepareParams(args) {
  if (typeof args[0] === 'string') {
    console.warn(DEPRICATED_API_WARNING);
    return {
      namespace: args[0],
      reducers: args[1],
      initialState: args[2],
      globalReducer: args[3]
    };
  }

  return args[0] || {};
};

var createMapFromTypes = function createMapFromTypes(types, reducers) {
  var result = {};
  Object.keys(reducers).forEach(function (key) {
    if (!(key in types)) throw createError$1("There is no '" + key + "' action type.");
    result[types[key]] = normalizeReducer(reducers[key]);
  });
  return result;
};

var createMapFromNamespace = function createMapFromNamespace(namespace, reducers) {
  var result = {};
  Object.keys(reducers).forEach(function (type) {
    result[namespacedActionType(namespace, type)] = normalizeReducer(reducers[type]);
  });
  return result;
};

var normalizeReducer = function normalizeReducer(reducer) {
  return isFunction(reducer) ? reducer : function (state) {
    return _extends({}, state, reducer);
  };
};

var ARGUMENT_ERROR$1 = "As argument expected object of shape : {\n  namespace: 'string',\n  types: 'object',\n  initialState: 'object',\n  reducers: 'object',\n  globalReducer: 'function'\n}.\nRequired keys: namespace or types, initialState.";
var DEPRICATED_API_WARNING = 'redux-compose-reducer#composeReducer: ' + 'Multiple arguments api is depricated and will be removed in future versions. ' + 'Please use object argument.';

var createError$1 = function createError(message) {
  return createCapturedError(message, composeReducer);
};

exports.createTypes = createTypes;
exports.composeReducer = composeReducer;
