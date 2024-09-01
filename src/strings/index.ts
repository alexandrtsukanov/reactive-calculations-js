import {Reactive, createDependencyChain} from '../reactive.ts';

export function fromValue(value: string) {
    return new Reactive(value);
}

export function from(...reactives: Reactive<string>[]) {
    const newReactive = new Reactive<string>();

    return createDependencyChain<string>(newReactive, reactives);
}