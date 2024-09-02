const {fromObject, from} = require('../objects/index');

function createDOMEvent(emitter, event) {
    const withResolvers = () => {
        let resolve
        let reject
    
        const promise = new Promise((res, rej) => {
            resolve = res;
            reject = rej;
        });
    
        return {
            promise,
            reject,
            resolve,
        };
    }
    
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
    
        emitter.addEventListener(event, handler);
    
        return {
            [Symbol.asyncIterator]() {
                return this;
            },
    
            next() {
                if (done) {
                    return Promise.resolve({done, value: undefined});               
                }
    
                const promise = withResolvers();
                promises.push(promise);
    
                return promise.promise;
            },
    
            return() {
                done = true;
                emitter.removeEventListener(event, handler);
                return Promise.resolve({done, value: undefined});
            }
        }
    }

    return {
        flatMap: async function*(callback) {
            for await (const e of on(emitter, event)) {
                const event = fromObject(e)

                return from(event).flatMap(callback);
            }
        },

        map: async function*(callback) {
            for await (const e of on(emitter, event)) {
                const event = fromObject(e)

                return from(event).map(callback);
            }
        },
    }
}

module.exports = {createDOMEvent};