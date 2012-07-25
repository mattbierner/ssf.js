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

/* Type checks.
 ******************************************************************************/
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
var formatValue = function(v, format, options) {
    if (typeof v === 'undefined') return options.formatUndefined(v, format);
    else if (isNumber(v)) return options.formatNumber(v, format);
    else if (isString(v)) return options.formatString(v, format);
    else if (isDate(v)) return options.formatDate(v, format);
    else if (isArray(v)) return options.formatArray(v, format);
    else return options.formatObject(v, format);
};

var formatUndefined = function(v, format){
    return '';
}

var formatNumber = function(v, format) {
    return v;
};

var formatString = function(v, format) {
    return v;
};

var formatDate = function(v, format) {
    return v;
};

var formatArray = function(v, format) {
    return v;
};

var formatObject = function(v, format) {
    return v;
};


/* Helper functions.
 ******************************************************************************/
var tokenize = (function() {
    var sep = '.';
    function parseAlignment(alignment) {
        if (!alignment) return 0;
        var val = parseInt(alignment.slice(1));
        return (isNaN(val) ? 0 : val);
    }
    return function(path, padding, format) {
        return {
            'path': path.split(sep),
            'alignment': parseAlignment(padding),
            'format': (format && format.slice(1))
        };
    };
}());

var align = function(str, alignment) {
    var padLength = Math.abs(alignment) - str.length;
    if (padLength <= 0)
        return str;
    var padding = Array(padLength + 1).join(" ");
    return (alignment > 0 ? padding + str : str + padding);
};

var evalToken = (function() {
    function reduceMap(p, c) { return p[c]; }
    return function(token, input, options) {
        var path = token.path,
            value = (path[0] ? path.reduce(reduceMap, input) : input);
        return align(options.formatValue(value, token.format, options) + "", token.alignment)
    };
}());

/* Exported objects
 ******************************************************************************/
var defaults = {
    'formatValue': formatValue,
    'formatUndefined': formatUndefined,
    'formatNumber': formatNumber,
    'formatString': formatString,
    'formatDate': formatDate,
    'formatArray': formatArray,
    'formatObject': formatObject
};

var compile = (function() {
    var re = /@(@|[a-z0-9_$\.]+)|@\(([^\(\),:]*)(,[^\(\),:]*)?(:[^\(\),:]*)?\)/gi;
    var reInner = /@\([^\(\)]*\)/gi;
    
    return function(template, options) {
        var tokens = {};
        var compiledTemplate = template.replace(re, function(match, path1, path2, padding, format) {
            if (match === '@@')
                return '@';
            var path = path1 || path2;
            if (path1)
                match = "@(" + path1 + ")";
            if (!tokens.hasOwnProperty(match))
                tokens[match] = tokenize(path, padding, format);
            return match;
        });
        
        if (isEmpty(tokens)) {
            return function(input) { return compiledTemplate; };
        } else {
            var templateOptions = options ? shallowClone(options) : {}; 
            for (var k in defaults)
                if (defaults.hasOwnProperty(k) && !templateOptions.hasOwnProperty(k))
                    templateOptions[k] = defaults[k];
            
            return function(input) {
                var values = {};
                for (var k in tokens)
                    if (tokens.hasOwnProperty(k))
                        values[k] = evalToken(tokens[k], input, templateOptions);
                return compiledTemplate.replace(reInner, function(match) { return values[match]; });
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