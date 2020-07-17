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

router.get('/carrito', isLoggedIn, registrado, async(req, res) => {
    const carrito = await DB.query('SELECT nombre_prod, producto.cantidad, imagen, precio_venta, id_car, cars.cantidad as cant_car from producto, cars WHERE producto.id_prod = cars.prod_id and cars.user_id =' + req.user.id_usuario);
    var total = 0;
    var carIds = [];
    console.log(carrito);
    if (carrito.length > 0) {
        carrito.forEach(element => {
            //var mul = element.precio_venta * element.cantidad
            total += element.precio_venta
            carIds.push(element.id_car)
        });
    }
    res.render('carrito', { pagina: 'Carrito', carrito, total, carIds });
});

router.get('/delete/:id', isLoggedIn, registrado, async(req, res) => {
    const { id } = req.params;
    await DB.query('DELETE FROM cars WHERE id_car = ?', [id]);
    req.flash('exito', 'Producto Removido del Carrito Correctamente');
    res.redirect('/carrito');
});

router.post('/cardata', async(req, res) => {
    var ids = req.query.ids;
    var array_ids = ids.split(",").map(Number); //Cojo los datos separados por comas y .map(coge directamente el numero)
    var precios = [];
    for (let i = 0; i < array_ids.length; i++) {
        var le = await DB.query('SELECT precio_venta from producto, cars WHERE producto.id_prod = cars.prod_id and cars.user_id = ' + req.user.id_usuario + ' and cars.id_car = ' + array_ids[i] + ';');
        precios.push(await le[0].precio_venta)
    }
    var cant = req.body;
    cant = Object.values(cant);
    for (var i = 0; i < cant.length; i++) {
        console.log("cantidad -> ", cant[i], " Id_carrito", array_ids[i], "Precios -> ", precios[i], "Total", (cant[i] * precios[i]));
        await DB.query('UPDATE cars SET cantidad =' + cant[i] + ', total_producto =' + cant[i] * precios[i] + ' WHERE id_car =' + array_ids[i] + ';');
    }
    res.send("xD");
});

module.exports = router;