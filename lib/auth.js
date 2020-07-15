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
    }
}