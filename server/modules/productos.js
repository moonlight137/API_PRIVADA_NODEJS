const fs = require('fs-extra');
const exists = require('fs-exists-sync');
const archivos = require('../utils/archivo');

let pruebas = false; //TRUE = ambiente de prueba | FALSE = ambiente de produccion

var objRutas = {
    errores: {
        in: ''
    },
    productos: {
        in: (pruebas) ? '/datos/macropro/webpage/in/' : '/datos/reportes/in',
        out: (pruebas) ? '/datos/macropro/webpage/out/' : '/datos/reportes/out',
        filename : 'Arti.txt'
    }
}

let local = module.exports = {

    /**
     * Realiza la escritura de un archivo para actualización de articulos en MacroPro.
     * @param {String} filename Nombre de archivo a escribir
     * @param {String} archivo Contenido de archivo a escribir.
     */
    actualizar_productos : (filename, archivo) => {

        return new Promise((resolve, reject) => {
            
            archivos.gral_escribir_archivo(objRutas.productos.in, filename, archivo)
                .then((resultado) => {
                    return local.buscarArchivoArticulo();
                }).then((resultado) => {
                    return resolve(resultado);
                }).catch((error) => {
                    console.log("ERROR: ", error);
                    return reject(error);
                });
        });
    },

    /**
     * Verifica si el archivo Arti.txt fue procesado de manera exitosa por al menos 10 segundos. Cuando el archivo sea procesado, será eliminado de la ruta out.
     */
    buscarArchivoArticulo: () => {
        let rutaIn = objRutas.productos.in;
        let rutaOut = objRutas.productos.out;
        let filename = objRutas.productos.filename;

        return new Promise((resolve, reject) => {
            let contador = 0;
            setInterval(function () {
                contador++;

                let promesa = new Promise((resolve, reject) => {
                    if (exists(rutaIn + filename)) {
                        console.log('>>>>>>>>>>>>>>>  MACROPRO NO PROCESA EL ARCHIVO');
                        return reject();
                    }
                    
                    archivos.eliminar_archivo(rutaOut, filename)
                        .then((resultado) => {
                            console.log('>>>>>>>>>>>>>>>  ARCHIVO PROCESADO');
                            return resolve();
                        }).catch((error) => {
                            console.log("ERROR =>", error);
                            return reject();
                        });
                });

                promesa.then((resultado) => {
                    clearInterval(this);
                    return resolve(true);
                }).catch((error) => {
                    console.log('***** Intento ' + contador)
                    if (contador >= 50) {
                        clearInterval(this);
                        return resolve(false);
                    }
                });
            }, 200);

        });
    }

};