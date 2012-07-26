define(function() {
    "use strict";

/* General utility
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

/* Type checks.
 ******************************************************************************/
var isUndefined = function(v) { return typeof v === 'undefined'; };

var isNumber = function(v) { return !isString(v) && !isNaN(parseFloat(v)) && isFinite(v); };

var isString = function(v) { return typeof v === 'string'; };

var isDate = function(v) { return v && v.getDate; };

var isArray = (function() {
    if (Array.isArray)
        return Array.isArray;
    return function(v) { // based on MDN suggestion.
        return Object.prototype.toString.call(v) === "[object Array]";
    };   
}());

var isFunction = function(v) {
    return v && getClass.call(v) === "[object Function]";
};

/* Default formatters.
 ******************************************************************************/
var formatterForValue = function(format, options) {
    var f;
    return function(v) {
        if (f) return f;
        if (isUndefined(v))     return (f = options.formatterForUndefined(format));
        else if (isNumber(v))   return (f = options.formatterForNumber(format));
        else if (isString(v))   return (f = options.formatterForString(format));
        else if (isDate(v))     return (f = options.formatterForDate(format));
        else if (isArray(v))    return (f = options.formatterForArray(format));
        else                    return (f = options.formatterForObject(format));
    };
};

var formatterForUndefined = function(format){
    return function(v) { return ''; };
}

var formatterForNumber = function(format) {
    return function(v) { return v; };
};

var formatterForString = function(format) {
    return function(v) { return v; };
};

var formatterForDate = function(format) {
    return function(v) { return v; };
};

var formatterForArray = function(format) {
    return function(v) { return v; };
};

var formatterForObject = function(format) {
    return function(v) { return v; };
};


/* Helper functions.
 ******************************************************************************/
function parseAlignment(alignment) {
    var val = parseInt(alignment);
    return (isNaN(val) ? 0 : val);
};

var align = function(str, alignment) {
    var padLength = Math.abs(alignment) - str.length;
    if (padLength <= 0)
        return str;
    var padding = Array(padLength + 1).join(" ");
    return (alignment > 0 ? padding + str : str + padding);
};

var tokenize = (function() {
    var sep = '.';
    function pathReduce(p, c) { return p[c]; };
    function evalFunction(path, formatterFactory) {
        if (!path) return identity;
        return function(input) {
            var value = path.reduce(pathReduce, input);
            return formatterFactory(value)(value);
        };
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

/* Exported objects
 ******************************************************************************/
var defaults = {
    'formatters': {},
    
    'formatterForValue': formatterForValue,
    'formatterForUndefined': formatterForUndefined,
    'formatterForNumber': formatterForNumber,
    'formatterForString': formatterForString,
    'formatterForDate': formatterForDate,
    'formatterForArray': formatterForArray,
    'formatterForObject': formatterForObject
};

var compile = (function() {
    var re = /@(@|[a-z0-9_$\.]+)|@\(([^\(\),:]*)(?:,([^\(\),:]*))?(?:\:([^\(\),:])*)?\)/gi;
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
            if (match === '@@')
                return '@';
            if (path1)
                match = "@(" + path1 + ")";
            if (!tokens.hasOwnProperty(match))
                tokens[match] = tokenize((path1 || path2), padding, format, templateOptions);
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
     * @param [options] A set of override, template specific options.
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