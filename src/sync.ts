import { DependencyChain } from "./types";

class Reactive {
    private value: number | null;
    deps: DependencyChain<any>;
    isFree = true;
    isStrict = true;

    constructor(value: number | null = null) {
        this.value = value;
        this.deps = new Map();
    }

    getValue() {
        return this.value;
    }

    updateValue(callback: (args: number[]) => any) {
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