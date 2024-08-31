const Reactive = require('../sync.ts');

interface DependencyOptions {
    isStrict: boolean;
}

const REGEXP_FLAGS = ['g', 'i', 's', 'm', 'u', 'y', 'd'] as const;
type RegExpFlag = typeof REGEXP_FLAGS[number];

class RegExpReactive extends Reactive<RegExp> {
    constructor(value: RegExp) {
        super(value)
    }

    addFlags(flags: RegExpFlag[], options?: DependencyOptions) {
        const newRegExp = new RegExp(
            this.value.source,
            this.prepareFlagsAdded(flags),
        )

        const cb = () => newRegExp;

        return this.depend(cb, options);
    }

    removeFlags(flags: RegExpFlag[], options?: DependencyOptions) {
        const newRegExp = new RegExp(
            this.value.source,
            this.prepareFlagsRemoved(flags),
        )

        const cb = () => newRegExp;

        return this.depend(cb, options);
    }

    private prepareFlagsAdded(newflags: RegExpFlag[]) {
        const set = new Set([...this.value.flags, ...newflags]);

        return Array.from(set).join('');
    }

    private prepareFlagsRemoved(flags: RegExpFlag[]) {
        const set = new Set(this.value.flags);

        flags.forEach(flag => set.delete(flag));

        return Array.from(set).join('');
    }
}

function fromRegExp(value: RegExp) {
    return new RegExpReactive(value);
}

module.exports = {fromRegExp};