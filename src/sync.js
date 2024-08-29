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
        this.isFree = true;
        this.isStrict = true;
        this.value = value;
        this.deps = new Set();
        this.parents = new Set();
        this.rules = new Map();
        this.rule = null;
    }
    Reactive.prototype.getValue = function () {
        return this.value;
    };
    Reactive.prototype.update = function (newValue) {
        // if (typeof newValue === 'function') {
        //     this.value = newValue(this.value);
        // } else {
        //     //@ts-ignore
        //     this.value = newValue;
        // }
        // this.updateDeps();
        var updater = typeof newValue === 'function'
            ? newValue
            : function () { return newValue; };
        // @ts-ignore
        this.value = updater(this.value);
        this.updateDeps();
    };
    Reactive.prototype.updateDeps = function () {
        var queue = Array.from(this.deps);
        // const queue: Reactive<T>[] = [...this.deps];
        var cursor = 0;
        while (cursor < queue.length) {
            var reactive = queue[cursor];
            var rule = reactive.rule;
            if (rule && reactive.getValue() !== null) {
                // @ts-ignore
                var set = reactive.getParents();
                var arr = Array.from(set);
                reactive.updateDep.apply(reactive, __spreadArray([rule], arr, false));
            }
            var dependencies = reactive.getDeps();
            dependencies.forEach(function (dep) {
                queue.push(dep);
            });
            cursor += 1;
        }
    };
    // private updateSelf() {
    // }
    Reactive.prototype.updateDep = function (callback) {
        var parents = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            parents[_i - 1] = arguments[_i];
        }
        if (callback) {
            // const arrayOfParents = []
            this.value = callback.apply(void 0, parents.map(function (reactive) { return reactive.getValue(); }));
        }
    };
    Reactive.prototype.getDeps = function () {
        return this.deps;
    };
    Reactive.prototype.getParents = function () {
        return this.parents;
    };
    Reactive.prototype.depend = function (callback) {
        this.rule = callback;
        var arrayOfParents = Array.from(this.parents);
        // const arrayOfParents = [...this.parents];
        // Check args amount
        this.value = this.rule.apply(this, arrayOfParents.map(function (reactive) { return reactive.getValue(); }));
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
    reactives.forEach(function (reactive) {
        reactive
            .getDeps()
            .add(newReactive);
        newReactive.getParents().add(reactive);
    });
    return newReactive;
}
var a = fromValue(1);
var b = fromValue(2);
var c = from(a, b).depend(function (val, b) { return val + b + 5; });
console.log(a.getValue());
console.log(b.getValue());
console.log(c.getValue());
a.update(function (val) { return val + 10; });
b.update(function (val) { return val + 10; });
console.log('\n');
console.log(a.getValue());
console.log(b.getValue());
console.log(c.getValue());
var d = from(c).depend(function (val) { return val * 10; });
console.log(d.getValue());
