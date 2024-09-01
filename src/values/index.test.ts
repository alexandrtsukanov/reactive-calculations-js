import {fromValue, from} from './index.ts';

describe('Числа', () => {
    describe('Простая зависимость', () => {
        const a = fromValue(1);
        const b = from(a).depend(val => val + 5);

        test('Инициализация а', () => {
            expect(a.getValue()).toBe(1);
        });
    
        test('Зависимость a от b', () => {
            expect(b.getValue()).toBe(6);
        });
    
        test('Обновление а', () => {
            a.update(val => val + 10);

            expect(a.getValue()).toBe(11);
        });

        test('Обновление b после обновления а', () => {
            expect(b.getValue()).toBe(16);
        });
    });

    describe('Сложная зависимость от двух или более чисел', () => {
        const a = fromValue(1);
        const b = fromValue(2);
        const c = fromValue(3);
        const d = from(a, b, c).depend((a, b, c) => a + b + c + 2);
        const e = from(d).depend(d => d * 10);
    
        test('Зависимость d от а, b и c', () => {
            expect(d.getValue()).toBe(8);
        });
    
        test('Зависимость e от d', () => {
            expect(e.getValue()).toBe(80);
        });
        
        test('Обновление а', () => {
            a.update((val) => val + 10);

            expect(a.getValue()).toBe(11);
        });

        test('Обновление b', () => {
            b.update((val) => val + 10);

            expect(b.getValue()).toBe(12);
        });
    
        test('Обновление d после обновления а и(или) b и(или) c', () => {
            expect(d.getValue()).toBe(28);
        });
    
        test('Обновление e после обновления d', () => {
            expect(e.getValue()).toBe(280);
        });
    });

    describe('Длинная цепочка зависимостей', () => {
        const a = fromValue(2);
        const b = from(a).depend(val => val + 10);
        const c = from(b).depend(val => val - 4);
        const d = from(c).depend(val => val * 2);
        const e = from(d).depend(val => val * 10);
    
        test('Зависимость e от a', () => {
            expect(e.getValue()).toBe(160);
        });
    
        test('Обновление e после обновления а', () => {
            a.update(5);

            expect(e.getValue()).toBe('22');
        });
    });

    describe('Освобождение от зависимостей', () => {
        const a = fromValue(3);
        const b = from(a).depend(val => val * 2);
        const c = from(b).depend(val => val * 4);

        test('Зависимость b от a', () => {
            expect(b.getValue()).toBe(6);
        });
    
        test('Зависимость c от a', () => {
            expect(c.getValue()).toBe(24);
        });
      
        test('Освобождение b от a, b не равно новому значению', () => {
            a.free(b);
            a.update(18);

            expect(b.getValue()).not.toBe(36);
        });

        test('Освобождение b от a, b равно старому значению', () => {
            expect(b.getValue()).toBe(6);
        });

        test('с сохраняет зависимость от b', () => {
            b.update(val => val + 1);

            expect(c.getValue()).toBe(28);
        });
    });

    describe('Инициализация зависимости в рандомный момент', () => {
        const a = fromValue(1);
        const b = fromValue(2);

        test('b независима от а', () => {
            a.update(3);

            expect(b.getValue()).toBe(2);
        });

        test('b теперь зависит от а', () => {
            b.dependsOn(a).depend(val => val ** 2);

            expect(b.getValue()).toBe(9);
        });

        test('Обновление b после обновления а', () => {
            a.update(4);

            expect(b.getValue()).toBe(16);
        });

        test('Недопустима циклическая зависимость', () => {
            expect(() => a.dependsOn(b)).toThrow();
        });
    });

    describe('Пустая зависимость', () => {
        const a = fromValue(1);
        const b = from(a);

        const c = fromValue(3);
        const d = fromValue(4);
        const e = from(c, d);

        test('Пустая зависимсость, одно значение', () => {
            expect(b.getValue()).toBeNull();
        });

        test('Пустая зависимсость, несколько значений', () => {
            expect(e.getValue()).toBeNull();
        });

        const f = from(b).depend(val => val * 2);

        test('f зависит от b', () => {
            expect(f.getValue()).toBe(2);
        });

        test('Обновление f после обновления b', () => {
            a.update(val => val + 10);
            
            expect(f.getValue()).toBe(22);
        });
        
        const g = from(e).depend((c, d) => (c + d) * 3);

        test('g зависит от e', () => {
            expect(g.getValue()).toBe(21);
        });
  
        test('Обновление g после обновления c и(или) d', () => {
            c.update(val => val + 100);
            d.update(val => val + 200);

            expect(g.getValue()).toBe(921);
        });
    })

    describe('Длинная цепочка пустых зависимостей', () => {
        const a = fromValue(1);
        const b = fromValue(2);
        const c = from(a, b);
        const d = from(c);
        const e = from(d);
        const f = from(e)
        const g = from(f).depend((valA, b) => valA + b + 7);

        test('g зависит от a и b', () => {
            expect(g.getValue()).toBe(10);
        });
 
        test('Обновление g после обновления а и(или) b', () => {
            a.update(val => val + 10);
            b.update(val => val + 10);

            expect(g.getValue()).toBe(30);
        });
    })

    describe('Комбинации родителей', () => {
        const a = fromValue(1);
        const b = fromValue(2);
        const c = from(a);
        const d = from(b);
        const e = from(c, d).depend((a, b) => a + b + 5);

        test('e зависит от a и b', () => {
            expect(e.getValue()).toBe(8);
        });

        test('Обновление e после обновления а и(или) b', () => {
            a.update(val => val + 10);
            b.update(val => val + 20);

            expect(e.getValue()).toBe(38);
        });

        test('Ошибка при несовпадении количества аргументов и зависимых значений', () => {
            expect(() => from(c, d).depend((a) => a + 5)).toThrow();
        })
    })

    describe('Нестрогие зависимости', () => {
        const a = fromValue(1);
        const b = from(a).depend(val => Math.floor((val + 5) / 2), {isStrict: false});
        const c = from(a).depend(val => Math.floor((val + 5) / 2));

        test('Зависимость b от a', () => {
            expect(b.getValue()).toBe(3);
        });

        test('Зависимость c от a', () => {
            expect(c.getValue()).toBe(3);
        });

        test('b можно поменять', () => {
            b.update(33);

            expect(b.getValue()).toBe(33);
        })

        test('с не поменяется', () => {
            c.update(53);

            expect(c.getValue()).toBe(3);
        })

        test('b меняется при обновлении а', () => {
            a.update(10);

            expect(b.getValue()).toBe(7);
        })

        test('с меняется при обновлении а', () => {
            expect(c.getValue()).toBe(7);
        })
    })

    describe('Цепочка правила зависимости', () => {
        const a = fromValue(10);
        const b = from(a)
            .depend(val => val + 5)
            .depend(val => val - 3)
            .depend(val => val * 2)

        test('Зависимость b от a', () => {
            expect(b.getValue()).toBe(24);
        });
    })

    describe('Адаптация по кол-ву аргументов при установлении зависимости', () => {
        const a = fromValue(3);
        const b = fromValue(4);

        test('Ошибка при несовпадении количества аргументов и зависимых значений', () => {
            expect(() => from(a, b).depend(val => val + 5)).toThrow();
        });

        test('Ошибка при несовпадении количества аргументов и зависимых значений', () => {
            expect(() => from(a, b).depend((val1, val2, val3) => val1 + val2 + val3 + 5)).toThrow();
        });
    })
});