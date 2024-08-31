var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Reactive = require('../sync.ts');
var OdjectReactive = /** @class */ (function (_super) {
    __extends(OdjectReactive, _super);
    function OdjectReactive(value) {
        return _super.call(this, value) || this;
    }
    OdjectReactive.prototype.map = function (callback, options) {
        this.checkDeps();
        var mapObject = function (obj) {
            return Object.entries(obj).reduce(function (result, _a) {
                var key = _a[0], value = _a[1];
                var _b = callback(key, value), newKey = _b[0], newValue = _b[1];
                result[newKey] = newValue;
                return result;
            }, {});
        };
        return this.depend(function (object) { return mapObject(object); }, options);
    };
    OdjectReactive.prototype.flatMap = function (callback, options) {
        this.checkDeps();
        // const b = from(a).flatMap(({a: aVal, c: cVal}) => ({[String(cVal + aVal)]: aVal + cVal}));
        return this.depend(function (arr) { return arr.flatMap(callback); }, options);
    };
    OdjectReactive.prototype.checkDeps = function () {
        if (this.closestNonEmptyParents.length > 1) {
            throw new Error('The current dependency method supports dependency of only one object');
        }
    };
    return OdjectReactive;
}(Reactive));
function fromOgject(value) {
    return new OdjectReactive(value);
}
module.exports = { fromOgject: fromOgject };
var obj = {
    a: 1, b: 2, c: 3,
};
var flatMap = function (_a) {
    var _b;
    var aVal = _a.a, cVal = _a.c;
    return (_b = {}, _b[String(cVal + aVal)] = aVal + cVal, _b);
};
var result = flatMap(obj);
console.log(result);
