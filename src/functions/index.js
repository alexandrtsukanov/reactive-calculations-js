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
exports.fromFunction = fromFunction;
exports.from = from;
var reactive_1 = require("../reactive");
var pipe_1 = require("../utils/pipe");
var FunctionReactive = /** @class */ (function (_super) {
    __extends(FunctionReactive, _super);
    function FunctionReactive(value) {
        if (value === void 0) { value = null; }
        var _this = _super.call(this, value) || this;
        _this.rules = [];
        return _this;
    }
    FunctionReactive.prototype.getValue = function () {
        var _a;
        return (_a = this.value) !== null && _a !== void 0 ? _a : (function () { });
    };
    FunctionReactive.prototype.update = function (newValue) {
        if (this.value === null) {
            return;
        }
        if (this.isDependent() && this.isStrict) {
            return;
        }
        this.value = newValue;
        this.updateDepsFns();
    };
    FunctionReactive.prototype.updateDepsFns = function () {
        var _a;
        var queue = Array.from(this.getDeps());
        var cursor = 0;
        var allRules = [];
        while (cursor < queue.length) {
            var reactive = queue[cursor];
            var rules = reactive.rules;
            allRules.push.apply(allRules, rules);
            if (!reactive.isEmptyDep()) {
                reactive.updateDepFn((_a = this.value) !== null && _a !== void 0 ? _a : (function () { }), allRules);
            }
            var dependencies = reactive.getDeps();
            dependencies.forEach(function (dep) {
                queue.push(dep);
            });
            cursor += 1;
        }
    };
    FunctionReactive.prototype.updateDepFn = function (valueFn, callbacks) {
        this.value = (0, pipe_1.pipe)(__spreadArray([valueFn], callbacks, true));
    };
    FunctionReactive.prototype.depend = function (callback, options) {
        var isStrict = (options !== null && options !== void 0 ? options : {}).isStrict;
        if (isStrict !== undefined) {
            this.isStrict = isStrict;
        }
        if (callback.length !== this.closestNonEmptyParents.length) {
            throw new Error("\n                Item depends on ".concat(this.closestNonEmptyParents.length, " items, but you passed ").concat(callback.length, " arguments.\n                Amount of arguments of dependency callback must be equal to amount of items this item depends on\n            "));
        }
        this.rules.push(callback);
        this.value = (0, pipe_1.pipe)(__spreadArray(__spreadArray([], this.mapToValues(this.closestNonEmptyParents), true), this.rules, true));
        return this;
    };
    return FunctionReactive;
}(reactive_1.Reactive));
function fromFunction(value) {
    return new FunctionReactive(value);
}
function from() {
    var reactives = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        reactives[_i] = arguments[_i];
    }
    if (reactives.length > 1) {
        throw new Error('Dependencies of more than 1 function are not supported');
    }
    var newReactive = new FunctionReactive();
    return (0, reactive_1.createDependencyChain)(newReactive, reactives);
}
var f1 = fromFunction(function (str) { return str.length; });
var f2 = from(f1);
console.log(f2.getValue());
