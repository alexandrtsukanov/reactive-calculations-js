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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BooleanReactive = void 0;
exports.fromBoolean = fromBoolean;
exports.from = from;
var reactive_1 = require("../reactive");
var BooleanReactive = /** @class */ (function (_super) {
    __extends(BooleanReactive, _super);
    function BooleanReactive() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BooleanReactive.prototype.same = function (options) {
        return this.depend(function (value) { return value; }, options);
    };
    BooleanReactive.prototype.opposite = function (options) {
        return this.depend(function (value) { return !value; }, options);
    };
    BooleanReactive.prototype.toggle = function () {
        this.update(function (prev) { return !prev; });
    };
    return BooleanReactive;
}(reactive_1.Reactive));
exports.BooleanReactive = BooleanReactive;
function fromBoolean(value) {
    return new BooleanReactive(value);
}
function from() {
    var reactives = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        reactives[_i] = arguments[_i];
    }
    var newReactive = new BooleanReactive();
    return (0, reactive_1.createDependencyChain)(newReactive, reactives);
}
var b = fromBoolean(true);
var t = from(b).same();
var f = from(t).opposite();
console.log(b.getValue()); // true
console.log(t.getValue()); // true
console.log(f.getValue()); // false
