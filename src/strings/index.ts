const {Reactive} = require('../reactive.ts');

function fromValue(value: string) {
    return new Reactive(value);
}

module.exports = {fromValue};