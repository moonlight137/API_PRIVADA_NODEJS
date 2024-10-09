const request = require('request');

const conexiones = require('../db/conexiones');
const codigo = require('../utils/errores');

var conn = conexiones.mongoCon("mongodb://ct_api_privada:d885m91WBy3AClpx47UK@10.10.251.199:27017/CT_API_Publica?authSource=admin");
logsPath = `${__dirname}/../archivos/logs/`;

var local = module.exports = {

    //Funcion para guardar un log del error registrado
    guardarLog: (error) => {
        // console.log(error)
        // let conn = mongoose.connection;
        // let conn = conexiones.mongoCon('mongodb://solis:admin@192.168.0.222:27017/CT_API_Publica');

        let coleccion = 'tbl_privada_logs';
        let time = new Date();
        let diaMes = time.getDate();
        let horaLocal = time.getHours();
        let minutoLocal = time.getMinutes();

        // console.log(diaMes)
        time.setTime(time.getTime() - time.getTimezoneOffset() * 60 * 1000);

        if (error.length === undefined) { errorArray = [error]; }
        else { errorArray = error }

        let newLog = {
            errorTime: time,
            errorCount: 1,
            errorLog: errorArray
        }

        conn.collection(coleccion)
            .aggregate([
                {
                    $project: {
                        dia: { $dayOfMonth: '$errorTime' },
                        hora: { $hour: '$errorTime' },
                        minutos: { $minute: '$errorTime' },
                        'errorTime': '$errorTime',
                        'errorCount': '$errorCount',
                        'errorLog': '$errorLog'
                    }
                },
                {
                    $match: {
                        dia: diaMes,
                        hora: horaLocal,
                        minutos: minutoLocal,
                        'errorLog': newLog.errorLog
                    }
                },
                {
                    $project: {
                        'errorTime': '$errorTime',
                        'errorCount': '$errorCount',
                        'errorLog': '$errorLog'
                    }
                }], (error, result = undefined) => {

                    if (error) {
                        console.log(JSON.stringify(error, undefined, 2))
                    }
                    else if (!result[0]) {
                        conn.collection(coleccion)
                            .insertOne(newLog, (error, result) => {
                                console.log("Este es mi error ", error)
                                console.log("Este es mi result ", result)
                                console.log("Este es newlog ######", newLog)
                                if (error) {
                                    console.info('>>>>>>>>>>>>>>> Registro error log: ' + error)
                                }
                                else {
                                    //nuevo producto registrado                                                                    
                                    console.info('>>>>>>>>>>>>>>> Registro log: ' + newLog)
                                }
                            });
                    }
                    else {
                        // console.log(JSON.stringify(result[0], undefined, 2))
                        conn.collection(coleccion)
                            .findOneAndUpdate(
                                { 'errorTime': result[0].errorTime },
                                // { $set: { 'errorCount': +1 } },
                                { $inc: { 'errorCount': 1 } },
                                { upsert: true },
                                (error, result) => {
                                    if (error) {
                                        // return reject(error);
                                        console.info('>>>>>>>>>>>>>>> Update error log: ' + error);
                                    } else {
                                        //producto actualizado
                                        console.info('>>>>>>>>>>>>>>> Update log: ' + newLog)
                                    }
                                });
                    }
                });
      //  conn.close();
        return error;

    },

    //Funcion para almacenar el log en base de datos mongo o en archivo(JSON)
    guardarLog1: (logReg) => {
        // console.log(logReg)
        conn.collection('tbl_privada_logs')
            .insertOne(logReg, (error, resultado) => {
                if (error) {
                    local.printConsola(__filename, Object.keys(local)[1], 'ERROR MONGO INSERT')
                    fs.writeFile(`${logsPath}${logReg.referencia}.json`, JSON.stringify(logReg, undefined, 2), (error) => {
                        if (error) {
                            local.printConsola(__filename, Object.keys(local)[1], 'ERROR CREANDO ARCHIVO')
                        } else {
                            // local.printConsola(__filename, Object.keys(local)[7], 'OK CREANDO ARCHIVO')
                        }
                    })
                }
                else {
                    // local.printConsola(__filename, Object.keys(local)[7], 'OK LOG MONGO REGISTRO')
                }
            })

        conn.on('error', (error) => {
            local.printConsola(__filename, Object.keys(local)[1], 'ERROR MONGO ON')
            fs.writeFile(`${logsPath}${logReg.referencia}.json`, JSON.stringify(logReg, undefined, 2), (error) => {
                if (error) {
                    local.printConsola(__filename, Object.keys(local)[1], 'ERROR CREANDO ARCHIVO')
                } else {
                    local.printConsola(__filename, Object.keys(local)[1], 'OK LOG CREANDO ARCHIVO')
                }
            })
        })
    },

    //Funcion para validar el tipo de error 
    validarError: (error = undefined, request = undefined, trazabilidad = undefined, reg = true) => {
        let regLog = {};
        if (error.stack) {
            regLog = {
                logTime: new Date(),
                referencia: String(new Date().getTime()),
                trazabilidad: trazabilidad,
                datosSolicitud: {
                    body: request.body,
                    query: request.query,
                    params: request.params,
                    path: request.baseUrl
                },
                error: error.stack.split("\n"),
                tipo: 'NC'
            }
            error = codigo.mensaje('503.3', '');
        }
        else {
            regLog = {
                logTime: new Date(),
                referencia: String(new Date().getTime()),
                trazabilidad: trazabilidad,
                datosSolicitud: {
                    body: request.body,
                    query: request.query,
                    params: request.params,
                    path: request.baseUrl
                },
                error: error,
                tipo: 'C'
            }
            // console.info(request, error, trazabilidad)            
        }

        (reg) ? local.guardarLog1(regLog) : null;
        // console.log(error)
        return error;
    },

    //Metodo para consumir un servicio de tipo REST mediante el envio de un Object 
    servicioRest: (servicio) => {
        return new Promise((resolve, reject) => {
            request({
                method: (servicio.metodo) ? servicio.metodo : null,
                headers: (servicio.headers) ? servicio.headers : null,
                url: (servicio.ruta) ? servicio.ruta : null,
                auth: (servicio.access) ? servicio.access : null,
                json: (servicio.datos) ? servicio.datos : null
            }, (errorServicio, respuesta) => {

                if (errorServicio) {
                    return reject(errorServicio);
                } else {
                    return resolve(respuesta)
                }
            });
        });
    },

    //Funcion para crear una impresion en consola con parametros y retorno de mensaje
    printConsola: (rutaFilename = 'SIN RUTA', metodo = 'SIN METODO', tipo = 'SIN TIPO', mensaje = undefined) => {
        ruta = (unidad[0] == 'C' || unidad[0] == 'D') ? rutaFilename.split('\\') : rutaFilename.split('/'); //WINDOWS o LINUX
        file = (ruta.pop()).split('.')[0];
        dir1 = ruta.pop();
        dir2 = ruta.pop();
        ruta = dir2 + '/' + dir1 + '/' + file
        mensaje = (mensaje) ? '\n' + JSON.stringify(mensaje, undefined, 2) : '';
        let consolaMensaje = '>>>>>>>>>>>>>>> ' + tipo + ' >>> ' + ruta + ' (' + metodo + ')' + mensaje
        console.error(consolaMensaje);
        return consolaMensaje;
    },
};

