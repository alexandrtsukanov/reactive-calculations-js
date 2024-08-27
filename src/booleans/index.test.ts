describe('Логические значения', () => {
    const truthy = fromBoolean(true);
    const truthy2 = from(truthy).same();
    const falsy = from(truthy2).opposite();

    test('Инициализация truthy №1', () => {
        expect(a.getValue()).toBeTruthy();
    });

    test('Инициализация truthy №2', () => {
        expect(a.getValue()).toBe(true);
    });

    test('truthy2 зависит от truthy прямо №1', () => {
        expect(truthy2.getValue()).toBeTruthy()
    })

    test('truthy2 зависит от truthy прямо №2', () => {
        expect(truthy2.getValue()).toBe(true)
    })

    test('falsy зависит от truthy2 обратно №1', () => {
        expect(falsy.getValue()).toBeFalsy()
    })

    test('falsy зависит от truthy2 обратно №2', () => {
        expect(falsy.getValue()).toBe(false);
    })

    truthy.toggle();

    test('Обновление truthy2 после обновления truthy №1', () => {
        expect(truthy2.getValue()).toBeFalsy()
    })

    test('Обновление truthy2 после обновления truthy №2', () => {
        expect(truthy2.getValue()).toBe(false)
    })

    test('Обновление falsy после обновления truthy №1', () => {
        expect(truthy2.getValue()).toBeTruthy()
    })

    test('Обновление falsy после обновления truthy №2', () => {
        expect(truthy2.getValue()).toBe(true)
    })

    truthy.update(val => !val);

    test('Зависимость truthy2 от truthy, поддержка обычного update №1', () => {
        expect(truthy2.getValue()).toBeTruthy()
    })

    test('Зависимость truthy2 от truthy, поддержка обычного update №2', () => {
        expect(truthy2.getValue()).toBe(true)
    })

    test('Зависимость falsy от truthy, поддержка обычного update №1', () => {
        expect(falsy.getValue()).toBeFalsy()
    })

    test('Зависимость falsy от truthy, поддержка обычного update №2', () => {
        expect(falsy.getValue()).toBe(false);
    })
})