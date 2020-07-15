const { Router } = require('express');
const DB = require('../models/myslq');
const router = Router();


router.get('/menu_registrado', (req, res) => {
    res.render('menu_usreg', { pagina: 'Registrado' });
});

router.get('/seleccionar_pd', async(req, res) => {
    const sql = "select id_prod, nombre_prod,descripcion,cantidad,precio_venta, imagen from producto";
    await DB.query(sql, (error, row, fields) => {
        if (!error) {
            res.render('seleccionar_pd', {
                pagina: 'Productos Chaide',
                datos: row
            });
        } else {
            res.send(error)
        }
    });
});

module.exports = router;