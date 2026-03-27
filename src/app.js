const express = require('express');
const app = express();

app.use(express.json());

// Tu définiras tes futures routes ici
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

// IMPORTANT : On exporte l'app sans démarrer le port !
module.exports = app;
