class Reactive {
    constructor(value = null) {
        this.value = value;
        this.deps = []
        this.dependants = []
    }

    getValue() {
        return this.value;
    }

    updateValue(callback) {
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

console.log(a.getValue()); // 1
console.log(b.getValue()); // 2
console.log(c.getValue()); // 8
console.log(d.getValue()); // 80

a.updateValue((val) => val + 10);
b.updateValue((val) => val + 10);
console.log(a.getValue()); // 1
console.log(b.getValue()); // 2
// c.updateValue((val) => val - 5);

// console.log(a.getValue());
// console.log(b.getValue());
console.log(c.getValue());
console.log(d.getValue());