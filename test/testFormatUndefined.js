define(['../lib/ssf'], function(ssf){
    return {
        'module': "Default Undefined Formatter",
        'tests': [
            ["Undefined Value",
            function(){
                assert.equal(ssf.format("0@(a.b.c)1@(c)2@(0)@1@()"), '012');
            }],
            ["Undefined Member", 
            function(){
                assert.equal(ssf.format("a@z@a.0", {
                    'a': 1,
                    'b' : 3.14
                }), "a");
            }],
        ],
    };
});
