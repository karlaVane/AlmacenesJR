const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const dbase = require('../models/myslq');
const help = require('./helpers');

//Registro
passport.use('registro.local', new LocalStrategy({
    usernameField: 'nombre',
    passwordField: 'passw',
    passReqToCallback: true
}, async(req, username, password, done) => {
    const { cedula, correo, telf, dir } = req.body;
    const newUser = {
        nombre: username,
        cedula,
        correo,
        contrasenia: password,
        direccion: dir,
        telefono: telf,
        estado: 1,
        id_us: 3,
        otros_datos: 0
    };
    newUser.contrasenia = await help.encryptPassword(newUser.contrasenia);
    const validacion = await dbase.query('SELECT * FROM usuario WHERE nombre = ?', [newUser.nombre]);
    if (validacion.length > 0) {
        done(null, false, req.flash('mensaje', `El usuario ${newUser.nombre} ya existe ingrese otro nombre de usuario`));
    } else {
        await dbase.query('INSERT INTO usuario SET ?', [newUser]);
        const verf = await dbase.query('SELECT * FROM usuario WHERE nombre = ?', [newUser.nombre]);
        newUser.id_usuario = verf[0].id_usuario;
        //console.log('Nuevo usuario -> ',newUser);
        return done(null, newUser)
    };
}));

//Ingreso 
passport.use('login.local', new LocalStrategy({
    usernameField: 'nombre',
    passwordField: 'passw',
    passReqToCallback: true
}, async(req, username, password, done) => {
    //console.log('manda datos del req -> ', req.body);
    const rows = await dbase.query('SELECT * FROM usuario WHERE nombre = ?', [username]);
    if (rows.length > 0) { //si no existe retorna un arreglo vacio
        const user = rows[0]; //cogo solo el objeto dentro del arreglo
        const validPassword = await help.matchPassword(password, user.contrasenia);
        if (validPassword) {
            done(null, user, req.flash('exito', "Welcome " + user.nombre))
        } else {
            done(null, false, req.flash('mensaje', "Contraseña incorrecta"));
        }
    } else {
        return done(null, false, req.flash('mensaje', "El Usuario no Existe"))
    }
}));



//Guarda el usuario en una session callback done
passport.serializeUser((user, done) => {
    console.log(user);
    done(null, user.id_usuario)
});

//Deserializarlo de la sesion
passport.deserializeUser(async(id, done) => {
    console.log(id);
    const rows = await dbase.query('SELECT * FROM usuario WHERE id_usuario = ?', [id]);
    done(null, rows[0]) //regresa un arreglo con el objetos y solo coge el objeto 0
});