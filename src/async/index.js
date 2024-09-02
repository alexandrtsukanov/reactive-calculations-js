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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
            .then(function () { return __awaiter(_this, void 0, void 0, function () {
            var queue, cursor, reactive, rules, arrayOfParents, dependencies;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.value = newValue;
                        queue = Array.from(this.getDeps());
                        cursor = 0;
                        _a.label = 1;
                    case 1:
                        if (!(cursor < queue.length)) return [3 /*break*/, 4];
                        reactive = queue[cursor];
                        rules = reactive.rules;
                        if (!!reactive.isEmptyDep()) return [3 /*break*/, 3];
                        arrayOfParents = reactive.closestNonEmptyParents;
                        console.log('rules outer =>', rules);
                        return [4 /*yield*/, reactive.updateDepAsync(rules, arrayOfParents)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        dependencies = reactive.getDeps();
                        dependencies.forEach(function (dep) {
                            queue.push(dep);
                        });
                        cursor += 1;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        }); })
            .catch(function (reason) { return _this.update(reason); });
    };
    AsyncReactive.prototype.updateDepAsync = function (callbacks, parents) {
        var _this = this;
        Promise.all(__spreadArray([], this.mapToValues(parents), true))
            .then(function (values) {
            _this.value = (0, pipe_1.pipe)(callbacks).apply(void 0, values);
        })
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
var p2 = from(p1).depend(function (val) { return val + 1; });
var p3 = from(p2).depend(function (val) { return val + 2; });
var p4 = from(p3).depend(function (val) { return val * 3; });
var p5 = from(p4).depend(function (val) { return val.toString(); });
p1.updateAsync(Promise.resolve(4))
    .then(function () {
    var _a;
    (_a = p1.getValue()) === null || _a === void 0 ? void 0 : _a.then(function (val) { return console.log(2, val); }); // 2
})
    .then(function () {
    console.log(3, p2.getValue()); // 2
})
    .then(function () {
    console.log(4, p3.getValue()); // 2
})
    .then(function () {
    console.log(1, p5.getValue()); // 1
});
// .then(() => {
//     console.log(4, p5.getValue()); // 7
// })
