import {Reactive, DependencyOptions} from '../reactive.ts';

type ArrayMethod<T> = (value: T) => T;
type FlatMapArray<T> = (this: undefined, value: T) => Array<T>;

class ArrayReactive extends Reactive<Array<any>> {
    map(callback: ArrayMethod<any>, options?: DependencyOptions) {
        this.checkDeps();

        return this.depend(
            (arr: Array<unknown>) => arr.map(callback),
            options,
        );
    }

    filter(callback: ArrayMethod<any>, options?: DependencyOptions) {
        this.checkDeps();
        
        return this.depend(
            (arr: Array<unknown>) => arr.filter(callback),
            options,
        );
    }

    flatMap(callback: FlatMapArray<any>, options?: DependencyOptions) {
        this.checkDeps();

        return this.depend(
            (arr: Array<unknown>) => arr.flatMap(callback),
            options,
        );
    }

    append(arrToAppend: Array<any>, options?: DependencyOptions) {
        this.checkDeps();

        return this.depend(
            (arr: Array<unknown>) => [...arr, ...arrToAppend],
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

export function fromArray(value: Array<any>) {
    return new ArrayReactive(value);
}

export function from(...reactives: ArrayReactive[]) {
    const newReactive = new ArrayReactive();

    return createDependencyChain(newReactive, reactives);
}

function createDependencyChain(dep: ArrayReactive, parents: ArrayReactive[]) {
    let emptyReactiveMet = false;
    let nonEmptyReactiveMet = false;

    parents.forEach(parent => {
        if (dep.getDeps().has(parent)) {
            throw new Error('Cycle dependency');
        }
        
        if (parent.isEmptyDep()) emptyReactiveMet = true;
        if (!parent.isEmptyDep()) nonEmptyReactiveMet = true;

        if (
            (parent.isEmptyDep() && nonEmptyReactiveMet) ||
            (!parent.isEmptyDep() && emptyReactiveMet)
        ) {
            throw new Error('Item cannot depend on both empty dependent item and non empty item');
        }

        parent.getDeps().add(dep);
        dep.getParents().add(parent);

        if (parent.isEmptyDep()) {
            dep.closestNonEmptyParents.push(...parent.closestNonEmptyParents)
        } else {
            dep.closestNonEmptyParents.push(parent);
        }
    });

    return dep;
}