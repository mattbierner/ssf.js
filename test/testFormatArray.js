define(['../lib/ssf'], function(ssf){
    return {
        'module': "Default Array Formatter",
        'tests': [
            ["Array Value",
            function(){
                assert.equal(ssf.format("abc@", ['d', 'e', 'f']), 'abcd,e,f');
            }],
            ["Array Member", 
            function(){
                assert.equal(ssf.format("a @a", {
                    'a': ['d', 'e', 'f'],
                }), "a d,e,f");
            }],
            ["Array Element", 
            function(){
                assert.equal(ssf.format("a @0 @(0) @1.a", ['c', {'a': 'd'}]), "a c c d");
                assert.equal(ssf.format("a@1@(-1)", []), "a");
            }],
            ["Empty Array", 
            function(){
                assert.equal(ssf.format("a @ b", []), "a  b");
            }],
            
            ["Format joiner", 
            function(){
                assert.equal(ssf.format("@(:|)", ['a', 'b', 'c']), "a|b|c");
                assert.equal(ssf.format("@(: )", ['a', 'b', 'c']), "a b c");
                assert.equal(ssf.format("@(::)", ['a', 'b', 'c']), "a:b:c");

                assert.equal(ssf.format("@(:[][])", ['a', 'b', 'c']), "a[]b[]c");
                assert.equal(ssf.format("@(:[,][1,2])", ['a', 'b', 'c']), "a[1,2]b[1,2]c");
            }],
            
            ["Format start slice", 
            function(){
                assert.equal(ssf.format("@(:[1])", ['a', 'b', 'c']), "b,c");
                assert.equal(ssf.format("@(:[-1])", ['a', 'b', 'c']), "c");
                assert.equal(ssf.format("@(:[4])", ['a', 'b', 'c']), "");
                
                assert.equal(ssf.format("@(:[1] )", ['a', 'b', 'c']), "b c");
            }],
            ["Format end slice", 
            function(){
                assert.equal(ssf.format("@(:[,1])", ['a', 'b', 'c']), "a");
                assert.equal(ssf.format("@(:[,-1])", ['a', 'b', 'c']), "a,b");
                assert.equal(ssf.format("@(:[,4])", ['a', 'b', 'c']), "a,b,c");
                
                assert.equal(ssf.format("@(:[,2] )", ['a', 'b', 'c']), "a b");
            }],
            ["Format both slice", 
            function(){
                assert.equal(ssf.format("@(:[1,2])", ['a', 'b', 'c']), "b");
                assert.equal(ssf.format("@(:[-2,-1])", ['a', 'b', 'c']), "b");
                assert.equal(ssf.format("@(:[1,4])", ['a', 'b', 'c']), "b,c");
                
                assert.equal(ssf.format("@(:[1,4] )", ['a', 'b', 'c']), "b c");
            }],
            
        ],
    };
});
