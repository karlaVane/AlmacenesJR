const { Router } = require('express');
const DB = require('../models/myslq');
const router = Router();
const { isLoggedIn, contador } = require('../lib/auth');
const dateFormat = require('dateformat');
const axios = require('axios');
var dateTime = require('node-datetime');

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
    var sql;
    sql = 'Select fecha, sum(total) as total from compra, detalle_compra ' +
        'where compra.id_detalle = detalle_compra.id_detalle ' +
        "and compra.fecha > '2019-12-31' " +
        "group by month(compra.fecha) " +
        "order by (compra.fecha) "

    var pred = await axios.get('http://127.0.0.1:5000/predicciones');
    newpred = [];
    var img = "http://127.0.0.1:5000/plot.png";

    var consulta_real = await DB.query(sql)
    for (let i = 0; i < pred.data.length; i++) {
        var real;
        if (i == 0) {
            if (consulta_real[i] === undefined) {
                real = 0
            } else {
                real = consulta_real[i].total
            }
            newpred.push({
                mes: "Enero",
                pred: parseFloat(pred.data[i]).toFixed(2),
                act: parseFloat(real).toFixed(2)
            });
        }

        if (i == 1) {
            if (consulta_real[i] === undefined) {
                real = 0
            } else {
                real = consulta_real[i].total
            }
            newpred.push({
                mes: "Febrero",
                pred: parseFloat(pred.data[i]).toFixed(2),
                act: parseFloat(real).toFixed(2)
            });
        }

        if (i == 2) {
            if (consulta_real[i] === undefined) {
                real = 0
            } else {
                real = consulta_real[i].total
            }
            newpred.push({
                mes: "Marzo",
                pred: parseFloat(pred.data[i]).toFixed(2),
                act: parseFloat(real).toFixed(2)
            });
        }
        if (i == 3) {
            if (consulta_real[i] === undefined) {
                real = 0
            } else {
                real = consulta_real[i].total
            }
            newpred.push({
                mes: "Abril",
                pred: parseFloat(pred.data[i]).toFixed(2),
                act: parseFloat(real).toFixed(2)
            });
        }
        if (i == 4) {
            if (consulta_real[i] === undefined) {
                real = 0
            } else {
                real = consulta_real[i].total
            }
            newpred.push({
                mes: "Mayo",
                pred: parseFloat(pred.data[i]).toFixed(2),
                act: parseFloat(real).toFixed(2)
            });
        }
        if (i == 5) {
            if (consulta_real[i] === undefined) {
                real = 0
            } else {
                real = consulta_real[i].total
            }
            newpred.push({
                mes: "Junio",
                pred: parseFloat(pred.data[i]).toFixed(2),
                act: parseFloat(real).toFixed(2)
            });
        }
        if (i == 6) {
            if (consulta_real[i] === undefined) {
                real = 0
            } else {
                real = consulta_real[i].total
            }
            newpred.push({
                mes: "Julio",
                pred: parseFloat(pred.data[i]).toFixed(2),
                act: parseFloat(real).toFixed(2)
            });
        }
        if (i == 7) {
            if (consulta_real[i] === undefined) {
                real = 0
            } else {
                real = consulta_real[i].total
            }
            newpred.push({
                mes: "Agosto",
                pred: parseFloat(pred.data[i]).toFixed(2),
                act: parseFloat(real).toFixed(2)
            });
        }
        if (i == 8) {
            if (consulta_real[i] === undefined) {
                real = 0
            } else {
                real = consulta_real[i].total
            }
            newpred.push({
                mes: "Septiembre",
                pred: parseFloat(pred.data[i]).toFixed(2),
                act: parseFloat(real).toFixed(2)
            });
        }
        if (i == 9) {
            if (consulta_real[i] === undefined) {
                real = 0
            } else {
                real = consulta_real[i].total
            }
            newpred.push({
                mes: "Octubre",
                pred: parseFloat(pred.data[i]).toFixed(2),
                act: parseFloat(real).toFixed(2)
            });
        }
        if (i == 10) {
            if (consulta_real[i] === undefined) {
                real = 0
            } else {
                real = consulta_real[i].total
            }
            newpred.push({
                mes: "Noviembre",
                pred: parseFloat(pred.data[i]).toFixed(2),
                act: parseFloat(real).toFixed(2)
            });
        }
        if (i == 11) {
            if (consulta_real[i] === undefined) {
                real = 0
            } else {
                real = consulta_real[i].total
            }
            newpred.push({
                mes: "Diciembre",
                pred: parseFloat(pred.data[i]).toFixed(2),
                act: parseFloat(real).toFixed(2)
            });
        }
    }
    res.render('estimaciones', { predic: newpred, img: img, pagina: 'Predicciones' })
});

router.get('/prod_mas_vendido', isLoggedIn, contador, (req, res) => {
    var dt = dateTime.create();
    var formatted = dt.format('Y-m-d');
    res.render('prod_mas_vendido', {
        pagina: 'Producto',
        fecha_act: formatted
    });
});
router.post('/prod_mas_vendido', isLoggedIn, contador, async(req, res) => {
    var desde = req.body.fecha_desde
    var hasta = req.body.fecha_hasta
    const sql = "select * from " +
        "(Select detalle_compra.id_prod,nombre_prod,imagen,sum(cant_comp) as cantidad,sum(total) as total " +
        "from  detalle_compra, compra,producto " +
        "where compra.id_detalle = detalle_compra.id_detalle " +
        "and detalle_compra.id_prod = producto.id_prod " +
        "and fecha >'" + desde + "' " +
        "and fecha <'" + hasta + "' " +
        "group by detalle_compra.id_prod " +
        ")C where cantidad = " +
        "(select max(cantidad) from(" +
        "Select detalle_compra.id_prod,nombre_prod,imagen,sum(cant_comp) as cantidad,sum(total) as total " +
        "from detalle_compra, compra,producto " +
        "where compra.id_detalle = detalle_compra.id_detalle " +
        "and detalle_compra.id_prod = producto.id_prod " +
        "and fecha >'" + desde + "' " +
        "and fecha <'" + hasta + "' " +
        "group by detalle_compra.id_prod " +
        ")A)"

    await DB.query(sql, (error, row, fields) => {
        if (!error) {
            res.render('prod_mas_vendido', {
                pagina: 'Producto',
                datos: row
            });
        } else {
            res.send(error)
        }
    });
});


module.exports = router;