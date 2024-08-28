export type Alphanum = number | string;

const a: Alphanum = 'a';

export type DependencyChain<T> = Map<Reactive, Set<[Reactive, () => void]>>
