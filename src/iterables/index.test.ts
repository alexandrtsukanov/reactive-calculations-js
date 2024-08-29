const {fromIterable, from} = require('../sync.ts');

describe('Iterables', () => {
    describe('Простая зависимость', () => {
        const a = fromIterable([1, 2, 3]);
        const b = from(a).map(el => el * 2);

        test('Инициализация а', () => {
            expect(a.getValue()).toEqual([1, 2, 3]);
        })
    
        test('Зависимость b от a', () => {
            const iterator = b.getIterator() // ?? Сразу итератор возвращать?
    
            expect(iterator.next().value).toBe(2);
            expect([...iterator]).toEqual([4, 6]);
        })
        
        a.updateMap(el => el + 1);

        test('Обновление b после обновления а через updateMap', () => {
            const iterator = b.getIterator();
    
            expect(iterator.next().value).toBe(4);
            expect([...iterator]).toEqual([6, 8]);
        })

        a.updateFilter(el => el > 2);

        test('Обновление b после обновления а через updateFilter', () => {
            const iterator = b.getIterator();
    
            expect(iterator.next().value).toBe(6);
            expect([...iterator]).toEqual([8]);
        })
    })
    
    describe('Цепочка правила зависимости №1', () => {
        const a = fromIterable([1, 2, 3, 4, 5]);
        const b = from(a)
            .map(el => el * 2)
            .take(3)
            .filter(el => el > 3)
    
        test('Цепочка', () => {
            const iterator = b.getIterator();
    
            expect(iterator.next().value).toBe(4);
            expect([...iterator]).toEqual([6]);
        })
    })

    describe('Цепочка правила зависимости №2', () => {
        const a = fromIterable([1, 2, 3, 4, 5]);
        const b = from(a)
            .map(el => el * 2)
            .takeLast(3)
            .reverse()
    
        test('Цепочка', () => {
            const iterator = b.getIterator();
    
            expect(iterator.next().value).toBe(10);
            expect([...iterator]).toEqual([8, 6]);
        })
    })

    describe('Цепочка зависимостей', () => {
        const a = fromIterable([1, 2, 3]);
        const b = from(a)
            .map(el => el * 2)
            .take(2)

        const c = from(b).map(el => el * 5)
    
        test('Цепочка', () => {
            const iterator = c[Symbol.iterator]();
    
            expect(iterator.next().value).toBe(10);
            expect([...iterator]).toEqual([20]);
        })
    })

    describe('Цепочка №2', () => {
        const a = fromIterable([1, 2, 3, 4, 5]);
        const b = from(a)
            .map(el => el * 2)
            .takeLast(3)
            .reverse()
    
        test('Цепочка', () => {
            const iterator = b[Symbol.iterator]();
    
            expect(iterator.next().value).toBe(10);
            expect([...iterator]).toEqual([6, 8]);
        })
    })

    describe('Цепочка c пустыми зависимостями', () => {
        const a = fromIterable([1, 2, 3, 4, 5]);
        const b = from(a);
        const c = from(b);
        const d = from(c)
        const e = from(d).map(el => el * 10);
    
        test('Пустая зависимость b от a', () => {
            const iterator = b[Symbol.iterator]();
    
            expect(iterator.next().value).toBeUndefined();
        })

        test('Пустая зависимость b от a', () => {
            const iterator = e[Symbol.iterator]();
    
            expect(iterator.next().value).toBe(10);
            expect([...iterator]).toEqual([20, 30, 40, 50]);
        })
    })

    describe('Iterable строки', () => {
        const a = fromIterable('abc');
        const b = from(a).map(char => char + '!');
    
        test('Зависимость b от a', () => {
            const iterator = b[Symbol.iterator]();
    
            expect(iterator.next().value).toBe('a!');
            expect([...iterator]).toEqual(['b!', 'c!']);
        })

        a.update('xyz');

        test('Обновление b после обновления а', () => {
            const iterator = b[Symbol.iterator]();
    
            expect(iterator.next().value).toBe('x!');
            expect([...iterator]).toEqual(['y!', 'z!']);
        })
    })

    describe('Iterable сета', () => {
        const a = fromIterable(new Set([1, 2, 3]));
        const b = from(a)
            .map(el => el + 5)
            .reverse()

    
        test('Зависимость b от a', () => {
            const iterator = b[Symbol.iterator]();
        
            expect(iterator.next().value).toBe(8);
            expect([...iterator]).toEqual([7, 6]);
        })

        a.update(new Set([4, 5, 6]));

        test('Обновление b после обновления а', () => {
            const iterator = b[Symbol.iterator]();
    
            expect(iterator.next().value).toBe(11);
            expect([...iterator]).toEqual([10, 9]);
        })
    })

    describe('Iterable итератора', () => {
        const a = fromIterable(new Map([
            ['a', 1],
            ['b', 2],
            ['c', 3],
        ]).values());

        const b = from(a).map(el => el + 2)

        test('Зависимость b от a', () => {
            const iterator = b[Symbol.iterator]();
        
            expect(iterator.next().value).toBe(3);
            expect([...iterator]).toEqual([4, 5]);
        })
    })

    describe('Не итератор', () => {
        test('Не итератор', () => {
            expect(fromIterable(42)).toThrow();
        })
    })
})
