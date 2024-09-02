import {Reactive, createDependencyChain} from '../reactive.ts';

export function createStr(value: string) {
    return new Reactive(value);
}

export function fromStr(...reactives: Reactive<string>[]): Reactive<string> {
    const newReactive = new Reactive<string>();

    return createDependencyChain(newReactive, reactives);
}