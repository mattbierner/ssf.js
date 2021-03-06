define(['../lib/ssf'], function(ssf){
    return {
        'module': "Default Number Formatter",
        'tests': [
            ["Top Level Number Value",
            function(){
                assert.equal(ssf.format("a@n()b", 1), "a1b");
            }],
            ["Basic decimal", 
            function(){
                assert.equal(ssf.format("@n()", 10), "10");
            }],
            ["Basic hex", 
            function(){
                assert.equal(ssf.format("@n()", 0xA), "10");
            }],
            ["Basic float", 
            function(){
                assert.equal(ssf.format("@n()", 3.14), "3.14");
            }],
            ["Precission", 
            function(){
                assert.equal(ssf.format("@n(:3)", 3), "003");
                assert.equal(ssf.format("@n(:1)", 3.14), "3.1");
                assert.equal(ssf.format("@n(:3)", 0xA), "010");
                
                var f = ssf.compile("@n(:3)");
                assert.equal(f(3), "003");
                assert.equal(f(3.14), "3.140");
            }],
            
        // Hex
            ["Simple hex", 
            function(){
                assert.equal(ssf.format("@n(:x)", 10), "a");
                assert.equal(ssf.format("@n(:x)", -10), "-a");
            }],
            ["Precission hex", 
            function(){
                assert.equal(ssf.format("@n(:x4)", 10), "000a");
                assert.equal(ssf.format("@n(:x4)", -10), "-000a");
            }],
            ["Hex from float", 
            function(){
                assert.equal(ssf.format("@n(:x2)", 10.14), "a.23");
                assert.equal(ssf.format("@n(:x8)", 255.125), "ff.20000000");

                assert.equal(ssf.format("@n(:x0)", 255.00), "ff");
                assert.equal(ssf.format("@n(:x3)", 10.00), "00a");

                assert.equal(ssf.format("@n(:x)", 10.144), "a.24");
            }],
            
        // Decimal
            ["Simple decimal", 
            function(){
                assert.equal(ssf.format("@n(:d)", 10), "10");
                assert.equal(ssf.format("@n(:d)", -10), "-10");
            }],
            ["Precission decimal", 
            function(){
                assert.equal(ssf.format("@n(:d4)", 10), "0010");
                assert.equal(ssf.format("@n(:d4)", -10), "-0010");
            }],
            ["Decimal from float, round down", 
            function(){
                assert.equal(ssf.format("@n(:d4)", 10.14), "0010");
            }],
            ["Decimal from float, round up", 
            function(){
                assert.equal(ssf.format("@n(:d4)", 9.99), "0010");
            }],
            
        //Float
            ["Simple float", 
            function(){
                assert.equal(ssf.format("@n(:f)", 3.14), "3.14");
                assert.equal(ssf.format("@n(:f)", -3.14), "-3.14");
            }],
            ["Precission float", 
            function(){
                assert.equal(ssf.format("@n(:f4)", 3.14), "3.1400");
                assert.equal(ssf.format("@n(:f4)", -3.14), "-3.1400");
                
                assert.equal(ssf.format("@n(:f0)", 3.14), "3");
                assert.equal(ssf.format("@n(:f0)", -3.14), "-3");
            }],
            ["Float from decimal", 
            function(){
                assert.equal(ssf.format("@n(:f4)", 10), "10.0000");
            }],
            
        // Exponential
            ["Simple exponential", 
            function(){
                assert.equal(ssf.format("@n(:e)", 3e+9), "3e+9");
                assert.equal(ssf.format("@n(:e)", -3e-9), "-3e-9");
            }],
            ["Precission exponential", 
            function(){
                assert.equal(ssf.format("@n(:e2)", 3e+9), "3.00e+9");
                assert.equal(ssf.format("@n(:e2)", 3.1199e+9), "3.12e+9");
                assert.equal(ssf.format("@n(:e0)", 3.1199e+9), "3e+9");
                
                assert.equal(ssf.format("@n(:e2)", -3e-9), "-3.00e-9");
                assert.equal(ssf.format("@n(:e2)", -3.1199e-9), "-3.12e-9");
                assert.equal(ssf.format("@n(:e0)", -3.1199e-9), "-3e-9");
            }],
            ["Exponential from decimal", 
            function(){
                assert.equal(ssf.format("@n(:e2)", 100), "1.00e+2");
            }],
            ["Exponential from float", 
            function(){
                assert.equal(ssf.format("@n(:e2)", 314.159), "3.14e+2");
                assert.equal(ssf.format("@n(:e2)", 314.159), "3.14e+2");
                
                assert.equal(ssf.format("@n(:e)", 314.159), "3.14159e+2");
            }],
            
        // Static tests
            ["Static type test",
            function(){
                var t = ssf.compile("@n()");
                assert.equal(t(1), '1');
                assert.equal(t("1aa"), '1');
                assert.equal(t("3.14aa"), '3.14');
            }],
        ],
    };
});
