
var objectDump = require('../index.js').objectDump
, ObjectDump = require('../index.js').ObjectDump
, fs = require('fs')
, expect = require('chai').expect
, assert = require('chai').assert
, should = require('should');

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
  }]
};

// Function
var two = function(){
  return function(){
    return 'success';
  }
};

// Array
var three = ['one', 'two', 3, function(){
  return 'four';
}];

describe('objectDump', function(){

  it('the first argument should accept any type and return a string', function(){
    expect(objectDump(one)).to.be.a('string')
    expect(objectDump(two)).to.be.a('string')
    expect(objectDump(three)).to.be.a('string')
    expect(objectDump(4)).to.be.a('string')
    expect(objectDump('five')).to.be.a('string')
  });

  it('the second argument takes an options hash, setting the prefix, suffix, and spacing', function(){
    var test = objectDump(one, {
      prefix : 'var test = '
    });
    var err = objectDump(one, 4);
    expect(test).to.be.a('string');
    expect(test.indexOf('var test =')).to.equal(0);
    expect(err.indexOf('4')).to.not.equal(0)
  })

  it('should provide a string which can be saved to a file', function(){
    return true;
  });

  describe('reading the output file back into a javascript object', function(done){
    var output
    , dump = objectDump(one, {
      prefix : 'exports.test = ',
      suffix : ';'
    });

    before(function(done){
      fs.writeFile(__dirname + '/output-test.js', dump, 'utf-8', function(){
        output = require('./output-test.js').test;
        done();
      })
    })

    after(function(done){
      fs.unlink(__dirname + '/output-test.js', function(){
        done();
      })
    })

    it('output.a should return "a"', function(){
      expect(output.a()).to.equal('a')
    })

    it('output.b should equal one.b', function(){
      assert.deepEqual(output.b, one.b)
    })

    it('output.c should be an empty array', function(){
      assert.deepEqual(output.c, one.c)
    })

    it('output.d should be an array equaling one.d', function(){
      var errors = 0;
      for (var i=0, l=one.d.length; i<l; i++) {
        if (typeof(one.d[i]) === 'function') {
          assert.equal(one.d[i](), output.d[i]())
        } else {
          assert.equal(one.d[i], output.d[i])
        }
      }
      expect(errors).to.equal(0)
    })
  });

});

describe('ObjectDump', function(){
  var a = new ObjectDump(one);
  var b = new ObjectDump('one', {
    'prefix' : 'name',
    'suffix' : ';',
    'spacing' : 4
  });
  
  it('is a constructor', function(){
    if ((a instanceof ObjectDump) !== true) {
      throw new Error("ObjectDump is not a constructor");
    }
  });
  
  it('has a property out, a string containing the output', function(){
    expect(a.out).to.be.a('string');
  });

  it('has a property prefix, a string containing the prefix to the object', function(){
    expect(a.prefix).to.equal('');
    expect(b.prefix).to.equal('name');
  });

  it('has a property suffix, a string containing the prefix to the object', function(){
    expect(a.suffix).to.equal('');
    expect(b.suffix).to.equal(';');
  });

  it('has a property spacing, equal to the third argument, defaulting to 2', function(){
    expect(a.spacing).to.equal(2);
    expect(b.spacing).to.equal(4);
  });
  
  describe('#repeat', function(){
    it('takes two arguments, the pattern to be repeated and the number of repetitions', function(){
      expect(a.repeat('t', 5)).to.equal('ttttt');
    });
  });

});
