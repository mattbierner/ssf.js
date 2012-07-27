define(['../lib/ssf'], function(ssf){
    return {
        'module': "Default Number Formatter",
        'tests': [
            ["Top Level Number Value",
            function(){
                assert.equal(ssf.format("a@()b", 1), "a1b");
            }],
            ["Basic decimal", 
            function(){
                assert.equal(ssf.format("@()", 10), "10");
            }],
            ["Basic hex", 
            function(){
                assert.equal(ssf.format("@()", 0xA), "10");
            }],
            ["Basic float", 
            function(){
                assert.equal(ssf.format("@()", 3.14), "3.14");
            }],
            ["Precission", 
            function(){
                assert.equal(ssf.format("@(:3)", 3), "003");
                assert.equal(ssf.format("@(:1)", 3.14), "3.1");
                assert.equal(ssf.format("@(:3)", 0xA), "010");
                
                var f = ssf.compile("@(:3)");
                assert.equal(f(3), "003");
                assert.equal(f(3.14), "3.140");
            }],
            
        // Hex
            ["Simple hex", 
            function(){
                assert.equal(ssf.format("@(:x)", 10), "a");
                assert.equal(ssf.format("@(:x)", -10), "-a");
            }],
            ["Precission hex", 
            function(){
                assert.equal(ssf.format("@(:x4)", 10), "000a");
                assert.equal(ssf.format("@(:x4)", -10), "-000a");
            }],
            ["Hex from float", 
            function(){
                assert.equal(ssf.format("@(:x2)", 10.14), "a.23");
            }],
            
        // Decimal
            ["Simple decimal", 
            function(){
                assert.equal(ssf.format("@(:d)", 10), "10");
                assert.equal(ssf.format("@(:d)", -10), "-10");
            }],
            ["Precission decimal", 
            function(){
                assert.equal(ssf.format("@(:d4)", 10), "0010");
                assert.equal(ssf.format("@(:d4)", -10), "-0010");
            }],
            ["Decimal from float, round down", 
            function(){
                assert.equal(ssf.format("@(:d4)", 10.14), "0010");
            }],
            ["Decimal from float, round up", 
            function(){
                assert.equal(ssf.format("@(:d4)", 9.99), "0010");
            }],
            
        //Float
            ["Simple float", 
            function(){
                assert.equal(ssf.format("@(:f)", 3.14), "3.14");
                assert.equal(ssf.format("@(:f)", -3.14), "-3.14");
            }],
            ["Precission float", 
            function(){
                assert.equal(ssf.format("@(:f4)", 3.14), "3.1400");
                assert.equal(ssf.format("@(:f4)", -3.14), "-3.1400");
                
                assert.equal(ssf.format("@(:f0)", 3.14), "3");
                assert.equal(ssf.format("@(:f0)", -3.14), "-3");
            }],
            ["Float from decimal", 
            function(){
                assert.equal(ssf.format("@(:f4)", 10), "10.0000");
            }],
            
        // Exponential
            ["Simple exponential", 
            function(){
                assert.equal(ssf.format("@(:e)", 3e+9), "3e+9");
                assert.equal(ssf.format("@(:e)", -3e-9), "-3e-9");
            }],
            ["Precission exponential", 
            function(){
                assert.equal(ssf.format("@(:e2)", 3e+9), "3.00e+9");
                assert.equal(ssf.format("@(:e2)", 3.1199e+9), "3.12e+9");
                assert.equal(ssf.format("@(:e0)", 3.1199e+9), "3e+9");
                
                assert.equal(ssf.format("@(:e2)", -3e-9), "-3.00e-9");
                assert.equal(ssf.format("@(:e2)", -3.1199e-9), "-3.12e-9");
                assert.equal(ssf.format("@(:e0)", -3.1199e-9), "-3e-9");
            }],
            ["Exponential from decimal", 
            function(){
                assert.equal(ssf.format("@(:e2)", 100), "1.00e+2");
            }],
            ["Exponential from float", 
            function(){
                assert.equal(ssf.format("@(:e2)", 314.159), "3.14e+2");
                assert.equal(ssf.format("@(:e2)", 314.159), "3.14e+2");
            }],
        ],
    };
});
