# SSF.js - Simple Javascript String Formatting #

## About ##
SSF.js is string formatting designed for Javascript. Format any Javascript object
using a simple syntax.

    ssf.format("Hello @", "world") -> "Hello world"
    
    // Formatting from an object.
    ssf.format("Member['a']:@a Member['c']['d']:@c.d", {'a':1, 'c': {'d': 2}})
        -> "Member['a']:1 Member['c']['d']:2"
    
    // Formatting from an array.
    ssf.format("Array[0]:@0 Array[1]:@1", ['A', 3]) -> "Array[0]:A Array[1]:3"

SSF also supports 'compiled' template functions, custom formatting logic (both
globally and per formatter), and alignment. A simple set of default data
formatters is also included.


# Using SSF #
SSF can be used either as an AMD style module or in the global scope.

## With AMD ##
Include any AMD style module loader and load SSF.

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
Include SSF file directly and use 'ssf' global.

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
can express any simple token and allows specifying alignment and formatter
options. The two can be mixed in the same format string.


### Simple Syntax ###
Simple tokens are of the form '@PATH' where PATH is a period delineated path,
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
Use either '@' or '@()' to access the top level input object. The expanded
syntax allows you specify alignment and a format string for the top level object.

    ssf.format("@ @()", "top") -> "top top"
    ssf.format("@(,4:x2)", 10) -> "0a  "
    

### Literal @ Symbol ###
Use '@@' to output a literal '@' symbol.

    ssf.format("@@") -> "@"

Only '@@' will generate a literal '@'. '@(@)' will lookup the '@' member in the
input object.

    ssf.format("@(@)", {'@': 3}) -> "3"

## 'Compiled' Formatters ##
If a program calls format multiple times with the same format string,
consider using a 'compiled' template function instead. 

    var formatter = ssf.compile("Hello @");
    formatter("world") -> "Hello world"
    formatter(3) -> "Hello 3"

As this example demonstrates, compiled template use dynamic typing and react
correctly when different objects are passed in.

Template functions also can use custom options and capture global options when
the template is created.

    var formatter = ssf.compile("Hello @", {
        'undefinedFactory': function() { return function() { return "undefined"}; }
    });
    ssf.format("Hello @", undefined) -> "Hello "
    formatter(undefined) -> "Hello undefined"

    var formatter = ssf.compile("@")
    ssf.defaults.undefinedFactory = function() { return function(){ return "undefined"; } }
    formatter(undefined) -> ""
    ssf.format("@", undefined) -> "undefined"


# Default Formatters #
A simple set of default formatters are provided with SSF. You can also write
your own formatters.

## Undefined Formatter ##
Returns an empty string in all cases.

    ssf.format("@", undefined) -> ""

## Number Formatter ##
Accepts format strings of the form "(d|f|e|x)PRECISION". Both values are optional.
PRECISION is a positive integer.
The first value is the output number type: 

### d ###
Outputs a decimal number. PRECISION is the minimum number of digits.

    ssf.format("@(:d)", 10) -> "10"
    ssf.format("@(:d)", -10) -> "-10"
    ssf.format("@(:d4)", 10) -> "0010"
    ssf.format("@(:d4)", 10.14) -> "0010"
    ssf.format("@(:d4)", 9.99) -> "0010"

### f ###
Outputs a fixed pointer number. PRECISION is the number of digits
after the decimal place. Default PRECISION is 2.

    ssf.format("@(:f)", 3.14) -> "3.14"
    ssf.format("@(:f)", -3.14) -> "-3.14"
    ssf.format("@(:f4)", 3.14) -> "3.1400"
    ssf.format("@(:f0)", 3.14) -> "3"
    ssf.format("@(:f4)", 10) -> "10.0000"

### e ###
Output a number in scientific notation. PRECISION is the number of digits after
the decimal place. 

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
Uses format strings of the form "[START,END]". Both values are optional
integers. START and END determine a range to select from the string. Think
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
Uses format strings of the form "[START,END]JOINER". All values are optional.
START and END are integers that determine a range to select from the array.
JOINER is a string used to join array elements.

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


# API #

**compile(template:String, [options:Object])**
'Compiles' a given template string with a set of options.

* template:String The string template that will be formatted.
* [options:Object] A set of override, template specific options. Compiling also
captures the state of the global options.

Returns a template function that accepts one input argument and returns a
formatted string.

**format(template:String, [options:Object])**
Formats a given string immediately.

* template:String The string template that will be formatted.
* [input:Object] An object that provides values for the template keys.
* [options:Object] A set of override, template specific options.

Returns the formatted string.

**formatArgs(template:String, args...)**
Exactly like 'format' expect input is the argument array, like how printf works.


## Options ##
Options has the structure:

    {
        'valueFactory':
        'undefinedFactory':
        'numberFactory':
        'stringFactory':
        'dateFactory':
        'arrayFactory':
        'objectFactory':
    }

See custom formatters for details.

## Custom Formatter Factories ##
Each factory function generates formatting functions for a given type.
'valueFactory' controls delegation to the other formatters.

Custom formatters may be used to support new format string options or introduce
new formatting behavior.

**valueFactory(format:String, options:Object)**
Controls delegation to other format factories. Default implementation does this
based on input type.

* format:String The format string to generate a formatter for.
* options:Object SSF options for the template.

Returns a formatter function that accepts a value input and returns a string.

**Other format functions(format:String)**
Returns a formatter function that accepts a value input and returns a string.


# Other Notes #

# Extending Global Objects #
By default, SSF does not extend any global Javascript objects. If you want to 
support statements such as:

    "@ 123".format("abc") -> "abc 123"
    "@0 @1 @2".formatArgs(1, 2, 3) -> "1 2 3"

and dont mind altering global objects, add the following statements to your program:

    String.prototype.format = function(input){ return ssf.format(this, input); }
    String.prototype.formatArgs = function(){ return ssf.format(this, arguments); }

# Known Limitations #
* Token values may not contain characters: '(' or ')'.
* Path key values may not contain characters: '.'.
* Paths may not contain any of the following characters: ',' or ':'.
* Top level access to empty string key is not supported. Empty string keys
may be used other places.

