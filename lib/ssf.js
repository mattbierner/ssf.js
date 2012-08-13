(function(define){

define(function() {
"use strict";

/* Type check functions
 ******************************************************************************/
var isUndefined = function(v) { return typeof v === 'undefined'; };

var isNumber = function(v) { return typeof v === 'number'; };

var isString = function(v) { return typeof v === 'string'; };

var isDate = function(v) { return v && v.getDate; };

// Based on MDN suggestion.
var isArray = (function() {
    return (Array.isArray ||
        function(v) {
            return Object.prototype.toString.call(v) === "[object Array]";
        }
    );
}());

var isObject = function(v) {return typeof v === 'object'; };

/* General utility functions
 ******************************************************************************/
var slice = Array.prototype.slice;

var identity = function(obj) { return obj; };

var constant = function(v) { return function() { return v; }; };

var copy = function(obj) {
    if (obj === null || !isObject(obj))
        return obj;
    var t = new obj.constructor(); 
    for (var key in obj)
        if (obj.hasOwnProperty(key))
            t[key] = copy(obj[key]);    
    return t;
};

var isEmpty = function(obj) {
    for (var k in obj)
        if (obj.hasOwnProperty(k))
            return false;
    return true;
};


/* Helper functions
 ******************************************************************************/
var parseAlignment = function(alignment) {
    var val = parseInt(alignment, 10);
    return (isNaN(val) ? 0 : val);
};

var align = function(str, alignment, padder) {
    var padLength = Math.abs(alignment) - str.length;
    if (padLength <= 0) {
        return str;
    } else {
        var padding = (new Array(padLength + 1)).join(isUndefined(padder) ? ' ' : padder);
        return (alignment > 0 ? padding + str : str + padding);
    }
};

var tokenize = (function() {
    var sep = '.';
    
    function pathReduce(p, c) { return p[c]; }
    
    function getFormatter(factory, path) {
        return (!path ? factory : 
            function(input) {
                return factory(isUndefined(input) ? input : path.reduce(pathReduce, input));
            }
        );
    }
    
    return function(type, path, alignment, format, options) {
        var formatter = getFormatter(options.formatterFactory(type, format, options), (path && path.split(sep)));
        if (!alignment) {
            return formatter;
        } else {
            alignment = parseAlignment(alignment);
            return function(v) { return align(formatter(v), alignment); };
        }
    };
}());

var formatterForArrayLike = (function() {
    var re = /(?:\[\s*((-?\d+)?(?:,(-?\d+)?)?)\])?(.*)?/;
    return function(overrideJoiner, defaultFormatter) {
        var formatter = defaultFormatter || identity;
        return function(format) {
            if (!format)
                return formatter;
            
            var match = re.exec(format);
            if (match === null || match[0] === '') {
                return formatter;
            } else {
                var range = match.slice(2, 4),
                    joiner = (isUndefined(overrideJoiner) ? match[4] : overrideJoiner);
                return function(v) {
                    return slice.apply(v, range).join(joiner);
                };
            }
        };
    };
}());

/* Default formatters
 ******************************************************************************/
var factoryForValue = function(type, format, options) {
    var factory;
    switch (type && type.toLowerCase()) {
        case 'u': factory = options.undefinedFactory; break;
        case 'n': factory = options.numberFactory; break;
        case 's': factory = options.stringFactory; break;
        case 'd': factory = options.dateFactory; break;
        case 'a': factory = options.arrayFactory; break;
        case 'o': factory = options.objectFactory; break;
        default:  factory = options.dynamicFactory; break;
    }
    return factory(format, options);
};

var formatterForDynamic = function(format, options) {
    var fu, fn, fs, fd, fa, fo;
    return function(v) {
        var formatter;
        if (isUndefined(v))     formatter = (fu || (fu = options.undefinedFactory(format)));
        else if (isNumber(v))   formatter = (fn || (fn = options.numberFactory(format)));
        else if (isString(v))   formatter = (fs || (fs = options.stringFactory(format)));
        else if (isArray(v))    formatter = (fa || (fa = options.arrayFactory(format)));
        else if (isDate(v))     formatter = (fd || (fd = options.dateFactory(format)));
        else                    formatter = (fo || (fo = options.objectFactory(format)));
        return formatter(v);
    };
};

var formatterForUndefined = constant(constant(''));

var formatterForNumber = (function(){
    var re = /^\s*([xdfe]?)([0-9]*)\s*$/i;
    
    function isFloat(n) { return (n === +n && n !== (n | 0)); }
    
    function padNumber(v, alignment) {
        return (v[0] === '-' ?
            '-' + align(v.slice(1), alignment, '0') :
            align(v, alignment, '0'));
    }
    
    function toFixed(v, p) { return Number.prototype.toFixed.call(v, p); }
    function toExponential(v, p) { return Number.prototype.toExponential.call(v, p); }
    function toHex(v) { return v.toString(16); }
    
    var converters = {
        'x':
            function(precision) {
                return function(v) {
                    var output = toHex(v),
                        decimal = output.indexOf('.');
                    if (decimal === -1) {
                        return padNumber(output, precision);
                    } else {
                        if (precision === '')
                            precision = 2;
                        var diff = precision - (output.length - (decimal + 1));
                        return (diff > 0 ?
                            padNumber(output, -(output.length + diff)) :
                            slice.call(output, 0, decimal + precision + 1).join('')
                        );
                    }
                };
            },
        'd':
            function(precision) {
                return (precision === '' ? toFixed :
                    function(v) { return padNumber(toFixed(v), precision); }
                );
            },
        'f':
            function(precision) {
                return (precision === '' ?
                    function(v) { return toFixed(v, 2); } :
                    function(v) { return toFixed(v, precision); }
                );
            },
        'e':
            function(precision) {
                return (precision === '' ? toExponential :
                    function(v) { return toExponential(v, precision); }
                );
            }
    };
    
    return function(format) {
        if (!format) return parseFloat;
        
        var formatOptions = re.exec(format);
        if (formatOptions === null || formatOptions[0] === '')
            return parseFloat;
        
        var specifier = (formatOptions[1] && formatOptions[1].toLowerCase()),
            precision = (formatOptions[2] && parseInt(formatOptions[2], 10));
        
        // If we have a type specifier get the formatter now, else do it at runtime.
        return (specifier ? converters[specifier](precision) :
            function(v) {
                return converters[isFloat(v) ? 'f' : 'd'](precision)(v);
            }
        );
    };
}());

var formatterForString = function(format) {
    var formatter = formatterForArrayLike('')(format);
    return function(v) { return formatter('' + v); };
};
var formatterForDate = constant(identity);

var formatterForArray = (function(){
    return formatterForArrayLike(undefined, function(v){ return Array.prototype.join.call(v); });
}());

var formatterForObject = constant(identity);


/* Exported objects
 ******************************************************************************/
var defaults = {
    'formatterFactory': factoryForValue,
    'undefinedFactory': formatterForUndefined,
    'numberFactory': formatterForNumber,
    'stringFactory': formatterForString,
    'dateFactory': formatterForDate,
    'arrayFactory': formatterForArray,
    'objectFactory': formatterForObject,
    'dynamicFactory': formatterForDynamic
};

var compile = (function() {
    var re = /@([a-z]*)\(([^\(\),:]*)(?:,([^\(\),:]*))?(?:\:([^\(\)]*))?\)|@([a-z0-9_$\.]*[a-z0-9_$])|@@|@/gi;
    var reInner = /@[a-z]*\([^\(\)]*\)/gi;
    
    function extendDefaults(options, defaults) {
        var templateOptions = copy(defaults);
        for (var k in options)
            if (options.hasOwnProperty(k))
                templateOptions[k] = options[k];
        return templateOptions;
    }
    
    return function(template, options) {
        var tokens = {},
            templateOptions = extendDefaults(options, defaults); 
        
        var compiledTemplate = template.replace(re, function(match, type, path1, padding, format, path2) {
            if (match === '@@')
                return '@';
            
            // normalize the input
            var path, normalizedMatch;
            if (match === '@')
                normalizedMatch = '@(,:)';
            else {
                path = (path2 || path1);
                normalizedMatch = '@' + (type || '') + '(' + path + ',' + (padding || '') + ':' + (format || '') + ')';
            }
            // create new token if we don't already have one
            if (!tokens.hasOwnProperty(normalizedMatch))
                tokens[normalizedMatch] = tokenize(type, path, padding, format, templateOptions);
            // replace with normalized input
            return normalizedMatch;
        });
        
        if (isEmpty(tokens)) { // the format string is not dependent on input
            // '@@' may still have been replaced so return compiled
            return constant(compiledTemplate);
        } else {
            return function(input) {
                // evaluate every token for input
                var values = {};
                for (var k in tokens)
                    if (tokens.hasOwnProperty(k))
                        values[k] = tokens[k](input);
                // perform the actual string formatting.
                return compiledTemplate.replace(reInner, function(match) {
                    return values[match];
                });
            };
        }
    };
}());

var format = function(template, input, options) {
    return compile(template, options)(input);
};

var formatArgs = function(template) {
    return format(template, slice.call(arguments, 1));
};

/* Export
 ******************************************************************************/
return {
    /**
     * 'Compiles' a given template string with a set of options.
     * 
     * @param template The string template that will be formatted.
     * @param [options] A set of override, template specific options. Compiling
     *   also captures the state of the global options.
     * 
     * @return A template function that accepts one input argument and returns a
     *   formatted string.
     */
    'compile': compile,
    
    /**
     * Formats a given string immediately.
     * 
     * @param template The string template that will be formatted.
     * @param [input] An object that provides values for the template keys.
     * @param [options] A set of override, template specific options.
     * 
     * @return The formatted string.
     */
    'format': format,
    
    /**
     * Formats a given string immediately using function call arguments.
     * 
     * Does not allow formatting options.
     * 
     * @param template The string template that will be formatted.
     * @param [*arguments] All other arguments will be used as input to format the
     *   string and can be accessed by index: @1 @(3)
     * 
     * @return The formatted string.
     */
    'formatArgs': formatArgs,

    'defaults': defaults
};

});

}(
    typeof define !== 'undefined' ? define : function(factory) { ssf = factory(); }
));