import { DependencyOptions, Reactive } from "../reactive.ts";

export class AsyncReactive extends Reactive<Promise<any>> {
    asyncValue: Promise<any> | null;

    constructor(value: Promise<any> | null = null) {
        super(value)
        this.asyncValue = value
    }
    // update(newValue: any | ((prevValue: any) => any)) {
    //     if (this.getValue() !== null) {
    //         this.getValue()
    //             .then()

    //     }
    // }

    // asyncDepend(callback: (...args: any[]) => any, options?: DependencyOptions) {
    //     if (this.getValue() === null) {
    //         return Promise.all(this.mapToValues(this.closestNonEmptyParents))
    //             .then(values => {
    //                 return this.depend(() => callback(...values), options)
    //             })
    //             .catch(reason => {
    //                 return this.depend(() => reason, options)
    //             })
    //     } else {
    //         return this.getValue()
    //             ?.then(value => {
    //                 return this.depend(() => callback(value), options)
    //             })
    //             .catch(reason => {
    //                 return this.depend(() => reason, options)
    //             })
    //     }
    // }

    getValue() {
        return this.asyncValue;
    }
    
    depend(callback: (...args: any[]) => any, options?: DependencyOptions) {
        const {isStrict} = options ?? {};

        if (isStrict !== undefined) {
            this.isStrict = isStrict;
        }
        
        if (callback.length !== this.closestNonEmptyParents.length) {
            throw new Error(`Item depends on ${this.closestNonEmptyParents.length} items, but you passed ${callback.length} arguments. Amount of arguments of dependency callback must be equal to amount of items this item depends on`);
        }

        if (this.asyncValue === null) {
            const parents = Promise.all(this.mapToValues(this.closestNonEmptyParents));

            this.asyncValue = parents
                .then(values => {
                    this.rule = callback;

                    return this.rule(...values);
                })
                .catch(reason => reason)
        } else {
            this.asyncValue
                .then(value => {
                    this.rule = callback;

                    return this.rule(value);
                })
                .catch(reason => reason)
        }

        return this;
    }
}

export function fromAsync(value: Promise<any>) {
    return new AsyncReactive(value);
}

export function from(...reactives: AsyncReactive[]) {
    const newReactive = new AsyncReactive();

    return createDependencyChain(newReactive, reactives);
}

function createDependencyChain(dep: AsyncReactive, parents: AsyncReactive[]) {
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