import { Reactive } from "./reactive.ts";
import { BooleanReactive } from './booleans/index.ts';

export type Alphanum = number | string;

export type ReactiveParams<T> = 
    Reactive<T>[] | 
    BooleanReactive[]

export type CommonReactive<T> = 
    Reactive<T> | 
    BooleanReactive