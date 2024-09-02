function on(emitter, event) {
    const promises = [];
    let done = false;
    
    const handler = (data) => {
        promises
            .splice(0, promises.length)
            .forEach(({resolve}) => {
                resolve({done: false, value: data});
            });
    }

    emitter.on(event, handler);

    return {
        [Symbol.asyncIterator]() {
            return this;
        },

        next() {
            if (done) {
                return Promise.resolve({done, value: undefined});               
            }

            const promise = Promise.withResolvers();
            promises.push(promise);

            return promise.promise;
        },

        return() {
            done = true;
            emitter.off(event, handler);
            return Promise.resolve({done, value: undefined});
        }
    }
}