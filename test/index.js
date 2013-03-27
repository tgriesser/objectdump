
var ObjectDump = require('../index.js');
var _          = require('underscore');
var Backbone   = require('backbone');

var fs = require('fs');
var expect = require('chai').expect;
var assert = require('chai').assert;

// Object
var one = {
  a : function(){
    return 'a';
  },
  b : {
    b1 : 1,
    b2 : 2
  },
  "c" : [],
  d : ['a', 'b', 'c', function(){
    return 'a';
  }],
  e : undefined,
  f : 'function'
};

// Function
var two = function(){
  return function(){
    return 'success';
  };
};

// Array
var three = ['one', 'two', 3, function(){
  return 'four';
}];

describe('ObjectDump#toString', function(){

  it('the first argument should accept any type and return a string', function(){
    expect(new ObjectDump(one).toString()).to.be.a('string');
    expect(new ObjectDump(two).toString()).to.be.a('string');
    expect(new ObjectDump(three).toString()).to.be.a('string');
    expect(new ObjectDump(4).toString()).to.be.a('string');
    expect(new ObjectDump('five').toString()).to.be.a('string');
  });

  it('the toString argument takes an options hash, setting the prefix, suffix, and spacing', function(){
    var test = new ObjectDump(one).toString({
      prefix : 'var test = '
    });
    var err = new ObjectDump(one).toString(4);
    expect(test).to.be.a('string');
    expect(test.indexOf('var test =')).to.equal(0);
    expect(err.indexOf('4')).to.not.equal(0);
  });

  it('should provide a string which can be saved to a file', function(){
    return true;
  });

  describe('reading the output file back into a javascript object', function(done){
    
    var output;

    before(function(done){
      var dump = new ObjectDump(one).toString({
        prefix : 'exports.test = ',
        suffix : ';'
      });
      fs.writeFile(__dirname + '/output-test.js', dump, 'utf-8', function(){
        output = require('./output-test.js').test;
        done();
      });
    });

    after(function(done){
      fs.unlink(__dirname + '/output-test.js', function(){
        done();
      });
    });

    it('output.a should return "a"', function(){
      expect(output.a()).to.equal('a');
    });

    it('output.b should equal one.b', function(){
      assert.deepEqual(output.b, one.b);
    });

    it('output.c should be an empty array', function(){
      assert.deepEqual(output.c, one.c);
    });

    it('output.d should be an array equaling one.d', function(){
      var errors = 0;
      for (var i=0, l=one.d.length; i<l; i++) {
        if (typeof(one.d[i]) === 'function') {
          assert.equal(one.d[i](), output.d[i]());
        } else {
          assert.equal(one.d[i], output.d[i]);
        }
      }
      expect(errors).to.equal(0);
    });

    it('output.e should be undefined', function(){
      expect(output.e).to.be.an('undefined');
    });

    it('output.f should be a string equaling function', function(){
      expect(output.f).to.be.a('string');
    });

  });

});

describe('ObjectDump#deepStringify', function(){

  var a = new ObjectDump(function(){ return 'test'; })
  , b = new ObjectDump({'a':[1, '2', {'3' : 3}, function(){ return 'test'; }], 'b':function(){ return 'test'; }})
  , resp = {'a':[1, '2', {'3' : 3}, 'function (){ return \'test\'; }'], 'b':'function (){ return \'test\'; }'};

  it('should stringify any functions, keeping javascript objects and arrays intact', function(){
    expect(a.deepStringify()).to.equal("function (){ return 'test'; }");
    assert.deepEqual(b.deepStringify(), resp);
  });

});

describe('ObjectDump#extend', function () {

  it('Should allow the ObjectDump capabilities on other objects', function (done) {
    ObjectDump.extend(Backbone.Model);
    var m = new Backbone.Model();
    fs.writeFile(__dirname + '/backbone-1.0.js', 'module.exports = ' + m, function () {
      var bbModel = require('./backbone-1.0');
      assert.deepEqual(_.keys(bbModel), [ 'cid', 'attributes', '_changing', '_previousAttributes', 'changed', '_pending', 'on', 'once', 'off', 'trigger', 'stopListening', 'listenTo', 'listenToOnce', 'bind', 'unbind', 'validationError', 'idAttribute', 'initialize', 'toJSON', 'sync', 'get', 'escape', 'has', 'set', 'unset', 'clear', 'hasChanged', 'changedAttributes', 'previous', 'previousAttributes', 'fetch', 'save', 'destroy', 'url', 'parse', 'clone', 'isNew', 'isValid', '_validate', 'keys', 'values', 'pairs', 'invert', 'pick', 'omit', 'toString' ]);
      fs.unlink(__dirname + '/backbone-1.0.js', function () {
        done();
      });
    });

});
  
  

});