import { DependencyOptions, Reactive } from "../reactive";

type ArrayMethod<T> = (value: T) => T;

class IterableReactive extends Reactive<Iterable<any>> {
    iterator: Iterator<any>;

    constructor(value: Iterable<any>) {
        super(value);
        this.iterator = value[Symbol.iterator]();
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

function fromIterable(value: Array<any>) {
    return new IterableReactive(value);
}

module.exports = {fromIterable};