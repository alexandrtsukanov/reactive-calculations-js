import {Reactive, createDependencyChain, DependencyOptions} from "../reactive";
import {pipe} from "../utils/pipe";

class FunctionReactive extends Reactive<Function> {
    rules: ((...args: any[]) => any)[];

    constructor(value: Function | null = null) {
        super(value);
        this.rules = [];
    }

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
        const allRules: ((...args: any[]) => any)[] = [];

        while (cursor < queue.length) {
            const reactive = queue[cursor] as FunctionReactive;
            const {rules} = reactive;
            allRules.push(...rules);

            if (!reactive.isEmptyDep()) {
                reactive.updateDepFn(
                    this.value ?? (() => {}),
                    allRules,
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

export function createFunction(value: Function) {
    return new FunctionReactive(value);
}

export function fromFn(...reactives: FunctionReactive[]): FunctionReactive  {
    if (reactives.length > 1) {
        throw new Error('Dependencies of more than 1 function are not supported')
    }

    const newReactive = new FunctionReactive();

    return createDependencyChain(newReactive, reactives);
}