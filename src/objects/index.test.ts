import { fromObj, createObject } from "./index.ts";

describe('Объекты', () => {
    describe('Простая зависимость', () => {
        const a = createObject({a: 1, b: 2});
        const b = fromObj(a).depend(val => ({...val, b: val.b + 10}));

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
            expect(b.getValue()).toEqual({a: 1, b: 13, c: 4});
        });
    });

    describe('Простая зависимость, меняем все поля', () => {
        const a = createObject({a: 1, b: 2});
        const b = fromObj(a).depend(val => ({
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
            expect(b.getValue()?.a).toBeNaN();
            expect(b.getValue()?.b).toBeNaN();
        });
 
        test('Обновление а через прямую замену с возвращением полей', () => {
            a.update({a: 7, b: 8});

            expect(a.getValue()).toEqual({a: 7, b: 8});
        });

        test('Вернули поля', () => {
            expect(b.getValue()).toEqual({a: 17, b: 28});
        });

        test('Обновление а через прямую замену с возвращением полей', () => {
            a.update({b: 9, a: 10});

            expect(a.getValue()).toEqual({a: 10, b: 9});
        });

        test('Вернули поля', () => {
            expect(b.getValue()).toEqual({a: 20, b: 29});
        });
    });

    describe('Цепочка правила зависимости', () => {
        const a = createObject({a: 1, b: 2});
        const b = fromObj(a)
            .depend(val => ({...val, b: val.b * 2}))
            .depend(val => ({...val, a: val.a * 3}))
            .depend(val => ({...val, 
                a: val.a + 1,
                b: val.b + 2,
            }))
            .depend(val => ({
                ...val,
                c: val.a + val.b,
            }))
    
        test('Зависимость b от a', () => {
            expect(b.getValue()).toEqual({a: 4, b: 6, c: 10});
        });
    
        test('Обновление b после обновления а', () => {
            a.update(prev => ({...prev, a: 3, b: 4}));

            expect(b.getValue()).toEqual({a: 10, b: 10, c: 20});
        });
    });

    describe('Цепочка зависимостей', () => {
        const a = createObject({a: 1, b: 2});
        const b = fromObj(a);
        const c = fromObj(b).depend(val => ({...val, 
            b: val.b + 2,
            c: 100,
        }));
        const d = fromObj(c).depend(val => ({...val, 
            a: val.a - 1,
            d: 200,
        }));

        test('Зависимость d от a', () => {
            expect(d.getValue()).toEqual({a: 0, b: 4, c: 100, d: 200});
        });

        test('Зависимость с от a', () => {
            expect(c.getValue()).toEqual({a: 1, b: 4, c: 100});
        });

        test('Пустая зависимость b от a', () => {
            expect(b.getValue()).toBeNull()
        });
    
        test('Обновление d после обновления а', () => {
            a.update(prev => ({...prev, a: 3, b: 4}));

            expect(d.getValue()).toEqual({a: 2, b: 6, c: 100, d: 200});
        });
    });

    describe('Зависимость через flatMap', () => {
        const a = createObject({a: 1, b: 2, c: 3});
        const b = fromObj(a).flatMap(({a: aVal, c: cVal}) => ({[String(cVal) + String(aVal)]: aVal + cVal}));

        test('Зависимость d от a', () => {
            expect(b.getValue()).toEqual({'31': 4});
        });
        
        test('Обновление d после обновления а', () => {
            a.update({a: 4, b: 5, c: 6});

            expect(b.getValue()).toEqual({'64': 10});
        });
    });

    describe('Зависимость через map', () => {
        const a = createObject({a: 1, b: 2, c: 3});
        const b = fromObj(a).map((key, value) => [value, key]);

        test('Зависимость b от a', () => {
            expect(b.getValue()).toEqual({'1': 'a', '2': 'b', '3': 'c'});
        });
    
        test('Обновление b после обновления а', () => {
            a.update({a: 4, b: 5, c: 6});

            expect(b.getValue()).toEqual({'4': 'a', '5': 'b', '6': 'c'});
        });
    });

    describe('Инициализация зависимости в рандомный момент', () => {
        const a = createObject({a: 1});
        const b = createObject({b: 2});

        test('b независима от а', () => {
            a.update({a: 10});

            expect(b.getValue()).toEqual({b: 2});
        });

        test('b теперь зависит от а', () => {
            b.dependsOn(a).depend(val => ({b: val.a}));

            expect(b.getValue()).toEqual({b: 10});
        });

        test('Обновление b после обновления а', () => {
            a.update({a: 20});
            
            expect(b.getValue()).toEqual({b: 20});
        });

        test('Недопустима циклическая зависимость', () => {
            expect(() => a.dependsOn(b)).toThrow();
        });
    });
});