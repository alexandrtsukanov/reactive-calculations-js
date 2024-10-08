import {createArray, fromArr} from './index.ts';

describe('Массивы', () => {
    describe('Простая зависимость', () => {
        const a = createArray([1, 2, 3]);
        const b = fromArr(a).map(el => el * 2);
    
        test('Инициализация а', () => {
            expect(a.getValue()).toEqual([1, 2, 3]);
        });
    
        test('Зависимость b от a', () => {
            expect(b.getValue()).toEqual([2, 4, 6]);
        });

        test('Обновление а', () => {
            a.update(prev => prev.map(el => el + 1));

            expect(a.getValue()).toEqual([2, 3, 4]);
        });

        test('Обновление b после обновления а через map', () => {
            expect(b.getValue()).toEqual([4, 6, 8]);
        });

        test('Обновление b после обновления а через filter', () => {
            a.update(prev => prev.filter(el => el % 2 === 0));

            expect(b.getValue()).toEqual([4, 8]);
        });
    })

    describe('Цепочка правила зависимости', () => {
        const a = createArray([1, 2, 3]);
        const b = fromArr(a)
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
        const a = createArray([1, 2, 3]);
        const b = fromArr(a)
        const c = fromArr(b).map(el => el * 3)
        const d = fromArr(c).map(el => el + 3)

        test('Зависимость d от a', () => {
            expect(d.getValue()).toEqual([6, 9, 12]);
        });
    })

    describe('Пустой массив', () => {
        const a = createArray([1]);
        const b = fromArr(a).map(el => el * 2);

        test('Обновление через pop, в результате пустой массив №1', () => {
            a.update(prev => {
                prev.pop();
                return prev;
            });

            expect(b.getValue()).toHaveLength(0);
        });

        test('Обновление через pop, в результате пустой массив №2', () => {
            expect(b.getValue()).toEqual([]);
        });
    })

    describe('Освобождение от зависимостей', () => {
        const a = createArray(['a', 'b', 'c']);
        const b = fromArr(a).map(el => el + '!');
        
        test('Зависимость b от a', () => {
            a.update(['d', 'e']);

            expect(b.getValue()).toEqual(['d!', 'e!'])
        });

        test('Освобождение b от a, b не равно новому значению', () => {
            a.free(b);
            a.update(['f', 'g', 'h', 'i']);

            expect(b.getValue()).not.toEqual(['f!', 'g!', 'h!', 'i!']);
        });

        test('Освобождение b от a, b равно старому значению', () => {
            expect(b.getValue()).toEqual(['d!', 'e!'])
        });
    })

    describe('Обычная зависимость через depend', () => {
        const a = createArray([1, 2, 3]);
        const b = fromArr(a).depend(arr => [...arr, 4]);
        const c = fromArr(a).depend(arr => arr.map(el => el * 2));

        test('Зависимость b от a', () => {
            expect(b.getValue()).toEqual([1, 2, 3, 4])
        });

        test('Зависимость c от a', () => {
            expect(c.getValue()).toEqual([2, 4, 6])
        });

        test('Обновление b после обновления а', () => {
            a.update([4, 5, 6]);

            expect(b.getValue()).toEqual([4, 5, 6, 4])
        });

        test('Зависимость c от a', () => {
            expect(c.getValue()).toEqual([8, 10, 12])
        });
    })

    describe('Сложная зависимость от двух или более массивов', () => {
        const a = createArray([1, 2, 3]);
        const b = createArray([4, 5, 6]);

        const c = fromArr(a, b).depend((a, b) => [...a, ...b]);

        test('Зависимость b от a', () => {
            expect(c.getValue()).toEqual([1, 2, 3, 4, 5, 6])
        });
        
        test('Обновление c после обновления а и(или) b', () => {
            a.update(prev => [...prev, 100]);
            b.update(prev => [...prev, 200]);

            expect(c.getValue()).toEqual([1, 2, 3, 100, 4, 5, 6, 200]);
        });
    })
})