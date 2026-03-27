const { capitalize, calculateAverage, slugify, clamp } = require('../src/utils');

describe('utils functions', () => {

    describe('capitalize', () => {
        it('should return "Hello" when "hello" is given', () => {
            expect(capitalize("hello")).toBe("Hello");
        });
        it('should return "World" when "WORLD" is given', () => {
            expect(capitalize("World")).toBe("World");
        });
        it('should return "" when "" is given', () => {
            expect(capitalize("")).toBe("");
        });
        it('should return "" when null is given', () => {
            expect(capitalize(null)).toBe("");
        });
    });

    describe('calculateAverage', () => {
        it('should return 12 when [10, 12, 14] is given', () => {
            expect(calculateAverage([10, 12, 14])).toBe(12);
        });
        it('should return 15 when [15] is given', () => {
            expect(calculateAverage([15])).toBe(15);
        });
        it('should return 0 when [] is given', () => {
            expect(calculateAverage([])).toBe(0);
        });
        it('should return 11 when [10, 11, 12] is given', () => {
            expect(calculateAverage([10, 11, 12])).toBe(11);
        });
    });

    describe('slugify', () => {
        it('should return "hello-world" when "Hello World" is given', () => {
            expect(slugify("Hello World")).toBe("hello-world");
        });
        it('should return "spaces-everywhere" when " Spaces Everywhere " is given', () => {
            expect(slugify(" Spaces Everywhere ")).toBe("spaces-everywhere");
        });
        it('should return "cest-lete" when "C\'est l\'ete !" is given', () => {
            expect(slugify("C'est l'ete !")).toBe("cest-lete");
        });
        it('should return "" when "" is given', () => {
            expect(slugify("")).toBe("");
        });
    });

    describe('clamp', () => {
        it('should return 5 when clamp(5, 0, 10) is called', () => {
            expect(clamp(5, 0, 10)).toBe(5);
        });
        it('should return 0 when clamp(-5, 0, 10) is called', () => {
            expect(clamp(-5, 0, 10)).toBe(0);
        });
        it('should return 10 when clamp(15, 0, 10) is called', () => {
            expect(clamp(15, 0, 10)).toBe(10);
        });
        it('should return 0 when clamp(0, 0, 0) is called', () => {
            expect(clamp(0, 0, 0)).toBe(0);
        });
    });

});
