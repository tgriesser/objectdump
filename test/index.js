/*jshint curly:false, eqnull:true, node:true, laxcomma:true, white:false*/
/*global it:false describe:false before:false after:false */

"use strict";

var ObjectDump = require('../index.js')
, fs = require('fs')
, expect = require('chai').expect
, assert = require('chai').assert;

// Object
var one = {
  a : function(){
    return 'a';
  }
  , b : {
    b1 : 1
    , b2 : 2
  },
  "c" : [],
  d : ['a', 'b', 'c', function(){
    return 'a';
  }],
  e : undefined
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

describe('ObjectDump().render()', function(){

  it('the first argument should accept any type and return a string', function(){
    expect(new ObjectDump(one).render()).to.be.a('string');
    expect(new ObjectDump(two).render()).to.be.a('string');
    expect(new ObjectDump(three).render()).to.be.a('string');
    expect(new ObjectDump(4).render()).to.be.a('string');
    expect(new ObjectDump('five').render()).to.be.a('string');
  });

  it('the render argument takes an options hash, setting the prefix, suffix, and spacing', function(){
    var test = new ObjectDump(one).render({
      prefix : 'var test = '
    });
    var err = new ObjectDump(one).render(4);
    expect(test).to.be.a('string');
    expect(test.indexOf('var test =')).to.equal(0);
    expect(err.indexOf('4')).to.not.equal(0);
  });

  it('should provide a string which can be saved to a file', function(){
    return true;
  });

  describe('reading the output file back into a javascript object', function(done){
    var output
    , dump = new ObjectDump(one).render({
      prefix : 'exports.test = ',
      suffix : ';'
    });

    before(function(done){
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
  });

});

describe('ObjectDump().deepStringify()', function(){

  var a = new ObjectDump(function(){ return 'test'; })
  , b = new ObjectDump({'a':[1, '2', {'3' : 3}, function(){ return 'test'; }], 'b':function(){ return 'test'; }})
  , resp = {'a':[1, '2', {'3' : 3}, 'function (){ return \'test\'; }'], 'b':'function (){ return \'test\'; }'};

  it('should stringify any functions, keeping javascript objects and arrays intact', function(){
    expect(a.deepStringify()).to.equal("function (){ return 'test'; }");
    assert.deepEqual(b.deepStringify(), resp);
  });

});

describe('ObjectDump.repeat()', function(){
  
  it('takes two arguments, the pattern to be repeated and the number of repetitions', function(){
    expect(ObjectDump.repeat('t', 5)).to.equal('ttttt');
  });

});

