const { Router } = require('express');
const DB = require('../models/myslq');
const router = Router();

//CARRITO DE COMPRAS
router.get('/datos_facturacion', (req, res) => {
    res.render('datos_facturacion', {
        pagina: 'Datos factura',
    });
});

router.get('/tarj_credito', (req, res) => {
    res.render('tarj_cred', {
        pagina: 'Tarjeta de crédito',
    });
});

module.exports = router;