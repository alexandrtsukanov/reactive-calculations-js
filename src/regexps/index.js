"use strict";
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromRegExp = fromRegExp;
exports.from = from;
var reactive_1 = require("../reactive");
var REGEXP_FLAGS = ['g', 'i', 's', 'm', 'u', 'y', 'd'];
var RegExpReactive = /** @class */ (function (_super) {
    __extends(RegExpReactive, _super);
    function RegExpReactive() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RegExpReactive.prototype.getValue = function () {
        var _a;
        return (_a = this.value) !== null && _a !== void 0 ? _a : new RegExp('');
    };
    RegExpReactive.prototype.addFlags = function (flags, options) {
        var _this = this;
        var cb = function (prevRegExp) {
            var _a;
            var newRegExp = new RegExp((_a = prevRegExp === null || prevRegExp === void 0 ? void 0 : prevRegExp.source) !== null && _a !== void 0 ? _a : '', _this.prepareFlagsAdded(prevRegExp.flags, flags));
            return newRegExp;
        };
        return this.depend(cb, options);
    };
    RegExpReactive.prototype.removeFlags = function (flags, options) {
        var _this = this;
        var cb = function (prevRegExp) {
            var _a;
            var newRegExp = new RegExp((_a = prevRegExp === null || prevRegExp === void 0 ? void 0 : prevRegExp.source) !== null && _a !== void 0 ? _a : '', _this.prepareFlagsRemoved(prevRegExp.flags, flags));
            return newRegExp;
        };
        return this.depend(cb, options);
    };
    RegExpReactive.prototype.prepareFlagsAdded = function (oldFlags, newflags) {
        var _a;
        var set = new Set(__spreadArray(__spreadArray([], (_a = oldFlags.split('')) !== null && _a !== void 0 ? _a : [], true), newflags, true));
        return Array.from(set).join('');
    };
    RegExpReactive.prototype.prepareFlagsRemoved = function (oldFlags, flags) {
        var set = new Set(oldFlags);
        flags.forEach(function (flag) { return set.delete(flag); });
        return Array.from(set).join('');
    };
    return RegExpReactive;
}(reactive_1.Reactive));
function fromRegExp(value) {
    return new RegExpReactive(value);
}
function from() {
    var reactives = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        reactives[_i] = arguments[_i];
    }
    var newReactive = new RegExpReactive();
    return (0, reactive_1.createDependencyChain)(newReactive, reactives);
}
