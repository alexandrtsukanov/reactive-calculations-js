import { DependencyOptions, Reactive, createDependencyChain } from "../reactive.ts";

export class AsyncReactive extends Reactive<Promise<any>> {
    asyncValue: Promise<any> | null;

    constructor(value: Promise<any> | null = null) {
        super(value)
        this.asyncValue = value
    }

    getValue() {
        return this.asyncValue;
    }
    
    depend(callback: (...args: any[]) => any, options?: DependencyOptions) {
        const {isStrict} = options ?? {};

        if (isStrict !== undefined) {
            this.isStrict = isStrict;
        }
        
        if (callback.length !== this.closestNonEmptyParents.length) {
            throw new Error(`Item depends on ${this.closestNonEmptyParents.length} items, but you passed ${callback.length} arguments. Amount of arguments of dependency callback must be equal to amount of items this item depends on`);
        }

        if (this.asyncValue === null) {
            const parents = Promise.all(this.mapToValues(this.closestNonEmptyParents));

            this.asyncValue = parents
                .then(values => {
                    this.rules.push(callback);

                    return this.rule(...values);
                })
                .catch(reason => reason)
        } else {
            this.asyncValue
                .then(value => {
                    this.rules.push(callback);

                    return this.rule(value);
                })
                .catch(reason => reason)
        }

        return this;
    }
}

export function fromAsync(value: Promise<any>) {
    return new AsyncReactive(value);
}

export function from(...reactives: AsyncReactive[]): AsyncReactive {
    const newReactive = new AsyncReactive();

    return createDependencyChain(newReactive, reactives);
}