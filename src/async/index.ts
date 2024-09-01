import { DependencyOptions, Reactive } from "../reactive.ts";

export class PromiseReactive extends Reactive<Promise<any>> {
    depend(callback: (...args: any[]) => any, options?: DependencyOptions) {
        const {isStrict} = options ?? {};

        if (isStrict !== undefined) {
            this.isStrict = isStrict;
        }
        
        if (callback.length !== this.closestNonEmptyParents.length) {
            throw new Error(`Item depends on ${this.closestNonEmptyParents.length} items, but you passed ${callback.length} arguments. Amount of arguments of dependency callback must be equal to amount of items this item depends on`);
        }

        this.rule = callback;

        if (this.getValue() !== null) {
            this.getValue()
                ?.then(value => {
                    if (value === null) {
                        return this.rule(...this.mapToValues(this.closestNonEmptyParents));
                    } else {
                        return this.rule(value);          
                    }
                })
                .catch(reason => {
                    if (reason === null) {
                        return this.rule(...this.mapToValues(this.closestNonEmptyParents));
                    } else {
                        return this.rule(reason);          
                    }
                })
        }

        return this;
    }
}