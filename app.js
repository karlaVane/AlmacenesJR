const express = require('express'); //libreria de express
const hbs = require('hbs');
const path = require('path');
const morgan = require('morgan');
const multer = require('multer');
const { DB } = require('./models/mysqlKeys');
const session = require('express-session'); //session de express
const MySQLStore = require('express-mysql-session'); //para guardar la session de express
const flash = require('connect-flash'); //permite mandar mensajes de exito utiliza sesiones
const passport = require('passport'); //Este crea La session;


//Inizialiso el Objeto
const app = express(); //Crear objeto
require('./models/myslq'); //llamo a mysql 
require('./lib/passportConfig'); //llamo a mis variables de passport

//Settings
app.set('view engine', 'hbs'); // hbs
const puerto = process.env.PORT || 3000; // puerto para Heroku
app.set('port', puerto)
app.use(express.static(__dirname + '/public')); // buscar en la carpeta public
hbs.registerPartials(__dirname + '/views/parciales');
require('./lib/hbs');

//Middlewares
app.use(session({
    secret: 'sg',
    resave: false,
    saveUninitialized: false,
    store: new MySQLStore(DB)
}));
app.use(flash());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());

//Variables Globales
app.use((req, res, next) => {
    app.locals.success = req.flash('exito');
    app.locals.message = req.flash('mensaje');
    app.locals.usuario = req.user;
    next();
});

//Multer
const storage = multer.diskStorage({
    destination: path.join(__dirname, 'public/uploads'),
    filename: (req, file, call) => {
        call(null, new Date().getTime() + path.extname(file.originalname)); //resive el errror y el filename(e,fn) fn es el tiempo  y la extension .jpeg 
    }
});
app.use(multer({ storage }).single('image')); //ve si mandamos una imagen y poner el nombre del campo html (image)

//Routes
app.use(require('./routes'));
app.use(require('./routes/autentificacion'));
app.use(require('./routes/admin'));
app.use(require('./routes/contador'));
app.use(require('./routes/registrado'));
app.use(require('./routes/carrito'));

module.exports = app;