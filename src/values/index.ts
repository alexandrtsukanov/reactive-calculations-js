import {Reactive, createDependencyChain} from '../reactive.ts';

export function fromValue(value: number) {
    return new Reactive(value);
}

export function from(...reactives: Reactive<number>[]) {
    const newReactive = new Reactive<number>();

    return createDependencyChain(newReactive, reactives);
}