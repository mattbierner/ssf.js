define(['../lib/ssf'], function(ssf){
    return {
        'module': "Alignment Test",
        'tests': [
            ["Simple left alignment",
            function(){
                assert.equal(ssf.format("a@(a,-4)b", {'a': '1'}), "a1   b");
            }],
            ["Simple left alignment",
            function(){
                assert.equal(ssf.format("a@(a,4)b", {'a': '1'}), "a   1b");
            }],
            
            ["Too long left alignment",
            function(){
                assert.equal(ssf.format("a@(a,-4)b", {'a': 'ccccccc'}), "acccccccb");
            }],
            ["Too long right alignment",
            function(){
                assert.equal(ssf.format("a@(a,4)b", {'a': 'ccccccc'}), "acccccccb");
            }],
            
            ["No alignment",
            function(){
                assert.equal(ssf.format("a@(a,)b", {'a': '1'}), "a1b");
            }],
            ["Invalid alignment",
            function(){
                assert.equal(ssf.format("a@(a,c)b", {'a': '1'}), "a1b");
            }],
        ],
    };
});
