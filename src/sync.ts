// import { DependencyChain } from "./types";

type DependencyChain<T> = Map<Reactive<T>, Set<[Reactive<T>, () => void]>>
type Initializer<T> = T extends any ? (T | (() => T)) : never

type DependencyChain2<T> = Set<Reactive<T>>;

class Reactive<T> {
    private value: T | null;
    private deps: DependencyChain2<T>;
    private parents: DependencyChain2<T>;
    rules: Map<Reactive<T>, Function>;
    isFree = true;
    isStrict = true;
    rule: ((...args: any[]) => T) | null;

    constructor(value: T | null = null) {
        this.value = value;
        this.deps = new Set();
        this.parents = new Set();
        this.rules = new Map();
        this.rule = null;
    }

    getValue() {
        return this.value;
    }

    update(newValue: Initializer<T>) {
        // if (typeof newValue === 'function') {
        //     this.value = newValue(this.value);
        // } else {
        //     //@ts-ignore
        //     this.value = newValue;
        // }

        // this.updateDeps();

        const updater = typeof newValue === 'function'
            ? newValue
            : () => newValue

        // @ts-ignore
        this.value = updater(this.value);

        this.updateDeps();
    }

    private updateDeps() {
        const queue: Reactive<T>[] = Array.from(this.deps)
        // const queue: Reactive<T>[] = [...this.deps];
        let cursor = 0;

        while (cursor < queue.length) {
            const reactive = queue[cursor];
            const {rule} = reactive;

            if (rule && reactive.getValue() !== null) {
                // @ts-ignore
                const set = reactive.getParents();
                const arr = Array.from(set);
                reactive.updateDep(rule, ...arr);
            }

            const dependencies = reactive.getDeps();

            dependencies.forEach(dep => {
                queue.push(dep);
            })

            cursor += 1;
        }
    }

    // private updateSelf() {

    // }

    updateDep(callback: typeof this.rule, ...parents: Reactive<T>[]) {
        if (callback) {
            // const arrayOfParents = []

            this.value = callback(...parents.map((reactive: Reactive<T>) => reactive.getValue()));
        }
    }

    getDeps() {
        return this.deps;
    }

    getParents() {
        return this.parents;
    }

    depend(callback: (...args: any[]) => T) {
        this.rule = callback;
        const arrayOfParents = Array.from(this.parents);
        // const arrayOfParents = [...this.parents];
        
        // Check args amount

        this.value = this.rule(...arrayOfParents.map((reactive: Reactive<T>) => reactive.getValue()));

        return this;
    }

    dependsOn(...reactives: Reactive<T>[]) {
        reactives.forEach(reactive => {
            reactive.getDeps().add(this);
            this.parents.add(reactive);
        })
    }

    free(...reactives: Reactive<T>[]) {
        reactives.forEach(reactive => {
            this.deps.delete(reactive);

            reactive.getParents().delete(this);
        })
    }

    break(...reactives: Reactive<T>[]) {
        reactives.forEach(reactive => {
            this.parents.delete(reactive);

            reactive.getDeps().delete(this);
        })
    }
}

function fromValue(value: any) {
    return new Reactive(value);
}

function from(...reactives: Reactive<any>[]) {
    const newReactive = new Reactive();

    reactives.forEach(reactive => {
        reactive
            .getDeps()
            .add(newReactive)

        newReactive.getParents().add(reactive);
    });
    
    return newReactive;
}

const a = fromValue(1);
const b = fromValue(2);
const c = from(a, b).depend((val, b) => val + b + 5);

console.log(a.getValue())
console.log(b.getValue())
console.log(c.getValue())

a.update((val: number) => val + 10)
b.update((val: number) => val + 10)

console.log('\n');

console.log(a.getValue())
console.log(b.getValue())
console.log(c.getValue())

const d = from(c).depend((val) => val * 10);
console.log(d.getValue())
