const { Router } = require('express');
const DB = require('../models/myslq');
const { isLoggedIn, registrado } = require('../lib/auth');

const router = Router();

router.get('/carrito', isLoggedIn, registrado, async(req, res) => {
    const carrito = await DB.query('SELECT nombre_prod, producto.cantidad, imagen, precio_venta, id_car, cars.cantidad as cant_car from producto, cars WHERE producto.id_prod = cars.prod_id and cars.user_id =' + req.user.id_usuario);
    var total = 0;
    var carIds = [];
    if (carrito.length > 0) {
        for (let i = 0; i < carrito.length; i++) {
            var mul = (carrito[i].precio_venta * carrito[i].cant_car);
            total += mul;
            carIds.push(carrito[i].id_car);
            carrito[i].precio_venta = carrito[i].precio_venta * carrito[i].cant_car;

        };
    }
    res.render('carrito', { pagina: 'Carrito', carrito, total, carIds });
});

router.get('/delete/:id', isLoggedIn, registrado, async(req, res) => {
    const { id } = req.params;
    await DB.query('DELETE FROM cars WHERE id_car = ?', [id]);
    req.flash('exito', 'Producto Removido del Carrito Correctamente');
    res.redirect('/carrito');
});

router.post('/cardata', isLoggedIn, registrado, async(req, res) => {
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
        //console.log("cantidad -> ", cant[i], " Id_carrito", array_ids[i], "Precios -> ", precios[i], "Total", (cant[i] * precios[i]));
        await DB.query('UPDATE cars SET cantidad =' + cant[i] + ', total_producto =' + cant[i] * precios[i] + ' WHERE id_car =' + array_ids[i] + ';');
    }
    res.redirect('/tarj_credito?ids_car=' + array_ids);
});

router.get('/p_individual', isLoggedIn, registrado, async(req, res) => {
    const { id_car, cant, precio } = req.query;
    try {
        await DB.query('UPDATE cars SET cantidad =' + cant + ', total_producto =' + precio + ' WHERE id_car =' + id_car + ';', (error) => {
            if (!error) {
                res.redirect('/tarj_credito?id_car=' + id_car);
            } else {
                res.send(error);
            }
        });
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;