import { DependencyOptions, Reactive, createDependencyChain } from "../reactive";

const REGEXP_FLAGS = ['g', 'i', 's', 'm', 'u', 'y', 'd'] as const;
type RegExpFlag = typeof REGEXP_FLAGS[number];

class RegExpReactive extends Reactive<RegExp> {
    getValue() {
        return this.value ?? new RegExp('');
    }

    addFlags(flags: RegExpFlag[], options?: DependencyOptions) {
        const cb = (prevRegExp: RegExp) => {
            const newRegExp = new RegExp(
                prevRegExp?.source ?? '',
                this.prepareFlagsAdded(
                    prevRegExp.flags,
                    flags,
                ),
            )

            return newRegExp;
        };

        return this.depend(cb, options);
    }

    removeFlags(flags: RegExpFlag[], options?: DependencyOptions) {
        const cb = (prevRegExp: RegExp) => {
            const newRegExp = new RegExp(
                prevRegExp?.source ?? '',
                this.prepareFlagsRemoved(
                    prevRegExp.flags,
                    flags
                ),
            )

            return newRegExp;
        };

        return this.depend(cb, options);
    }

    private prepareFlagsAdded(oldFlags: string, newflags: RegExpFlag[]) {
        const set = new Set([
            ...oldFlags.split('') ?? [],
            ...newflags
        ]);

        return Array.from(set).join('');
    }

    private prepareFlagsRemoved(oldFlags: string, flags: RegExpFlag[]) {
        const set = new Set(oldFlags);

        flags.forEach(flag => set.delete(flag));

        return Array.from(set).join('');
    }
}

export function createRegExp(value: RegExp) {
    return new RegExpReactive(value);
}

export function fromRe(...reactives: RegExpReactive[]): RegExpReactive {
    const newReactive = new RegExpReactive();

    return createDependencyChain(newReactive, reactives);
}
