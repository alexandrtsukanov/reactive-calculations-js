import { Reactive, createDependencyChain } from "../reactive";

interface DependencyOptions {
    isStrict: boolean;
}

class FunctionReactive extends Reactive<Function> {
    depend(callback:  (...args: any[]) => any, options?: DependencyOptions) {
        const {isStrict} = options ?? {};

        if (isStrict !== undefined) {
            this.isStrict = isStrict;
        }
        
        const arrayOfParents = Array.from(this.closestNonEmptyParents);

        if (callback.length !== arrayOfParents.length) {
            throw new Error(`Item depends on ${arrayOfParents.length} items, but you passed ${callback.length} arguments. Amount of arguments of dependency callback must be equal to amount of items this item depends on`);
        }

        const pipe = fns => (...args) => {
            const firstFn = fns[0];
            const firstResult = firstFn(...args);

            return fns
                .slice(1)
                .reduce((res, fn) => fn(res), firstResult)
        }

        this.rule = callback;
        this.value = pipe([...this.closestNonEmptyParents, this.rule]);

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