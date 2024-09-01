import { from, fromRegExp } from "./index.ts";

describe('Регулярные выражения', () => {
    const pattern = 'a.123 text B.456 text c.789';

    describe('Через литерал', () => {
        const r = /[a-z].\d+/;
        const r1 = fromRegExp(r);
        const result1 = pattern.match(r1.getValue());
    
        test('Совпадение без флагов', () => {
            expect(result1?.[0]).toBe('a.123')
        })

        const r2 = from(r1).addFlags(['g']);
        
        test('Совпадение c флагом g', () => {
            const result2 = pattern.match(r2.getValue());

            expect(result2?.[0]).toBe('a.123')
            expect(result2?.[1]).toBe('c.789')
        })
    
        const r3 = from(r2).addFlags(['i']);        
        
        test('Совпадение c флагами g и i', () => {
            const result3 = pattern.match(r3.getValue());

            expect(result3?.[0]).toBe('a.123')
            expect(result3?.[1]).toBe('B.456')
            expect(result3?.[2]).toBe('c.789')
        })
    
        const r4 = from(r3).removeFlags(['i']);
        
        test('Новое совпадение c флагом g', () => {
            const result4 = pattern.match(r4.getValue());
            
            expect(result4?.[0]).toBe('a.123')
            expect(result4?.[1]).toBe('c.789')
        })
    })

    describe('Через конструктор', () => {
        const r = new RegExp('[a-z].\\d+');
        const r1 = fromRegExp(r);
        
        test('Совпадение без флагов', () => {
            const result1 = pattern.match(r1.getValue());

            expect(result1?.[0]).toBe('a.123')
        })

        const r2 = from(r1).addFlags(['g']);
        
        test('Совпадение c флагом g', () => {
            const result2 = pattern.match(r2.getValue());

            expect(result2?.[0]).toBe('a.123')
            expect(result2?.[1]).toBe('c.789')
        })
    
        const r3 = from(r2).addFlags(['i']);
        
        test('Совпадение c флагами g и i', () => {
            const result3 = pattern.match(r3.getValue());

            expect(result3?.[0]).toBe('a.123')
            expect(result3?.[1]).toBe('B.456')
            expect(result3?.[2]).toBe('c.789')
        })
    
        const r4 = from(r3).removeFlags(['i']);
        
        test('Новое совпадение c флагом g', () => {
            const result4 = pattern.match(r4.getValue());

            expect(result4?.[0]).toBe('a.123')
            expect(result4?.[1]).toBe('c.789')
        })
    })
})