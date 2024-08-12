describe('reactive number', () => {
    const a = fromValue(1);
    const b = fromValue(2);
    const c = from(a, b).depend((a, b) => a + b + 5);
    const d = from(c).depend((c) => c * 10);

    test('dep', () => {
        expect(c.getValue()).toBe(8);
    });

    test('dep', () => {
        expect(d.getValue()).toBe(80);
    });
});