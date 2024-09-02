import {createIterable, fromIter} from "./index.ts";

describe('Iterables', () => {
    describe('Простая зависимость', () => {
        const a = createIterable([1, 2, 3]);
        const b = fromIter(a).map(el => el * 2);

        test('Инициализация а', () => {
            const iterator = a.getIterator();

            expect(iterator.next().value).toBe(1);
            expect(iterator.next().value).toBe(2);
            expect(iterator.next().value).toBe(3);
        })
    
        test('Зависимость b от a', () => {
            const iterator = b.getIterator()

            expect(iterator.next().value).toBe(2);
            expect(iterator.next().value).toBe(4);
            expect(iterator.next().value).toBe(6);
        })
        
        test('Обновление b после обновления а', () => {
            // @ts-ignore
            a.update((prev) => prev.map(el => el + 1));

            const iterator = b.getIterator();

            expect(iterator.next().value).toBe(4);
            expect(iterator.next().value).toBe(6);
            expect(iterator.next().value).toBe(8);
        })

        test('Обновление b после обновления а', () => {
            // @ts-ignore
            a.update(prev => prev.filter(el => el > 2));

            const iterator = b.getIterator()?.[Symbol.iterator]()
    
            expect(iterator.next().value).toBe(6);
            expect(iterator.next().value).toBe(8);
        })
    })
    
    describe('Цепочка правила зависимости', () => {
        const a = createIterable([1, 2, 3, 4, 5]);
        const b = fromIter(a)
            .map(el => el * 2)
            .filter(el => el > 3)
            .reverse()
    
        test('Цепочка', () => {
            const iterator = b.getIterator();
    
            expect(iterator.next().value).toBe(10);
            expect(iterator.next().value).toBe(8);
            expect(iterator.next().value).toBe(6);
            expect(iterator.next().value).toBe(4);
        })
    })

    describe('Цепочка зависимостей', () => {
        const a = createIterable([1, 2, 3]);
        const b = fromIter(a).map(el => el * 2)
        const c = fromIter(b).map(el => el * 5)
    
        test('Цепочка', () => {
            const iterator = c.getIterator();

            expect(iterator.next().value).toBe(10);
            expect(iterator.next().value).toBe(20);
            expect(iterator.next().value).toBe(30);
        })

        test('Обновление c после обновления а', () => {
            // @ts-ignore
            a.update(prev => prev.map(el => el - 1))

            const iterator = c.getIterator()
    
            expect(iterator.next().value).toBe(0);
            expect(iterator.next().value).toBe(10);
            expect(iterator.next().value).toBe(20);
        })
    })

    describe('Цепочка', () => {
        const a = createIterable([1, 2, 3, 4, 5]);
        const b = fromIter(a)
            .map(el => el * 2)
            .reverse()
            .map(el => el - 1)
    
        test('Цепочка', () => {
            const iterator = b.getIterator();
    
            expect(iterator.next().value).toBe(9);
            expect(iterator.next().value).toBe(7);
            expect(iterator.next().value).toBe(5);
            expect(iterator.next().value).toBe(3);
            expect(iterator.next().value).toBe(1);
        })

        test('Обновление b после обновления а', () => {
            // @ts-ignore
            a.update(prev => prev.filter(el => el !== 3));

            const iterator = b.getIterator();
    
            expect(iterator.next().value).toBe(9);
            expect(iterator.next().value).toBe(7);
            expect(iterator.next().value).toBe(3);
            expect(iterator.next().value).toBe(1);
        })
    })

    describe('Цепочка c пустыми зависимостями', () => {
        const a = createIterable([1, 2, 3, 4, 5]);
        const b = fromIter(a);
        const c = fromIter(b);
        const d = fromIter(c)
        const e = fromIter(d).map(el => el * 10);
    
        test('Пустая зависимость b от a', () => {
            const iterator = b.getIterator()?.[Symbol.iterator]()
    
            expect(iterator.next().value).toBeUndefined();
        })

        test('Пустая зависимость b от a', () => {
            const iterator = e.getIterator();
    
            expect(iterator.next().value).toBe(10);
            expect(iterator.next().value).toBe(20);
            expect(iterator.next().value).toBe(30);
            expect(iterator.next().value).toBe(40);
            expect(iterator.next().value).toBe(50);
        })
    })

    describe('Iterable строки', () => {
        const a = createIterable('abc');
        const b = fromIter(a).map(char => char + '!');
    
        test('Зависимость b от a', () => {
            const iterator = b.getIterator()
    
            expect(iterator.next().value).toBe('a!');
            expect(iterator.next().value).toBe('b!');
            expect(iterator.next().value).toBe('c!');
        })

        test('Обновление b после обновления а', () => {
            a.update('xyz');

            const iterator = b.getIterator()
    
            expect(iterator.next().value).toBe('x!');
            expect(iterator.next().value).toBe('y!');
            expect(iterator.next().value).toBe('z!');
        })
    })

    describe('Iterable сета', () => {
        const a = createIterable(new Set([1, 2, 3]));
        const b = fromIter(a)
            .map(el => el + 5)
            .reverse()

        test('Зависимость b от a', () => {
            const iterator = b.getIterator()
        
            expect(iterator.next().value).toBe(8);
            expect(iterator.next().value).toBe(7);
            expect(iterator.next().value).toBe(6);
        })
        
        test('Обновление b после обновления а', () => {
            a.update(new Set([4, 5, 6]));

            const iterator = b.getIterator();
    
            expect(iterator.next().value).toBe(11);
            expect(iterator.next().value).toBe(10);
            expect(iterator.next().value).toBe(9);
        })
    })

    describe('Iterable итератора', () => {
        const a = createIterable(new Map([
            ['a', 1],
            ['b', 2],
            ['c', 3],
        ]).values());

        const b = fromIter(a).map(el => el + 2)

        test('Зависимость b от a', () => {
            const iterator = b.getIterator()
        
            expect(iterator.next().value).toBe(3);
            expect(iterator.next().value).toBe(4);
            expect(iterator.next().value).toBe(5);
        })

        test('Обновление b после обновления а', () => {
            a.update(new Map([['x', 10]]).values())

            const iterator = b.getIterator();
    
            expect(iterator.next().value).toBe(12);
            expect(iterator.next().value).toBeUndefined();
        })
    })
})
