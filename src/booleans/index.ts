import {Reactive, DependencyOptions} from "../reactive";

export class BooleanReactive extends Reactive<boolean> {
    same(options?: DependencyOptions) {
        return this.depend(value => value, options);
    }

    opposite(options?: DependencyOptions) {
        return this.depend(value => !value, options);
    }

    toggle() {
        this.update(prev => !prev);
    }
}

export function fromBoolean(value: boolean) {
    return new BooleanReactive(value);
}

export function from(...reactives: BooleanReactive[]) {
    const newReactive = new BooleanReactive();

    return createDependencyChain(newReactive, reactives);
}

function createDependencyChain(dep: BooleanReactive, parents: BooleanReactive[]) {
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