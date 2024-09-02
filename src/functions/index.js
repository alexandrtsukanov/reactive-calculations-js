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
var FunctionReactive = /** @class */ (function (_super) {
    __extends(FunctionReactive, _super);
    function FunctionReactive() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // deps: FunctionReactive[];
    // rules: ((...args: any[]) => any)[];
    // constructor(value: Function | null = null) {
    //     super();
    //     this.deps = [];
    //     this.rules = [];
    // }
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
        var queue = Array.from(this.getDeps());
        var cursor = 0;
        while (cursor < queue.length) {
            var reactive = queue[cursor];
            var rules = reactive.rules;
            if (!reactive.isEmptyDep()) {
                reactive.updateDepFn(this.value, rules);
            }
            var dependencies = reactive.getDeps();
            dependencies.forEach(function (dep) {
                queue.push(dep);
            });
            cursor += 1;
        }
    };
    FunctionReactive.prototype.updateDepFn = function (fn, callbacks) {
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
        this.value = pipe(__spreadArray([fn !== null && fn !== void 0 ? fn : (function () { })], callbacks, true));
    };
    FunctionReactive.prototype.depend = function (callback, options) {
        var isStrict = (options !== null && options !== void 0 ? options : {}).isStrict;
        if (isStrict !== undefined) {
            this.isStrict = isStrict;
        }
        if (callback.length !== this.closestNonEmptyParents.length) {
            throw new Error("\n                Item depends on ".concat(this.closestNonEmptyParents.length, " items, but you passed ").concat(callback.length, " arguments.\n                Amount of arguments of dependency callback must be equal to amount of items this item depends on\n            "));
        }
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
        this.rules.push(callback);
        this.value = pipe(__spreadArray(__spreadArray([], this.mapToValues(this.closestNonEmptyParents), true), this.rules, true));
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
    var newReactive = new FunctionReactive();
    return (0, reactive_1.createDependencyChain)(newReactive, reactives);
}
var f = function (a, b) { return a + b; };
var f1 = fromFunction(f);
var f2 = from(f1).depend(function (val) { return val + 1; });
console.log(f1.getValue()(10, 5));
console.log(f2.getValue()(10, 5));
console.log(f2.getValue()(20, 10));
var fNew = function (a, b) { return a * b; };
f1.update(fNew);
console.log(f1.getValue()(10, 5));
console.log(f2.getValue()(10, 5));
