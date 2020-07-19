const { Router } = require('express');
const DB = require('../models/myslq');
const { isLoggedIn, registrado } = require('../lib/auth');

const router = Router();

router.get('/carrito', isLoggedIn, registrado, async(req, res) => {
    const carrito = await DB.query('SELECT nombre_prod, producto.cantidad, imagen, precio_venta, id_car, cars.cantidad as cant_car from producto, cars WHERE producto.id_prod = cars.prod_id and cars.user_id =' + req.user.id_usuario);
    var total = 0;
    var carIds = [];
    if (carrito.length > 0) {
        carrito.forEach(element => {
            var mul = (element.precio_venta * element.cant_car);
            total += mul;
            carIds.push(element.id_car);
            element.precio_venta = element.precio_venta * element.cant_car;
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
        console.log("cantidad -> ", cant[i], " Id_carrito", array_ids[i], "Precios -> ", precios[i], "Total", (cant[i] * precios[i]));
        await DB.query('UPDATE cars SET cantidad =' + cant[i] + ', total_producto =' + cant[i] * precios[i] + ' WHERE id_car =' + array_ids[i] + ';');
    }
    res.redirect('/comprarv2');
});


module.exports = router;