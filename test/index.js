var fs = require('fs');
var expect = require('chai').expect;
var assert = require('assert');

var ObjectDump = require('../index.js');
var _          = require('underscore');

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
  f : 'function',
  g : new Date()
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

  it('should return a string for any type', function(){
    assert.ok(_.isString(new ObjectDump(one).toString()));
    assert.ok(_.isString(new ObjectDump(two).toString()));
    assert.ok(_.isString(new ObjectDump(three).toString()));
    assert.ok(_.isString(new ObjectDump(4).toString()));
    assert.ok(_.isString(new ObjectDump('five').toString()));
  });

  it('takes an options hash, with prefix, suffix, and spacing', function(){
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

describe('ObjectDump#deepStringify', function () {
  var a = new ObjectDump(function(){ return 'test'; });
  var b = new ObjectDump({'a':[1, '2', {'3' : 3}, function(){ return 'test'; }], 'b':function(){ return 'test'; }});
  var resp = {'a':[1, '2', {'3' : 3}, 'function (){ return \'test\'; }'], 'b':'function (){ return \'test\'; }'};

  it('should stringify any functions, keeping javascript objects and arrays intact', function(){
    assert.equal(a.deepStringify(), "function (){ return 'test'; }");
    assert.deepEqual(b.deepStringify(), resp);
  });
});
