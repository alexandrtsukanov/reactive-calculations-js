// import { DependencyChain } from "./types";

type Exept = Exclude<null | undefined, any>;

type DependencyChain<T> = Set<Reactive<T>>;

interface DependencyOptions {
    isStrict: boolean;
}

class Reactive<T extends NonNullable<any>> {
    private value: T | null;
    private deps: DependencyChain<T>;
    private parents: DependencyChain<T>;
    rule: ((...args: any[]) => T) | null;
    closestNonEmptyParents: Reactive<T>[];
    isStrict = true;

    constructor(value: T | null = null) {
        this.value = value;
        this.deps = new Set();
        this.parents = new Set();
        this.rule = null;
        this.closestNonEmptyParents = [];
    }

    getValue() {
        return this.value;
    }

    update(newValue: T | ((prevValue: T) => T)) {
        if (this.isDependent() && this.isStrict) {
            return;
        }

        // instanceof works!
        if (newValue instanceof Function) {
            if (this.value !== null) {
                this.value = newValue(this.value)
            }
        } else {
            this.value = newValue;
        }

        // const updater: Function = typeof newValue === 'function'
        //     ? newValue
        //     : (_: T) => newValue
            
        // this.value = updater(this.value);

        this.updateDeps();
    }

    private updateDeps() {
        const queue: Reactive<T>[] = Array.from(this.deps);
        let cursor = 0;

        while (cursor < queue.length) {
            const reactive = queue[cursor];
            const {rule} = reactive;

            if (!reactive.isEmptyDep()) {
                const arrayOfParents = reactive.closestNonEmptyParents;
                reactive.updateDep(rule, ...arrayOfParents);
            }

            const dependencies = reactive.getDeps();

            dependencies.forEach(dep => {
                queue.push(dep);
            })

            cursor += 1;
        }
    }
 
    updateDep(callback: ((...args: any[]) => T) | null, ...parents: Reactive<T>[]) {
        if (callback) {
            this.value = callback(...this.mapToValues(parents));
        }
    }

    getDeps() {
        return this.deps;
    }

    getParents() {
        return this.parents;
    }

    depend(callback: (...args: any[]) => T, options?: DependencyOptions) {
        const {isStrict} = options ?? {};

        if (isStrict !== undefined) {
            this.isStrict = isStrict;
        }
        
        const arrayOfParents = Array.from(this.closestNonEmptyParents);

        if (callback.length !== arrayOfParents.length) {
            throw new Error(`Item depends on ${arrayOfParents.length} items, but you passed ${callback.length} arguments. Amount of arguments of dependency callback must be equal to amount of items this item depends on`);
        }

        this.rule = callback;

        this.value = this.rule(...this.mapToValues(arrayOfParents));

        return this;
    }

    dependsOn(...reactives: Reactive<T>[]) {
        reactives.forEach(reactive => {
            if (this.deps.has(reactive)) {
                throw new Error('Cycle dependency');
            }

            reactive.getDeps().add(this);
            this.parents.add(reactive);
        })

        return this;
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

    isDependent() {
        return this.parents.size > 0;
    }

    isEmptyDep() {
        return this.isDependent() && this.value === null && this.rule === null;
    }

    private mapToValues(reactives: Reactive<T>[]) {
        return reactives.map((reactive: Reactive<T>) => reactive.getValue());
    }
}

function fromValue(value: number | string | boolean) {
    return new Reactive(value);
}

function from(...reactives: Reactive<any>[]) {
    const newReactive = new Reactive();

    let emptyReactiveMet = false;
    let nonEmptyReactiveMet = false;

    reactives.forEach((reactive) => {
        if (reactive.isEmptyDep()) emptyReactiveMet = true;
        if (!reactive.isEmptyDep()) nonEmptyReactiveMet = true;

        if (
            (reactive.isEmptyDep() && nonEmptyReactiveMet) ||
            (!reactive.isEmptyDep() && emptyReactiveMet)
        ) {
            throw new Error('Item cannot depend on both empty dependent item and non empty item');
        }

        reactive
            .getDeps()
            .add(newReactive)

        newReactive.getParents().add(reactive);

        if (reactive.isEmptyDep()) {
            newReactive.closestNonEmptyParents.push(...reactive.closestNonEmptyParents)
        } else {
            newReactive.closestNonEmptyParents.push(reactive);
        }
    });

    return newReactive;
}

const a = fromValue(1);
const b = fromValue(2);
const c = from(a, b);
const d = from(c).depend((a, b) => a + b + 5);

// const a = fromValue(1);
// const b = fromValue(2);
// const c = from(a);
// const d = from(b);
// const e = from(c, d).depend((a, b) => a + b + 5) // 8

a.update(10)
b.update(20)

console.log(a.getValue());
console.log(b.getValue());
console.log(c.getValue());
console.log(d.getValue());
// console.log(e.getValue());

module.exports = {
    Reactive,
    fromValue,
    from,
}