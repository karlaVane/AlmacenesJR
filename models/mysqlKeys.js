module.exports = {
    /* DB: {
         host: 'localhost',
         user: 'root',
         password: 'Velascogsg',
         database: 'almacenes_jr',
         multipleStatements: true
     }*/
    ///Clever Cloud
    /*
        DB: {
            host: 'bmjd90hnoovqvagyqmil-mysql.services.clever-cloud.com',
            user: 'usy9m2uck5ogfpio',
            password: 'CJhojSlXANQkJqk4Imb0',
            database: 'bmjd90hnoovqvagyqmil',
            multipleStatements: true
        }
    */
    ///Google Cloud
    //Necesito los ips de sus compus
    DB: {
        host: process.env.GCLOUD_host,
        user: process.env.GCLOUD_user,
        password: process.env.GCLOUD_password,
        database: 'almacenes_jr',
        multipleStatements: true
    }
};