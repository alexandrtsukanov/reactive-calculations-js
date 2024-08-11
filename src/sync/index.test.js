describe('reactive number', () => {
    test('composed of non-numbers throws CustomError', () => {
        expect(() => binaryStringToNumber('abc')).toThrow(CustomError);
    });
  
    test('with extra whitespace throws CustomError', () => {
        expect(() => binaryStringToNumber('  100')).toThrow(CustomError);
    });
  
    test('returns the correct number', () => {
        expect(binaryStringToNumber('100')).toBe(4);
    });
});