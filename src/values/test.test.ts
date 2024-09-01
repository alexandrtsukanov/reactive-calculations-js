function fn(num) {
    return {
        value: num,
        update() {
            this.value += 1
        }
    };
}

describe('describe', () => {
    const res = new String('')
        
    test('test 1', () => {
        expect(res).toBeInstanceOf(Function)
    })
})