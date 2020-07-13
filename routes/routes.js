const { Router } = require("express");
const DB = require('../models/myslq');
const cloudinary = require('cloudinary');
const fs = require('fs-extra');
const { readSync } = require("fs-extra");

//Iniziallizar el Router
const router = Router();

//Inizializar la Cloud
cloudinary.config({
    cloud_name: process.env.ClOUD_NAME,
    api_key: process.env.CLOUD_KEY,
    api_secret: process.env.CLOUD_SECRET
});
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
//INICIO DE SESION
router.get('/inicio_sesion', (req, res) => {
    res.render('inicio_sesion', {
        pagina: 'Inicio Sesion',
    });
});

//REGISTRARSE
router.get('/registrarse', (req, res) => {
    res.render('registrarse', {
        pagina: 'Registrarse',

    });
});

router.post('/registrarse', async(req, res) => {
    const { nombre, cedula, correo, passw, telf, dir } = req.body;
    const sql = "INSERT INTO usuario (nombre, cedula, correo, contrasenia, direccion, telefono, estado, id_us, otros_datos) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    await DB.query(sql, [nombre, cedula, correo, passw, dir, telf, 1, 3, 0], (error, rows, fields) => {
        if (!error) {
            res.redirect('/');
        } else {
            res.send(error);
        }
    });
});
//GESTION DE USUARIOS ADMINISTRADOR
router.get('/menu_usadmin', (req, res) => {
    res.render('menu_usadmin', {
        pagina: 'Administrador',
    });
});

router.get('/menu_gestionus', (req, res) => {
    res.render('menu_gestionus', {
        pagina: 'Gestion usuarios',

    });
});

router.get('/crear_us', (req, res) => {
    res.render('crear_us', {
        pagina: 'Crear usuarios',
    });
});

router.post('/crear_us', async(req, res) => {
    const { nombre, cedula, correo, passw, telf, dir, tipoUS } = req.body;
    if (!req.file) {
        const imagen = null
        const sql = "INSERT INTO usuario (nombre, cedula, correo, contrasenia, direccion, telefono, estado, id_us, otros_datos,imagen) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?)";
        await DB.query(sql, [nombre, cedula, correo, passw, dir, telf, 1, tipoUS, 0, imagen], (error, rows, fields) => {
            if (!error) {
                res.redirect('menu_gestionus');
            } else {
                res.send(error);
            }
        });
    }
    const resulIMG = await cloudinary.v2.uploader.upload(req.file.path);
    const sql = "INSERT INTO usuario (nombre, cedula, correo, contrasenia, direccion, telefono, estado, id_us, otros_datos,imagen) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?)";
    await DB.query(sql, [nombre, cedula, correo, passw, dir, telf, 1, tipoUS, 0, resulIMG.url], (error, rows, fields) => {
        if (!error) {
            fs.unlink(req.file.path);
            res.redirect('/menu_usadmin');
        } else {
            res.send(error);
        }
    });

});

router.get('/consultar_us', async(req, res) => {
    const sql = "select nombre, cedula, correo, direccion, telefono, estado, tipo,imagen from usuario, tipo_usuario where usuario.id_us=tipo_usuario.id_us";
    await DB.query(sql, (error, row, fields) => {
        if (!error) {
            res.render('consultar_us', {
                pagina: 'Consultar usuarios',
                datos: row
            });
        } else {
            res.send(error)
        }
    });
});

router.get('/eliminar_us', async(req, res) => {
    const sql = "select id_usuario, nombre, cedula, correo, direccion, telefono, estado, tipo,imagen from usuario, tipo_usuario where usuario.id_us=tipo_usuario.id_us";
    await DB.query(sql, (error, row, fields) => {
        if (!error) {
            res.render('eliminar_us', {
                pagina: 'Eliminar usuarios',
                datos: row
            });
        } else {
            res.send(error)
        }
    });
});
router.get("/eliminar_usuario", async(req, res) => {
    const id_usEl = req.query.id_us;
    const sql = "delete from usuario where id_usuario= " + id_usEl;
    console.log(sql);
    await DB.query(sql, (error, row, fields) => {
        if (!error) {
            res.redirect('/eliminar_us')
        } else {
            res.send(error)
        }
    });
});

router.get('/modificar_us', async(req, res) => {
    const sql = "select nombre, cedula, correo, direccion, telefono, estado, tipo,imagen from usuario, tipo_usuario where usuario.id_us=tipo_usuario.id_us";
    await DB.query(sql, (error, row, fields) => {
        if (!error) {
            res.render('modificar_us', {
                pagina: 'modificar usuarios',
                datos: row
            });
        } else {
            res.send(error)
        }
    });
});

//modificacion de usuarios donde se cambian los datos (formulario cargado con los datos a editar)
router.get('/editar_datosUs', async(req, res) => {
    var cedula = req.query.ci;
    const sql = "select nombre, cedula, correo, direccion, telefono, tipo,imagen from usuario, tipo_usuario where usuario.id_us=tipo_usuario.id_us and cedula = '";
    await DB.query(sql + cedula + "'", (error, row, fields) => {
        if (!error) {
            res.render('editar_datosUs', {
                pagina: 'Modificacion usuarios',
                datos: row,
                cedula
            });
        } else {
            res.send(error)
        }
    });
});
router.post('/editar_datosUs', async(req, res) => {
    var cedula_q = req.query.ci
    const { nombre, cedula, correo, dir, telf, tipoUS } = req.body;
    const resultIMG = await cloudinary.v2.uploader.upload(req.file.path);
    const sql = "update usuario set nombre= '";
    await DB.query(sql + nombre + "' ,cedula = '" + cedula + "', correo='" + correo +
        " ', direccion='" + dir + "',telefono='" + telf + "',id_us= " + tipoUS +
        ",imagen= '" + resultIMG.url + "' where cedula = '" + cedula_q + "'", (error, rows, fields) => {
            if (!error) {
                fs.unlink(req.file.path);
                res.redirect('/consultar_us');
            } else {
                res.send(error);
            }
        });
});

///GESTION DE PRODUCTOS ADMINISTRADOR
router.get('/menu_gestionpd', (req, res) => {
    res.render('menu_gestionpd', {
        pagina: 'Gestión productos',
    });
});

router.get('/crear_pd', (req, res) => {
    res.render('crear_pd', {
        pagina: 'Crear producto',
    });
});

router.post('/crear_pd', async(req, res) => {
    const { name, categ, desc, precio_compra, precio_venta, cant } = req.body;
    const resultIMG = await cloudinary.v2.uploader.upload(req.file.path);
    var sql = "INSERT INTO producto (nombre_prod, descripcion, cantidad,  imagen, precio_venta, precio_compra, id_categoria) VALUES (?, ?, ?, ?, ?, ?, ?)";
    await DB.query(sql, [name.toUpperCase(), desc, cant, resultIMG.url, precio_venta, precio_compra, categ], (error, row, fields) => {
        if (!error) {
            fs.unlink(req.file.path);
            res.redirect('/')
        } else {
            res.send(error);
        }
    });
});

router.get('/consultar_pd_admin', async(req, res) => {
    var sql = "select nombre_prod,descripcion,cantidad,precio_venta,precio_compra,categoria,imagen from producto, categoria where producto.id_categoria = categoria.id_categoria";
    await DB.query(sql, (error, row, fields) => {
        if (!error) {
            res.render('consultar_pd_admin', {
                pagina: 'Productos',
                datos: row
            });
        } else {
            res.send(error)
        }
    });
});
//el buscar categoria está dentro de consultar producto
router.post('/buscar_categ', async(req, res) => {
    var categ_prod = req.body.categ_prod;
    var sql;
    if (categ_prod == '5') {
        sql = "select nombre_prod,descripcion,cantidad,precio_venta,precio_compra,categoria,imagen" +
            " from producto, categoria where producto.id_categoria = categoria.id_categoria";
    } else {
        sql = "select nombre_prod,descripcion,cantidad,precio_venta,precio_compra,categoria,imagen" +
            " from producto, categoria where producto.id_categoria = categoria.id_categoria and producto.id_categoria =" + categ_prod;
    }
    await DB.query(sql, (error, row, fields) => {
        if (!error) {
            res.render("consultar_pd_admin", { pagina: 'Producto', datos: row });

        } else {
            res.send(error);
        }
    });
});

router.get('/eliminar_pd', async(req, res) => {
    var sql;
    const id_prodEl = req.query.id_prod;
    if (id_prodEl == undefined) {
        sql = "select id_prod, nombre_prod,descripcion,cantidad,precio_venta,precio_compra,categoria,imagen" +
            " from producto, categoria where producto.id_categoria = categoria.id_categoria";
        await DB.query(sql, (error, row, fields) => {
            if (!error) {
                res.render('eliminar_pd', {
                    pagina: 'Eliminar producto',
                    datos: row
                });
            } else {
                res.send(error);
            }
        });
    } else {
        sql = "delete from producto where id_prod= " + id_prodEl;
        await DB.query(sql, (error, row, fields) => {
            if (!error) {
                res.redirect('/eliminar_pd');
            } else {
                res.send(error);
            }
        });
    }
});

//el buscar categoria eliminado está dentro de eliminar producto
router.post('/buscar_categ_eliminado', async(req, res) => {
    var categ_prod = req.body.categ_prod;
    var sql;
    if (categ_prod == '5') {
        sql = "select id_prod,nombre_prod,descripcion,cantidad,precio_venta,precio_compra,categoria,imagen" +
            " from producto, categoria where producto.id_categoria = categoria.id_categoria";
    } else {
        sql = "select id_prod,nombre_prod,descripcion,cantidad,precio_venta,precio_compra,categoria,imagen" +
            " from producto, categoria where producto.id_categoria = categoria.id_categoria and producto.id_categoria =" + categ_prod;
    }
    await DB.query(sql, (error, row, fields) => {
        if (!error) {
            res.render('eliminar_pd', { pagina: 'Eliminar Producto', datos: row });
        } else {
            res.send(error);
        }
    });
});

router.get('/modificar_pd', (req, res) => {
    res.render('modificar_pd', {
        pagina: 'Modificar producto',
    });
});


//USUARIO CONTADOR
router.get('/menu_contador', (req, res) => {
    res.render('menu_contador', {
        pagina: 'Contador',

    });
});
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