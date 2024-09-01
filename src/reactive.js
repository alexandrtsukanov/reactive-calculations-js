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
        if (this.value === null) {
            return;
        }
        if (this.isDependent() && this.isStrict) {
            return;
        }
        if (newValue instanceof Function) {
            this.value = newValue(this.value);
        }
        else {
            this.value = newValue;
        }
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
        if (callback.length !== this.closestNonEmptyParents.length) {
            throw new Error("Item depends on ".concat(this.closestNonEmptyParents.length, " items, but you passed ").concat(callback.length, " arguments. Amount of arguments of dependency callback must be equal to amount of items this item depends on"));
        }
        this.rule = callback;
        if (this.value === null) {
            this.value = this.rule.apply(this, this.mapToValues(this.closestNonEmptyParents));
        }
        else {
            this.value = this.rule(this.value);
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
        return this.isDependent() && this.value === null && this.rule === null;
    };
    Reactive.prototype.init = function () {
        this.value = null;
    };
    Reactive.prototype.mapToValues = function (reactives) {
        return reactives.map(function (reactive) { return reactive.getValue(); });
    };
    Reactive.prototype.checkDeps = function () {
        if (this.closestNonEmptyParents.length > 1) {
            throw new Error("The current dependency method supports dependency of only one item. Now it depends on ".concat(this.closestNonEmptyParents.length, " items with values ").concat(this.mapToValues(this.closestNonEmptyParents)));
        }
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
    return createDependencyChain(newReactive, reactives);
}
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
var r = new Reactive(undefined);
console.log(r.getValue());
var a = fromValue(1);
var b = fromValue(2);
var c = from(a);
var d = from(b);
//@ts-ignore
var e = from(c, d).depend(function (a, b) { return a + b; });
console.log(e.getValue());
// const a = fromValue(1);
// const b = fromValue(2);
// const c = from(a);
// const d = from(b);
// const e = from(c, d).depend((a, b) => a + b + 5) // 8
a.update(10);
b.update(20);
console.log(a.getValue());
console.log(b.getValue());
console.log(c.getValue());
console.log(d.getValue());
console.log(e.getValue());
module.exports = {
    Reactive: Reactive,
    createDependencyChain: createDependencyChain,
    from: from,
};
