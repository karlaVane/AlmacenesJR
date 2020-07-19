const { Router } = require('express');
const DB = require('../models/myslq');
const { isLoggedIn, registrado } = require('../lib/auth');

const router = Router();


router.get('/menu_registrado', isLoggedIn, registrado, (req, res) => {
    res.render('menu_usreg', { pagina: 'Registrado' });
});

router.get('/seleccionar_pd', isLoggedIn, registrado, async(req, res) => {
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

router.post('/prodCarrito', isLoggedIn, registrado, async(req, res) => {
    var selecionados = req.body //objeto
    var prod = Object.values(selecionados)
    var newcar = {
        user_id: req.user.id_usuario,
        cantidad: 1
    };
    if (prod.length > 0) {
        await DB.query('SELECT * FROM producto WHERE id_prod IN (' + prod + ');', (error, row, fields) => {
            if (!error) {
                row.forEach(async producto => {
                    newcar.prod_id = producto.id_prod;
                    newcar.total_producto = producto.precio_venta;
                    await DB.query('INSERT INTO cars SET ?', [newcar]);
                });
                res.redirect('/carrito');
            } else
                res.send(error);
        });

    } else {
        req.flash('mensaje', 'No a seleccionado ningun producto');
        res.redirect('/seleccionar_pd');
    }
});

router.get('/comprar', async(req, res) => {
    console.log(req.query);
    const { id_car, cant, precio } = req.query;
    var producto = await DB.query('SELECT id_prod from producto, cars where producto.id_prod = cars.prod_id and cars.user_id = ' + req.user.id_usuario + ' and cars.id_car = ' + id_car + ';')
    newcompra = {
        cant_comp: cant,
        total: precio,
        id_usuario: req.user.id_usuario,
        id_prod: producto[0].id_prod
    }
    console.log(newcompra);
    //DB.query('')
    res.send('Ok')
});

router.get('/comprarv2', (req, res) => {
    console.log(req.query);
    res.send('Ok')
});


router.get('/tarj_credito', isLoggedIn, registrado, (req, res) => {
    res.render('tarj_cred', {
        pagina: 'Tarjeta de crédito',
    });
});


router.get('/datos_facturacion', isLoggedIn, registrado, (req, res) => {
    res.render('datos_facturacion', {
        pagina: 'Datos factura',
    });
});

module.exports = router;