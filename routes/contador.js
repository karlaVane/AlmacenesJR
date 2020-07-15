const { Router } = require('express');
const DB = require('../models/myslq');
const router = Router();


router.get('/menu_contador', (req, res) => {
    res.render('menu_contador', { pagina: 'Contador' });
});


module.exports = router;