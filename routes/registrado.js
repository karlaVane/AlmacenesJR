const { Router } = require('express');
const DB = require('../models/myslq');
const { isLoggedIn, registrado } = require('../lib/auth');
const { encryptPassword } = require('../lib/helpers');
const dateFormat = require('dateformat');
const fs = require('fs-extra');
const router = Router();
const cloudinary = require('../lib/cloudinary'); //Inizializar la Cloud
const axios = require('axios')

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

router.get('/tarj_credito', isLoggedIn, registrado, async(req, res) => {
    var car = req.query;
    try {
        if (car.id_car) {
            console.log('Un solo Producto: id_car->', car.id_car);
            var producto = await DB.query('SELECT total_producto from cars WHERE user_id =' + req.user.id_usuario + ' and  id_car =' + car.id_car + ';');
            res.render('tarj_cred', {
                pagina: 'Tarjeta de crédito',
                id_car: car.id_car,
                precio: producto[0].total_producto
            });
        }
        if (car.ids_car) {
            console.log('Multiples productos: ids_car->', car.ids_car);
            var productos = await DB.query('SELECT total_producto from cars WHERE user_id =' + req.user.id_usuario + ' and  id_car in (' + car.ids_car + ');');
            var tot = 0;
            productos.forEach(element => {
                tot += element.total_producto;
            });
            console.log(tot);
            res.render('tarj_cred', {
                pagina: 'Tarjeta de crédito',
                ids_car: car.ids_car,
                precio: tot
            });
        }
    } catch (error) {
        console.log(error);
    }
});

router.post('/datos_tarj', isLoggedIn, registrado, async(req, res) => {
    var car = req.query;
    var { tipoT } = req.body;
    console.log('Veo el query ->', car);
    try {
        if (tipoT == 1) {
            const { numeroTarjC, fechaTarjC, codigoTarjC } = req.body;
            newpago = {
                num_tarjeta: numeroTarjC,
                fecha_exp: fechaTarjC,
                cod_seguridad: await encryptPassword(codigoTarjC),
                id_tipoPago: tipoT
            }
            console.log("pago credito", newpago);
            await DB.query('INSERT INTO pago_cobro SET ?', [newpago]);
            var resId = await DB.query('SELECT LAST_INSERT_ID();');
            var id_pago = Object.values(resId[0])
            console.log("id_pago", id_pago);
        }
        if (tipoT == 2) {
            const { numeroTarjD, fechaTarjD, codigoTarjD } = req.body;
            newpago = {
                num_tarjeta: numeroTarjD,
                fecha_exp: fechaTarjD,
                cod_seguridad: await encryptPassword(codigoTarjD),
                id_tipoPago: tipoT
            }
            console.log("Pago Debito", newpago);
            await DB.query('INSERT INTO pago_cobro SET ?', [newpago]);
            var resId = await DB.query('SELECT LAST_INSERT_ID();');
            var id_pago = Object.values(resId[0]);
            console.log("id_pago", id_pago);
        }
        if (car.id_car) {
            var producto = await DB.query('SELECT prod_id, cantidad, total_producto from cars where user_id = ' + req.user.id_usuario + ' and id_car = ' + car.id_car + ';');
            newdetalle = {
                cant_comp: producto[0].cantidad,
                total: producto[0].total_producto,
                id_usuario: req.user.id_usuario,
                id_prod: producto[0].prod_id
            }
            console.log("Detalle->", newdetalle);
            await DB.query('INSERT INTO detalle_compra SET ?', [newdetalle]);
            var detalleId = await DB.query('SELECT LAST_INSERT_ID();');
            var id_detalle = Object.values(detalleId[0]);
            console.log("id_detalle", id_detalle);
            var num_fac = await DB.query('SELECT num_factura from compra');
            var len = num_fac.length;
            console.log("tamaño num_factura", len);
            var today = new Date();
            var dd = String(today.getDate()).padStart(2, '0');
            var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
            var yyyy = today.getFullYear();
            today = yyyy + '/' + mm + '/' + dd;
            newcompra = {
                fecha: today,
                id_pago,
                id_detalle
            };
            if (len > 0) {
                var num_factura = num_fac[len - 1].num_factura + 1;
                newcompra.num_factura = num_factura;
                console.log("Compra->", newcompra);
            } else {
                newcompra.num_factura = 1;
                console.log("Compra->", newcompra);
            }
            DB.query('INSERT INTO compra SET ?', [newcompra]);
            var compraId = await DB.query('SELECT LAST_INSERT_ID();');
            var id_compra = Object.values(compraId[0]);
            await DB.query('DELETE FROM cars WHERE id_car = ?', [car.id_car]);
            res.redirect('/factura?id_compra=' + id_compra);
        }
        if (car.ids_car) {
            ids_detalle = [];
            var array_ids = car.ids_car.split(",").map(Number); ///cojo los números
            for (let i = 0; i < array_ids.length; i++) {
                var producto = await DB.query('SELECT prod_id, cantidad, total_producto from cars where user_id = ' + req.user.id_usuario + ' and id_car = ' + array_ids[i] + ';');
                newdetalle = {
                    cant_comp: producto[0].cantidad,
                    total: producto[0].total_producto,
                    id_usuario: req.user.id_usuario,
                    id_prod: producto[0].prod_id
                }
                await DB.query('INSERT INTO detalle_compra SET ?', [newdetalle]);
                var detalleId = await DB.query('SELECT LAST_INSERT_ID();');
                var id_detalle = Object.values(detalleId[0]);
                ids_detalle.push(id_detalle);
                console.log("Detalle->", newdetalle);
            }
            console.log("ids_detalle", ids_detalle);
            var num_fac = await DB.query('SELECT num_factura from compra');
            var len = num_fac.length;
            console.log("tamaño num_factura", len);
            var today = new Date();
            var dd = String(today.getDate()).padStart(2, '0');
            var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
            var yyyy = today.getFullYear();
            today = yyyy + '/' + mm + '/' + dd;
            newcompra = {
                fecha: today,
                id_pago,
            };
            if (len > 0) {
                var num_factura = num_fac[len - 1].num_factura + 1;
                newcompra.num_factura = num_factura;
                console.log("Compra->", newcompra);
            } else {
                newcompra.num_factura = 1;
                console.log("Compra->", newcompra);
            }
            var ids_compra = [];
            for (let i = 0; i < ids_detalle.length; i++) {
                newcompra.id_detalle = ids_detalle[i];
                await DB.query('INSERT INTO compra SET ?', [newcompra]);
                var compraId = await DB.query('SELECT LAST_INSERT_ID();');
                ids_compra.push(Object.values(compraId[0]));
            }
            await DB.query('DELETE FROM cars WHERE id_car in (' + car.ids_car + ');');
            res.redirect('/factura?ids_compra=' + ids_compra);
        }
    } catch (error) {
        console.error(error);
    }
});

router.get('/factura', isLoggedIn, registrado, async(req, res) => {
    var compra = req.query;
    if (compra.id_compra) {
        console.log(compra.id_compra);
        var consulta = await DB.query('SELECT compra.num_factura, usuario.nombre, usuario.cedula, usuario.correo, usuario.direccion, producto.nombre_prod,' +
            'detalle_compra.cant_comp, detalle_compra.total, tipo_pago.tarjeta  FROM usuario, compra, detalle_compra, pago_cobro, producto, tipo_pago ' +
            'WHERE compra.id_detalle = detalle_compra.id_detalle ' +
            'and compra.id_pago = pago_cobro.id_pago ' +
            'and detalle_compra.id_usuario = usuario.id_usuario ' +
            'and detalle_compra.id_prod =  producto.id_prod ' +
            'and pago_cobro.id_tipoPago = tipo_pago.id_tipoPago ' +
            'and compra.id_compra = ' + compra.id_compra +
            ' and detalle_compra.id_usuario = ' + req.user.id_usuario + ';');
        res.render('datos_facturacion', { pagina: 'Datos factura', factura: consulta[0] });
    }
    if (compra.ids_compra) {
        var compras = [];
        console.log(compra.ids_compra);
        var array_ids = compra.ids_compra.split(',').map(Number);
        for (let i = 0; i < array_ids.length; i++) {
            var consulta = await DB.query('SELECT compra.num_factura, usuario.nombre, usuario.cedula, usuario.correo, usuario.direccion, producto.nombre_prod,' +
                'detalle_compra.cant_comp, detalle_compra.total, tipo_pago.tarjeta  FROM usuario, compra, detalle_compra, pago_cobro, producto, tipo_pago ' +
                'WHERE compra.id_detalle = detalle_compra.id_detalle ' +
                'and compra.id_pago = pago_cobro.id_pago ' +
                'and detalle_compra.id_usuario = usuario.id_usuario ' +
                'and detalle_compra.id_prod =  producto.id_prod ' +
                'and pago_cobro.id_tipoPago = tipo_pago.id_tipoPago ' +
                'and compra.id_compra = ' + array_ids[i] +
                ' and detalle_compra.id_usuario = ' + req.user.id_usuario + ';');
            compras.push(consulta[0])
        }
        res.render('datos_facturacion', { pagina: 'Datos factura', facturas: compras });
    }
});
//revisar
router.get('/facturas', isLoggedIn, registrado, async(req, res) => {
    var facturas = [];
    var consulta = await DB.query('SELECT compra.num_factura, compra.fecha, usuario.nombre, usuario.cedula, usuario.correo, usuario.direccion, producto.nombre_prod,' +
        'detalle_compra.cant_comp, detalle_compra.total, tipo_pago.tarjeta  FROM usuario, compra, detalle_compra, pago_cobro, producto, tipo_pago ' +
        'WHERE compra.id_detalle = detalle_compra.id_detalle ' +
        'and compra.id_pago = pago_cobro.id_pago ' +
        'and detalle_compra.id_usuario = usuario.id_usuario ' +
        'and detalle_compra.id_prod =  producto.id_prod ' +
        'and pago_cobro.id_tipoPago = tipo_pago.id_tipoPago ' +
        'and detalle_compra.id_usuario = ' + req.user.id_usuario + ';');
    if (consulta.length > 0) {
        for (let i = 0; i < consulta.length; i++) {
            if (!facturas.includes(consulta[i].num_factura)) {
                facturas.push(consulta[i].num_factura)
            }
        }
        facturas.sort();
        //console.log(facturas);
        consulta.forEach(consulta => {
            consulta.fecha = dateFormat(consulta.fecha, "yyyy-mm-dd")
        });
        res.render('selec_facturas_us', { facturas: facturas, consulta: consulta, pagina: 'Mis facturas' })
        console.log(facturas);
    } else {
        req.flash('mensaje', 'No tiene Facturas');
        res.render('selec_facturas_us', { pagina: 'Facturas' })
    }
});
//revisar
router.get('/consultar_f', isLoggedIn, registrado, async(req, res) => {
    var id_fac = req.query.id_factura;
    console.log(id_fac);
    var fac = [];
    var compras = await DB.query('SELECT id_compra from compra where num_factura = ' + id_fac + ';');
    for (let i = 0; i < compras.length; i++) {
        var consulta = await DB.query('SELECT compra.num_factura, compra.fecha, usuario.nombre, usuario.cedula, usuario.correo, usuario.direccion,usuario.telefono, producto.nombre_prod,' +
            'detalle_compra.cant_comp, detalle_compra.total, tipo_pago.tarjeta  FROM usuario, compra, detalle_compra, pago_cobro, producto, tipo_pago ' +
            'WHERE compra.id_detalle = detalle_compra.id_detalle ' +
            'and compra.id_pago = pago_cobro.id_pago ' +
            'and detalle_compra.id_usuario = usuario.id_usuario ' +
            'and detalle_compra.id_prod =  producto.id_prod ' +
            'and pago_cobro.id_tipoPago = tipo_pago.id_tipoPago ' +
            'and compra.id_compra = ' + compras[i].id_compra +
            ' and detalle_compra.id_usuario = ' + req.user.id_usuario + ';');
        fac.push(consulta[0]);
    }
    var sum_total = 0
    fac.forEach(fac => {
        sum_total = sum_total + fac.total
        fac.fecha = dateFormat(fac.fecha, "yyyy-mm-dd")
    });

    var numfac = consulta[0].num_factura
    var fecha = consulta[0].fecha
    var nombre = consulta[0].nombre
    var cedula = consulta[0].cedula
    var direccion = consulta[0].direccion
    var telef = consulta[0].telefono
    var subtotal = (sum_total / 1.12).toFixed(2)
    var iva = ((subtotal * 12) / 100).toFixed(2)
    console.log(fac);
    res.render('facturas_us', {
        fac: fac,
        fecha: fecha,
        nombre: nombre,
        cedula: cedula,
        direccion: direccion,
        telef: telef,
        sum_total: sum_total,
        numfac: numfac,
        subtotal: subtotal,
        iva: iva,
        pagina: 'Mis facturas'
    });
});

router.get('/consultar_img', isLoggedIn, registrado, (req, res) => {
    res.render('consprod_img', { pagina: 'Consultar imagen' })
});

router.post('/consultar_img', isLoggedIn, registrado, async(req, res) => {
    var resultIMG = await cloudinary.v2.uploader.upload(req.file.path);
    fs.unlink(req.file.path);
    var clasi = await axios.get(`http://127.0.0.1:5000/clasificador?img=${resultIMG.url}`);
    console.log(clasi.data);
    await cloudinary.v2.uploader.destroy(resultIMG.public_id);
    var respuesta = await DB.query('select * from producto, categoria where categoria.id_categoria = producto.id_categoria and  producto.id_categoria = ' + clasi.data + ';');
    var categ
    if (respuesta.length > 0) {
        categ = respuesta[0].categoria;
    } else {
        cat = await DB.query('select * from categoria where id_categoria = ' + clasi.data + ';');
        categ = cat[0].categoria;
    }
    res.render('mostrar_prod_clasif', { data: respuesta, categ: categ, pagina: 'Productos' });
});

module.exports = router;