const {Reactive} = require('../values/index.ts');

interface DependencyOptions {
    isStrict: boolean;
}

type ArrayMethod<T> = (value: T) => Array<T>;
type FlatMapArray<T> = (this: undefined, value: T) => Array<T>;

class ArrayReactive extends Reactive {
    constructor(value: Array<unknown>) {
        super(value)
    }

    map(callback: ArrayMethod<unknown>, options?: DependencyOptions) {
        this.checkDeps();

        return this.depend(
            (arr: Array<unknown>) => arr.map(callback),
            options,
        );
    }

    filter(callback: ArrayMethod<unknown>, options?: DependencyOptions) {
        this.checkDeps();
        
        return this.depend(
            (arr: Array<unknown>) => arr.filter(callback),
            options,
        );
    }

    flatMap(callback: FlatMapArray<unknown>, options?: DependencyOptions) {
        this.checkDeps();

        return this.depend(
            (arr: Array<unknown>) => arr.flatMap(callback),
            options,
        );
    }

    append(arrToAppend: Array<unknown>, options?: DependencyOptions) {
        this.checkDeps();

        return this.depend(
            (arr: Array<unknown>) => [...arr, ...arrToAppend],
            options,
        );
    }

    unshift(arrToUnshift: Array<unknown>, options?: DependencyOptions) {
        this.checkDeps();

        return this.depend(
            (arr: Array<unknown>) => [...arrToUnshift, ...arr],
            options,
        );
    }

    reverse(options?: DependencyOptions) {
        this.checkDeps();

        return this.depend(
            (arr: Array<unknown>) => [...arr.reverse()],
            options,
        );
    }
}

function fromArray(value: Array<any>) {
    return new ArrayReactive(value);
}

module.exports = {fromArray};