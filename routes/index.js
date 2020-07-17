const { Router } = require('express');
const DB = require('../models/myslq');
const router = Router();

///PAGINA PRINCIPAL
router.get('/', async(req, res) => { // petición get
    var id = req.query.id || 1;
    const sql = "SELECT * FROM producto where id_categoria =";
    await DB.query(sql + id, (error, row, fields) => {
        if (!error) {
            res.render('pag_principal', { pagina: 'Almacenes JR', datos: row, colchon: 1, almohada: 2, sofa: 3, complementos: 4 });
        } else {
            res.send(error)
        }
    });
});

module.exports = router;