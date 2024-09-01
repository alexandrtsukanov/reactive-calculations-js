import { ArrayMethod } from "../arrays";
import { DependencyOptions, Reactive, createDependencyChain } from "../reactive";

class IterableReactive extends Reactive<Iterable<any>> {
    iterator: Iterator<any> | undefined;

    constructor(value: Iterable<any> | null = null) {
        super(value);
        this.iterator = value?.[Symbol.iterator]();
    }

    getIterator() {
        return this.iterator;
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

export function fromIterable(value: Array<any>) {
    return new IterableReactive(value);
}

export function from(...reactives: IterableReactive[]) {
    const newReactive = new IterableReactive();
    newReactive.getValue()

    return createDependencyChain(newReactive, reactives);
}