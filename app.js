const express = require('express'); //libreria de express
const hbs = require('hbs');
const path = require('path');
const morgan = require('morgan');
const multer = require('multer');



//Inizialiso el Objeto
const app = express(); //Crear objeto
require('./models/myslq'); //llamo a mysql 

//Settings
app.set('view engine', 'hbs'); // hbs
const puerto = process.env.PORT || 3000; // puerto para Heroku
app.set('port', puerto)
app.use(express.static(__dirname + '/public')); // buscar en la carpeta public
hbs.registerPartials(__dirname + '/views/parciales');

//Middlewares
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
require('./hbs/helpers');

//Multer
const storage = multer.diskStorage({
    destination: path.join(__dirname, 'public/uploads'),
    filename: (req, file, call) => {
        call(null, new Date().getTime() + path.extname(file.originalname)); //resive el errror y el filename(e,fn) fn es el tiempo  y la extension .jpeg 
    }
});
app.use(multer({ storage }).single('image')); //ve si mandamos una imagen y poner el nombre del campo html (image)

//Routes
app.use(require('./routes/routes'))


module.exports = app;