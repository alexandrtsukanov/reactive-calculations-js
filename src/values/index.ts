import {Reactive} from '../reactive.ts';

function fromValue(value: number | string) {
    return new Reactive<typeof value>(value);
}

module.exports = {fromValue};