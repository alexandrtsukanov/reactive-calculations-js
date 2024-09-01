import { DependencyOptions, Reactive } from "../reactive.ts";

export class PromiseReactive extends Reactive<Promise<any>> {
    depend(callback: (...args: any[]) => any, options?: DependencyOptions) {
        if (this.getValue() === null) {
            return Promise.all(this.mapToValues(this.closestNonEmptyParents))
                .then(values => {
                    return this.depend(() => callback(...values), options)
                })
                .catch(reason => {
                    return this.depend(() => reason, options)
                })
        } else {
            return this.getValue()
                ?.then(value => {
                    return this.depend(() => callback(value), options)
                })
                .catch(reason => {
                    return this.depend(() => reason, options)
                })
        }
    }
    
    // depend(callback: (...args: any[]) => any, options?: DependencyOptions) {
    //     const {isStrict} = options ?? {};

    //     if (isStrict !== undefined) {
    //         this.isStrict = isStrict;
    //     }
        
    //     if (callback.length !== this.closestNonEmptyParents.length) {
    //         throw new Error(`Item depends on ${this.closestNonEmptyParents.length} items, but you passed ${callback.length} arguments. Amount of arguments of dependency callback must be equal to amount of items this item depends on`);
    //     }

    //     this.rule = callback;

    //     if (this.getValue() === null) {
    //         const parents = Promise.all(this.mapToValues(this.closestNonEmptyParents));

    //         this.value = parents
    //             .then(values => {
    //                 return this.rule(...values);
    //             })
    //             .catch(reason => {
    //                 return this.rule(reason);
    //             })
    //     } else {
    //         this.getValue()
    //             ?.then(value => {
    //                 return this.rule(value);
    //             })
    //             .catch(reason => {
    //                 return this.rule(reason);
    //             })
    //     }

    //     return this;
    // }
}