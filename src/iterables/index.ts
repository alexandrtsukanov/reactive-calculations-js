import { MapArray, FilterArray } from "../arrays";
import { DependencyOptions, Reactive, createDependencyChain } from "../reactive";

class IterableReactive extends Reactive<Iterable<any>> {
    getIterator() {
        return (this.value ?? [])[Symbol.iterator]();
    }

    map(callback: MapArray<any>, options?: DependencyOptions) {
        this.checkDeps();

        function mapIterator(iterable) {
            const iterator = iterable[Symbol.iterator]();
            let current = iterator.next();
            
            return {
                [Symbol.iterator]() {
                    return this;
                },
                next() {

                    if(current.done) {
                        return current;
                    }
                    
                    const saved = current;
                    current = iterator.next();

                    return {done: false, value: callback(saved.value)};
                },
            }
        }

        return this.depend(
            (prevIterator) => mapIterator(prevIterator),
            options,
        );
    }

    filter(callback: FilterArray<any>, options?: DependencyOptions) {
        this.checkDeps();

        function filterIterator(iterable) {
            const iterator = iterable[Symbol.iterator]();
            
            return {
                [Symbol.iterator]() {
                    return this;
                },
                next() {
                    let current = iterator.next();

                    if(current.done) {
                        return current;
                    }

                    while (!callback(current.value)) {
                        current = iterator.next();
                    }

                    return current;
                },
            }
        }
        
        return this.depend(
            (prevIterator) => filterIterator(prevIterator),
            options,
        );
    }

    reverse(options?: DependencyOptions) {
        this.checkDeps();
        
        function reverseIterator(iterable) {
            const array = Array.from(iterable);
            let len = array.length;
            let i = 0;

            return {
                [Symbol.iterator]() {
                    return this;
                },
                next() {
                    if(i >= len) {
                        return {done: true, value: undefined};
                    }

                    const savedI = i;
                    i += 1;

                    return {
                        done: false,
                        value: array[len - savedI - 1]
                    }
                },
            }
        }
        
        return this.depend(
            (prevIterator) => reverseIterator(prevIterator),
            options,
        );
    }
}

export function createIterable(value: Iterable<any>) {
    return new IterableReactive(value);
}

export function fromIter(...reactives: IterableReactive[]): IterableReactive {
    const newReactive = new IterableReactive();

    return createDependencyChain(newReactive, reactives);
}