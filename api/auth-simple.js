const express = require('express');
const router = express.Router();

// Rota de teste simples
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: '✅ Rota de auth funcionando!',
        timestamp: new Date().toISOString(),
        test: 'auth simple test'
    });
});

// Rota de registro
router.post('/register', (req, res) => {
    res.json({
        success: true,
        message: 'Rota de registro funcionando!'
    });
});

// Rota de login
router.post('/login', (req, res) => {
    res.json({
        success: true,
        message: 'Rota de login funcionando!'
    });
});

module.exports = router;
