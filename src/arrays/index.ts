import {Reactive, DependencyOptions, createDependencyChain} from '../reactive';

export type MapArray<T> = (value: T) => T;
export type FilterArray<T> = (value: T) => boolean;
type FlatMapArray<T> = (this: undefined, value: T) => Array<T>;

class ArrayReactive extends Reactive<Array<any>> {
    map(callback: MapArray<any>, options?: DependencyOptions) {
        this.checkDeps();

        return this.depend(
            (arr: Array<unknown>) => arr.map(callback),
            options,
        );
    }

    filter(callback: FilterArray<any>, options?: DependencyOptions) {
        this.checkDeps();
        
        return this.depend(
            (arr: Array<any>) => arr.filter(callback),
            options,
        );
    }

    flatMap(callback: FlatMapArray<any>, options?: DependencyOptions) {
        this.checkDeps();

        return this.depend(
            (arr: Array<any>) => arr.flatMap(callback),
            options,
        );
    }

    append(arrToAppend: Array<any>, options?: DependencyOptions) {
        this.checkDeps();

        return this.depend(
            (arr: Array<any>) => [...arr, ...arrToAppend],
            options,
        );
    }

    unshift(arrToUnshift: Array<any>, options?: DependencyOptions) {
        this.checkDeps();

        return this.depend(
            (arr: Array<any>) => [...arrToUnshift, ...arr],
            options,
        );
    }

    reverse(options?: DependencyOptions) {
        this.checkDeps();

        return this.depend(
            (arr: Array<any>) => [...arr.reverse()],
            options,
        );
    }
}

export function createArray(value: Array<any>) {
    return new ArrayReactive(value);
}

export function fromArr(...reactives: ArrayReactive[]): ArrayReactive {
    const newReactive = new ArrayReactive();

    return createDependencyChain(newReactive, reactives);
}