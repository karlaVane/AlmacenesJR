module.exports = {
    isLoggedIn(req, res, next) {
        if (req.isAuthenticated()) {
            return next(); //continua con el siguiente codigo
        } else {
            return res.redirect('/inicio_sesion') //Se redirije a signin
        }
    },

    loggedUs(req, res, next) {
        if (!req.isAuthenticated()) {
            return next();
        } else {
            return res.redirect('/menu_usadmin');
        }
    },

    admin(req, res, next) {
        if (req.user.id_us === 1) {
            return next();
        } else {
            return res.redirect('/menu');
        }
    },

    contador(req, res, next) {
        if (req.user.id_us === 2) {
            return next();
        } else {
            return res.redirect('/menu');
        }
    },

    registrado(req, res, next) {
        if (req.user.id_us === 3) {
            return next();
        } else {
            return res.redirect('/menu');
        }
    }
}