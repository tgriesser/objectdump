//    Objectdump
//    Turns an object into something we can save to a file...
//    https://github.com/tgriesser/objectdump
//    @author   Tim Griesser
//    @license  MIT

var _ = require('underscore');
var funcRegex = /function\s?\(/;

var ObjectDump = function(input) {
  this.input = input;
  this.functionCache = {};
};

_.extend(ObjectDump.prototype, {

  // The output of the "ObjectDump"
  out : null,

  // The string to prefix the object with
  prefix : '',

  // The string to suffix the object with
  suffix : '',

  // The input string
  input : null,

  // The depth of indentation for each object level
  spacing : 2,

  // Caches the unique function placeholder
  uniqFn : function(obj) {
    var uniq = _.uniqueId('%%objectdump');
    this.functionCache[uniq] = obj;
    return uniq;
  },

  // Checks the type of the string
  dumpString : function(obj) {
    if (obj === void 0) return 'undefined';
    if (_.isDate(obj)) return 'new Date()';
    if (_.isFunction(obj)) return this.uniqFn(obj.toString());
    if (_.isArray(obj)) return this.dumpArr(obj);
    if (_.isString(obj))
      return funcRegex.test(obj) ? this.uniqFn(obj) : '"' + obj.replace(/\"/g, '\\"') + '"';
    if (_.isObject(obj)) return this.dumpObj(obj);
    return (obj ? obj.toString() : '%%objectdumpisNull');
  },

  // Formats the string by spacing after newlines
  prepDump : function(obj) {
    return this.dumpString(obj).replace(/\n/g, "\n" + repeat(' ', this.spacing));
  },

  // Dumps the current object to a string
  dumpObj : function(obj) {
    var stack, k;
    stack = [];
    for (k in obj) {
      stack.push(repeat(" ", this.spacing) + this.dumpString(k) + ': '+ this.prepDump(obj[k]));
    }
    return '{' + "\n" + stack.join(",\n") + "\n}";
  },

  // Ensure each item in the array is output properly
  dumpArr : function(arr) {
    var stack;
    stack = [];
    for (var i=0, l=arr.length; i<l; i++) {
      stack.push(this.dumpString(arr[i]));
    }
    return '[' + stack.join(',') + ']';
  },

  // Ensure all functions are converted to string
  deepStringify : function(input) {
    var obj = (input || this.input);
    if (_.isFunction(obj)) return obj.toString();
    if (_.isObject(obj) || _.isArray(obj)) {
      return _.reduce(obj, function(memo, value, key) {
        if (_.isFunction(value)) {
          memo[key] = value.toString();
        } else if (_.isObject(value) || _.isArray(value)) {
          memo[key] = this.deepStringify(value);
        }
        return memo;
      }, obj, this);
    }
  },

  // Render the output of the function
  toString : function(options) {
    _.defaults(options || (options = {}), {
      prefix: '',
      suffix: ''
    });
    if (_.isNumber(options.spacing)) this.spacing = options.spacing;
    var dump = this;
    var out = _.result(options, 'prefix') + 
      this.dumpString(this.input).replace(/(%%objectdump[0-9]+)/g, function(item) {
        return dump.functionCache[item];
      }).replace(/%%objectdumpisNull/g, null) + _.result(this, 'suffix');

    return out;
  }

});

// Mixin the ObjectDump's `toString` into to another object
ObjectDump.extend = function (Target) {
  var target = (Target.prototype ? Target.prototype : Target);
  target.toString = function (options) {
    return new ObjectDump(this).toString(options);
  };
};

// Simple repetition of an item.
var repeat = function(pattern, count) {
  if (count < 1) return '';
  var result = '';
  while (count > 0) {
    if (count & 1) result += pattern;
    count >>= 1, pattern += pattern;
  }
  return result;
};

module.exports = ObjectDump;
