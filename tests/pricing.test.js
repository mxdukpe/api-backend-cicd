const { calculateDeliveryFee, applyPromoCode, calculateSurge, calculateOrderTotal } = require('../src/pricing');

describe('Pricing Engine', () => {

    describe('calculateDeliveryFee', () => {
        it('should calculate base fee correctly (2km, 1kg)', () => {
            expect(calculateDeliveryFee(2, 1)).toBe(2.00);
        });

        it('should apply distance supplement correctly (6km, 2kg)', () => {
            // 2.00 + (3 * 0.50) = 3.50
            expect(calculateDeliveryFee(6, 2)).toBe(3.50);
        });

        it('should apply both distance and weight supplement (10km, 6kg)', () => {
            // 2.00 + (7 * 0.50) + 1.50 = 7.00
            expect(calculateDeliveryFee(10, 6)).toBe(7.00);
        });

        it('should apply weight supplement even if distance is short (2km, 8kg)', () => {
            // 2.00 + 1.50 = 3.50
            expect(calculateDeliveryFee(2, 8)).toBe(3.50);
        });

        it('should throw an error if distance > 10km (15km)', () => {
            expect(() => calculateDeliveryFee(15, 2)).toThrow(/Hors zone/);
        });

        it('should throw an error for negative distance', () => {
            expect(() => calculateDeliveryFee(-5, 2)).toThrow(/négatifs/);
        });

        it('should throw an error for negative weight', () => {
            expect(() => calculateDeliveryFee(5, -2)).toThrow(/négatifs/);
        });

        it('should allow exactly 10km without error', () => {
             expect(calculateDeliveryFee(10, 2)).toBe(5.50); // 2.00 + (7*0.50)
        });
    });

    describe('applyPromoCode', () => {
        const mockPromoCodes = [
            { code: 'PERCENT20', type: 'percentage', value: 20, minOrder: 15.00, expiresAt: '2099-12-31' },
            { code: 'FIXED5', type: 'fixed', value: 5, minOrder: 10.00, expiresAt: '2099-12-31' },
            { code: 'EXPIRED10', type: 'fixed', value: 10, minOrder: 5.00, expiresAt: '2020-01-01' },
            { code: 'BIGFIXED', type: 'fixed', value: 50, minOrder: 10.00, expiresAt: '2099-12-31' },
            { code: 'FREE100', type: 'percentage', value: 100, minOrder: 0.00, expiresAt: '2099-12-31' }
        ];

        it('should apply percentage reduction (20% on 50 = 40)', () => {
            expect(applyPromoCode(50, 'PERCENT20', mockPromoCodes)).toBe(40);
        });

        it('should apply fixed reduction (5 on 30 = 25)', () => {
            expect(applyPromoCode(30, 'FIXED5', mockPromoCodes)).toBe(25);
        });

        it('should not change price if promo string is empty or null', () => {
            expect(applyPromoCode(30, null, mockPromoCodes)).toBe(30);
            expect(applyPromoCode(30, '', mockPromoCodes)).toBe(30);
        });

        it('should throw an error for non-existent code', () => {
            expect(() => applyPromoCode(30, 'BOGUS', mockPromoCodes)).toThrow(/inexistant/);
        });

        it('should throw an error if minimum order is not met', () => {
            expect(() => applyPromoCode(10, 'PERCENT20', mockPromoCodes)).toThrow(/Minimum/);
        });

        it('should throw an error if code is expired', () => {
            expect(() => applyPromoCode(30, 'EXPIRED10', mockPromoCodes)).toThrow(/expiré/);
        });

        it('should not allow total to drop below 0 with large fixed code', () => {
            expect(applyPromoCode(30, 'BIGFIXED', mockPromoCodes)).toBe(0);
        });

        it('should allow 100% reduction resulting in 0', () => {
            expect(applyPromoCode(50, 'FREE100', mockPromoCodes)).toBe(0);
        });

        it('should behave correctly when subtotal is 0', () => {
            expect(applyPromoCode(0, 'FREE100', mockPromoCodes)).toBe(0);
        });

        it('should throw error on negative subtotal', () => {
            expect(() => applyPromoCode(-10, 'PERCENT20', mockPromoCodes)).toThrow(/négatif/);
        });
    });

    describe('calculateSurge', () => {
        it('should return 1.0 for normal weekday hours (Mardi 15h)', () => {
            expect(calculateSurge(15, 'tuesday')).toBe(1.0);
        });

        it('should return 1.3 for lunch hours (Mercredi 12h30)', () => {
            expect(calculateSurge(12.5, 'wednesday')).toBe(1.3);
            expect(calculateSurge('12:30', 'wednesday')).toBe(1.3); // test du format texte
        });

        it('should return 1.5 for weekday dinner (Jeudi 20h)', () => {
            expect(calculateSurge(20, 'thursday')).toBe(1.5);
        });

        it('should return 1.8 for weekend dinner (Vendredi 21h)', () => {
            expect(calculateSurge(21, 'friday')).toBe(1.8);
            expect(calculateSurge(20, 'saturday')).toBe(1.8);
        });

        it('should return 1.2 for Sunday daytime (Dimanche 14h)', () => {
            expect(calculateSurge(14, 'sunday')).toBe(1.2);
        });

        it('should correctly handle limits like exactly 11h30 (should be lunch)', () => {
            expect(calculateSurge(11.5, 'monday')).toBe(1.3);
            expect(calculateSurge('11:30', 'monday')).toBe(1.3);
        });

        it('should correctly handle limits like exactly 19h00 (should be dinner)', () => {
            expect(calculateSurge(19, 'tuesday')).toBe(1.5);
        });

        it('should throw error at exactly 22h00 (closed)', () => {
            expect(() => calculateSurge(22, 'monday')).toThrow(/fermé/);
        });

        it('should throw error at 9h59 (closed)', () => {
            expect(() => calculateSurge('09:59', 'monday')).toThrow(/fermé/);
        });

        it('should work at exactly 10h00 (open)', () => {
            expect(calculateSurge(10, 'monday')).toBe(1.0);
        });
    });

    describe('calculateOrderTotal', () => {
        const mockPromoCodes = [
            { code: 'PERCENT20', type: 'percentage', value: 20, minOrder: 15.00, expiresAt: '2099-12-31' }
        ];

        it('should process a normal complete order correctly', () => {
            const items = [{ name: "Pizza", price: 12.50, quantity: 2 }];
            // Mardi 15h -> normal surge (1.0), 5km 1kg -> 2.00 + 2*0.50 = 3.00
            const res = calculateOrderTotal(items, 5, 1, null, 15, 'tuesday', mockPromoCodes);
            expect(res.subtotal).toBe(25.00);
            expect(res.discount).toBe(0.00);
            expect(res.deliveryFee).toBe(3.00); // 3 euros for 5km
            expect(res.surge).toBe(1.0);
            expect(res.total).toBe(28.00);
        });

        it('should process order with a promo code correctly', () => {
            const items = [{ name: "Pizza", price: 12.50, quantity: 2 }];
            // Mardi 15h
            const res = calculateOrderTotal(items, 5, 1, 'PERCENT20', 15, 'tuesday', mockPromoCodes);
            expect(res.subtotal).toBe(25.00);
            expect(res.discount).toBe(5.00); // 20% de 25 = 5
            expect(res.deliveryFee).toBe(3.00);
            expect(res.total).toBe(23.00); // 25 - 5 + 3
        });

        it('should apply surge properly only on delivery fee', () => {
            const items = [{ name: "Pizza", price: 12.50, quantity: 2 }];
            // Vendredi 20h -> surge 1.8. 5km 1kg -> 3.00 base delivery
            const res = calculateOrderTotal(items, 5, 1, null, 20, 'friday', mockPromoCodes);
            expect(res.subtotal).toBe(25.00);
            expect(res.deliveryFee).toBe(5.40); // 3 * 1.8 = 5.40
            expect(res.total).toBe(30.40); // 25 + 5.40
        });

        it('should throw an error for empty basket', () => {
            expect(() => calculateOrderTotal([], 5, 1, null, 15, 'tuesday', mockPromoCodes)).toThrow(/vide/);
        });

        it('should throw an error for negative item price', () => {
            const items = [{ name: "Bug", price: -5, quantity: 2 }];
            expect(() => calculateOrderTotal(items, 5, 1, null, 15, 'monday')).toThrow(/négatif/);
        });

        it('should throw an error if store is closed (23h)', () => {
             const items = [{ name: "Pizza", price: 10, quantity: 1 }];
             expect(() => calculateOrderTotal(items, 5, 1, null, 23, 'monday')).toThrow(/fermé/);
        });

        it('should throw an error if distance is out of zone (15km)', () => {
             const items = [{ name: "Pizza", price: 10, quantity: 1 }];
             expect(() => calculateOrderTotal(items, 15, 1, null, 15, 'monday')).toThrow(/zone/);
        });

    });

});
