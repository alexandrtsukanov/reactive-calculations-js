import { createPromise, fromProm } from "./index.ts"

describe('Promises', () => {
    describe('Простая зависимость', () => {
        const promise1 = new Promise((res) => {
            setTimeout(() => res(1), 1000)
        })

        const p1 = createPromise(promise1);
        const p2 = fromProm(p1).depend(val => val + 5);

        test('Инициализация p1', () => {
            return expect(p1.getValue()).resolves.toBe(1);
        })

        test('p2 зависит от p1', () => {
            return expect(p2.getValue()).resolves.toBe(6);
        })

        test('Обновление p1', () => {
            const updated = p1.updateAsync(Promise.resolve(2))

            updated
                .then(() => {
                    return expect(p1.getValue()).resolves.toBe(2)
                })
        })

        test('Обновление p2 после обновления p1', () => {
            expect(p2.getValue()).toBe(7);
        })
    })

    describe('Сложная зависимость от двух или более промисов', () => {
        const promise1 = new Promise((res) => {
            setTimeout(() => res(1), 1000)
        })

        const promise2 = new Promise((res) => {
            setTimeout(() => res(2), 2000)
        })

        const p1 = createPromise(promise1);
        const p2 = createPromise(promise2);

        const p3 = fromProm(p1, p2).depend((val1, val2) => (val1 + val2) * 2);

        test('p3 зависит от p1 и p2', () => {
            return expect(p3.getValue()).resolves.toBe(6);
        })

        test('Обновление p1', () => {
            const updated = p1.updateAsync(Promise.resolve(10))

            updated
                .then(() => {
                    return expect(p1.getValue()).resolves.toBe(10)
                })
        })

        test('Обновление p3 после обновления p1', () => {
            expect(p3.getValue()).toBe(24);
        })

        test('Обновление p2', () => {
            const updated = p2.updateAsync(Promise.resolve(1))

            updated
                .then(() => {
                    return expect(p2.getValue()).resolves.toBe(1)
                })
        })

        test('Обновление p3 после обновления p2', () => {
            expect(p3.getValue()).toBe(22);
        })
    })

    describe('Длинная цепочка зависимостей', () => {
        const promise1 = new Promise((res) => {
            setTimeout(() => res(1), 1000)
        })

        const p1 = createPromise(promise1);
        const p2 = fromProm(p1).depend(val => val + 1)
        const p3 = fromProm(p2).depend(val => val + 2)
        const p4 = fromProm(p3).depend(val => val * 3)
        const p5 = fromProm(p4).depend(val => val.toString());

        test('p5 зависит от p1', () => {
            return expect(p5.getValue()).resolves.toBe('12');
        })

        test('Обновление p1, исключение', () => {
            expect(() => p1.updateAsync(Promise.resolve(4))).toThrow();
        })
    })

    describe('Цепочка правила зависимости', () => {
        const promise1 = new Promise((res) => {
            setTimeout(() => res('abc'), 1000);
        })

        const p1 = createPromise(promise1);
        const p2 = fromProm(p1)
            .depend(val => val + 'd')
            .depend(val => val + 'e')
            .depend(val => 'prefix_' + val)
            .depend(val => val.split('_'))

        test('p2 зависит от p1', () => {
            return expect(p2.getValue()).resolves.toEqual(['prefix', 'abcde']);
        })

        test('Обновление p2 после обновления p1', () => {
            const updated = p1.updateAsync(Promise.resolve('xyz'));

            updated
                .then(() => {
                    return expect(p1.getValue()).resolves.toBe('xyz')
                })
        })

        test('p2 зависит от p1', () => {
            expect(p2.getValue()).toEqual(['prefix', 'xyzde']);
        })
    })

    describe('Пустые зависимости', () => {
        const promise1 = new Promise((res) => {
            setTimeout(() => res(1), 1000);
        })

        const promise2 = new Promise((res) => {
            setTimeout(() => res(2), 2000);
        })

        const p1 = createPromise(promise1);
        const p2 = createPromise(promise2);
        const p3 = fromProm(p1, p2)
        const p4 = fromProm(p3).depend((val1, val2) => val1 + val2)

        test('p3 зависит от p1 и p2 пусто', () => {
            return expect(p3.getValue()).toBeNull();
        })

        test('p4 зависит от p1 и p2', () => {
            return expect(p4.getValue()).resolves.toBe(3);
        })
    })
})