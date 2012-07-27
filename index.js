
/**
 * Turns an object into something we can save to a file...
 * @author  - Tim Griesser
 * @license - MIT
 * @link - https://github.org/tgriesser/objectdump
 */
_ = require('underscore');

var ObjectDump = function(input, options) {
  options = (options || {})
  if (_.isNumber(options.spacing)) this.spacing = options.spacing;
  if (_.isString(options.prefix)) this.prefix = options.prefix;
  if (_.isString(options.suffix)) this.suffix = options.suffix;
  this.out = this.dumpString(input);
}

_.extend(ObjectDump.prototype, {

  // The output of the ObjectDump
  out : null,

  // The string to prefix the object with
  prefix : '',

  // The string to suffix the object with
  suffix : '',

  // The depth of indentation for each object level
  spacing : 2,

  // Checks the type of the string
  dumpString : function(obj) {
    if (_.isFunction(obj)) return obj.toString();
    if (_.isArray(obj)) return this.dumpArr(obj);
    if (_.isString(obj))
      return obj.indexOf('function') !== -1 ? obj : '"' + obj.replace(/\"/g, '\\"') + '"';
    if (_.isObject(obj)) return this.dumpObj(obj);
    return obj.toString();
  },

  // Dumps the current object to a string
  dumpObj : function(obj) {
    var stack, k;
    stack = [];
    for (k in obj) {
      stack.push(
        this.repeat(" ", this.spacing) 
        + this.dumpString(k) + ': '
        + this.dumpString(obj[k]).replace(/\n/g, "\n" + this.repeat(' ', this.spacing)))
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

  // Simple repetition of an item
  repeat : function(pattern, count) {
    if (count < 1) return '';
    var result = '';
    while (count > 0) {
      if (count & 1) result += pattern;
      count >>= 1, pattern += pattern;
    }
    return result;
  },

  // Render the output of the function
  render : function() {
    return this.prefix + this.out + this.suffix;
  }

});

exports.ObjectDump = ObjectDump;
exports.objectDump = function(arg, options) {
  return new ObjectDump(arg, options).render();
};
