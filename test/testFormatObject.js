define(['../lib/ssf'], function(ssf){
    return {
        'module': "Default Undefined Object",
        'tests': [
            ["Object Value",
            function(){
                assert.equal(ssf.format("@", {}), ({}).toString());
            }],
            ["Object Member", 
            function(){
                assert.equal(ssf.format("@a", {
                    'a': {},
                }), ({}).toString());
            }],
            ["Custom toString",
            function(){
                var obj = {};
                obj.toString = function() { return 'bla'; };
                assert.equal(ssf.format("@", obj), 'bla');
            }],
      
        ],
    };
});
