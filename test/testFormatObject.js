define(['../lib/ssf'], function(ssf){
    return {
        'module': "Default Undefined Object",
        'tests': [
            ["Object Value",
            function(){
                assert.equal(ssf.format("@o()", {}), ({}).toString());
            }],
            ["Object Member", 
            function(){
                assert.equal(ssf.format("@o(a)", {
                    'a': {},
                }), ({}).toString());
            }],
            ["Custom toString",
            function(){
                var obj = {};
                obj.toString = function() { return 'bla'; };
                assert.equal(ssf.format("@o()", obj), 'bla');
            }],
            
        // Static Tests
            ["Static format test",
            function(){
                var t = ssf.compile("@o()");
                assert.equal(t({}), ({}).toString());
                assert.equal(t([1,2,3]), ([1,2,3]).toString());
                
                var s = [];
                s.toString = function() { return 'bla'; };
                assert.equal(t(s), 'bla');
            }],
        ],
    };
});
