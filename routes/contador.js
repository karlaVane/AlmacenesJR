const { Router } = require('express');
const DB = require('../models/myslq');
const router = Router();
const { isLoggedIn, contador } = require('../lib/auth');
const dateFormat = require('dateformat');
const axios = require('axios');

router.get('/menu_contador', isLoggedIn, contador, (req, res) => {
    res.render('menu_contador', { pagina: 'Contador' });
});

router.get('/allfact', isLoggedIn, contador, async(req, res) => {
    var compras = await DB.query('Select fecha, num_factura, nombre, cedula,nombre_prod, cant_comp, total,tarjeta ' +
        'from compra, usuario, producto, detalle_compra,pago_cobro,tipo_pago ' +
        'where detalle_compra.id_usuario = usuario.id_usuario ' +
        'and detalle_compra.id_prod = producto.id_prod ' +
        'and detalle_compra.id_detalle = compra.id_detalle ' +
        'and compra.id_pago = pago_cobro.id_pago ' +
        'and pago_cobro.id_tipoPago = tipo_pago.id_tipoPago');

    console.log(compras);
    compras.forEach(compras => {
        compras.fecha = dateFormat(compras.fecha, "yyyy-mm-dd")
    });

    if (compras.length > 0) {
        res.render('facturas_contador', { pagina: 'Facturas', compras: compras });
    } else {
        req.flash('mensaje', 'No hay facturas en el sistema');
        res.render('facturas_contador', { pagina: 'Facturas', compras: compras });
    }
});

router.post('/fact_x_categ', isLoggedIn, contador, async(req, res) => {
    var fact_categ = req.body.fact_categ
    var sql;
    if (fact_categ == '5') {
        sql = 'Select fecha, num_factura, nombre, cedula,nombre_prod, cant_comp, total,tarjeta ' +
            'from compra, usuario, producto, detalle_compra,pago_cobro,tipo_pago ' +
            'where detalle_compra.id_usuario = usuario.id_usuario ' +
            'and detalle_compra.id_prod = producto.id_prod ' +
            'and detalle_compra.id_detalle = compra.id_detalle ' +
            'and compra.id_pago = pago_cobro.id_pago ' +
            'and pago_cobro.id_tipoPago = tipo_pago.id_tipoPago';
    } else {
        sql = 'Select fecha, num_factura, nombre, cedula,nombre_prod, cant_comp, total,tarjeta ' +
            'from compra, usuario, producto, detalle_compra,pago_cobro,tipo_pago ' +
            'where detalle_compra.id_usuario = usuario.id_usuario ' +
            'and detalle_compra.id_prod = producto.id_prod ' +
            'and detalle_compra.id_detalle = compra.id_detalle ' +
            'and compra.id_pago = pago_cobro.id_pago ' +
            'and pago_cobro.id_tipoPago = tipo_pago.id_tipoPago ' +
            'and producto.id_categoria =' + fact_categ;
    }
    await DB.query(sql, (error, row, fields) => {
        row.forEach(row => {
            row.fecha = dateFormat(row.fecha, "yyyy-mm-dd")
        });
        if (!error) {
            res.render("facturas_contador", { pagina: 'Factura', compras: row });
        } else {
            res.send(error);
        }
    });
});

router.post('/fact_x_cedula', isLoggedIn, contador, async(req, res) => {
    var fact_ced = req.body.fact_ced
    var sql;

    sql = 'Select fecha, num_factura, nombre, cedula,nombre_prod, cant_comp, total,tarjeta ' +
        'from compra, usuario, producto, detalle_compra,pago_cobro,tipo_pago ' +
        'where detalle_compra.id_usuario = usuario.id_usuario ' +
        'and detalle_compra.id_prod = producto.id_prod ' +
        'and detalle_compra.id_detalle = compra.id_detalle ' +
        'and compra.id_pago = pago_cobro.id_pago ' +
        'and pago_cobro.id_tipoPago = tipo_pago.id_tipoPago ' +
        'and usuario.cedula = ' + fact_ced;

    await DB.query(sql, (error, row, fields) => {
        row.forEach(row => {
            row.fecha = dateFormat(row.fecha, "yyyy-mm-dd")
        });
        if (!error) {
            res.render("facturas_contador", { pagina: 'Factura', compras: row });
        } else {
            res.send(error);
        }
    });
});

router.get('/prediccion', isLoggedIn, contador, async(req, res) => {
    var pred = await axios.get('http://127.0.0.1:5000/predicciones');
    newpred = [];
    //var img = await axios.get('http://127.0.0.1:5000/plot.png'); //consigo los bytes
    var img = "http://127.0.0.1:5000/plot.png";
    console.log(pred.data.length);
    for (let i = 0; i < pred.data.length; i++) {
        if (i == 0) {
            newpred.push({
                mes: "Enero",
                pred: pred.data[i]
            });
        }
        if (i == 1) {
            newpred.push({
                mes: "Febrero",
                pred: pred.data[i]
            });
        }

        if (i == 2) {
            newpred.push({
                mes: "Marzo",
                pred: pred.data[i]
            });
        }
        if (i == 3) {
            newpred.push({
                mes: "Abril",
                pred: pred.data[i]
            });
        }
        if (i == 4) {
            newpred.push({
                mes: "Mayo",
                pred: pred.data[i]
            });
        }
        if (i == 5) {
            newpred.push({
                mes: "Junio",
                pred: pred.data[i]
            });
        }
        if (i == 6) {
            newpred.push({
                mes: "Julio",
                pred: pred.data[i]
            });
        }
        if (i == 7) {
            newpred.push({
                mes: "Agosto",
                pred: pred.data[i]
            });
        }
        if (i == 8) {
            newpred.push({
                mes: "Septiembre",
                pred: pred.data[i]
            });
        }
        if (i == 9) {
            newpred.push({
                mes: "Octubre",
                pred: pred.data[i]
            });
        }
        if (i == 10) {
            newpred.push({
                mes: "Noviembre",
                pred: pred.data[i]
            });
        }
        if (i == 11) {
            newpred.push({
                mes: "Diciembre",
                pred: pred.data[i],
            });
        }
    }
    res.render('estimaciones', { predic: newpred, img })
});

module.exports = router;