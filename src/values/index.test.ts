import { Alphanum } from "../types";

const {fromValue, from} = require('../sync.ts');

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
    
        a.update(val => val + 10);
        
        test('Обновление а', () => {
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
            expect(c.getValue()).toBe(8);
        });
    
        test('Зависимость e от d', () => {
            expect(e.getValue()).toBe(80);
        });
    
        a.update((val) => val + 10);
        b.update((val) => val + 10);
    
        test('Обновление а', () => {
            expect(a.getValue()).toBe(11);
        });
    
        test('Обновление b', () => {
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
        const e = from(d).depend(val => val.toString());
    
        test('Зависимость e от a', () => {
            expect(e.getValue()).toBeInstanceOf(String);
        });
    
        test('Зависимость e от a', () => {
            expect(e.getValue()).toBe('16');
        });
    
        a.update(5);
        
        test('Обновление e после обновления а', () => {
            expect(a.getValue()).toBe('22');
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
    
        a.free(b);
        a.update(18);
        
        test('Освобождение b от a, b не равно новому значению', () => {
            expect(b.getValue()).not.toBe(36);
        });

        test('Освобождение b от a, b равно старому значению', () => {
            expect(b.getValue()).toBe(6);
        });

        b.update(val => val + 1);
    
        test('с сохраняет зависимость от b', () => {
            expect(c.getValue()).toBe(28);
        });
    });

    describe('Инициализация зависимости в рандомный момент', () => {
        const a = fromValue(1);
        const b = fromValue(2);

        a.update(3);

        test('b независима от а', () => {
            expect(b.getValue()).toBe(2);
        });

        b.dependsOn(a).depend(val => val ** 2);

        test('b теперь зависит от а', () => {
            expect(b.getValue()).toBe(9);
        });

        a.update(4);

        test('Обновление b после обновления а', () => {
            expect(b.getValue()).toBe(16);
        });

        test('Недопустима циклическая зависимость', () => {
            expect(a.dependsOn(b).depend(val => val)).toThrow();
        });
    });

    describe('Пустая зависимость', () => {
        const a = fromValue(1);
        const b = from(a);

        const c = fromValue(3);
        const d = fromValue(4);
        const e = from(c, d);

        test('Пустая зависимсость, одно значение', () => {
            expect(b.getValue()).toBeUndefined();
        });

        test('Пустая зависимсость, несколько значений', () => {
            expect(e.getValue()).toBeUndefined();
        });

        const f = from(b).depend(val => val * 2);

        test('f зависит от b', () => {
            expect(f.getValue()).toBe(2);
        });

        a.update(val => val + 10);

        test('Обновление f после обновления b', () => {
            expect(f.getValue()).toBe(22);
        });

        const g = from(e).depend((c, d) => (c + d) * 3);

        test('g зависит от e', () => {
            expect(g.getValue()).toBe(21);
        });

        c.update(val => val + 100);
        d.update(val => val + 200);

        test('Обновление g после обновления c и(или) d', () => {
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

        a.update(val => val + 10);
        b.update(val => val + 10);

        test('Обновление g после обновления а и(или) b', () => {
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

        a.update(val => val + 10);
        b.update(val => val + 20);

        test('Обновление e после обновления а и(или) b', () => {
            expect(g.getValue()).toBe(35);
        });

        const f = from(c, d).depend((a) => a + 5);

        test('Ошибка при несовпадении количества аргументов и зависимых значений', () => {
            expect(from(c, d).depend((a) => a + 5)).toThrow();
        })
    })

    describe('Нестрогие зависимости', () => {
        const a = fromValue(1);
        const b = from(a, {isStrict: false}).depend(val => Math.floor((val + 5) / 2));
        const c = from(a).depend(val => Math.floor((val + 5) / 2));

        test('Зависимость b от a', () => {
            expect(b.getValue()).toBe(3);
        });

        test('Зависимость c от a', () => {
            expect(c.getValue()).toBe(3);
        });

        expect(b.update(33)).not.toThrow();
        expect(c.update(53)).toThrow();
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
            expect(from(a, b).depend(val => val + 5)).toThrow();
        });

        test('Ошибка при несовпадении количества аргументов и зависимых значений', () => {
            expect(from(a, b).depend((val1, val2, val3) => val1 + val2 + val3 + 5)).toThrow();
        });
    })
});

describe('Строки', () => {
    const a = fromValue('abc');
    const b = from(a).depend(val => val + '_postfix');
    const c = from(b).depend(val => 'prefix_' + val);

    test('Инициализация а', () => {
        expect(a.getValue()).toBe('abc');
    });

    test('Зависимость b от a', () => {
        expect(b.getValue()).toBe('abc_postfix');
    });

    test('Зависимость c от b', () => {
        expect(c.getValue()).toBe('prefix_abc_postfix');
    });

    a.update('xyz');

    test('Обновление b после обновления а', () => {
        expect(b.getValue()).toBe('xyz_postfix');
    });

    test('Обновление c после обновления b', () => {
        expect(c.getValue()).toBe('prefix_xyz_postfix');
    });
})