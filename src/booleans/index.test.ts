const {fromBoolean, from} = require('./index.ts');

describe('Логические значения', () => {
    const a = fromBoolean(true);
    const b = from(a).same();
    const c = from(b).opposite();

    test('Инициализация a №1', () => {
        expect(a.getValue()).toBeTruthy();
    });

    test('Инициализация a №2', () => {
        expect(a.getValue()).toBe(true);
    });

    test('b зависит от a прямо №1', () => {
        expect(b.getValue()).toBeTruthy()
    })

    test('b зависит от a прямо №2', () => {
        expect(b.getValue()).toBe(true)
    })

    test('c зависит от b обратно №1', () => {
        expect(c.getValue()).toBeFalsy()
    })

    test('c зависит от b обратно №2', () => {
        expect(c.getValue()).toBe(false);
    })

    test('Обновление a №1', () => {
        a.toggle();

        expect(a.getValue()).toBeFalsy()
    })

    test('Обновление a №2', () => {
        expect(a.getValue()).toBe(false)
    })

    test('Обновление b после обновления a №1', () => {
        expect(b.getValue()).toBeFalsy()
    })

    test('Обновление b после обновления a №2', () => {
        expect(b.getValue()).toBe(false)
    })

    test('Обновление c после обновления a №1', () => {
        expect(c.getValue()).toBeTruthy()
    })

    test('Обновление c после обновления a №2', () => {
        expect(c.getValue()).toBe(true)
    })

    test('Зависимость b от a, поддержка обычного update №1', () => {
        a.update(val => !val);

        expect(b.getValue()).toBeTruthy()
    })

    test('Зависимость b от a, поддержка обычного update №2', () => {
        expect(b.getValue()).toBe(true)
    })

    test('Зависимость c от a, поддержка обычного update №1', () => {
        expect(c.getValue()).toBeFalsy()
    })

    test('Зависимость c от a, поддержка обычного update №2', () => {
        expect(c.getValue()).toBe(false);
    })
})