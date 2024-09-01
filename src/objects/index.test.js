import { from, fromObject } from "./index.ts";

    describe('Простая зависимость', () => {
        const a = fromObject({a: 1, b: 2});
        const b = from(a).depend(val => ({...val, b: val.b + 10}));

        test('Инициализация а', () => {
            expect(a.getValue()).toEqual({a: 1, b: 2});
        });
    
        test('Зависимость b от a', () => {
            expect(b.getValue()).toEqual({a: 1, b: 12});
        });
    
        test('Обновление а', () => {
            a.update(prev => ({...prev, b: 3, c: 4}));

            expect(a.getValue()).toEqual({a: 1, b: 3, c: 4});
        });
    
        test('Обновление b после обновления а', () => {
            expect(a.getValue()).toEqual({a: 2, b: 13, c: 4});
        });
    });

    describe('Простая зависимость, меняем все поля', () => {
        const a = fromObject({a: 1, b: 2});
        const b = from(a).depend(val => ({
            ...val, 
            a: val.a + 10, 
            b: val.b + 20,
        }));

        test('Инициализация а', () => {
            expect(a.getValue()).toEqual({a: 1, b: 2});
        });
    
        test('Зависимость b от a', () => {
            expect(b.getValue()).toEqual({a: 11, b: 22});
        });
    
        test('Обновление а', () => {
            a.update(prev => ({...prev, a: 3, b: 4, c: 5}));

            expect(a.getValue()).toEqual({a: 3, b: 4, c: 5});
        });
    
        test('Обновление b после обновления а', () => {
            expect(b.getValue()).toEqual({a: 13, b: 24, c: 5});
        });

        test('Обновление а через прямую замену', () => {
            a.update({c: 6, d: 7});

            expect(a.getValue()).toEqual({c: 6, d: 7});
        });

        test('Удалили поля', () => {
            expect(b.getValue()).toEqual({c: 6, d: 7});
        });
 
        test('Обновление а через прямую замену с возвращением полей', () => {
            a.update({a: 7, b: 8});

            expect(a.getValue()).toEqual({a: 7, b: 8});
        });

        test('Вернули поля', () => {
            expect(b.getValue()).toEqual({a: 17, b: 28});
        });

        test('Обновление а через прямую замену с частичным возвращением полей', () => {
            a.update({b: 9});

            expect(a.getValue()).toEqual({b: 9});
        });

        test('Вернули поля', () => {
            expect(b.getValue()).toEqual({b: 29});
        });
    });

    describe('Цепочка правила зависимости', () => {
        const a = fromObject({a: 1, b: 2});
        const b = from(a)
            .depend(val => ({...val, b: val.b * 2}))
            .depend(val => ({...val, a: val.a * 3}))
            .depend(val => ({
                ...val, 
                a: val.a + 1,
                b: val.b + 2,
                c: val.a + val.b,
            }))
    
        test('Зависимость b от a', () => {
            expect(b.getValue()).toEqual({a: 4, b: 6, c: 10});
        });
    
        test('Обновление b после обновления а', () => {
            a.update(prev => ({...prev, a: 3, b: 4}));

            expect(a.getValue()).toEqual({a: 10, b: 10, c: 20});
        });
    });

    describe('Цепочка зависимостей', () => {
        const a = fromObject({a: 1, b: 2});
        const b = from(a);
        const c = from(b).depend(val => ({...val, 
            b: val.b + 2,
            c: 100,
        }));
        const d = from(c).depend(val => ({...val, 
            a: val.a - 1,
            d: 200,
        }));

        test('Зависимость d от a', () => {
            expect(b.getValue()).toEqual({a: 0, b: 4, c: 100, d: 200});
        });
    
        test('Обновление d после обновления а', () => {
            a.update(prev => ({...prev, a: 3, b: 4}));

            expect(a.getValue()).toEqual({a: 2, b: 6, c: 100, d: 200});
        });
    });

    describe('Зависимость через flatMap', () => {
        const a = fromObject({a: 1, b: 2, c: 3});
        const b = from(a).flatMap(({a: aVal, c: cVal}) => ({[String(cVal) + String(aVal)]: aVal + cVal}));

        test('Зависимость d от a', () => {
            expect(b.getValue()).toEqual({'31': 4});
        });
        
        test('Обновление d после обновления а', () => {
            a.update({a: 4, b: 5, c: 6});

            expect(a.getValue()).toEqual({'64': 10});
        });
    });

    describe('Зависимость через map', () => {
        const a = fromObject({a: 1, b: 2, c: 3});
        const b = from(a).map((key, value) => [value, key]);

        test('Зависимость d от a', () => {
            expect(b.getValue()).toEqual({'1': 'a', '2': 'b', '3': 'c'});
        });
    
        test('Обновление d после обновления а', () => {
            a.update({a: 4, b: 5, c: 6});

            expect(a.getValue()).toEqual({'4': 'a', '5': 'b', '6': 'c'});
        });
    });

    describe('Инициализация зависимости в рандомный момент', () => {
        const a = fromObject({a: 1});
        const b = fromObject({b: 2});

        test('b независима от а', () => {
            a.update({a: 10});

            expect(b.getValue()).toEqual({b: 2});
        });

        test('b теперь зависит от а', () => {
            b.dependsOn(a).depend(val => ({...val, b: val.a}));

            expect(b.getValue()).toBe({b: 10});
        });

        test('Обновление b после обновления а', () => {
            a.update({a: 20});
            
            expect(b.getValue()).toBe({b: 20});
        });

        test('Недопустима циклическая зависимость', () => {
            expect(a.dependsOn(b).depend(val => val)).toThrow();
        });
    });