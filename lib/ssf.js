(function(define){

define(function() {
"use strict";

/* General utility functions
 ******************************************************************************/
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

var identity = function(obj) { return obj; };

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

/**
 * based on MDN suggestion.
 */
var isArray = (function() {
    return (Array.isArray ||
        function(v) {
            return Object.prototype.toString.call(v) === "[object Array]";
        }
    );
}());

var isFunction = function(v) {
    return v && getClass.call(v) === "[object Function]";
};

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
    var re = /^([a-z]?)([0-9]*)$/i;
    function alignNumber(v, alignment){
        if (v[0] == '-')
            return '-' + align(v.slice(1), alignment, '0');
        return align(v, alignment, '0');
    };
    var converters = {
        'x': function(precision) {
            return (!precision ?
                function(v) { return v.toString(16); } : 
                function(v) {
                    return alignNumber(v.toString(16), precision);
                }
            );
        },
        'd': function(precision) {
            return (!precision ?
                function(v) { return (v + 0.0).toFixed(); } :
                function(v) {
                    return alignNumber((v + 0.0).toFixed(), precision)
                }
            );
        },
        'f': function(precision) {
            return (!precision ?
                function(v) { return (v + 0.0); } :
                function(v) { return (v + 0.0).toFixed(precision); }
            );
        },
        'e': function(precision) {
            return function(v) { return (v + 0.0).toExponential(precision); }
        }
    };
    
    return function(format) {
        if (!format)
            return identity;
        var formatOptions = re.exec(trim(format));
        if (formatOptions === null || formatOptions[0] === '')
            return identity;
        
        var specifier = (formatOptions[1] && formatOptions[1].toLowerCase()),
            percision = formatOptions[2];
        
        if (percision)
            percision = parseInt(percision);
        
        var convertFactory = converters[specifier];
        if (!convertFactory) {
            return identity;
        } else {
            var convert = convertFactory(percision);
            return function(v) { return convert(v); };
        }
    };
}());

/**
 * Default formatter factory for strings.
 * 
 */
var formatterForString = (function(){
    return function(format) {
        if (!format)
            return identity;
        var slice = Array.prototype.slice,
            range = format.split(',');
        return function(v) {
            return slice.apply(v, range);
        };
    };
}());

var formatterForDate = function(format) {
    return function(v) { return v; };
};

var formatterForArray = function(format) {
    return function(v) { return v; };
};

var formatterForObject = function(format) {
    return function(v) { return v; };
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
    var re = /@([a-z0-9_$\.]*[a-z0-9_$])|@\(([^\(\),:]*)(?:,([^\(\),:]*))?(?:\:([^\(\):]*))?\)|@@|@/gi;
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
                match = '@()';
            else {
                path = (path1 || path2);
                match = '@(.' + path + ',' + (padding || '') + ':' + (format || '') + ')';
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
    return format(template, Array.prototype.slice.call(arguments, 1));
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
    (define || function(factory){
        if (module) {
            module.exports = factory();
        } else {
            ssf = factory();
        }
    })
));