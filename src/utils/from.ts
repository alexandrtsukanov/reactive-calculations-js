import { Reactive } from "../reactive.ts";
import { BooleanReactive } from '../booleans/index.ts';
import { ReactiveParams } from "../types.ts";

export function from<T extends any>(...reactives: ReactiveParams<T>) {
    let newReactive;

    if (reactives[0] instanceof Reactive) {
        newReactive = new Reactive<T>();
    }

    if (reactives[0] instanceof BooleanReactive) {
        newReactive = new BooleanReactive();
    }

    // return createDependencyChain(newReactive, reactives);
}