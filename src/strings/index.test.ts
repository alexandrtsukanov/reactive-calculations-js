const {fromValue} = require('./index.ts');
const {from} = require('../reactive.ts');

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
    
    test('Обновление b после обновления а', () => {
        a.update('xyz');

        expect(b.getValue()).toBe('xyz_postfix');
    });

    test('Обновление c после обновления b', () => {
        expect(c.getValue()).toBe('prefix_xyz_postfix');
    });
})