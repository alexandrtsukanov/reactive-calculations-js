"use strict";
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
exports.Reactive = void 0;
exports.createDependencyChain = createDependencyChain;
var pipe_1 = require("./utils/pipe");
var Reactive = /** @class */ (function () {
    function Reactive(value) {
        if (value === void 0) { value = null; }
        this.isStrict = true;
        this.value = value;
        this.deps = new Set();
        this.parents = new Set();
        this.rules = [];
        this.closestNonEmptyParents = [];
    }
    Reactive.prototype.getValue = function () {
        return this.value;
    };
    Reactive.prototype.update = function (newValue) {
        if (this.value === null) {
            return;
        }
        if (this.isDependent() && this.isStrict) {
            return;
        }
        // @ts-ignore
        this.value = newValue;
        // if (newValue instanceof Function) {
        //     this.value = newValue(this.value)
        // } else {
        // }
        // this.updateDeps();
    };
    Reactive.prototype.updateDeps = function () {
        var queue = Array.from(this.deps);
        var cursor = 0;
        while (cursor < queue.length) {
            var reactive = queue[cursor];
            var rules = reactive.rules;
            if (!reactive.isEmptyDep()) {
                var arrayOfParents = reactive.closestNonEmptyParents;
                reactive.updateDep.apply(reactive, __spreadArray([rules], arrayOfParents, false));
            }
            var dependencies = reactive.getDeps();
            dependencies.forEach(function (dep) {
                queue.push(dep);
            });
            cursor += 1;
        }
    };
    Reactive.prototype.updateDep = function (callbacks) {
        var parents = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            parents[_i - 1] = arguments[_i];
        }
        this.value = (0, pipe_1.pipe)(callbacks).apply(void 0, this.mapToValues(parents));
    };
    Reactive.prototype.getDeps = function () {
        return this.deps;
    };
    Reactive.prototype.getParents = function () {
        return this.parents;
    };
    Reactive.prototype.depend = function (callback, options) {
        var isStrict = (options !== null && options !== void 0 ? options : {}).isStrict;
        if (isStrict !== undefined) {
            this.isStrict = isStrict;
        }
        if (callback.length !== this.closestNonEmptyParents.length) {
            throw new Error("\n                Item depends on ".concat(this.closestNonEmptyParents.length, " items, but you passed ").concat(callback.length, " arguments.\n                Amount of arguments of dependency callback must be equal to amount of items this item depends on\n            "));
        }
        this.rules.push(callback);
        if (this.value === null) {
            this.value = callback.apply(void 0, this.mapToValues(this.closestNonEmptyParents));
        }
        else {
            this.value = callback(this.value);
        }
        return this;
    };
    Reactive.prototype.dependsOn = function () {
        var reactives = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            reactives[_i] = arguments[_i];
        }
        var dep = createDependencyChain(this, reactives);
        dep.init();
        return dep;
    };
    Reactive.prototype.free = function () {
        var _this = this;
        var reactives = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            reactives[_i] = arguments[_i];
        }
        reactives.forEach(function (reactive) {
            _this.deps.delete(reactive);
            reactive.getParents().delete(_this);
        });
    };
    Reactive.prototype.break = function () {
        var _this = this;
        var reactives = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            reactives[_i] = arguments[_i];
        }
        reactives.forEach(function (reactive) {
            _this.parents.delete(reactive);
            reactive.getDeps().delete(_this);
        });
    };
    Reactive.prototype.isDependent = function () {
        return this.parents.size > 0;
    };
    Reactive.prototype.isEmptyDep = function () {
        return this.isDependent() && this.value === null;
    };
    Reactive.prototype.init = function () {
        this.value = null;
    };
    Reactive.prototype.mapToValues = function (reactives) {
        return reactives.map(function (reactive) { return reactive.getValue(); });
    };
    Reactive.prototype.checkDeps = function () {
        if (this.closestNonEmptyParents.length > 1) {
            throw new Error("\n                The current dependency method supports dependency of only one item.\n                Now it depends on ".concat(this.closestNonEmptyParents.length, " items with values ").concat(this.mapToValues(this.closestNonEmptyParents), "\n            "));
        }
    };
    return Reactive;
}());
exports.Reactive = Reactive;
function createDependencyChain(dep, parents) {
    var emptyReactiveMet = false;
    var nonEmptyReactiveMet = false;
    parents.forEach(function (parent) {
        var _a;
        if (dep.getDeps().has(parent)) {
            throw new Error('Cycle dependency');
        }
        if (parent.isEmptyDep())
            emptyReactiveMet = true;
        if (!parent.isEmptyDep())
            nonEmptyReactiveMet = true;
        if ((parent.isEmptyDep() && nonEmptyReactiveMet) ||
            (!parent.isEmptyDep() && emptyReactiveMet)) {
            throw new Error('Item cannot depend on both empty dependent item and non empty item');
        }
        parent.getDeps().add(dep);
        dep.getParents().add(parent);
        if (parent.isEmptyDep()) {
            (_a = dep.closestNonEmptyParents).push.apply(_a, parent.closestNonEmptyParents);
        }
        else {
            dep.closestNonEmptyParents.push(parent);
        }
    });
    return dep;
}
