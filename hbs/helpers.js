const hbs = require('hbs');
//////HELPERS
hbs.registerHelper('getAnio', () => {
    return new Date().getFullYear();
})