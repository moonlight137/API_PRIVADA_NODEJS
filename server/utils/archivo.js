const fs = require("fs-extra");
const Promise = require('bluebird');

const exists = require('fs-exists-sync');
const xml2js = require('xml2js');
const parser = new xml2js.Parser({ ignoreAttrs: false, mergeAttrs: true });

local = module.exports = {
    //Procedimiento para mover un archivo
    mover_archivo: (file, pathToMove) => {
        return new Promise((resolve, reject) => {
            fs.move(file, pathToMove, error => {
                if (error) {
                    return reject(error);
                }
                return resolve({ okMessage: "Se Movio el archivo" });
            });
        });
    },

    escribir_archivo: (pathFile) => {
        return new Promise((resolve, reject) => {
            let file = __dirname + pathFile
            fs.writeFile(file, new Date().getTime(), (error) => {
                if (error) {
                    //Acceso denegado
                    return reject();
                } else {
                    // console.log('=============== OK')
                    return resolve()
                }
            });
        });
    },

    leer_archivo: (pathFile) => {
        return new Promise((resolve, reject) => {
            let file = __dirname + pathFile
            fs.readFile(file, 'utf8', (error, data) => {
                if (error) {
                    //Acceso denegado
                    return reject();
                } else {
                    // console.log('=============== OK')
                    return resolve(data)
                }
            });
        });
    },

    /**
     * función general para escribir archivos.
     * @param {String} path Ruta destino de escritura de archivo.
     * @param {String} filename Nombre de archivo.
     * @param {String} text Contenido de archivo.
     */
    gral_escribir_archivo: (path, filename, text) => {
        return new Promise((resolve, reject) => {
            fs.writeFile(path + filename, text, (error) => {
                if (error) {
                    console.log("Error", error)
                    return reject(error);
                }

                return resolve({ okMessage: "Se Creo el archivo" });
            });
        });
    },

    /**
     * Elimina archivo de una ruta en especifico.
     */
    eliminar_archivo: (path, filename) => {
        return new Promise((resolve, reject) => {
            fs.remove(path + filename, err => {
                if (err) {
                    console.log("ERROR AL ELIMINAR", err);
                    return reject();
                }

                return resolve();
            })
        });
    },


    //crear el archivo TXT para Remision, Pedido o Factura
    crearArchivos: (pedidoData) => {
        console.log("Este es mi pedidoData crear archivos ", pedidoData)
        // console.log(JSON.stringify(pedidoData, undefined, 2))
        return new Promise((resolve, reject) => {
            let documentos = pedidoData.documentos;
            let archivosWrite = [];
            documentos.forEach((archivo) => {
                let promesa = new Promise((resolve, reject) => {
                    // console.log(archivo.rutaIn + archivo.filename + ".txt")
                    fs.writeFile(archivo.rutaIn + archivo.filename + ".txt", archivo.txt, (error) => {
                        if (error) {
                            console.log('================= ERROR CREACION ARCHIVO: ' + error);
                            return reject('Error en la creacion de archivo: ' + archivo.filename)
                        } else {
                            // console.log('ARCHIVO CREADO: ' + archivo.filename + '.txt')
                            return resolve(archivo)
                        }
                    });
                });
                archivosWrite.push(promesa);
            });
            return resolve(Promise.all(archivosWrite))
        });
    },

    //Mover los archivos de una ubicacion a otra
    moverArchivos: (archivos) => {
        let movimientos = [];
        archivos.forEach((archivo) => {
            let promesa = new Promise((resolve, reject) => {
           fs.exists(archivo.rutaIn + archivo.filename, (exists) => {
                    if (exists) {
                  //  if(fs.existsSync(archivo.rutaIn + archivo.filename)) {
                        fs.move(archivo.rutaIn + archivo.filename,
                            archivo.rutaOut + archivo.filename, (error) => {
                                if (error) {
                                    console.log('================= ERROR MOVIENDO ARCHIVO: ' + archivo.filename)
                                    local.eliminarArchivos(archivos)
                                }
                                return resolve(archivo);
                            });
                    }
                    else {
                        console.log('ARCHIVO NO ENCONTRADO, NO SE MOVIO: ' + archivo.filename)
                        return resolve();
                    }
                });
            });
            movimientos.push(promesa);
        });
        return Promise.all(movimientos);
    },

    //Eliminar los archivos de una ubicacion
    eliminarArchivos: (archivos) => {
        let movimientos = [];
        archivos.forEach((archivo) => {
            let promesa = new Promise((resolve, reject) => {
                 fs.exists(archivo.rutaIn + archivo.filename, (exists) => {
                    if (exists) {
                   // if(fs.existsSync(archivo.rutaIn + archivo.filename)) {
                        fs.unlink(archivo.rutaIn + archivo.filename, (error) => {
                            if (error) {
                                console.log('================= ERROR ELIMINANDO ARCHIVO: ' + archivo.filename)
                                return resolve();
                            }
                            console.log('# # # # # # # # # ARCHIVO ELIMINADO: ' + archivo.filename)
                            return resolve(archivo);
                        });
                    }
                    else {
                        console.log('ARCHIVO NO ELIMINADO, NO SE ELIMINO: ' + archivo.filename)
                        return resolve();
                    }
                });
            });
            movimientos.push(promesa);
        });
        return Promise.all(movimientos);
    },

    //Funcion para buscar la respuesta XML que pertenece a un archivo TXT Remision, Pedido, Factura
    buscarXML: (documentos) => {
        let encontrados = [];
        documentos.forEach((objeto) => {
            let rutaIn = objeto.rutaIn;
            let rutaOut = objeto.rutaOut;
            let rutaError = objeto.rutaError;
            let filename = objeto.filename;
            let folioPedido = objeto.folioPedido;

            let intervalo = new Promise((resolve, reject) => {
                let contador = 0;
                setInterval(function () {
                    contador++;

                    let promesa = new Promise((resolve, reject) => {
                        fs.readFile(rutaIn + filename + '.xml', 'utf8', (error, data) => {
                            if (error) {
                                return reject(error);
                            }

                            parser.parseString((data), (error, result) => {
                                if (error) {
                                    return reject(error);
                                }
                                console.log('=============== #0 Archivo encontrado: ' + filename + '.xml')

                                // if (exists(rutaIn + filename + '.txt')) {
                                //     //Movemos el archivo TXT si MacroPro no lo realizo
                                //     console.log('>>>>>>>>>>>>>>> #1 Moviendo archivo: ' + filename + '.txt (MacroPro no pudo moverlo)')
                                //     local.moverArchivos([{ rutaIn: rutaIn, rutaOut: rutaOut, filename: filename + '.txt' }])
                                //         .then((resultado) => {
                                //             console.log('>>>>>>>>>>>>>>> #2 OK, archivo: ' + filename + '.txt movido (MacroPro no pudo moverlo)')
                                //         })
                                //         .catch((error) => {
                                //             console.log('>>>>>>>>>>>>>>> #3 NOK, archivo: ' + filename + '.txt (MacroPro lo pudo mover)')
                                //         });
                                // }

                                return resolve({
                                    folioPedido: folioPedido,
                                    rutaIn: rutaIn,
                                    rutaOut: rutaOut,
                                    file: result,
                                    filename: filename + '.xml'
                                })
                            });

                        })
                    });

                    promesa.then((resultado) => {
                        clearInterval(this);
                        return resolve(resultado);
                    }).catch((error) => {
                        console.log('INTENTO ', contador)
                        if (contador == 150) {
                            clearInterval(this);
                            let mensaje;
                            // console.log(filename)
                            switch (filename.substring(0, 4)) {
                                case "Fact":
                                    mensaje = `NO SE PUDO PROCESAR LA FACTURA ARCHIVO: ${filename}.xml`
                                    break;
                                case "Comp":
                                    mensaje = `NO SE PUDO PROCESAR LA PROCESAR REMISION ARCHIVO: ${filename}.xml`
                                    break;
                                case "PedW":
                                    mensaje = `NO SE PUDO PROCESAR EL PEDIDO ARCHIVO: ${filename}.xml`
                                    break;
                                case "Alta":
                                    mensaje = `NO SE PUDO PROCESAR LA FACTURA PROVEEDOR ARCHIVO: ${filename}.xml`
                                    break;
                            }
                            
                            return resolve({
                                folioPedido: (folioPedido) ? folioPedido : undefined,
                                error: true,
                                errorMensaje: mensaje,
                                rutaIn: rutaIn,
                                rutaOut: rutaError,
                                filename: filename + '.txt'
                            });
                        }
                    })

                }, 200);


            });
            encontrados.push(intervalo);
        })

        return Promise.all(encontrados);

    }

}