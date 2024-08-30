const Reactive = require('../sync.ts')

interface DependencyOptions {
    isStrict: boolean;
}

type ArrayMethod<T> = (value: T, index: number, array: T[]) => Array<T>;

class ArrayReactive extends Reactive {
    constructor(value: Array<any>) {
        super(value)
    }

    map(callback: ArrayMethod<any>, options?: DependencyOptions) {
        return this.depend(
            (arr: Array<any>) => arr.map(callback),
            options,
        );
    }

    filter(callback: ArrayMethod<any>, options?: DependencyOptions) {
        return this.depend(
            (arr: Array<any>) => arr.filter(callback),
            options,
        );
    }

    flatMap(callback: any, options?: DependencyOptions) { // ? callback flatMap
        return this.depend(
            (arr: Array<any>) => arr.flatMap(callback),
            options,
        );
    }

    append(arrToAppend: Array<any>, options?: DependencyOptions) {
        return this.depend(
            (arr: Array<any>) => [...arr, ...arrToAppend],
            options,
        );
    }

    unshift(arrToUnshift: Array<any>, options?: DependencyOptions) {
        return this.depend(
            (arr: Array<any>) => [...arrToUnshift, ...arr],
            options,
        );
    }

    reverse(options?: DependencyOptions) {
        return this.depend(
            (arr: Array<any>) => [...arr.reverse()],
            options,
        );
    }

    private checkDeps() {
        //
    }
}

function fromArray(value: Array<any>) {
    return new ArrayReactive(value);
}

module.exports = {fromArray};