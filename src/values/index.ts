import {Reactive, createDependencyChain} from '../reactive.ts';

export function createNum(value: number) {
    return new Reactive(value);
}

export function fromNum(...reactives: Reactive<number>[]): Reactive<number> {
    const newReactive = new Reactive<number>();

    return createDependencyChain(newReactive, reactives);
}