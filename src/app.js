const express = require('express');
const app = express();

app.use(express.json());

// Tu définiras tes futures routes ici
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

const { calculateOrderTotal, applyPromoCode } = require('./pricing');

// Base de code promo en mémoire pour l'API
const mockPromoCodes = [
    { code: 'BIENVENUE20', type: 'percentage', value: 20, minOrder: 15.00, expiresAt: '2099-12-31' },
    { code: 'EXPIRED10', type: 'fixed', value: 5, minOrder: 0.00, expiresAt: '2020-01-01' }
];

let orders = [];

// Permet de reset la BDD en mémoire entre chaque test
app.delete('/orders', (req, res) => {
    orders = [];
    res.status(204).send();
});

app.post('/orders/simulate', (req, res) => {
    try {
        const { items, distance, weight, promoCode, hour, dayOfWeek } = req.body;
        const result = calculateOrderTotal(items, distance, weight, promoCode, hour, dayOfWeek, mockPromoCodes);
        res.status(200).json(result);
    } catch (e) {
        // En cas d'erreur (heure fermée, vide, hors limite), on renvoie 400
        res.status(400).json({ error: e.message });
    }
});

app.post('/orders', (req, res) => {
    try {
        const { items, distance, weight, promoCode, hour, dayOfWeek } = req.body;
        const result = calculateOrderTotal(items, distance, weight, promoCode, hour, dayOfWeek, mockPromoCodes);
        const order = {
            id: Math.random().toString(36).substr(2, 9),
            priceDetails: result,
            items, distance, weight, promoCode, hour, dayOfWeek
        };
        orders.push(order);
        res.status(201).json(order);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

app.get('/orders/:id', (req, res) => {
    const order = orders.find(o => o.id === req.params.id);
    if (!order) return res.status(404).json({ error: "Commande introuvable" });
    res.status(200).json(order);
});

app.post('/promo/validate', (req, res) => {
    try {
        const { promoCode, subtotal } = req.body;
        if (!promoCode) return res.status(400).json({ error: "Code manquant" });

        const promo = mockPromoCodes.find(p => p.code === promoCode);
        if (!promo) return res.status(404).json({ error: "Code inconnu" });

        const newSubtotal = applyPromoCode(subtotal, promoCode, mockPromoCodes);
        res.status(200).json({ valid: true, newSubtotal });
    } catch (e) {
        res.status(400).json({ valid: false, error: e.message });
    }
});

// IMPORTANT : On exporte l'app sans démarrer le port !
module.exports = app;
