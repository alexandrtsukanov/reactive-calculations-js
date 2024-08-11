class Reactive {
    protected value: number | null;
    deps: any;
    depsReversed: any;

    constructor(value: number | null = null) {
        this.value = value;
        this.deps = new Map();
        this.depsReversed = new Map();
    }

    getValue(): number | null {
        return this.value;
    }

    updateValue(callback: (...args: number[]) => number) {
        this.value = callback(this.value);
        this.dependants.forEach(reactive => reactive.updateValue(() => callback(reactive.getValue())));
    }

    getDependants() {
        return this.dependants;
    }

    getDependencies() {
        return this.dependencies;
    }

    setDependencies(deps) {
        this.dependencies = deps;
    }

    map(callback) {
        this.value = callback(...this.dependencies.map(reactive => reactive.getValue()));
        return this;
    }
}

function fromValue(value) {
    return new Reactive(value);
}

function from(...reactives) {
    const newReactive = new Reactive();

    reactives.forEach(reactive => reactive.getDependants().push(newReactive));

    newReactive.setDependencies(reactives);

    return newReactive;
}

const a = fromValue(1);
const b = fromValue(2);
const c = from(a, b).map((a, b) => a + b + 5);
const d = from(c).map((c) => c * 10);

// console.log(a.getValue()); // 1
// console.log(b.getValue()); // 2
// console.log(c.getValue()); // 8
// console.log(d.getValue()); // 80

console.log(d.getValue());
a.updateValue((val) => val + 10);
b.updateValue((val) => val + 10);
c.updateValue((val) => val - 5);


// console.log(a.getValue());
// console.log(b.getValue());
// console.log(d.getValue());

// fromBoolean

const truee = fromBoolean(true);
const truee2 = form(truee).same();
console.log(truee2); // true
const truee3 = form(truee2).opposite();
console.log(truee3); // false