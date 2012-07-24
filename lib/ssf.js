/**
 * Formats a string given a map object. Looks for tokens of type ${...}. Tokens
 * are used as paths if they contains any '.' characters.
 */
var format = (function(){
    var re = /{([^\}]+),?([^\}]*)?:?([^\}]*)?\}/g;
    var sep = '.';
    return function(map)
    {
        return this.replace(re, function(capture)
        {
            var val = capture.slice(2, capture.length - 1) || "";
            return val.split(sep).reduce(function(p, c){ return p[c]; }, map);
        });
    }
}());
