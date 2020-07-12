const mysql = require('mysql');

const mysqlConnection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'kvmr2108',
    database: 'almacenes_jr',
    multipleStatements: true
});

mysqlConnection.connect((error) => {
    if (error) {
        console.log(error);
    } else {
        console.log("mySQL is connected");
    }
})

module.exports = mysqlConnection