const { Router } = require('express');
const DB = require('../models/myslq');
const router = Router();
const { isLoggedIn, contador } = require('../lib/auth');

router.get('/menu_contador', isLoggedIn, contador, (req, res) => {
    res.render('menu_contador', { pagina: 'Contador' });
});


module.exports = router;