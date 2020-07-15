const { Router } = require("express");
const DB = require('../models/myslq');
const fs = require('fs-extra');
const { readSync } = require("fs-extra");
const cloudinary = require('../lib/cloudinary'); //Inizializar la Cloud
const help = require('../lib/helpers');

const { isLoggedIn, loggedUs } = require('../lib/auth');

//Iniziallizar el Router
const router = Router();


//GESTION DE USUARIOS ADMINISTRADOR
router.get('/menu_usadmin', isLoggedIn, (req, res) => {
    res.render('menu_usadmin', {
        pagina: 'Administrador'
    });
});

router.get('/menu_gestionus', isLoggedIn, (req, res) => {
    res.render('menu_gestionus', {
        pagina: 'Gestion usuarios'

    });
});

router.get('/crear_us', isLoggedIn, (req, res) => {
    res.render('crear_us', {
        pagina: 'Crear usuarios'
    });
});

router.post('/crear_us', isLoggedIn, async(req, res) => {
    const { nombre, cedula, correo, telf, dir, tipoUS } = req.body;
    var { passw } = req.body;
    var nombres = await DB.query('SELECT nombre FROM usuario')
    if (nombres.include(nombre)) {
        req.flash('mensaje', "El Nombre de usuario " + nombre + " ya existe");
        res.redirect('/crear_us');
    }
    passw = await help.encryptPassword(passw);
    if (!req.file) {
        const imagen = null
        const id_img = null
        const sql = "INSERT INTO usuario (nombre, cedula, correo, contrasenia, direccion, telefono, estado, id_us, otros_datos,imagen,id_img) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        await DB.query(sql, [nombre, cedula, correo, passw, dir, telf, 1, tipoUS, 0, imagen, id_img], (error, rows, fields) => {
            if (!error) {
                req.flash('exito', "Usuario " + nombre + " Creado con exito");
                res.redirect('menu_gestionus');
            } else {
                res.send(error);
            }
        });
    }
    const resulIMG = await cloudinary.v2.uploader.upload(req.file.path);
    const sql = "INSERT INTO usuario (nombre, cedula, correo, contrasenia, direccion, telefono, estado, id_us, otros_datos,imagen,id_img) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    await DB.query(sql, [nombre, cedula, correo, passw, dir, telf, 1, tipoUS, 0, resulIMG.url, resulIMG.public_id], (error, rows, fields) => {
        if (!error) {
            fs.unlink(req.file.path);
            res.redirect('/menu_gestionus');
        } else {
            res.send(error);
        }
    });

});

router.get('/consultar_us', isLoggedIn, async(req, res) => {
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

router.get('/eliminar_us', isLoggedIn, async(req, res) => {
    const sql = "select id_usuario, nombre, cedula, correo, direccion, telefono, estado, tipo,imagen, id_img from usuario, tipo_usuario where usuario.id_us=tipo_usuario.id_us";
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

router.get("/eliminar_usuario", isLoggedIn, async(req, res) => {
    const id_usEl = req.query.id_us;
    const sql = "delete from usuario where id_usuario= " + id_usEl;
    await DB.query(sql, async(error, row, fields) => {
        if (!error) {
            var img = req.query.img;
            if (img) {
                await cloudinary.v2.uploader.destroy(img);
            }
            res.redirect('/eliminar_us')
        } else {
            res.send(error)
        }
    });
});

router.get('/modificar_us', isLoggedIn, async(req, res) => {
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
router.get('/editar_datosUs', isLoggedIn, async(req, res) => {
    var cedula = req.query.ci;
    const sql = "select * from usuario where cedula = '";
    await DB.query(sql + cedula + "'", async(error, row, fields) => {
        if (!error) {
            var data = await row[0];
            if (data.id_us === 1) {
                data.tipo = 'Administrador';
            } else if (data.id_us === 2) {
                data.tipo = 'Contador';
            } else {
                data.tipo = 'Registrado';
            }
            console.log(data);
            res.render('editar_datosUs', {
                pagina: 'Modificacion usuarios',
                datos: data,
                cedula
            });
        } else {
            res.send(error)
        }
    });
});

router.post('/editar_datosUs', isLoggedIn, async(req, res) => {
    var cedula_q = req.query.ci
    var resultIMG;
    var sql;
    const { nombre, cedula, correo, dir, telf, tipoUS } = req.body;
    console.log(req.query);
    if (!req.file) {
        sql = "update usuario set nombre= '";
        await DB.query(sql + nombre + "' ,cedula = '" + cedula + "', correo='" + correo +
            " ', direccion='" + dir + "',telefono='" + telf + "',id_us= '" + tipoUS +
            "' where cedula = '" + cedula_q + "'", (error, rows, fields) => {
                if (!error) {
                    res.redirect('/modificar_us');
                } else {
                    res.send(error);
                }
            });
    } else {
        var id_img = req.query.img;
        if (id_img) {
            await cloudinary.v2.uploader.destroy(id_img);
        }
        resultIMG = await cloudinary.v2.uploader.upload(req.file.path);
        sql = "update usuario set nombre= '";
        await DB.query(sql + nombre + "' ,cedula = '" + cedula + "', correo='" + correo +
            " ', direccion='" + dir + "',telefono='" + telf + "',id_us= " + tipoUS +
            ",imagen= '" + resultIMG.url + "',id_img= '" + resultIMG.public_id + "' where cedula = '" + cedula_q + "'", (error, rows, fields) => {
                if (!error) {
                    fs.unlink(req.file.path);
                    res.redirect('/modificar_us');
                } else {
                    res.send(error);
                }
            });
    }
});

///GESTION DE PRODUCTOS ADMINISTRADOR
router.get('/menu_gestionpd', isLoggedIn, (req, res) => {
    res.render('menu_gestionpd', {
        pagina: 'Gestión productos',
    });
});

router.get('/crear_pd', isLoggedIn, (req, res) => {
    res.render('crear_pd', {
        pagina: 'Crear producto',
    });
});

router.post('/crear_pd', isLoggedIn, async(req, res) => {
    const { name, categ, desc, precio_compra, precio_venta, cant } = req.body;
    const resultIMG = await cloudinary.v2.uploader.upload(req.file.path);
    var sql = "INSERT INTO producto (nombre_prod, descripcion, cantidad,  imagen, id_img, precio_venta, precio_compra, id_categoria) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    await DB.query(sql, [name.toUpperCase(), desc, cant, resultIMG.url, resultIMG.public_id, precio_venta, precio_compra, categ], (error, row, fields) => {
        if (!error) {
            fs.unlink(req.file.path);
            res.redirect('/menu_gestionpd')
        } else {
            res.send(error);
        }
    });
});

router.get('/consultar_pd_admin', isLoggedIn, async(req, res) => {
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
router.post('/buscar_categ', isLoggedIn, async(req, res) => {
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

router.get('/eliminar_pd', isLoggedIn, async(req, res) => {
    var sql;
    var id_prodEl = req.query.id_prod;
    if (id_prodEl == undefined) {
        sql = "select id_prod, nombre_prod,descripcion,cantidad,precio_venta,precio_compra,categoria,imagen, id_img" +
            " from producto, categoria where producto.id_categoria = categoria.id_categoria";
        await DB.query(sql, (error, row, fields) => {
            if (!error) {
                console.log(row);
                res.render('eliminar_pd', {
                    pagina: 'Eliminar producto',
                    datos: row
                });
            } else {
                res.send(error);
            }
        });
    } else {
        var id_img = req.query.img;
        console.log(id_img);
        if (id_img) {
            await cloudinary.v2.uploader.destroy(id_img);
        }
        sql = "delete from producto where id_prod= " + id_prodEl;
        await DB.query(sql, async(error, row, fields) => {
            if (!error) {
                res.redirect('/eliminar_pd');
            } else {
                res.send(error);
            }
        });
    }
});

//el buscar categoria eliminado está dentro de eliminar producto
router.post('/buscar_categ_eliminado', isLoggedIn, async(req, res) => {
    var categ_prod = req.body.categ_prod;
    var sql;
    if (categ_prod == '5') {
        sql = "select id_prod,nombre_prod,descripcion,cantidad,precio_venta,precio_compra,categoria,imagen, id_img" +
            " from producto, categoria where producto.id_categoria = categoria.id_categoria";
    } else {
        sql = "select id_prod,nombre_prod,descripcion,cantidad,precio_venta,precio_compra,categoria,imagen, id_img" +
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

router.get('/modificar_pd', isLoggedIn, async(req, res) => {
    const sql = "select id_prod, nombre_prod, descripcion, cantidad, precio_venta, precio_compra, categoria, imagen from producto, categoria where producto.id_categoria=categoria.id_categoria";
    await DB.query(sql, (error, row, fields) => {
        if (!error) {
            res.render('modificar_pd', {
                pagina: 'modificar producto',
                datos: row
            });
        } else {
            res.send(error)
        }
    });
});

router.post('/buscar_categ_modificar', isLoggedIn, async(req, res) => {
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
            res.render('modificar_pd', { pagina: 'Modificar Producto', datos: row });
        } else {
            res.send(error);
        }
    });
});
///////////////////////////////////
router.get('/editar_prod', isLoggedIn, async(req, res) => {
    var id_producto = req.query.idprod;
    const sql = "select id_prod, nombre_prod, descripcion, cantidad, precio_venta, precio_compra, categoria, producto.id_categoria, imagen, id_img from producto, categoria where producto.id_categoria=categoria.id_categoria" +
        " and id_prod = " + id_producto;
    await DB.query(sql, (error, row, fields) => {
        if (!error) {
            res.render('editar_prod', {
                pagina: 'Editar productos',
                datos: row,
            });
        } else {
            res.send(error)
        }
    });
});

router.post('/editar_prod', isLoggedIn, async(req, res) => {
    var producto_q = req.query.id_prod
    var resultIMG;
    var sql;
    const { name, categ, desc, precio_compra, precio_venta, cant } = req.body;
    if (!req.file) {
        sql = "update producto set nombre_prod= '";
        await DB.query(sql + name + "' ,id_categoria = " + categ + ", descripcion='" + desc +
            " ', precio_compra=" + precio_compra + ",precio_venta=" + precio_venta + ",cantidad= " + cant +
            " where id_prod = " + producto_q, (error, rows, fields) => {
                if (!error) {
                    res.redirect('/consultar_pd_admin');
                } else {
                    res.send(error);
                }
            });
    } else {
        var id_img = req.query.img;
        if (id_img) {
            await cloudinary.v2.uploader.destroy(id_img);
        }
        resultIMG = await cloudinary.v2.uploader.upload(req.file.path);
        sql = "update producto set nombre_prod= '";
        await DB.query(sql + name + "' ,id_categoria = " + categ + ", descripcion='" + desc +
            " ', precio_compra=" + precio_compra + ",precio_venta=" + precio_venta + ",cantidad= " + cant +
            ",imagen= '" + resultIMG.url + "' ,id_img= '" + resultIMG.public_id + "' where id_prod = " + producto_q, (error, rows, fields) => {
                if (!error) {
                    fs.unlink(req.file.path);
                    res.redirect('/consultar_pd_admin');
                } else {
                    res.send(error);
                }
            });
    }
});

module.exports = router;