const Reactive = require('../sync.ts');

interface DependencyOptions {
    isStrict: boolean;
}

class BooleanReactive extends Reactive {
    constructor(value: boolean) {
        super(value)
    }

    same(options?: DependencyOptions) {
        return this.depend(value => value, options);
    }

    opposite(options?: DependencyOptions) {
        return this.depend(value => !value, options);
    }

    toggle() {
        this.update(prev => !prev);
    }
}

function fromBoolean(value: boolean) {
    return new BooleanReactive(value);
}

module.exports = {fromBoolean};