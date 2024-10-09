let config = require('./_config');
let env = 'prod' //Ambiente predeterminado
//Contenedor de las variables del ambiente predeterminado
process.vars = config[env];

//Contenedor de todos los ambientes configurados
process.enviroment = {};

//Cargamos todos los ambientes de la configuración
Object.keys(config).forEach((key) => {
    process.enviroment[key] = config[key];
});