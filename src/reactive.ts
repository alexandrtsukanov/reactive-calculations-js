type DependencyChain<T> = Set<Reactive<T>>;

export interface DependencyOptions {
    isStrict: boolean;
}

export class Reactive<T> {
    protected value: T | null;
    private deps: DependencyChain<T>;
    private parents: DependencyChain<T>;
    rule: ((...args: any[]) => T) | null;
    closestNonEmptyParents: Reactive<T>[];
    isStrict = true;

    constructor(value: T | null = null) {
        this.value = value;
        this.deps = new Set();
        this.parents = new Set();
        this.rule = null;
        this.closestNonEmptyParents = [];
    }

    getValue() {
        return this.value;
    }

    update(newValue: T | ((prevValue: T) => T)) {
        if (this.value === null) {
            return;
        }
        
        if (this.isDependent() && this.isStrict) {
            return;
        }

        if (newValue instanceof Function) {
            this.value = newValue(this.value)
        } else {
            this.value = newValue;
        }

        this.updateDeps();
    }

    private updateDeps() {
        const queue: Reactive<T>[] = Array.from(this.deps);
        let cursor = 0;

        while (cursor < queue.length) {
            const reactive = queue[cursor];
            const {rule} = reactive;

            if (!reactive.isEmptyDep()) {
                const arrayOfParents = reactive.closestNonEmptyParents;
                reactive.updateDep(rule, ...arrayOfParents);
            }

            const dependencies = reactive.getDeps();

            dependencies.forEach(dep => {
                queue.push(dep);
            })

            cursor += 1;
        }
    }
 
    updateDep(callback: ((...args: (T | null)[]) => T) | null, ...parents: Reactive<T>[]) {
        if (callback) {
            this.value = callback(...this.mapToValues(parents));
        }
    }

    getDeps() {
        return this.deps;
    }

    getParents() {
        return this.parents;
    }

    depend(callback: (...args: T[]) => T, options?: DependencyOptions) {
        const {isStrict} = options ?? {};

        if (isStrict !== undefined) {
            this.isStrict = isStrict;
        }
        
        if (callback.length !== this.closestNonEmptyParents.length) {
            throw new Error(`Item depends on ${this.closestNonEmptyParents.length} items, but you passed ${callback.length} arguments. Amount of arguments of dependency callback must be equal to amount of items this item depends on`);
        }

        this.rule = callback;

        if (this.value === null) {
            this.value = this.rule(...this.mapToValues(this.closestNonEmptyParents));
        } else {
            this.value = this.rule(this.value);          
        }

        return this;
    }

    dependsOn(...reactives: Reactive<T>[]) {
        const dep = createDependencyChain(this, reactives);
        dep.init();

        return dep;
    }

    free(...reactives: Reactive<T>[]) {
        reactives.forEach(reactive => {
            this.deps.delete(reactive);

            reactive.getParents().delete(this);
        })
    }

    break(...reactives: Reactive<T>[]) {
        reactives.forEach(reactive => {
            this.parents.delete(reactive);

            reactive.getDeps().delete(this);
        })
    }

    isDependent() {
        return this.parents.size > 0;
    }

    isEmptyDep() {
        return this.isDependent() && this.value === null && this.rule === null;
    }

    private init() {
        this.value = null;
    }

    protected mapToValues(reactives: Reactive<T>[]) {
        return reactives.map((reactive: Reactive<T>) => reactive.getValue());
    }

    protected checkDeps() {
        if (this.closestNonEmptyParents.length > 1) {
            throw new Error(`The current dependency method supports dependency of only one item. Now it depends on ${this.closestNonEmptyParents.length} items with values ${this.mapToValues(this.closestNonEmptyParents)}`);
        }
    }
}

export function createDependencyChain(dep, parents) {
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