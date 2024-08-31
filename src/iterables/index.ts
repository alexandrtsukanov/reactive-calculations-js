const Reactive = require('../sync.ts')

interface DependencyOptions {
    isStrict: boolean;
}

type ArrayMethod<T> = (value: T) => Array<T>;

class IterableReactive extends Reactive {
    constructor(value: Iterable<unknown>) {
        super();
        this.value = value[Symbol.iterator]();
    }

    map(callback: ArrayMethod<unknown>, options?: DependencyOptions) {
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

    filter(callback: ArrayMethod<unknown>, options?: DependencyOptions) {
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