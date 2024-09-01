"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pipe = void 0;
var pipe = function (fns) { return function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var firstFn = fns[0];
    var firstResult = firstFn.apply(void 0, args);
    return fns
        .slice(1)
        .reduce(function (res, fn) { return fn(res); }, firstResult);
}; };
exports.pipe = pipe;
