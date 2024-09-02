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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsyncReactive = void 0;
exports.fromAsync = fromAsync;
exports.from = from;
var reactive_1 = require("../reactive");
var pipe_1 = require("../utils/pipe");
var AsyncReactive = /** @class */ (function (_super) {
    __extends(AsyncReactive, _super);
    function AsyncReactive() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AsyncReactive.prototype.updateAsync = function (newValue) {
        var _this = this;
        if (!this.value) {
            return Promise.reject();
        }
        return this.value
            .then(function () {
            _this.value = newValue;
            var queue = Array.from(_this.getDeps());
            var cursor = 0;
            while (cursor < queue.length) {
                var reactive = queue[cursor];
                var rules = reactive.rules;
                if (!reactive.isEmptyDep()) {
                    var arrayOfParents = reactive.closestNonEmptyParents;
                    console.log('rules outer =>', rules);
                    reactive.updateDepAsync(rules, arrayOfParents);
                }
                var dependencies = reactive.getDeps();
                dependencies.forEach(function (dep) {
                    queue.push(dep);
                });
                cursor += 1;
            }
        })
            .catch(function (reason) { return _this.update(reason); });
    };
    AsyncReactive.prototype.updateDepAsync = function (callbacks, parents) {
        var _this = this;
        Promise.all(__spreadArray([], this.mapToValues(parents), true))
            .then(function (values) {
            _this.value = (0, pipe_1.pipe)(callbacks).apply(void 0, values);
        })
            // .catch(reason => reason)
            // this.value
            //     ?.then(() => {
            //         console.log('values', this.value, values);
            //         console.log('pipe(callbacks)(...values) =>', pipe(callbacks)(...values), callbacks[0](values[0]));
            //         console.log('Finally value =>', this.value);
            //     })
            .catch(function (reason) { return _this.value = reason; });
    };
    AsyncReactive.prototype.depend = function (callback, options) {
        var isStrict = (options !== null && options !== void 0 ? options : {}).isStrict;
        if (isStrict !== undefined) {
            this.isStrict = isStrict;
        }
        if (callback.length !== this.closestNonEmptyParents.length) {
            throw new Error("\n                Item depends on ".concat(this.closestNonEmptyParents.length, " items, but you passed ").concat(callback.length, " arguments.\n                Amount of arguments of dependency callback must be equal to amount of items this item depends on\n            "));
        }
        this.rules.push(callback);
        if (this.value === null) {
            var parents = Promise.all(this.mapToValues(this.closestNonEmptyParents));
            this.value = parents
                .then(function (values) {
                return callback.apply(void 0, values);
            })
                .catch(function (reason) { return reason; });
        }
        else {
            this.value
                .then(function (value) {
                return callback(value);
            })
                .catch(function (reason) { return reason; });
        }
        return this;
    };
    return AsyncReactive;
}(reactive_1.Reactive));
exports.AsyncReactive = AsyncReactive;
function fromAsync(value) {
    return new AsyncReactive(value);
}
function from() {
    var reactives = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        reactives[_i] = arguments[_i];
    }
    var newReactive = new AsyncReactive();
    return (0, reactive_1.createDependencyChain)(newReactive, reactives);
}
var promise1 = new Promise(function (res) {
    setTimeout(function () { return res(1); }, 1000);
});
var p1 = fromAsync(promise1);
var p2 = from(p1).depend(function (val) { return val + 5; });
console.log(p1.getDeps());
(_a = p1.getValue()) === null || _a === void 0 ? void 0 : _a.then(function (val) { return console.log(1, val); }); // 1
(_b = p2.getValue()) === null || _b === void 0 ? void 0 : _b.then(function (val) { return console.log(2, val); }); // 6
p1.updateAsync(Promise.resolve(2))
    .then(function () {
    var _a;
    (_a = p1.getValue()) === null || _a === void 0 ? void 0 : _a.then(function (val) { return console.log(3, val); }); // 2
})
    .then(function (val) {
    console.log(4, val); // 7
});
