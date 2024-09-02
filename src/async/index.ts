import { DependencyOptions, Reactive, createDependencyChain } from "../reactive";
import { pipe } from "../utils/pipe";

export class AsyncReactive extends Reactive<Promise<any>> {
    updateAsync(newValue: Promise<any>): Promise<any> {
        if (!this.value) {            
            return Promise.reject();
        }

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
                        console.log('rules outer =>', rules);
                        
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

    updateDepAsync(callbacks: ((...args: any[]) => any)[], parents: AsyncReactive[]) {
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

export function createPromise(value: Promise<any>) {
    return new AsyncReactive(value);
}

export function fromProm(...reactives: AsyncReactive[]): AsyncReactive {
    const newReactive = new AsyncReactive();

    return createDependencyChain(newReactive, reactives);
}

const promise1 = new Promise((res) => {
    setTimeout(() => res(1), 1000)
})

const p1 = createPromise(promise1);
const p2 = fromProm(p1).depend(val => val + 1)
const p3 = fromProm(p2).depend(val => val + 2)
const p4 = fromProm(p3).depend(val => val * 3)
const p5 = fromProm(p4).depend(val => val.toString());

p1.updateAsync(Promise.resolve(4))
    .then(() => {
        p1.getValue()?.then(val => console.log(2, val)) // 2
    })
    .then(() => {
        console.log(3, p2.getValue()) // 2
    })
    .then(() => {
        console.log(4, p3.getValue()) // 2
    })
    .then(() => {
        console.log(1, p5.getValue()) // 1
    })
    // .then(() => {
    //     console.log(4, p5.getValue()); // 7
    // })