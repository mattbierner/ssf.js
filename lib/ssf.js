(function(define){

define(function() {
"use strict";

/* General utility functions
 ******************************************************************************/
var slice = Array.prototype.slice;

var identity = function(obj) { return obj; };

var shallowClone = function(obj) {
    var c = {};
    for (var k in obj)
        if (obj.hasOwnProperty(k))
            c[k] = obj[k];
    return c;
};

var isEmpty = function(obj) {
    for (var k in obj)
        if (obj.hasOwnProperty(k))
            return false;
    return true;
};

var trim = (function(){
    var re = /^\s+|\s+$/;
    return function(str){ return str.replace(re, ''); };
}());


/* Type check functions
 ******************************************************************************/
var isUndefined = function(v) { return typeof v === 'undefined'; };

var isNumber = function(v) { return !isString(v) && !isNaN(parseFloat(v)) && isFinite(v); };

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

/* Helper functions
 ******************************************************************************/
var parseAlignment = function(alignment) {
    var val = parseInt(alignment);
    return (isNaN(val) ? 0 : val);
};

var align = function(str, alignment, padder) {
    var padLength = Math.abs(alignment) - str.length;
    if (padLength <= 0)
        return str;
    var padding = Array(padLength + 1).join(isUndefined(padder) ? ' ' : padder);
    return (alignment > 0 ? padding + str : str + padding);
};

var tokenize = (function() {
    var sep = '.';
    
    function pathReduce(p, c) { return p[c]; };
    
    function evalFunction(path, formatterFactory) {
        return (!path ?
            function(input) { return formatterFactory(input)(input); } : 
            function(input) {
                var value = (isUndefined(input) ? input : path.reduce(pathReduce, input));
                return formatterFactory(value)(value);
            }
        );
    };
    
    return function(path, alignment, format, options) {
        var evalInput = evalFunction((path && path.split(sep)), options.formatterForValue(format, options));
        if (!alignment) {
            return evalInput;
        } else {
            alignment = parseAlignment(alignment);
            return function(input){ return align(evalInput(input), alignment); };
        }
    };
}());

var formatterForArrayLike = (function() {
    var re = /(?:\[\s*((-?\d+)?(?:,(-?\d+)?)?)\])?(.*)?/;
    return function(format, overrideJoiner) {
        if (!format)
            return identity;
        var match = re.exec(format);
        if (match === null || match[0] === '') {
            return identity;
        } else {
            var range = match.slice(2, 4),
                joiner = isUndefined(overrideJoiner) ? match[4] : overrideJoiner;
            return function(v) {
                return slice.apply(v, range).join(joiner);
            };
        }
    };
}());

/* Default formatters
 ******************************************************************************/
/**
 * 
 */
var formatterForValue = function(format, options) {
    var fu, fn, fs, fd, fa, fo;
    return function(v) {
        if (isUndefined(v))     return (fu || (fu = options.formatterForUndefined(format)));
        else if (isNumber(v))   return (fn || (fn = options.formatterForNumber(format)));
        else if (isString(v))   return (fs || (fs = options.formatterForString(format)));
        else if (isDate(v))     return (fd || (fd = options.formatterForDate(format)));
        else if (isArray(v))    return (fa || (fa = options.formatterForArray(format)));
        else                    return (fo || (fo = options.formatterForObject(format)));
    };
};

/**
 * Default formatter factory for undefined.
 * Default undefined formatter always returns an empty string.
 * 
 * @param [format] Format option string.
 * 
 * @return undefined formatter.
 */
var formatterForUndefined = (function(){
    function f(v) { return ''; };
    return function(format){ return f; };
}());

/**
 * Default formatter factory for numbers.
 * 
 * @param [format] Format option string.
 *
 */
var formatterForNumber = (function(){
    var re = /^\s*([xdfe]?)([0-9]*)\s*$/i;
    
    function isFloat(n) { return (n === +n && n !== (n | 0)); };
    
    function padNumber(v, alignment) {
        return (v[0] === '-' ?
            '-' + align(v.slice(1), alignment, '0') :
            align(v, alignment, '0'));
    };
    
    function toFixed(v, p) { return Number.prototype.toFixed.call(v, p); }
    function toExponential(v, p) { return Number.prototype.toExponential.call(v, p); }
    function toHex(v) { return v.toString(16); }
    
    var converters = {
        'x': function(precision) {
            return function(v) {
                var output = toHex(v),
                    decimal = output.indexOf('.');
                if (decimal === -1) {
                    return padNumber(output, precision);
                } else {
                    if (precision === '')
                        precision = 2;
                    var diff = precision - (output.length - (decimal + 1));
                    if (diff > 0)
                        return padNumber(toHex(v), -(output.length + diff));
                    else
                        return slice.call(output, 0, decimal + precision + 1).join('');
                }
            }
        },
        'd': function(precision) {
            return (precision === '' ? toFixed :
                function(v) { return padNumber(toFixed(v), precision) }
            );
        },
        'f': function(precision) {
            return (precision === '' ?
                function(v) { return toFixed(v, 2); } :
                function(v) { return toFixed(v, precision); }
            );
        },
        'e': function(precision) {
            return (precision === '' ? toExponential :
                function(v) { return toExponential(v, precision); }
            );
        }
    };
    
    return function(format) {
        if (!format || !trim(format))
            return identity;
        var formatOptions = re.exec(format);
        if (formatOptions === null || formatOptions[0] === '')
            return identity;
        
        var specifier = (formatOptions[1] && formatOptions[1].toLowerCase()),
            percision = (formatOptions[2] && parseInt(formatOptions[2]));
        
        return (specifier ?
            converters[specifier](percision) :
            function(v) {
                return converters[isFloat(v) ? 'f' : 'd'](percision)(v);
            }
        );
    };
}());

/**
 * Default formatter factory for strings.
 * 
 * "[START,END]"
 * 
 * The default string formatter treats the format string as an argument to
 * slice called on the input string. This allows you to select a substring.
 * The format string must be of the above where both START and END
 * are valid integers. Both start and end may be omitted.
 * 
 * @param [format] Format option string.
 * 
 * @return A formatter function for a string.
 */
var formatterForString = function(format) {
    return formatterForArrayLike(format, '');
};


/**
 * 
 */
var formatterForDate = function(format) {
    return function(v) { return v; };
};

/**
 * Default formatter factory for Arrays.
 * 
 * "[START,END]JOINER"
 * 
 * The default array formatter supports both slice and join. Both the slice and
 * join sections are optional (There is one exception noted below). START and END
 * are valid integers and both may be omitted. JOINER is any string, including
 * whitespace. If JOINER is of the form '[]', you must also specify a slice
 * (the slice may be empty however). 
 */
var formatterForArray = formatterForArrayLike;

/**
 * 
 */
var formatterForObject = function(format) {
    return identity;
};



/* Exported objects
 ******************************************************************************/
var defaults = {
    'formatterForValue': formatterForValue,
    'formatterForUndefined': formatterForUndefined,
    'formatterForNumber': formatterForNumber,
    'formatterForString': formatterForString,
    'formatterForDate': formatterForDate,
    'formatterForArray': formatterForArray,
    'formatterForObject': formatterForObject
};

var compile = (function() {
    var re = /@([a-z0-9_$\.]*[a-z0-9_$])|@\(([^\(\),:]*)(?:,([^\(\),:]*))?(?:\:([^\(\)]*))?\)|@@|@/gi;
    var reInner = /@\([^\(\)]*\)/gi;
    
    function extendDefaults(options) {
        var templateOptions = (options ? shallowClone(options) : {}); 
        for (var k in defaults)
            if (defaults.hasOwnProperty(k) && !templateOptions.hasOwnProperty(k))
                templateOptions[k] = defaults[k];
        return templateOptions;
    };
    
    return function(template, options) {
        var tokens = {},
            templateOptions = extendDefaults(options); 
        
        var compiledTemplate = template.replace(re, function(match, path1, path2, padding, format) {
            var path;
            if (match === '@@')
                return '@';
            else if (match === '@')
                match = '@(,:)';
            else {
                path = (path1 || path2);
                match = '@(' + path + ',' + (padding || '') + ':' + (format || '') + ')';
            }
            if (!tokens.hasOwnProperty(match))
                tokens[match] = tokenize(path, padding, format, templateOptions);
            return match;
        });
        
        if (isEmpty(tokens)) {
            return function(input) { return compiledTemplate; };
        } else {
            return function(input) {
                var values = {};
                for (var k in tokens)
                    if (tokens.hasOwnProperty(k))
                        values[k] = tokens[k](input);
                return compiledTemplate.replace(reInner, function(match) {
                    return values[match];
                });
            };
        }
    }
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