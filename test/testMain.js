define(['../lib/ssf'], function(ssf){
    return {
        'module': "Main Tests",
        'tests': [
            ["Literal @ symbol",
            function(){
                assert.equal(ssf.format("@@ @(@)", {'@': '1'}), "@ 1");
            }],
            ["Simple replace",
            function(){
                assert.equal(ssf.format("ab-c- @a @b @(-c-,0:bla) a b -c-", {
                    'a': '1',
                    'b': '2',
                    '-c-': '3'}), "ab-c- 1 2 3 a b -c-");
            }],
            ["Path replace",
            function(){
                assert.equal(ssf.format("@a.b a b c @b.a", {
                    'a': {'b': '1'},
                    'b': {'a': '2'},
                    'c': {'c': '3'}}), "1 a b c 2");
            }],
            ["Top level literal",
            function(){
                assert.equal(ssf.format("abc @ a b c", "1"), "abc 1 a b c");
            }],
            ["Trailing period",
            function(){
                assert.equal(ssf.format("@a.@(a).", {'a': '1'}), "1.1.");
            }],
            ["@ Association",
            function(){
                assert.equal(ssf.format("@a@@c@b", {
                    'a': '1',
                    'b': '2',
                    'c': '3'}), "1@c2");
            }],
            ["@ Association With Paths",
            function(){
                assert.equal(ssf.format("@a.b@@c.c@b.a", {
                    'a': {'b': '1'},
                    'b': {'a': '2'},
                    'c': {'c': '3'}}), "1@c.c2");
            }],
            ["Parentheses Matching",
            function(){
                assert.equal(ssf.format("(@a) (@(b))", {
                    'a': '1',
                    'b': '2'}), "(1) (2)");
            }],
            ["Empty Key",
            function(){
                assert.equal(ssf.format("@()", 1), "1");
                assert.equal(ssf.format("@b..c @(a.) @(b..c)", {
                    '' : 4,
                    'a': {'': '1'},
                    'b': {'': {'c': '2'}}}), "2 1 2");
            }],
            
            ["Array value",
            function(){
                assert.equal(ssf.format("0 1 2 @0@1@2",
                    ['a', 'b', 'c']), '0 1 2 abc');
            }],
            
        // Custom formatters 
            ["Template specific formatter",
            function(){
                var t = ssf.compile("@", {
                    'formatterForUndefined': function() { return function(){ return "undefined"; } }
                })
                assert.equal(t(), 'undefined');
            }],
            
            ["Global formatter",
            function(){
                var old = ssf.defaults.formatterForUndefined;
                
                var t = ssf.compile("@")
                ssf.defaults.formatterForUndefined = function() { return function(){ return "undefined"; } }
                assert.equal(t(), '');
                assert.equal(ssf.format("@"), 'undefined');
                
                ssf.defaults.formatterForUndefined = old;
            }],
        ],
    };
});
