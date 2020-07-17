const bcrypt = require('bcryptjs');

const help = {};

help.encryptPassword = async(password) => {
    const salt = await bcrypt.genSalt(10); //Patron
    const hash = await bcrypt.hash(password, salt); //Contraseña
    return hash;
};

//Para comprara contraseñas encriptadas
help.matchPassword = async(contra, dbContra) => {
    try {
        return await bcrypt.compare(contra, dbContra);
    } catch (error) {
        console.log(error);
    }
};

module.exports = help;