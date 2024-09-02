import { fromFn, createFunction } from "./index.ts";

describe('Функции', () => {
    describe('Простая зависимость', () => {
        const f = (a, b) => a + b;
        const f1 = createFunction(f);
        const f2 = fromFn(f1).depend(val => val + 1);
    
        test('Инициализация f1', () => {
            expect(f1.getValue()(10, 5)).toBe(15);
        })
    
        test('Зависимость f2 от f1', () => {
            expect(f2.getValue()(10, 5)).toBe(16);
        })
    
        test('Зависимость f2 от f1 с другими аргументами', () => {
            expect(f2.getValue()(20, 10)).toBe(31);
        })
        
        test('Обновление f1', () => {
            const fNew = (a, b) => a * b;
            f1.update(fNew);

            expect(f1.getValue()(10, 5)).toBe(50);
        });
    
        test('Обновление f2 после обновления f1', () => {
            expect(f2.getValue()(10, 5)).toBe(51);
        })
    
        test('Обновление f2 после обновления f1 с другими аргументами', () => {
            expect(f2.getValue()(20, 10)).toBe(201);
        })
    })

    describe('Длинная цепочка зависимостей', () => {
        const f = (a, b) => a + b + 1;
        const f1 = createFunction(f);
        const f2 = fromFn(f1).depend(val => val + 2);
        const f3 = fromFn(f2).depend(val => val - 10);
        const f4 = fromFn(f3).depend(val => val * 2);

        test('Инициализация f1', () => {
            expect(f1.getValue()(10, 5)).toBe(16);
        })
    
        test('Зависимость f2 от f1', () => {
            expect(f2.getValue()(10, 5)).toBe(18);
        })

        test('Зависимость f3 от f2', () => {
            expect(f3.getValue()(10, 5)).toBe(8);
        })

        test('Зависимость f4 от f3', () => {
            expect(f4.getValue()(10, 5)).toBe(16);
        })
    
        test('Зависимость f4 от f3 с другими аргументами', () => {
            expect(f4.getValue()(9, 10)).toBe(24);
        })
    
        test('Обновление f1', () => {
            const fNew = (a, b) => a * b + 2;
            f1.update(fNew);

            expect(f1.getValue()(2, 4)).toBe(10);
        });
    
        test('Обновление f2 после обновления f1', () => {
            expect(f2.getValue()(2, 4)).toBe(12);
        })

        test('Обновление f3 после обновления f1', () => {
            expect(f3.getValue()(2, 4)).toBe(2);
        })

        test('Обновление f4 после обновления f1', () => {
            expect(f4.getValue()(2, 4)).toBe(4);
        })
    })

    describe('Цепочка правила зависимости', () => {
        const f = (a, b) => Math.max(a, b);
        const f1 = createFunction(f);
        const f2 = fromFn(f1)
            .depend(val => val + 1)
            .depend(val => val * 2)
            .depend(val => val.toString())

        test('Зависимость f2 от f1', () => {
            expect(f2.getValue()(3, 4)).toBe('10');
        });
        
        test('Обновление f2 после обновления f1', () => {
            const fNew = (a, b) => Math.min(a, b);
            f1.update(fNew);

            expect(f2.getValue()(3, 4)).toBe('8');
        })
    })

    describe('Зависимость от двух или более функций', () => {
        const average = (a, b, c) => Math.floor((a + b + c) / 3);
        const f1 = createFunction(average);

        const doubleSum = (a, b) => (a + b) * 2;
        const f2 = createFunction(doubleSum);

        test('Зависимость f3 от f1 и(или) f2', () => {
            expect(() => fromFn(f1, f2).depend((val1, val2) => val1 + val2)).toThrow();
        });
    })

    describe('Пустая зависимость', () => {
        const f1 = createFunction(str => str.length);
        const f2 = fromFn(f1);
        const f3 = fromFn(f2).depend(num => num * 2);

        test('Инициализация f1', () => {
            expect(f1.getValue()('hello!')).toBe(6);
        });

        test('Зависимость f2 от f1, пустая функция', () => {
            expect(f2.getValue()()).toBeUndefined()
        });
        
        test('Зависимость f3 от f1', () => {
            expect(f3.getValue()('hello!')).toBe(12);
        });
    })

    describe('Инициализация зависимости в рандомный момент', () => {
        const f1 = createFunction((a, b) => a - b);
        const f2 = createFunction((a, b) => a * 2 + b);

        test('f2 не зависит от f1', () => {
            expect(f2.getValue()(3, 4)).toBe(10);
        });

        test('f2 не зависит от f1', () => {
            f1.update((a, b) => a - b + 1);

            expect(f2.getValue()(3, 4)).toBe(10);
        });

        test('f2 зависит от f1', () => {
            f2.dependsOn(f1).depend(val => val.toString())

            expect(f2.getValue()(3, 4)).toBe('0');
        });

        test('Обновление f2 после обновления f1', () => {
            f1.update((a, b) => a - b + 2)

            expect(f2.getValue()(3, 4)).toBe('1');
        });
    })

    describe('Освобождение от зависимостей', () => {
        const doubleSum = (a, b) => (a + b) * 2;
        const f1 = createFunction(doubleSum);
        const f2 = fromFn(f1).depend(val => val + 1);

        test('Зависимость f2 от f1', () => {
            expect(f2.getValue()(4, 5)).toBe(19);
        });

        test('Зависимость f2 от f1', () => {
            f1.free(f2);
            f1.update( (a, b) => (a + b) * 3);

            expect(f2.getValue()(4, 5)).toBe(19);
        });
    })

    describe('Ничего не возвращающая функция', () => {
        const f1 = createFunction(() => {});
        const f2 = fromFn(f1).depend(val => val + 1);

        test('Зависимость f3 от f1 и(или) f2', () => {
            expect(f2.getValue()()).toBeNaN();
        });
    })
})