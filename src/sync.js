// import { DependencyChain } from "./types";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var Reactive = /** @class */ (function () {
    function Reactive(value) {
        if (value === void 0) { value = null; }
        this.isStrict = true;
        this.value = value;
        this.deps = new Set();
        this.parents = new Set();
        this.rule = null;
        this.closestNonEmptyParents = [];
    }
    Reactive.prototype.getValue = function () {
        return this.value;
    };
    Reactive.prototype.update = function (newValue) {
        if (this.isDependent() && this.isStrict) {
            return;
        }
        var updater = typeof newValue === 'function'
            ? newValue
            : function () { return newValue; };
        this.value = updater(this.value);
        this.updateDeps();
    };
    Reactive.prototype.updateDeps = function () {
        var queue = Array.from(this.deps);
        var cursor = 0;
        while (cursor < queue.length) {
            var reactive = queue[cursor];
            var rule = reactive.rule;
            if (!reactive.isEmptyDep()) {
                var arrayOfParents = reactive.closestNonEmptyParents;
                reactive.updateDep.apply(reactive, __spreadArray([rule], arrayOfParents, false));
            }
            var dependencies = reactive.getDeps();
            dependencies.forEach(function (dep) {
                queue.push(dep);
            });
            cursor += 1;
        }
    };
    Reactive.prototype.updateDep = function (callback) {
        var parents = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            parents[_i - 1] = arguments[_i];
        }
        if (callback) {
            this.value = callback.apply(void 0, this.mapToValues(parents));
        }
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
        var arrayOfParents = Array.from(this.closestNonEmptyParents);
        if (callback.length !== arrayOfParents.length) {
            throw new Error("Item depends on ".concat(arrayOfParents.length, " items, but you passed ").concat(callback.length, " arguments. Amount of arguments of dependency callback must be equal to amount of items this item depends on"));
        }
        this.rule = callback;
        this.value = this.rule.apply(this, this.mapToValues(arrayOfParents));
        return this;
    };
    Reactive.prototype.dependsOn = function () {
        var _this = this;
        var reactives = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            reactives[_i] = arguments[_i];
        }
        reactives.forEach(function (reactive) {
            reactive.getDeps().add(_this);
            _this.parents.add(reactive);
        });
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
        return this.isDependent() && this.value === null && this.rule === null;
    };
    Reactive.prototype.mapToValues = function (reactives) {
        return reactives.map(function (reactive) { return reactive.getValue(); });
    };
    return Reactive;
}());
function fromValue(value) {
    return new Reactive(value);
}
function from() {
    var reactives = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        reactives[_i] = arguments[_i];
    }
    var newReactive = new Reactive();
    var emptyReactiveMet = false;
    var nonEmptyReactiveMet = false;
    reactives.forEach(function (reactive, index) {
        var _a;
        if (reactive.isEmptyDep())
            emptyReactiveMet = true;
        if (!reactive.isEmptyDep())
            nonEmptyReactiveMet = true;
        if ((reactive.isEmptyDep() && nonEmptyReactiveMet) ||
            (!reactive.isEmptyDep() && emptyReactiveMet)) {
            throw new Error('Item cannot depend on both empty dependent item and non empty item');
        }
        reactive
            .getDeps()
            .add(newReactive);
        newReactive.getParents().add(reactive);
        if (reactive.isEmptyDep()) {
            (_a = newReactive.closestNonEmptyParents).push.apply(_a, reactive.closestNonEmptyParents);
            // newReactive.closestNonEmptyParents[index] = reactive.closestNonEmptyParents[index];
        }
        else {
            newReactive.closestNonEmptyParents.push(reactive);
        }
    });
    // if (reactives[0].isEmptyDep()) {
    //     newReactive.closestNonEmptyParents = reactives[0].closestNonEmptyParents;
    // } else {
    //     newReactive.closestNonEmptyParents = [...reactives];
    // }
    return newReactive;
}
// const a = fromValue(1);
// const b = fromValue(2);
// const c = from(a, b);
// const d = from(c).depend((a, b) => a + b + 5);
var a = fromValue(1);
var b = fromValue(2);
var c = from(a);
var d = from(b);
var e = from(c, d).depend(function (a, b) { return a + b + 5; });
a.update(10)
b.update(20)
console.log(a.getValue());
console.log(b.getValue());
console.log(c.getValue());
console.log(d.getValue());
console.log(e.getValue());
module.exports = {
    Reactive: Reactive,
    fromValue: fromValue,
    from: from,
};
