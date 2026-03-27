const { isValidEmail, isValidPassword, isValidAge } = require('../src/validators');

describe('Validators functions', () => {

    describe('isValidEmail', () => {
        it('should return true for "user@example.com"', () => {
            expect(isValidEmail("user@example.com")).toBe(true);
        });
        it('should return true for "user.name+tag@domain.co"', () => {
            expect(isValidEmail("user.name+tag@domain.co")).toBe(true);
        });
        it('should return false for "invalid"', () => {
            expect(isValidEmail("invalid")).toBe(false);
        });
        it('should return false for "@domain.com"', () => {
            expect(isValidEmail("@domain.com")).toBe(false);
        });
        it('should return false for "user@"', () => {
            expect(isValidEmail("user@")).toBe(false);
        });
        it('should return false for ""', () => {
            expect(isValidEmail("")).toBe(false);
        });
        it('should return false for null', () => {
            expect(isValidEmail(null)).toBe(false);
        });
    });

    describe('isValidPassword', () => {
        it('should return valid state for "Passw0rd!"', () => {
            const res = isValidPassword("Passw0rd!");
            expect(res.valid).toBe(true);
            expect(res.errors.length).toBe(0);
        });
        it('should accumulate errors for a short invalid password', () => {
            const res = isValidPassword("short");
            expect(res.valid).toBe(false);
            expect(res.errors).toContain("Trop court");
            expect(res.errors).toContain("Majuscule manquante");
            expect(res.errors).toContain("Chiffre manquant");
            expect(res.errors).toContain("Spécial manquant");
        });
        it('should complain if uppercase is missing ("alllowercase1!")', () => {
            const res = isValidPassword("alllowercase1!");
            expect(res.valid).toBe(false);
            expect(res.errors).toContain("Majuscule manquante");
        });
        it('should complain if lowercase is missing ("ALLUPPERCASE1!")', () => {
            const res = isValidPassword("ALLUPPERCASE1!");
            expect(res.valid).toBe(false);
            expect(res.errors).toContain("Minuscule manquante");
        });
        it('should complain if digits are missing ("NoDigits!here")', () => {
            const res = isValidPassword("NoDigits!here");
            expect(res.valid).toBe(false);
            expect(res.errors).toContain("Chiffre manquant");
        });
        it('should complain if special chars are missing ("NoSpecial1here")', () => {
            const res = isValidPassword("NoSpecial1here");
            expect(res.valid).toBe(false);
            expect(res.errors).toContain("Spécial manquant");
        });
        it('should gracefully handle empty or null values', () => {
            expect(isValidPassword("").valid).toBe(false);
            expect(isValidPassword(null).valid).toBe(false);
        });
    });

    describe('isValidAge', () => {
        it('should return true for 25', () => expect(isValidAge(25)).toBe(true));
        it('should return true for 0', () => expect(isValidAge(0)).toBe(true));
        it('should return true for 150', () => expect(isValidAge(150)).toBe(true));
        
        it('should return false for -1', () => expect(isValidAge(-1)).toBe(false));
        it('should return false for 151', () => expect(isValidAge(151)).toBe(false));
        
        it('should return false for floats (pas un entier)', () => expect(isValidAge(25.5)).toBe(false));
        it('should return false for string digits (pas un nombre)', () => expect(isValidAge("25")).toBe(false));
        it('should return false for null', () => expect(isValidAge(null)).toBe(false));
    });

});
