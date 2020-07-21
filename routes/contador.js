const { Router } = require('express');
const DB = require('../models/myslq');
const router = Router();
const { isLoggedIn, contador } = require('../lib/auth');

router.get('/menu_contador', isLoggedIn, contador, (req, res) => {
    res.render('menu_contador', { pagina: 'Contador' });
});

router.get('/allfact', isLoggedIn, contador, async(req, res) => {
    var compras = await DB.query('SELECT * from compra');
    console.log(compras);
    if (compras.length > 0) {
        res.render('facturas_contador', { compras });
    } else {
        req.flash('mensaje', 'No hay facturas en el sistema');
        res.render('facturas_contador', { compras });
    }
});

module.exports = router;