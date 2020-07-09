const { Router } = require("express");
const DB = require('../models/myslq');
const cloudinary = require('cloudinary');
const fs = require('fs-extra');

//Iniziallizar el Router
const router = Router();

//Inizializar la Cloud
cloudinary.config({
    cloud_name: process.env.ClOUD_NAME,
    api_key: process.env.CLOUD_KEY,
    api_secret: process.env.CLOUD_SECRET
});

router.get('/', (req, res) => { // petición get
    res.render('pag_principal', { pagina: 'Almacenes JR' });
});

router.get('/inicio_sesion', (req, res) => {
    res.render('inicio_sesion', {
        //nombre: 'KaRla VANEssA',
        pagina: 'Inicio Sesion',
        //class1: 'nav-item active',
        //class2: 'nav-item'
    });
});

router.get('/menu_usadmin', (req, res) => {
    res.render('menu_usadmin', {
        pagina: 'Administrador',
    });
});

router.get('/menu_contador', (req, res) => {
    res.render('menu_contador', {
        pagina: 'Contador',

    });
});

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

router.get('/registrarse', (req, res) => {
    res.render('registrarse', {
        pagina: 'Registrarse',

    });
});

router.get('/menu_gestionus', (req, res) => {
    res.render('menu_gestionus', {
        pagina: 'Gestion usuarios',

    });
});

router.get('/consultar_us', (req, res) => {
    res.render('consultar_us', {
        pagina: 'Consultar usuarios',

    });
});

router.get('/eliminar_us', (req, res) => {
    res.render('eliminar_us', {
        pagina: 'Eliminar usuarios',
    });
});

router.get('/modificar_us', (req, res) => {
    res.render('modificar_us', {
        pagina: 'Modificar usuarios',

    });
});

router.get('/crear_us', (req, res) => {
    res.render('crear_us', {
        pagina: 'Crear usuarios',
    });
});

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
    const { name, categ, desc, precio, cant } = req.body;
    const resultIMG = await cloudinary.v2.uploader.upload(req.file.path);
    var sql = "INSERT INTO producto (nombre_prod, descripcion, cantidad, precio, imagen, id_categoria) VALUES (?, ?, ?, ?, ?, ?)";
    await DB.query(sql, [name, desc, cant, precio, resultIMG.url, categ], (error, row, fields) => {
        if (!error) {
            fs.unlink(req.file.path);
            res.redirect('/menu_usadmin')
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

router.get('/eliminar_pd', (req, res) => {
    res.render('eliminar_pd', {
        pagina: 'Eliminar producto',
    });
});

router.get('/consultar_pd', (req, res) => {
    res.render('consultar_pd', {
        pagina: 'Consultar producto',
    });
});

module.exports = router;