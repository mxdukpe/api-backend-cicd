const request = require('supertest');
const app = require('../src/app');

describe('API Integration Tests', () => {

    beforeEach(async () => {
        // On vide la mémoire des commandes avant chaque test
        await request(app).delete('/orders');
    });

    describe('POST /orders/simulate', () => {
        it('should simulate normal order successfully', async () => {
            const res = await request(app).post('/orders/simulate').send({
                items: [{ name: "Pizza", price: 10, quantity: 2 }],
                distance: 5, weight: 1, promoCode: null,
                hour: 15, dayOfWeek: 'tuesday'
            });
            expect(res.status).toBe(200);
            expect(res.body.total).toBe(23.00); // 20 + 3
        });

        it('should simulate order with promo correctly', async () => {
            const res = await request(app).post('/orders/simulate').send({
                items: [{ name: "Pizza", price: 10, quantity: 2 }],
                distance: 5, weight: 1, promoCode: 'BIENVENUE20',
                hour: 15, dayOfWeek: 'tuesday'
            });
            expect(res.status).toBe(200);
            expect(res.body.total).toBe(19.00); // (20 * 0.8) + 3 = 16 + 3
        });

        it('should return 400 for expired promo', async () => {
            const res = await request(app).post('/orders/simulate').send({
                items: [{ name: "Pizza", price: 10, quantity: 2 }],
                distance: 5, weight: 1, promoCode: 'EXPIRED10',
                hour: 15, dayOfWeek: 'tuesday'
            });
            expect(res.status).toBe(400);
        });

        it('should return 400 for empty basket', async () => {
            const res = await request(app).post('/orders/simulate').send({ items: [] });
            expect(res.status).toBe(400);
        });

        it('should return 400 for out of zone (> 10km)', async () => {
            const res = await request(app).post('/orders/simulate').send({
                items: [{ name: "Pizza", price: 10, quantity: 2 }], distance: 15
            });
            expect(res.status).toBe(400);
        });

        it('should return 400 when closed (23h)', async () => {
            const res = await request(app).post('/orders/simulate').send({
                items: [{ name: "Pizza", price: 10, quantity: 2 }], distance: 5, hour: 23, dayOfWeek: 'tuesday'
            });
            expect(res.status).toBe(400);
        });

        it('should apply surge properly (Friday 20h)', async () => {
            const res = await request(app).post('/orders/simulate').send({
                items: [{ name: "Pizza", price: 10, quantity: 2 }],
                distance: 5, weight: 1, hour: 20, dayOfWeek: 'friday'
            });
            // 20 + (3 * 1.8) = 20 + 5.4 = 25.4
            expect(res.status).toBe(200);
            expect(res.body.total).toBe(25.40);
        });
    });

    describe('POST /orders and GET /orders/:id', () => {
        it('should create an order successfully', async () => {
            const res = await request(app).post('/orders').send({
                items: [{ name: "Pizza", price: 10, quantity: 2 }],
                distance: 5, weight: 1, hour: 15, dayOfWeek: 'tuesday'
            });
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('id');
            expect(res.body.priceDetails.total).toBe(23.00);
        });

        it('should retrieve an order by ID', async () => {
            const createRes = await request(app).post('/orders').send({
                items: [{ name: "Burger", price: 15, quantity: 1 }],
                distance: 2, weight: 1, hour: 15, dayOfWeek: 'thursday'
            });
            const id = createRes.body.id;

            const getRes = await request(app).get(`/orders/${id}`);
            expect(getRes.status).toBe(200);
            expect(getRes.body.id).toBe(id);
        });

        it('should create separate orders with different IDs', async () => {
            const payload = { items: [{ name: "Burger", price: 15, quantity: 1 }], distance: 2, weight: 1, hour: 15, dayOfWeek: 'thursday' };
            const r1 = await request(app).post('/orders').send(payload);
            const r2 = await request(app).post('/orders').send(payload);
            expect(r1.body.id).not.toBe(r2.body.id);
        });

        it('should not register an invalid order', async () => {
            const res = await request(app).post('/orders').send({ items: [] });
            expect(res.status).toBe(400);
        });

        it('should return 404 for unknown order ID', async () => {
            const res = await request(app).get('/orders/bogus-id');
            expect(res.status).toBe(404);
        });
    });

    describe('POST /promo/validate', () => {
        it('should validate a good code', async () => {
            const res = await request(app).post('/promo/validate').send({ promoCode: 'BIENVENUE20', subtotal: 20 });
            expect(res.status).toBe(200);
            expect(res.body.valid).toBe(true);
            expect(res.body.newSubtotal).toBe(16.00);
        });

        it('should reject expired code with 400', async () => {
            const res = await request(app).post('/promo/validate').send({ promoCode: 'EXPIRED10', subtotal: 20 });
            expect(res.status).toBe(400);
            expect(res.body.valid).toBe(false);
            expect(res.body.error).toMatch(/expiré/i);
        });

        it('should reject missing code with 400', async () => {
            const res = await request(app).post('/promo/validate').send({ subtotal: 20 });
            expect(res.status).toBe(400);
        });

        it('should reject unknown code with 404', async () => {
             const res = await request(app).post('/promo/validate').send({ promoCode: 'FAKE', subtotal: 20 });
             expect(res.status).toBe(404);
        });

        it('should reject code if under minimum order', async () => {
            const res = await request(app).post('/promo/validate').send({ promoCode: 'BIENVENUE20', subtotal: 10 });
            expect(res.status).toBe(400);
            expect(res.body.error).toMatch(/minimum/i);
        });
    });

});
