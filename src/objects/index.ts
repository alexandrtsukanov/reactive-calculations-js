import { Reactive, createDependencyChain, DependencyOptions } from "../reactive.ts";

interface Object {
    [key: string]: any  
}

type MapObject<T> = (key: string, value: T) => [string, T];
type FlatMapObject = (obj: Object) => Object;

class ObjectReactive extends Reactive<Object> {
    map(callback: MapObject<any>, options?: DependencyOptions) {
        this.checkDeps();

        const mapObject = obj => {
            return Object.entries(obj).reduce((result, [key, value]) => {
                const [newKey, newValue] = callback(key, value);
                result[newKey] = newValue;

                return result;
            }, {});
        }

        return this.depend(
            (object: Object) => mapObject(object),
            options,
        );
    }

    flatMap(callback: FlatMapObject, options?: DependencyOptions) {
        this.checkDeps();

        return this.depend(
            (object: Object) => callback(object),
            options,
        );
    }
}

export function createObject(value: Object) {
    return new ObjectReactive(value);
}

export function fromObj(...reactives: ObjectReactive[]): ObjectReactive {
    const newReactive = new ObjectReactive();

    return createDependencyChain(newReactive, reactives);
}