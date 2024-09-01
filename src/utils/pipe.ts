export const pipe = fns => (...args) => {
    const firstFn = fns[0];
    const firstResult = firstFn(...args);

    return fns
        .slice(1)
        .reduce((res, fn) => fn(res), firstResult)
}