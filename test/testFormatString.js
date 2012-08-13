define(['../lib/ssf'], function(ssf){
    return {
        'module': "Default String Formatter",
        'tests': [
            ["String Value",
            function(){
                assert.equal(ssf.format("abc@s()", "defg"), 'abcdefg');
            }],
            ["String Member", 
            function(){
                assert.equal(ssf.format("a @s(a)", {
                    'a': "bla",
                }), "a bla");
            }],
            ["Empty String", 
            function(){
                assert.equal(ssf.format("a @s() b", ""), "a  b");
            }],
            
            ["Format start slice", 
            function(){
                assert.equal(ssf.format("@s(:[1])", "abc"), "bc");
                assert.equal(ssf.format("@s(:[-1])", "abc"), "c");
                assert.equal(ssf.format("@s(:[4])", "abc"), "");
            }],
            ["Format end slice", 
            function(){
                assert.equal(ssf.format("@s(:[,1])", "abc"), "a");
                assert.equal(ssf.format("@s(:[,-1])", "abc"), "ab");
                assert.equal(ssf.format("@s(:[,4])", "abc"), "abc");
            }],
            ["Format both slice", 
            function(){
                assert.equal(ssf.format("@s(:[1,2])", "abc"), "b");
                assert.equal(ssf.format("@s(:[-2,-1])", "abc"), "b");
                assert.equal(ssf.format("@s(:[1,4])", "abc"), "bc");
            }],
            
        // Static tests
            ["Static type test",
            function(){
                var t = ssf.compile("@s()");
                assert.equal(t('abc'), 'abc');
                assert.equal(t({}), ({}).toString());
            }],
            
            ["Static options test",
            function(){
                var t = ssf.compile("@s(:[1,6])");
                assert.equal(t('abc'), 'bc');
                assert.equal(t({}), ({}).toString().slice(1, 6));
            }],
        ],
    };
});
