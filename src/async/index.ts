import { DependencyOptions, Reactive, createDependencyChain } from "../reactive";
import { pipe } from "../utils/pipe";

export class AsyncReactive extends Reactive<Promise<any>> {
    updateAsync(newValue: Promise<any>): Promise<any> {
        if (!this.value) {            
            return Promise.reject();
        }

        return this.value
            .then(() => {
                this.value = newValue;

                const queue = Array.from(this.getDeps())
                let cursor = 0;
    
                while (cursor < queue.length) {
                    const reactive = queue[cursor] as AsyncReactive;
                    const {rules} = reactive;
    
                    if (!reactive.isEmptyDep()) {
                        const arrayOfParents = reactive.closestNonEmptyParents as AsyncReactive[];
                        console.log('rules outer =>', rules);
                        
                        reactive.updateDepAsync(rules, arrayOfParents)
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

    updateDepAsync(callbacks: ((...args: any[]) => any)[], parents: AsyncReactive[]) {
        Promise.all([...this.mapToValues(parents)])
            .then(values => {
                this.value = pipe(callbacks)(...values);
            })

            // .catch(reason => reason)
            // this.value
            //     ?.then(() => {
            //         console.log('values', this.value, values);
                    
            //         console.log('pipe(callbacks)(...values) =>', pipe(callbacks)(...values), callbacks[0](values[0]));

            //         console.log('Finally value =>', this.value);
            //     })
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
                    return callback(...values);
                })
                .catch(reason => reason)
        } else {
            this.value
                .then(value => {
                    return callback(value);
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

const promise1 = new Promise((res) => {
    setTimeout(() => res(1), 1000)
})

const p1 = fromAsync(promise1);
const p2 = from(p1).depend(val => val + 5);

console.log(p1.getDeps());


p1.getValue()?.then(val => console.log(1, val)) // 1
p2.getValue()?.then(val => console.log(2, val)) // 6
p1.updateAsync(Promise.resolve(2))
    .then(() => {
        p1.getValue()?.then(val => console.log(3, val)) // 2
    })
    .then(() => {
        console.log(4, p2.getValue()); // 7
    })