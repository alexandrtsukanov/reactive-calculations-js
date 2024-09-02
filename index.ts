import {createNum, fromNum} from './src/values';
import {createStr, fromStr} from './src/strings';
import {createBoolean, fromBool} from './src/booleans';
import {createArray, fromArr} from './src/arrays';
import {createIterable, fromIter} from './src/iterables';
import {createObject, fromObj} from './src/objects';
import {createFunction, fromFn} from './src/functions';
import {createPromise,fromProm} from './src/async';
import {createRegExp, fromRe} from './src/regexps';
import {createDOMEvent} from './src/events';

export default {
    createNum,
    createStr,
    createBoolean,
    createArray,
    createIterable,
    createObject,
    createFunction,
    createPromise,
    createRegExp,
    createDOMEvent,

    fromNum,
    fromStr,
    fromBool,
    fromArr,
    fromIter,
    fromObj,
    fromFn,
    fromProm,
    fromRe,
}