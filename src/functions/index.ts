import {Reactive, createDependencyChain, DependencyOptions} from "../reactive";
import { pipe } from "../utils/pipe";

class FunctionReactive extends Reactive<Function> {
    getValue() {
        return this.value ?? (() => {});
    }

    update(newValue: Function) {
        if (this.value === null) {
            return;
        }
        
        if (this.isDependent() && this.isStrict) {
            return;
        }

        this.value = newValue;

        this.updateDepsFns();
    }

    private updateDepsFns() {
        const queue = Array.from(this.getDeps());
        let cursor = 0;

        while (cursor < queue.length) {
            const reactive = queue[cursor] as FunctionReactive;
            const {rules} = reactive;

            if (!reactive.isEmptyDep()) {
                reactive.updateDepFn(
                    this.value ??  (() => {}),
                    rules
                );
            }

            const dependencies = reactive.getDeps();

            dependencies.forEach(dep => {
                queue.push(dep);
            })

            cursor += 1;
        }
    }

    updateDepFn(valueFn: Function, callbacks: ((...args: any[]) => any)[]) {
        this.value = pipe([valueFn, ...callbacks]);
    }

    depend(callback:  (...args: any[]) => any, options?: DependencyOptions) {
        const {isStrict} = options ?? {};

        if (isStrict !== undefined) {
            this.isStrict = isStrict;
        }
        
        if (callback.length !== this.closestNonEmptyParents.length) {
            throw new Error(`
                Item depends on ${this.closestNonEmptyParents.length} items, but you passed ${callback.length} arguments.
                Amount of arguments of dependency callback must be equal to amount of items this item depends on
            `);
        }

        this.rules.push(callback);
        this.value = pipe([...this.mapToValues(this.closestNonEmptyParents), ...this.rules]);

        return this;        
    }
}

export function fromFunction(value: Function) {
    return new FunctionReactive(value);
}

export function from(...reactives: FunctionReactive[]): FunctionReactive  {
    const newReactive = new FunctionReactive();

    return createDependencyChain(newReactive, reactives);
}

const f = (a, b) => a + b;
const f1 = fromFunction(f);
const f2 = from(f1).depend(val => val + 1);

console.log(f1.getValue()(10, 5));
console.log(f2.getValue()(10, 5));
console.log(f2.getValue()(20, 10));

const fNew = (a, b) => a * b;
f1.update(fNew);

console.log(f1.getValue()(10, 5));
console.log(f2.getValue()(10, 5));
