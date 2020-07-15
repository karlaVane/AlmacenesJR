  const hbs = require('hbs');

  hbs.registerHelper('getAnio', () => {
      return new Date().getFullYear();
  })

  hbs.registerHelper('palabra', (palabra) => {
      var palabre_sinE = palabra.replace(/[^\w]/gi, '');
      return palabre_sinE;
  });

  hbs.registerHelper('mayus', (palabra) => {
      return palabra.toUpperCase();
  })