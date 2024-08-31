const Reactive = require('../sync.ts')

interface DependencyOptions {
    isStrict: boolean;
}

type MapObject<T> = (key: string | Symbol, value: T) => [string, T];
type FlatMapObject = (obj: Object) => Object;

class OdjectReactive extends Reactive {
    constructor(value: Object) {
        super(value);
    }

    map(callback: MapObject<unknown>, options?: DependencyOptions) {
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

function fromOgject(value: Array<any>) {
    return new OdjectReactive(value);
}

module.exports = {fromOgject};