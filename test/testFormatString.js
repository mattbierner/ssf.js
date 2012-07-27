define(['../lib/ssf'], function(ssf){
    return {
        'module': "Default String Formatter",
        'tests': [
            ["String Value",
            function(){
                assert.equal(ssf.format("abc@", "defg"), 'abcdefg');
            }],
            ["String Member", 
            function(){
                assert.equal(ssf.format("a @a", {
                    'a': "bla",
                }), "a bla");
            }],
            ["Empty String", 
            function(){
                assert.equal(ssf.format("a @a b", ""), "a  b");
            }],
            
            ["Format start slice", 
            function(){
                assert.equal(ssf.format("@(:[1])", "abc"), "bc");
                assert.equal(ssf.format("@(:[-1])", "abc"), "c");
                assert.equal(ssf.format("@(:[4])", "abc"), "");
            }],
            ["Format end slice", 
            function(){
                assert.equal(ssf.format("@(:[,1])", "abc"), "a");
                assert.equal(ssf.format("@(:[,-1])", "abc"), "ab");
                assert.equal(ssf.format("@(:[,4])", "abc"), "abc");
            }],
            ["Format both slice", 
            function(){
                assert.equal(ssf.format("@(:[1,2])", "abc"), "b");
                assert.equal(ssf.format("@(:[-2,-1])", "abc"), "b");
                assert.equal(ssf.format("@(:[1,4])", "abc"), "bc");
            }],
            
        ],
    };
});
