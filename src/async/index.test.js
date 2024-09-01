import { fromAsync, from } from "./index.ts"

describe('Простая зависимость', () => {
    const promise1 = new Promise((res) => {
        setTimeout(() => res(1), 1000)
    })

    const p1 = fromAsync(promise1);
    const p2 = from(p1).depend(val => val + 5);

    test('Инициализация p1', () => {
        return expect(p1.getValue()).resolves.toBe(1);
    })

    test('p2 зависит от p1', () => {
        return expect(p2.getValue()).resolves.toBe(6);
    })

    test('Обновление p1', () => {
        p1.update(val => val.then(val => val + 1))

        return expect(p2.getValue()).resolves.toBe(2);
    })

    test('Обновление p2 после обновления p1', () => {
        return expect(p2.getValue()).resolves.toBe(7);
    })
})

describe('Сложная зависимость от двух или более промисов', () => {
    const promise1 = new Promise((res) => {
        setTimeout(() => res(1), 1000)
    })

    const promise2 = new Promise((res) => {
        setTimeout(() => res(2), 2000)
    })

    const p1 = fromAsync(promise1);
    const p2 = fromAsync(promise2);

    const p3 = from(p1, p2).depend((val1, val2) => (val1 + val2) * 2);

    test('p3 зависит от p1 и p2', () => {
        return expect(p3.getValue()).resolves.toBe(6);
    })

    test('Обновление p1', () => {
        p1.update(Promise.resolve(10))

        return expect(p1.getValue()).resolves.toBe(10);
    })

    test('Обновление p3 после обновления p1', () => {
        return expect(p3.getValue()).resolves.toBe(24);
    })

    test('Обновление p2', () => {
        p2.update(val => val.then(val => val - 1));

        return expect(p2.getValue()).resolves.toBe(1);
    })

    test('Обновление p3 после обновления p2', () => {
        return expect(p3.getValue()).resolves.toBe(22);
    })
})

describe('Длинная цепочка зависимостей', () => {
    const promise1 = new Promise((res) => {
        setTimeout(() => res(1), 1000)
    })

    const p1 = fromAsync(promise1);
    const p2 = from(p1).depend(val => val + 1)
    const p3 = from(p2).depend(val => val + 2)
    const p4 = from(p3).depend(val => val * 3)
    const p5 = from(p4).depend(val => val.toString());

    test('p5 зависит от p1', () => {
        return expect(p5.getValue()).resolves.toBe('12');
    })

    test('Обновление p5 после обновления p1', () => {
        p1.update(val => val.then(val => val + 3))

        return expect(p5.getValue()).resolves.toBe('21');
    })
})

describe('Цепочка правила зависимости', () => {
    const promise1 = new Promise((res) => {
        setTimeout(() => res('abc'), 1000);
    })

    const p1 = fromAsync(promise1);
    const p2 = from(p1)
        .depend(val => val + 'd')
        .depend(val => val + 'e')
        .depend(val => 'prefix_' + val)
        .depend(val => val.split('_'))

    test('p2 зависит от p1', () => {
        return expect(p2.getValue()).resolves.toEqual(['prefix', 'abc']);
    })

    test('Обновление p2 после обновления p1', () => {
        p1.update(Promise.resolve('xyz'))

        return expect(p2.getValue()).resolves.toEqual(['prefix', 'xyz']);
    })
})

describe('Reject', () => {
    const promise1 = new Promise((res) => {
        setTimeout(() => res(1), 2000);
    })

    const promise2 = new Promise((_, rej) => {
        setTimeout(() => rej('Error'), 1000);
    })

    const p1 = fromAsync(promise1);
    const p2 = fromAsync(promise2);
    const p3 = from(p1, p2).depend((val1, val2) => val1 + val2)

    test('p3 зависит от p1 и p2 и реджектится', () => {
        return expect(p3.getValue()).rejects.toBe('Error');
    })
})

describe('Пустые зависимости', () => {
    const promise1 = new Promise((res) => {
        setTimeout(() => res(1), 1000);
    })

    const promise2 = new Promise((res) => {
        setTimeout(() => res(2), 2000);
    })

    const p1 = fromAsync(promise1);
    const p2 = fromAsync(promise2);
    const p3 = from(p1, p2)
    const p4 = from(p3).depend((val1, val2) => val1 + val2)

    test('p3 зависит от p1 и p2 пусто', () => {
        return expect(p3.getValue()).resolves.toBeNull();
    })

    test('p4 зависит от p1 и p2', () => {
        return expect(p4.getValue()).resolves.toBe(3);
    })
})