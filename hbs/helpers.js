const hbs = require('hbs');
//////HELPERS
hbs.registerHelper('getAnio', () => {
    return new Date().getFullYear();
})

hbs.registerHelper('palabra', (palabra) => {
    var palabre_sinE = palabra.replace(/[^\w]/gi, '');
    return palabre_sinE;
});