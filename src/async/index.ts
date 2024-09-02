import { DependencyOptions, Reactive, createDependencyChain } from "../reactive";
import { pipe } from "../utils/pipe";

export class AsyncReactive extends Reactive<Promise<any>> {
    updateAsync(newValue: Promise<any>): Promise<any> {
        if (!this.value) {            
            return Promise.reject();
        }

        this.checkChainLength(this);

        return this.value
            .then(async () => {
                this.value = newValue;

                const queue = Array.from(this.getDeps())
                let cursor = 0;
    
                while (cursor < queue.length) {
                    const reactive = queue[cursor] as AsyncReactive;
                    const {rules} = reactive;
    
                    if (!reactive.isEmptyDep()) {
                        const arrayOfParents = reactive.closestNonEmptyParents as AsyncReactive[];
                                                
                        await reactive.updateDepAsync(rules, arrayOfParents)
                    }
    
                    const dependencies = reactive.getDeps();
    
                    dependencies.forEach(dep => {
                        queue.push(dep);
                    })
    
                    cursor += 1;
                }
            })
            .catch(reason => this.update(reason))
    }

    private updateDepAsync(callbacks: ((...args: any[]) => any)[], parents: AsyncReactive[]) {
        Promise.all([...this.mapToValues(parents)])
            .then(values => {
                this.value = pipe(callbacks)(...values);
            })
            .catch(reason => this.value = reason)
    }
    
    depend(callback: (...args: any[]) => any, options?: DependencyOptions) {
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

        if (this.value === null) {
            const parents = Promise.all(this.mapToValues(this.closestNonEmptyParents));

            this.value = parents
                .then(values => {
                    return pipe(this.rules)(...values)
                })
                .catch(reason => reason)
        } else {
            this.value
                .then(value => {
                    return pipe(this.rules)(value);
                })
                .catch(reason => reason)
        }

        return this;
    }

    private checkChainLength(current: AsyncReactive) {
        if (
            current.getDeps().size > 0 &&
            Array.from(current.getDeps())
                .some(dep => dep.getDeps().size > 0)
        ) {
            throw new Error('Updating promises in chain consisting of more than 2 promises is not supported');
        }
    }
}

export function createPromise(value: Promise<any>) {
    return new AsyncReactive(value);
}

export function fromProm(...reactives: AsyncReactive[]): AsyncReactive {
    const newReactive = new AsyncReactive();

    return createDependencyChain(newReactive, reactives);
}