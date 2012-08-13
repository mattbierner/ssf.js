define(['../lib/ssf'], function(ssf){
    return {
        'module': "Default Array Formatter",
        'tests': [
            ["Array Value",
            function(){
                assert.equal(ssf.format("abc@a()", ['d', 'e', 'f']), 'abcd,e,f');
            }],
            ["Array Member", 
            function(){
                assert.equal(ssf.format("a @a(a)", {
                    'a': ['d', 'e', 'f'],
                }), "a d,e,f");
            }],
            ["Array Element", 
            function(){
                assert.equal(ssf.format("a @a(0) @a(0) @a(1.a)", ['c', {'a': 'd'}]), "a c c d");
            }],
            ["Empty Array", 
            function(){
                assert.equal(ssf.format("a @a() b", []), "a  b");
            }],
            
            ["Format joiner", 
            function(){
                assert.equal(ssf.format("@a(:|)", ['a', 'b', 'c']), "a|b|c");
                assert.equal(ssf.format("@a(: )", ['a', 'b', 'c']), "a b c");
                assert.equal(ssf.format("@a(::)", ['a', 'b', 'c']), "a:b:c");

                assert.equal(ssf.format("@a(:[][])", ['a', 'b', 'c']), "a[]b[]c");
                assert.equal(ssf.format("@a(:[,][1,2])", ['a', 'b', 'c']), "a[1,2]b[1,2]c");
            }],
            
            ["Format start slice", 
            function(){
                assert.equal(ssf.format("@a(:[1])", ['a', 'b', 'c']), "b,c");
                assert.equal(ssf.format("@a(:[-1])", ['a', 'b', 'c']), "c");
                assert.equal(ssf.format("@a(:[4])", ['a', 'b', 'c']), "");
                
                assert.equal(ssf.format("@a(:[1] )", ['a', 'b', 'c']), "b c");
            }],
            ["Format end slice", 
            function(){
                assert.equal(ssf.format("@a(:[,1])", ['a', 'b', 'c']), "a");
                assert.equal(ssf.format("@a(:[,-1])", ['a', 'b', 'c']), "a,b");
                assert.equal(ssf.format("@a(:[,4])", ['a', 'b', 'c']), "a,b,c");
                
                assert.equal(ssf.format("@a(:[,2] )", ['a', 'b', 'c']), "a b");
            }],
            ["Format both slice", 
            function(){
                assert.equal(ssf.format("@a(:[1,2])", ['a', 'b', 'c']), "b");
                assert.equal(ssf.format("@a(:[-2,-1])", ['a', 'b', 'c']), "b");
                assert.equal(ssf.format("@a(:[1,4])", ['a', 'b', 'c']), "b,c");
                
                assert.equal(ssf.format("@a(:[1,4] )", ['a', 'b', 'c']), "b c");
            }],
            
        // Static Tests
            ["Static type test",
            function(){
                var t = ssf.compile("@a()");
                assert.equal(t(['a', 'b', 'c']), 'a,b,c');
                assert.equal(t({'0': 'a', '1': 'b', '2':'c', length:3}), 'a,b,c');
            }],
            
            ["Static format test",
            function(){
                var t = ssf.compile("@a(:[1,3]|)");
                assert.equal(t(['a', 'b', 'c']), 'b|c');
                assert.equal(t({'0': 'a', '1': 'b', '2':'c', length:3}), 'b|c');
            }],
            
        ],
    };
});
