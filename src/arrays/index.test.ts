const {fromArray, from} = require('../sync.ts');

describe('Массивы', () => {
    describe('Простая зависимость', () => {
        const a = fromArray([1, 2, 3]);
        const b = from(a).map(el => el * 2);
    
        test('Инициализация а', () => {
            expect(a.getValue()).toEqual([1, 2, 3]);
        });
    
        test('Зависимость b от a', () => {
            expect(b.getValue()).toEqual([2, 4, 6]);
        });

        a.update(prev => prev.map(el => el + 1));

        test('Обновление а', () => {
            expect(a.getValue()).toEqual([2, 3, 4]);
        });

        test('Обновление b после обновления а через map', () => {
            expect(b.getValue()).toEqual([4, 6, 8]);
        });

        a.update(prev => prev.filter(el => el % 2 === 0));

        test('Обновление b после обновления а через filter', () => {
            expect(b.getValue()).toEqual([4, 8]);
        });
    })

    describe('Цепочка правила зависимости', () => {
        const a = fromArray([1, 2, 3]);
        const b = from(a)
            .map(el => el * 2)
            .filter(el => el > 3)
            .append(['end'])
            .unshift(['start'])
            .reverse();

        test('Зависимость b от a', () => {
            expect(b.getValue()).toEqual(['end', 6, 4, 'start']);
        });
    })

    describe('Цепочка зависимости', () => {
        const a = fromArray([1, 2, 3]);
        const b = from(a)
        const c = from(b).map(el => el * 3)
        const d = from(c).map(el => el + 3)

        test('Зависимость d от a', () => {
            expect(d.getValue()).toEqual([6, 9, 12]);
        });
    })

    describe('Пустой массив', () => {
        const a = fromArray([1]);
        const b = from(a).map(el => el * 2);

        a.update(prev => {
            prev.pop();
            return prev;
        });

        test('Обновление через pop, в результате пустой массив №1', () => {
            expect(b.getValue()).toHaveLength(0);
        });

        test('Обновление через pop, в результате пустой массив №2', () => {
            expect(b.getValue()).toEqual([]);
        });
    })

    describe('Освобождение от зависимостей', () => {
        const a = fromArray(['a', 'b', 'c']);
        const b = from(a).map(el => el + '!');

        a.update(['d', 'e']);

        test('Зависимость b от a', () => {
            expect(b.getValue()).toEqual(['d!', 'e!'])
        });

        a.free(b);
        a.update(['f', 'g', 'h', 'i']);

        test('Освобождение b от a, b не равно новому значению', () => {
            expect(b.getValue()).not.toEqual(['f!', 'g!', 'h!', 'i!']);
        });

        test('Освобождение b от a, b равно старому значению', () => {
            expect(b.getValue()).toEqual(['d!', 'e!'])
        });
    })

    describe('Обычная зависимость через depend', () => {
        const a = fromArray([1, 2, 3]);
        const b = from(a).depend(arr => [...arr, 4]);
        const c = from(a).depend(arr => arr.map(el => el * 2));

        test('Зависимость b от a', () => {
            expect(b.getValue()).toEqual([1, 2, 3, 4])
        });

        test('Зависимость c от a', () => {
            expect(c.getValue()).toEqual([2, 4, 6])
        });

        a.update([4, 5, 6]);

        test('Обновление b после обновления а', () => {
            expect(b.getValue()).toEqual([4, 5, 6, 4])
        });

        test('Зависимость c от a', () => {
            expect(c.getValue()).toEqual([8, 10, 12])
        });
    })

    describe('Сложная зависимость от двух или более массивов', () => {
        const a = fromArray([1, 2, 3]);
        const b = fromArray([4, 5, 6]);

        const c = from(a, b).depend((a, b) => [...a, ...b]);

        test('Зависимость b от a', () => {
            expect(c.getValue()).toEqual([1, 2, 3, 4, 5, 6])
        });

        a.update(prev => [...prev, 100]);
        b.update(prev => [...prev, 200]);

        test('Обновление c после обновления а и(или) b', () => {
            expect(c.getValue()).toEqual([1, 2, 3, 100, 4, 5, 6, 200]);
        });
    })
})