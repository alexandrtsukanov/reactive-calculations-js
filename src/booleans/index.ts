import {Reactive, DependencyOptions, createDependencyChain} from "../reactive";

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

export function createBoolean(value: boolean) {
    return new BooleanReactive(value);
}

export function fromBool(...reactives: BooleanReactive[]): BooleanReactive {
    const newReactive = new BooleanReactive();

    return createDependencyChain(newReactive, reactives);
}
