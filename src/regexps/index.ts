import { DependencyOptions, Reactive, createDependencyChain } from "../reactive";

const REGEXP_FLAGS = ['g', 'i', 's', 'm', 'u', 'y', 'd'] as const;
type RegExpFlag = typeof REGEXP_FLAGS[number];

class RegExpReactive extends Reactive<RegExp> {
    getValue() {
        return this.value ?? new RegExp('');
    }

    addFlags(flags: RegExpFlag[], options?: DependencyOptions) {
        const newRegExp = new RegExp(
            this.value?.source || '',
            this.prepareFlagsAdded(flags),
        )

        const cb = () => newRegExp;

        return this.depend(cb, options);
    }

    removeFlags(flags: RegExpFlag[], options?: DependencyOptions) {
        const newRegExp = new RegExp(
            this.value?.source ?? '',
            this.prepareFlagsRemoved(flags),
        )

        const cb = () => newRegExp;

        return this.depend(cb, options);
    }

    private prepareFlagsAdded(newflags: RegExpFlag[]) {
        const set = new Set([...this.value?.flags ?? '', ...newflags]);

        return Array.from(set).join('');
    }

    private prepareFlagsRemoved(flags: RegExpFlag[]) {
        const set = new Set(this.value?.flags ?? '');

        flags.forEach(flag => set.delete(flag));

        return Array.from(set).join('');
    }
}

export function fromRegExp(value: RegExp) {
    return new RegExpReactive(value);
}

export function from(...reactives: RegExpReactive[]): RegExpReactive {
    const newReactive = new RegExpReactive();

    return createDependencyChain(newReactive, reactives);
}