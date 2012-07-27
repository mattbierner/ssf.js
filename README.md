# SSF.js - Simple Javascript String Formatting #

## About ##
SSF.js is string formatting designed for Javascript. It uses a simple formatting
syntax, can format any Javascript object.

    ssf.format("Hello @", "world") -> "Hello world"
    
    // Formatting from an object.
    ssf.format("Member['a']:@a Member['c']['d']:@c.d", {'a':1, 'c': {'d': 2}}) -> "Member['a']:1 Member['c']['d']:2"
    
    // Formatting from an array.
    ssf.format("Array[0]:@0 Array[1]:@1", ['A', 3]) -> "Array[0]:A Array[1]:3"

SSf also supports 'compiled' template functions, custom formatting logic (both
globally and per formatter), and string alignment. A simple set of default data
formatters is included.


# Using SSF #
SSF support being used as both an AMD type module or in the global scope.

## With AMD ##
Include any AMD style module loader and load SSF for usage.

    <!DOCTYPE html>
    <html>
    <head></head>
    <body>
        <script type="application/javascript" src="require.js"></script>
        <script type="application/javascript">
            require(['ssf'], function(ssf) {
                alert(ssf.format("Hello @", "world"));
            });
        </script>
    </body>

## Global ##
Include SSF file directly and use global to access it.

    <!DOCTYPE html>
    <html>
    <head></head>
    <body>
        <script type="application/javascript" src="ssf.js"></script>
        <script type="application/javascript">
            alert(ssf.format("Hello @", "world"));
        </script>
    </body>


# SSF Overview #

## Formatting Syntax ##

SSF format tokens come in two flavors, simple and expanded. The expanded syntax
can express any simple token and allows alignment and formatter options. The
two can be mixed and matched in the same statement.


### Simple Syntax ###
Simple tokens are of the form '@PATH' where PATH is a period delineated path
like one written in unquoted Javascript code.

    ssf.format("@a", input) -> PATH = input.a
    ssf.format("@$.0.c._", input) -> PATH = input.$.0.c._
    ssf.format("@a.", input) -> PATH = input.a

The path is always relative to the input data. Note in the last example, simple
tokens do not capture trailing periods.

        ssf.format("Hi @a. How are you?", {'a': 'Bill'}) -> "Hi Bill. How are you?"

Simple syntax tokens can also be next to one another.

    ssf.format("@0@1@2", ['a', 'b', 'c']) -> "abc"

### Expanded Syntax ###
Expanded tokens are of the form '@(PATH,ALIGNMENT:FORMAT)'. Both ALIGNMENT and
FORMAT are optional.

    ssf.format("@(a)", input) -> PATH = input.a
    ssf.format("@(a,3)", input) -> PATH = input.a, ALIGNMENT = 3
    ssf.format("@(a:f2)", input) -> PATH = input.a, FORMAT = f2
    ssf.format("@(a,3:f2)", input) -> PATH = input.a, ALIGNMENT = 3, FORMAT = f2

Extended syntax tokens are useful when you want to control the delineation of 
a token

    ssf.format("input.@(a).c.d", {'a': 1}) -> "input.1.c.d"

PATH is a period delineated set or characters, like a path 
written using Javascript's square bracket notation. PATH may contain special 
characters and whitespace.

    ssf.format("@( )", input) -> PATH = input[' ']
    ssf.format("@(++.--)", input) -> PATH = input['++']['--']
    ssf.format("@('  '.@)", input) -> PATH = input["'  '"]['@']
    ssf.format("@(a.)", input) -> PATH = input['a']['']

Note that in the last example, the trailing period means that there is an extra
lookup for an empty string.


### Top Level Object ###
Use either '@' or '@()' to acces the top level input object. The expanded
syntax allows you specify alignment and a format string for the top level object.

    ssf.format("@ @()", "top") -> "top top"
    ssf.format("@(,4:x2)", 10) -> "0a  "
    

### Literal @ Symbol ###
Use '@@' to output a literal '@' symbol.

    ssf.format("@@") -> "@@"

Only '@@' will generate a literal '@'. '@(@)' will lookup the '@' member in the
data object.

    ssf.format("@(@)", {'@': 3}) -> "3"

## 'Compiled' Formatters ##
If a program calls format multiple times with the same format string,
consider using a 'compiled' template function instead. 

    var formatter = ssf.compile("Hello @");
    formatter("world") -> "Hello world"
    formatter(3) -> "Hello 3"

As this example demonstrates, compiled template use dynamic typing and react
correctly when differnt object types are passed in.

Template functions also can use custom options and capture global options when
the template is created.

    var formatter = ssf.compile("Hello @", {
        'formatterForUndefined': function() { return function() { return "undefined"}; }
    });
    ssf.format("Hello @", undefined) -> "Hello "
    formatter(undefined) -> "Hello undefined"

    var formatter = ssf.compile("@")
    ssf.defaults.formatterForUndefined = function() { return function(){ return "undefined"; } }
    formatter(undefined) -> ""
    ssf.format("@", undefined) -> "undefined"


# Default Formatters #
A simple set of default formatters are provided with SSF. Custom Formatters also
demonstrates writting a custom formatter.

## Undefined Formatter ##
Returns an empty string in all cases.

    ssf.format("@", undefined) -> ""

## Number Formatter ##
Accepts format strings of the form "(d|f|e|x)PRECISION". Both values are optional.
PRECISION is a positive integer.
The first value is the output number type: 

### 'd' ###
Outputs a decimal number. If specified, PRECISION is the minimum number of digits
to output.

    ssf.format("@(:d)", 10) -> "10"
    ssf.format("@(:d)", -10) -> "-10"
    ssf.format("@(:d4)", 10) -> "0010"
    ssf.format("@(:d4)", 10.14) -> "0010"
    ssf.format("@(:d4)", 9.99) -> "0010"

### f ###
Outputs a fixed pointer number. If specified, PRECISION is the number of digits
after the decimal place. Default PRECISION is 2.

    ssf.format("@(:f)", 3.14) -> "3.14"
    ssf.format("@(:f)", -3.14) -> "-3.14"
    ssf.format("@(:f4)", 3.14) -> "3.1400"
    ssf.format("@(:f0)", 3.14) -> "3"
    ssf.format("@(:f4)", 10) -> "10.0000"

### e ###
Output a number in scientific notation. If specified, PRECISION is the number
of digits after the decimal place. 

    ssf.format("@(:e)", 3e+9) -> "3e+9"
    ssf.format("@(:e)", -3e-9) -> "-3e-9"
    ssf.format("@(:e2)", 3e+9) -> "3.00e+9"
    ssf.format("@(:e2)", 3.1199e+9) -> "3.12e+9"
    ssf.format("@(:e0)", 3.1199e+9) -> "3e+9"
    ssf.format("@(:e2)", -3e-9) -> "-3.00e-9"
    ssf.format("@(:e2)", 100) -> "1.00e+2"
    ssf.format("@(:e2)", 314.159) -> "3.14e+2"
    ssf.format("@(:e2)", 314.159) -> "3.14e+2"

### x ###
Output a hex number. If the hex has a decimal point, PRECISION behaves like 'f',
otherwise it behaves like 'd'.

   ssf.format("@(:x)", 10) -> "a"
   ssf.format("@(:x)", -10) -> "-a"
   ssf.format("@(:x4)", 10) -> "000a"
   ssf.format("@(:x4)", -10) -> "-000a"
   ssf.format("@(:x2)", 10.14) -> "a.23"
   ssf.format("@(:x8)", 255.125) -> "ff.20000000"
   ssf.format("@(:x0)", 255.00) -> "ff"


## String Formatter ##
Accepts format strings of the form "[START,END]". Both values are optional
intergers. START and END determine a range to select from the string. Think
of it as calling slice on the string and using the result.

    ssf.format("@(:[1])", "abc") -> "bc"
    ssf.format("@(:[-1])", "abc") -> "c"
    ssf.format("@(:[4])", "abc") -> ""
    ssf.format("@(:[,1])", "abc") -> "a"
    ssf.format("@(:[,-1])", "abc") -> "ab"
    ssf.format("@(:[,4])", "abc") -> "abc"
    ssf.format("@(:[1,2])", "abc") -> "b"
    ssf.format("@(:[-2,-1])", "abc") -> "b"
    ssf.format("@(:[1,4])", "abc") -> "bc"


## Array Formatter ##
Accepts format strings of the form "[START,END]JOINER". All values are optional.
START and END are intergers that determine a range to select from the array like
calling slice. JOINER is the string used to join array elements.

    ssf.format("@(:|)", ['a', 'b', 'c']) -> "a|b|c"
    ssf.format("@(:[1])", ['a', 'b', 'c']) -> "b,c"
    ssf.format("@(:[-1])", ['a', 'b', 'c']) -> "c"
    ssf.format("@(:[4])", ['a', 'b', 'c']) -> ""
    ssf.format("@(:[1] )", ['a', 'b', 'c']) -> "b c"
    ssf.format("@(:[,1])", ['a', 'b', 'c']) -> "a"
    ssf.format("@(:[,-1])", ['a', 'b', 'c']) -> "a,b"
    ssf.format("@(:[,4])", ['a', 'b', 'c']) -> "a,b,c"
    ssf.format("@(:[,2] )", ['a', 'b', 'c']) -> "a b"
    ssf.format("@(:[1,2])", ['a', 'b', 'c']) -> "b"
    ssf.format("@(:[-2,-1])", ['a', 'b', 'c']) -> "b"
    ssf.format("@(:[1,4])", ['a', 'b', 'c']) -> "b,c"
    ssf.format("@(:[1,4] )", ['a', 'b', 'c']) -> "b c"
    ssf.format("@(:[][])", ['a', 'b', 'c']) -> "a[]b[]c"


## Object Formatter ##
Returns the 'toSting' value of the object.

    ssf.format("@", {}) -> "[Object Object]"
    
    var obj = {};
    obj.toString = function() { return 'bla'; };
    ssf.format("@", obj) -> 'bla'
