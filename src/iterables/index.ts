import { ArrayMethod } from "../arrays";
import { DependencyOptions, Reactive, createDependencyChain } from "../reactive";

class IterableReactive extends Reactive<Iterable<any>> {
    getIterator() {
        return (this.value ?? [])[Symbol.iterator]();
    }

    map(callback: ArrayMethod<any>, options?: DependencyOptions) {
        this.checkDeps();

        return this.depend(
            (prevIterator) => {
                const arr = [...prevIterator].map(callback);
                const iterator = arr[Symbol.iterator]();
                
                return iterator;
            },
            options,
        );
    }

    filter(callback: ArrayMethod<any>, options?: DependencyOptions) {
        this.checkDeps();
        
        return this.depend(
            (prevIterator) => {
                const arr = [...prevIterator].filter(callback);
                const iterator = arr[Symbol.iterator]();
                
                return iterator;
            },
            options,
        );
    }

    reverse(options?: DependencyOptions) {
        this.checkDeps();
        
        return this.depend(
            (prevIterator) => {
                const arr = [...prevIterator].reverse();
                const iterator = arr[Symbol.iterator]();
                
                return iterator;
            },
            options,
        );
    }
}

export function createIterable(value: Iterable<any>) {
    return new IterableReactive(value);
}

export function fromIter(...reactives: IterableReactive[]): IterableReactive {
    const newReactive = new IterableReactive();

    return createDependencyChain(newReactive, reactives);
}
