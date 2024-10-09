var mongoose = require('mongoose');
var mysql = require('mysql');
var mssql = require('mssql');

local = module.exports = {

    /* Función para establecer conexión a MYSQL */
    mySqlCon: (datosConexion) => {
        return new Promise((resolve, reject) => {
            var connection = mysql.createConnection({
                host: datosConexion.host,
                user: datosConexion.user,
                password: datosConexion.password,
                database: datosConexion.database,
                connectionLimit: 15,
                queueLimit: 30,
                acquireTimeout: 1000000
            });

            connection.connect((error) => {
                if (error) {
                    console.error("Error en conexion MySQL: ", error);
                    return reject(error);
                }
                return resolve(connection);
            });
        })
    },

    /* Función que establece conexión a MongoDB */
    mongoCon: (connectionURI) => {
        mongoose.Promise = global.Promise;
        return mongoose.createConnection(connectionURI);
        //return mongoose.connect(connectionURI);
    },

    /* Función que establece conexión a SQLServer */
    mssqlCon: (objCon) => {

        return new Promise((resolve, reject) => {
            let connection = new mssql.Connection({
                user: objCon.user,
                password: objCon.pass,
                server: objCon.server,
                database: objCon.db
            });

            connection.connect()
                .then((conn) => {
                    return resolve(conn);
                }).catch((error) => {
                    console.error('Error en conexion SQL: ', error);
                    return reject();
                });
        });
    }
};