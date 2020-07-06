const express = require('express') //libreria de express
const app = express() //Crear objeto
const hbs = require('hbs')
require('./hbs/helpers')

const puerto = process.env.PORT || 3000; // puerto para Heroku

app.use(express.static(__dirname + '/public')); // buscar en la carpeta public
hbs.registerPartials(__dirname + '/views/parciales');

app.set('view engine', 'hbs'); // hbs

app.get('/', (req, res) => { // petición get
    res.render('pag_principal', { //no es necesario poner .hbs
        pagina: 'Almacenes JR',
    })
});

app.get('/inicio_sesion', (req, res) => { // petición get
    res.render('inicio_sesion', { //no es necesario poner .hbs
        //nombre: 'KaRla VANEssA',
        pagina: 'Inicio Sesion',
        //class1: 'nav-item active',
        //class2: 'nav-item'
    })
});

app.get('/menu_usadmin', (req, res) => { // petición get
    res.render('menu_usadmin', { //no es necesario poner .hbs
        pagina: 'Administrador',
    })
});
app.get('/menu_contador', (req, res) => { // petición get
    res.render('menu_contador', { //no es necesario poner .hbs
        pagina: 'Contador',

    })
});
app.get('/datos_facturacion', (req, res) => { // petición get
    res.render('datos_facturacion', { //no es necesario poner .hbs
        pagina: 'Datos factura',

    })
});
app.get('/tarj_credito', (req, res) => { // petición get
    res.render('tarj_cred', { //no es necesario poner .hbs
        pagina: 'Tarjeta de crédito',
    })

});

app.post('/tarj_credito', (req, res) => {
    console.log(req.body);
});

app.get('/registrarse', (req, res) => { // petición get
    res.render('registrarse', { //no es necesario poner .hbs
        pagina: 'Registrarse',

    })
});
app.get('/menu_gestionus', (req, res) => { // petición get
    res.render('menu_gestionus', { //no es necesario poner .hbs
        pagina: 'Gestion usuarios',

    })
});

app.get('/consultar_us', (req, res) => { // petición get
    res.render('consultar_us', { //no es necesario poner .hbs
        pagina: 'Consultar usuarios',

    })
});
app.get('/eliminar_us', (req, res) => { // petición get
    res.render('eliminar_us', { //no es necesario poner .hbs
        pagina: 'Eliminar usuarios',

    })
});
app.get('/modificar_us', (req, res) => { // petición get
    res.render('modificar_us', { //no es necesario poner .hbs
        pagina: 'Modificar usuarios',

    })
});
app.get('/crear_us', (req, res) => { // petición get
    res.render('crear_us', { //no es necesario poner .hbs
        pagina: 'Crear usuarios',

    })
});
app.get('/menu_gestionpd', (req, res) => { // petición get
    res.render('menu_gestionpd', { //no es necesario poner .hbs
        pagina: 'Gestión productos',

    })
});
app.get('/crear_pd', (req, res) => { // petición get
    res.render('crear_pd', { //no es necesario poner .hbs
        pagina: 'Crear producto',

    })
});
app.get('/modificar_pd', (req, res) => { // petición get
    res.render('modificar_pd', { //no es necesario poner .hbs
        pagina: 'Modificar producto',

    })
});
app.get('/eliminar_pd', (req, res) => { // petición get
    res.render('eliminar_pd', { //no es necesario poner .hbs
        pagina: 'Eliminar producto',

    })
});
app.get('/consultar_pd', (req, res) => { // petición get
    res.render('consultar_pd', { //no es necesario poner .hbs
        pagina: 'Consultar producto',

    })
});
/*
app.get('/about', (req, res) => { // petición get
    res.render('about', { // it's not necessary .hbs
        pagina: 'About',
        class1: 'nav-item',
        class2: 'nav-item active'
    });

});*/

app.listen(puerto, () => {
    console.log(`Escuchando en el puerto ${puerto}`);
})