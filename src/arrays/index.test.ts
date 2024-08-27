describe('Массивы', () => {
    describe('Обновление массива', () => {
        const a = fromArray([1, 2, 3]);
        a.updateMap(el => el + 1);

        test('Обновление через updateMap', () => {
            expect(a.getValue()).toEqual([2, 4, 6]);
        });

        a.updateFilter(el => el > 2);

        test('Обновление через updateFilter', () => {
            expect(a.getValue()).toEqual([4, 6]);
        });

        a.updateFlatMap(el => [el, el + 1]);

        test('Обновление через updateFlatMap', () => {
            expect(a.getValue()).toEqual([4, 5, 6, 7]);
        });

        a.updatePush([8, 9]);

        test('Обновление через updatePush', () => {
            expect(a.getValue()).toEqual([4, 5, 6, 7, 8, 9]);
        });

        a.updateUnshift([2, 3]);

        test('Обновление через updatePush', () => {
            expect(a.getValue()).toEqual([2, 3, 4, 5, 6, 7, 8, 9]);
        });

        a.updatePop(3);

        test('Обновление через updatePop', () => {
            expect(a.getValue()).toEqual([2, 3, 4, 5, 6]);
        });

        a.updateShift(2);

        test('Обновление через updateShift', () => {
            expect(a.getValue()).toEqual([4, 5, 6]);
        });

        a.update([100, 200, 300]);

        test('Обновление через update напрямую', () => {
            expect(a.getValue()).toEqual([100, 200, 300]);
        });
    })

    describe('Простые зависимости', () => {
        const a = fromArray([1, 2, 3]);
        const b = from(a).map(el => el * 2);
    
        test('Инициализация а', () => {
            expect(a.getValue()).toEqual([1, 2, 3]);
        });
    
        test('Зависимость a от b', () => {
            expect(b.getValue()).toEqual([2, 4, 6]);
        });

        a.updateMap(el => el + 1);

        test('Обновление b после обновления а через updateMap', () => {
            expect(b.getValue()).toEqual([4, 6, 8]);
        });

        a.updateFilter(el => el % 2 === 0);

        test('Обновление b после обновления а через updateFilter', () => {
            expect(b.getValue()).toEqual([4, 8]);
        });
    })

    describe('Цепочка правила зависимости', () => {
        const a = fromArray([1, 2, 3]);
        const b = from(a)
            .map(el => el * 2)
            .filter(el => el > 3)
            .push(['end'])
            .unshift(['start'])
            .reverse();

        test('Обновление через updateMap', () => {
            expect(b.getValue()).toEqual(['end', 6, 4, 'start']);
        });
    })

    describe('Цепочка правила зависимости', () => {
        const a = fromArray([1, 2, 3]);
        const b = from(a)
            .map(el => el * 2)
            .filter(el => el > 3)
            .push(['end'])
            .unshift(['start'])
            .reverse();

        test('Обновление через updateMap', () => {
            expect(b.getValue()).toEqual(['end', 6, 4, 'start']);
        });
    })

    describe('Пустой массив', () => {
        const a = fromArray([1, 2, 3]);
        const b = from(a).map(el => el * 2);

        a.updatePop(10);

        test('Обновление через updatePop, в результате пустой массив №1', () => {
            expect(b.getValue()).toHaveLength(0);
        });

        test('Обновление через updateMap, в результате пустой массив №2', () => {
            expect(b.getValue()).toEqual([]);
        });
    })
})