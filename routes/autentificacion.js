const { Router } = require('express');
const DB = require('../models/myslq');
const router = Router();

const passport = require('passport');
const { isLoggedIn, loggedUs } = require('../lib/auth');

//REGISTRARSE
router.get('/registrarse', loggedUs, (req, res) => {
    res.render('registrarse', { pagina: 'Registrarse' });
});

router.post('/registrarse', loggedUs, passport.authenticate('registro.local', {
    successRedirect: '/menu',
    failureRedirect: '/registrarse',
    failureFlash: true
}));

//INICIO DE SESION
router.get('/inicio_sesion', loggedUs, (req, res) => {
    res.render('inicio_sesion', {
        pagina: 'Inicio Sesion',
    });
});

router.post('/inicio_sesion', loggedUs, passport.authenticate('login.local', {
    successRedirect: '/menu',
    failureRedirect: '/inicio_sesion',
    failureFlash: true
}));

router.get('/menu', isLoggedIn, (req, res) => {
    var usuario = req.user;
    if (usuario.id_us === 1) { //Adimn
        res.redirect('/menu_usadmin');
    }
    if (usuario.id_us === 2) { //Contador
        res.redirect('/menu_contador');
    }
    if (usuario.id_us === 3) { //Registrado
        res.redirect('/menu_registrado');
    }
});

router.get('/logout', isLoggedIn, (req, res) => {
    req.logOut();
    res.redirect('/');
});


module.exports = router;