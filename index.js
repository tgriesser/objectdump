
/**
 * Turns an object into something we can save to a file...
 * https://github.com/tgriesser/objectdump
 * @author   Tim Griesser
 * @license  MIT
 */

/*jshint curly:false, eqnull:true, strict:false, node:true, laxcomma:true, white:false*/
/*global require:false exports:false */

var _ = require('underscore');

function ObjectDump(input) {
  this.input = input;
}

// Simple repetition of an item
ObjectDump.repeat = function(pattern, count) {
  if (count < 1) return '';
  var result = '';
  while (count > 0) {
    if (count & 1) result += pattern;
    count >>= 1, pattern += pattern;
  }
  return result;
};

_.extend(ObjectDump.prototype, {

  // The output of the ObjectDump
  out : null

  // The string to prefix the object with
  , prefix : ''

  // The string to suffix the object with
  , suffix : ''

  // The input string
  , input : null

  // The depth of indentation for each object level
  , spacing : 2

  // Checks the type of the string
  , dumpString : function(obj) {
    if (obj === void 0) return 'undefined';
    if (_.isFunction(obj)) return obj.toString();
    if (_.isArray(obj)) return this.dumpArr(obj);
    if (_.isString(obj))
      return obj.indexOf('function') !== -1 ? obj : '"' + obj.replace(/\"/g, '\\"') + '"';
    if (_.isObject(obj)) return this.dumpObj(obj);
    return obj.toString();
  }

  // Dumps the current object to a string
  , dumpObj : function(obj) {
    var stack, k;
    stack = [];
    for (k in obj) {
      stack.push(
        ObjectDump.repeat(" ", this.spacing) + this.dumpString(k) + ': '+ this.dumpString(obj[k]).replace(/\n/g, "\n" + ObjectDump.repeat(' ', this.spacing)));
    }
    return '{' + "\n" + stack.join(",\n") + "\n}";
  }

  // Ensure each item in the array is output properly
  , dumpArr : function(arr) {
    var stack;
    stack = [];
    for (var i=0, l=arr.length; i<l; i++) {
      stack.push(this.dumpString(arr[i]));
    }
    return '[' + stack.join(',') + ']';
  }

  // Ensure all functions are converted to string
  , deepStringify : function(input) {
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
  }

  // Render the output of the function
  , render : function(options) {
    options = (options || {});
    if (_.isString(options.prefix)) this.prefix = options.prefix;
    if (_.isString(options.suffix)) this.suffix = options.suffix;
    if (_.isNumber(options.spacing)) this.spacing = options.spacing;

    return this.prefix + this.dumpString(this.input) + this.suffix;
  }

});


module.exports = ObjectDump;
