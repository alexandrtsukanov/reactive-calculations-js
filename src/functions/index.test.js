describe('Функции', () => {
    describe('Простая зависимость', () => {
        const f = (a, b) => a + b;
        const f1 = fromFunction(f);
        const f2 = from(f1).depend(val => val + 1);
    
        test('Инициализация f1', () => {
            expect(f1.getValue()(10, 5)).toBe(15);
        })
    
        test('Зависимость f2 от f1', () => {
            expect(f2.getValue()(10, 5)).toBe(16);
        })
    
        test('Зависимость f2 от f1 с другими аргументами', () => {
            expect(f2.getValue()(20, 10)).toBe(31);
        })
    
        const fNew = (a, b) => a * b;
        f1.update(fNew);
    
        test('Обновление f1', () => {
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
        const f1 = fromFunction(f);
        const f2 = from(f1).depend(val => val + 2);
        const f3 = from(f2).depend(val => val - 10);
        const f4 = from(f3).depend(val => val * 2);

        test('Инициализация f1', () => {
            expect(f1.getValue()(1, 2)).toBe(4);
        })
    
        test('Зависимость f2 от f1', () => {
            expect(f2.getValue()(10, 5)).toBe(18);
        })

        test('Зависимость f3 от f2', () => {
            expect(f3.getValue()(5, 6)).toBe(4);
        })

        test('Зависимость f4 от f3', () => {
            expect(f3.getValue()(7, 8)).toBe(16);
        })
    
        test('Зависимость f4 от f3 с другими аргументами', () => {
            expect(f2.getValue()(9, 10)).toBe(24);
        })
    
        const fNew = (a, b) => a * b + 2;
        f1.update(fNew);
    
        test('Обновление f1', () => {
            expect(f1.getValue()(2, 4)).toBe(10);
        });
    
        test('Обновление f4 после обновления f1', () => {
            expect(f4.getValue()(9, 10)).toBe(168);
        })
    })

    describe('Цепочка правила зависимости', () => {
        const f = (a, b) => Math.max(a, b);
        const f1 = fromFunction(f);
        const f2 = from(f1)
            .depend(val => val + 1)
            .depend(val => val * 2)
            .depend(val => val.toString())

        test('Зависимость f2 от f1', () => {
            expect(f2.getValue()(3, 4)).toBeInstanceOf(String);
        });

        test('Зависимость f2 от f1', () => {
            expect(f2.getValue()(3, 4)).toBe('10');
        });

        const fNew = (a, b) => Math.min(a, b);
        f1.update(fNew);

        test('Обновление f2 после обновления f1', () => {
            expect(f2.getValue()(3, 4)).toBe('8');
        })
    })

    describe('Сложная зависимость от двух или более функций', () => {
        const average = (a, b, c) => Math.floor((a + b + c) / 3);
        const f1 = fromFunction(average);

        const doubleSum = (a, b) => (a + b) * 2;
        const f2 = fromFunction(doubleSum);

        const f3 = from(f1, f2).depend((val1, val2) => val1 + val2);

        test('Зависимость f3 от f1 и(или) f2', () => {
            expect(f3.getValue()(1, 2, 3, 4, 5)).toBe(20);
        });

        test('Зависимость f3 от f1 и(или) f2, мало аргументов', () => {
            expect(f3.getValue()(1, 2, 3, 4)).toThrow();
        });

        test('Зависимость f3 от f1 и(или) f2, много аргументов', () => {
            expect(f3.getValue()(1, 2, 3, 4, 5, 6)).toBe(20);
        });

        const averageInc = (a, b, c) => average(a, b, c) + 1
        f1.update(averageInc);
        const doubleSumInc = (a, b) => doubleSum(a, b) + 1
        f2.update(doubleSumInc);

        test('Обновление f3 после обновления f1 и f2', () => {
            expect(f3.getValue()(1, 2, 3, 4, 5)).toBe(22);
        });
    })
})