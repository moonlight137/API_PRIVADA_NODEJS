const xml2js = require('xml2js');
const fs = require('fs-extra');
const exists = require('fs-exists-sync');

const _EmptySpace = "                                                            ";
const _RellenoNombre = "RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR";
const codigo = require('../utils/errores');

let parser = new xml2js.Parser({ ignoreAttrs: false, mergeAttrs: true });

let pruebas = false; //TRUE = ambiente de prueba | FALSE = ambiente de produccion

let objRutas = {
    errores: {
        in: '/datos/macropro_api_privada/server/archivos/'
    },
    pedido: {
        in: (pruebas) ? '/datos/webpage/Pedidos/in/' : '/datos/webpage/Pedidos/in/',
        out: (pruebas) ? '/datos/webpage/Pedidos/out/' : '/datos/webpage/Pedidos/out/'
    }
}

let rutaError = objRutas.errores.in

let local = module.exports = {

    //Metodo para crear el pedido web para el intercambio de documentos
    crearPedido: (pedidoData) => {
        // console.log(JSON.stringify(pedidoData, undefined, 2))
        let cliente = pedidoData.encabezado.cliente;
        let tipodeCambio = pedidoData.encabezado.tipodecambio;
        let almacen = pedidoData.encabezado.almacen;
        let plazo = pedidoData.encabezado.plazo;
        let productos = pedidoData.detalle.producto;
        let iva = pedidoData.encabezado.iva;
        let fecha = Date.now();

        var rutaIn = objRutas.pedido.in; //RUTAS DE ARCHIVOS IN
        var rutaOut = objRutas.pedido.out; //RUTAS DE ARCHIVOS OUT

        return new Promise((resolve, reject) => {
            let filenamePed = 'PedW' + almacen.substring(0, 2) + '_' + cliente + fecha;
            //Cabecera del archivo para el Pedido
            let pedido = _EmptySpace.substring(0, 21) +
                (cliente + _EmptySpace).substring(0, 15) + " " +
                (almacen + _EmptySpace).substring(0, 3) + " " + plazo + "  6                    @\r\n";

            productos.forEach((art) => {
                let tc = (art.moneda == "USD") ? tipodeCambio : " 1.00";
                pedido += (art.cantidad + _EmptySpace).substring(0, 10) + " " +
                    (art.clave + _EmptySpace).substring(0, 15) + "   " +
                    // (art.precioFinal + _EmptySpace).substring(0, 14) + "16.00  0.00  " + (tc + _EmptySpace).substring(0, 5) + "     @\r\n";
                    (art.precioFinal + _EmptySpace).substring(0, 14) + (iva + '.00' + _EmptySpace).substring(0, 5) + "  0.00  " + (tc + _EmptySpace).substring(0, 5) + "     @\r\n";
            });

            filenamePed = (filenamePed + _RellenoNombre).substring(0, 27);

            let pedidoCreado = {
                rutaIn: rutaIn,
                rutaOut: rutaOut,
                filename: filenamePed,
                txt: pedido
            }

            return resolve(pedidoCreado)
        });
    },

    //Metodo para crear el pedido de traspaso para el intercambio de documentos
    crearTraspaso: (pedidoData) => {
        // console.log(JSON.stringify(pedidoData, undefined, 2))
        let cliente = pedidoData.encabezado.cliente;
        let tipodeCambio = pedidoData.encabezado.tipodecambio;
        let almacen = pedidoData.encabezado.almacen;
        let plazo = pedidoData.encabezado.plazo;
        let productos = pedidoData.detalle.producto;
        let fecha = Date.now();

        var rutaIn = objRutas.pedido.in; //RUTAS DE ARCHIVOS IN
        var rutaOut = objRutas.pedido.out; //RUTAS DE ARCHIVOS OUT

        return new Promise((resolve, reject) => {
            let filenamePed = 'PedT' + almacen.substring(0, 2) + '_' + cliente + fecha;
            //Cabecera del archivo para el Pedido
            let pedido = _EmptySpace.substring(0, 21) +
                (cliente + _EmptySpace).substring(0, 15) + " " +
                (almacen + _EmptySpace).substring(0, 3) + " " + plazo + "  1                    @\r\n";

            productos.forEach((art) => {
                let tc = (art.moneda == "USD") ? tipodeCambio : " 1.00";
                pedido += (art.cantidad + _EmptySpace).substring(0, 10) + " " +
                    (art.clave + _EmptySpace).substring(0, 15) + "   " +
                    (art.precioFinal + _EmptySpace).substring(0, 14) + "16.00  0.00  " + (tc + _EmptySpace).substring(0, 5) + "     @\r\n";
            });

            let pedidoCreado = {
                rutaIn: rutaIn,
                rutaOut: rutaOut,
                filename: filenamePed,
                txt: pedido
            }

            return resolve(pedidoCreado)
        });
    },

    //Metodo para crear el pedido de credito para el intercambio de documentos
    crearCredito: (pedidoData) => {
        // console.log(JSON.stringify(pedidoData, undefined, 2))
        let cliente = pedidoData.encabezado.cliente;
        let tipodeCambio = pedidoData.encabezado.tipodecambio;
        let almacen = pedidoData.encabezado.almacen;
        let plazo = pedidoData.encabezado.plazo;
        let productos = pedidoData.detalle.producto;
        let fecha = Date.now();

        var rutaIn = objRutas.pedido.in; //RUTAS DE ARCHIVOS IN
        var rutaOut = objRutas.pedido.out; //RUTAS DE ARCHIVOS OUT

        return new Promise((resolve, reject) => {
            let filenamePed = 'PedC' + almacen.substring(0, 2) + '_' + cliente + fecha;
            //Cabecera del archivo para el Pedido
            let pedido = _EmptySpace.substring(0, 21) +
                (cliente + _EmptySpace).substring(0, 15) + " " +
                (almacen + _EmptySpace).substring(0, 3) + " " + plazo + "  3                    @\r\n";

            productos.forEach((art) => {
                let tc = (art.moneda == "USD") ? tipodeCambio : " 1.00";
                pedido += (art.cantidad + _EmptySpace).substring(0, 10) + " " +
                    (art.clave + _EmptySpace).substring(0, 15) + "   " +
                    (art.precioFinal + _EmptySpace).substring(0, 14) + "16.00  0.00  " + (tc + _EmptySpace).substring(0, 5) + "     @\r\n";
            });

            let pedidoCreado = {
                rutaIn: rutaIn,
                rutaOut: rutaOut,
                filename: filenamePed,
                txt: pedido
            }

            return resolve(pedidoCreado)
        });
    },

    //crear el archivo TXT para el intercambio de documento con MacroPro
    crearArchivos: (archivo) => {
        // console.log(JSON.stringify(archivo, undefined, 2))
        // console.log(archivo.rutaIn + archivo.filename)
        return new Promise((resolve, reject) => {
            fs.writeFile(archivo.rutaIn + archivo.filename + ".txt", archivo.txt, (error) => {
                if (error) {
                    console.log('>>>>>>>>>>>>>>> Error creando archivo: ' + error);
                    //Acceso denegado
                    return reject(codigo.mensaje('503.2', 'MP: Acceso denegado (CA)'));
                } else {
                    console.log('=============== Archivo creado: ' + archivo.filename + '.txt')

                    return resolve(archivo)
                }
            });
        });
    },

    //Buscar la respuesta (XML) del pedido procesado por MacroPro
    buscarXML: (objeto) => {
        console.log(JSON.stringify(objeto, undefined, 2))
        let inicio = Date.now()
        let rutaIn = objeto.rutaIn;
        let rutaOut = objeto.rutaOut;
        let filename = objeto.filename;

        return new Promise((resolve, reject) => {
            let contador = 0;
            setInterval(function () {
                contador++;

                let promesa = new Promise((resolve, reject) => {
                    fs.readFile(rutaIn + filename + '.xml', 'utf8', (error, data) => {
                        if (error) {
                            return reject(error);
                        }
                        console.log(data)
                        parser.parseString((data), (error, result) => {
                            if (error) {
                                return reject(error);
                            }
                            console.log('=============== Archivo encontrado: ' + filename + '.xml')

                            console.log(JSON.stringify(result, null, 2))
                            if (exists(rutaIn + filename + '.txt')) {
                                //Movemos el archivo TXT si MacroPro no lo realizo
                                console.log('>>>>>>>>>>>>>>> #1 Moviendo archivo: ' + filename + '.txt (MacroPro no pudo moverlo)')
                                local.moverArchivos({ rutaIn: rutaIn, rutaOut: rutaOut, filename: filename + '.txt' })
                                    .then((resultado) => {
                                        console.log('>>>>>>>>>>>>>>> #2 OK, archivo: ' + filename + '.txt movido (MacroPro no pudo moverlo)')
                                    })
                                    .catch((error) => {
                                        console.log('>>>>>>>>>>>>>>> #3 NOK, archivo: ' + filename + '.txt (MacroPro lo pudo mover)')
                                    });
                            }

                            // funcion para crear una copia para analisis y pruebas
                            // local.crearCopiaTXT(objeto)
                            //     .then((copiaFile) => {
                            //         return local.buscarCopiaXML(copiaFile)
                            //     })
                            //     .then((copiaXml) => {
                            //         if (copiaXml.filename.split('.')[1] == 'xml') {
                            //             local.moverCopiaArchivos(copiaXml)
                            //         }
                            //     })
                            try{
                                console.log('================================================================================================')
                                console.log(rutaIn + filename + '.xml')
                                console.log(fs.readFileSync(rutaIn + filename + '.xml'))
                                console.log('================================================================================================')
                            }catch(e){
                                
                            }
                            console.log('ORIGINAL: ' + result.Documento.Venta[0].Folio)
                            return resolve({
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
                    local.log(Object.assign(objeto, {error: false, intento: contador, tiempo: Date.now() - inicio, fecha: (new Date())}))
                    return resolve(resultado);
                }).catch((error) => {
                    console.log('***** Intento ' + contador)
                    if (contador >= 300) {
                        clearInterval(this);
                        local.log(Object.assign(objeto, {error: true, intento: contador, tiempo: Date.now() - inicio, fecha: (new Date())}))
                        //Archivo no procesado                            
                        console.log('>>>>>>>>>>>>>>> Error buscando archivo: ' + filename + '.xml')
                        return resolve({
                            error: codigo.mensaje('503.1', 'MP: Servicio no disponible (BA)'),
                            rutaIn: rutaIn,
                            rutaOut: rutaError,
                            filename: filename + '.txt'
                        });
                    }
                })

            }, 200);

        });
    },

    //Mover los archivos segun la respuesta o error
    moverArchivos: (archivo) => {
        // console.log(JSON.stringify(archivo, undefined, 2))
        return new Promise((resolve, reject) => {
            fs.exists(archivo.rutaIn + archivo.filename, (exists) => {
                if (exists) {
           // if(existsSync(archivo.rutaIn + archivo.filename)) {
                    fs.move(archivo.rutaIn + archivo.filename,
                        archivo.rutaOut + archivo.filename, (error) => {
                            if (error) {
                                console.log(error)
                                console.log('>>>>>>>>>>>>>>> Error moviendo archivo: ' + archivo.filename)
                                //Acceso denegado
                                return reject(codigo.mensaje('503.0', 'MP: Acceso denegado (MA) inside if'));
                            }
                            // console.log('Archivo movido: ' + archivo.filename)                            
                            return resolve(archivo);
                        });
                }
                else {
                    console.log('>>>>>>>>>>>>>>> Archivo no encontrado, no se movio: ' + archivo.filename)
                    return reject(codigo.mensaje('503.0', 'MP: Acceso denegado (MA) outside if'));
                }
            });
        });
    },

    //Orden de las respuestas del proceso de pedido
    ordenarRespuesta: (resultado) => {
        // console.log(JSON.stringify(resultado, undefined, 2))
        return new Promise((resolve, reject) => {
            if (resultado.file) {
                let jsonRespuesta = {
                    tipo: resultado.file.Documento.Venta[0].Tipo[0],
                    folio: resultado.file.Documento.Venta[0].Folio[0]
                }
                return resolve(jsonRespuesta)
            }
            return reject(resultado.error)
        });
    },

    validarEstructura: (objDatos) => {
        // console.log(JSON.stringify(objDatos, undefined, 2))
        return new Promise((resolve, reject) => {
            let valido = true;
            // VALIDAR LAS PROPIEDADES DE PRIMER NIVEL EN EL OBJETO 
            if (!objDatos.fecha || !objDatos.detalle || !objDatos.encabezado) {
                valido = false;
                //VALIDAR CONTENIDO EN PRODUCTOS ARRAY
            } else if (!objDatos.detalle.producto || objDatos.detalle.producto.length == 0) {
                valido = false;
            } else {
                // VALIDAR LAS PROPIEDADES DEL ENCABEZADO
                if (!objDatos.encabezado.cliente || objDatos.encabezado.cliente === "undefined" || typeof objDatos.encabezado.cliente === "undefined") { valido = false; }
                if (!objDatos.encabezado.almacen || objDatos.encabezado.almacen === "undefined" || typeof objDatos.encabezado.almacen === "undefined") { valido = false; }
                if (!objDatos.encabezado.tipodecambio || objDatos.encabezado.tipodecambio === "undefined" || typeof objDatos.encabezado.tipodecambio === "undefined") { valido = false; }
                if (!objDatos.encabezado.iva || objDatos.encabezado.iva === "undefined" || typeof objDatos.encabezado.iva === "undefined") { valido = false; }
                if (!objDatos.encabezado.plazo || objDatos.encabezado.plazo === "undefined" || typeof objDatos.encabezado.plazo === "undefined") { valido = false; }

                // VALIDAR LAS PROPIEDADES DEL ARRAY DE PRODUCTOS
                objDatos.detalle.producto.forEach((producto) => {
                    if (!producto.clave || producto.clave === "undefined" || typeof producto.clave === "undefined") { valido = false; }
                    if (!producto.precioFinal || producto.precioFinal === "undefined" || typeof producto.precioFinal === "undefined") { valido = false; }
                    if (!producto.precio || producto.precio === "undefined" || typeof producto.precio === "undefined") { valido = false; }
                    if (!producto.cantidad || producto.cantidad === "undefined" || typeof producto.cantidad === "undefined") { valido = false; }
                    if (!producto.moneda || producto.moneda === "undefined" || typeof producto.moneda === "undefined") { valido = false; }
                });
            }

            if (valido) {
                return resolve(objDatos);
            } else {
                console.error('ESTRUCTURA DEL PEDIDO NO VALIDANDA')

                let registroError = {
                    rutaIn: rutaError + "estructura/",
                    filename: new Date().getTime() + "_" + objDatos.encabezado.cliente,
                    txt: JSON.stringify(objDatos, undefined, 2)
                }

                local.crearArchivos(registroError).then((result) => {
                    return reject(codigo.mensaje('400.0', 'verifique los datos enviados.'));
                }).catch((error) => {
                    return reject(codigo.mensaje('400.0', 'verifique los datos enviados.'));
                })
            }
        });
    },

    //////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////COPIAS PARA PRUEBAS/////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////


    //crear el archivo TXT para el intercambio de documentos con MacroPro en un servidor diferente
    crearCopiaTXT: (archivo) => {
        // console.log(JSON.stringify(archivo, undefined, 2))
        archivo.rutaIn = '/datos/webpageQ/in/';
        archivo.rutaOut = '/datos/webpageQ/out/';
        return new Promise((resolve, reject) => {
            fs.writeFile(archivo.rutaIn + archivo.filename + ".txt", archivo.txt, (error) => {
                if (error) {
                    console.error('>>>>>>>>>>>>>>> (COPIA) Error creando archivo: ' + error);
                    //Acceso denegado
                    return resolve(codigo.mensaje('503.2', 'MP: Acceso denegado (CA)'));
                } else {
                    console.log('=============== (COPIA) Archivo creado: ' + archivo.filename + '.txt')
                    return resolve(archivo)
                }
            });
        });
    },

    //Buscar la respuesta (XML) del pedido procesado por MacroPro
    buscarCopiaXML: (objeto) => {
        // console.log(JSON.stringify(objeto, undefined, 2))
        let rutaIn = objeto.rutaIn;
        let rutaOut = objeto.rutaOut;
        let filename = objeto.filename;

        return new Promise((resolve, reject) => {
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
                            console.log('=============== Archivo encontrado: ' + filename + '.xml')

                            if (exists(rutaIn + filename + '.txt')) {
                                //Movemos el archivo TXT si MacroPro no lo realizo
                                console.log('>>>>>>>>>>>>>>> #1 Moviendo archivo: ' + filename + '.txt (MacroPro no pudo moverlo)')
                                local.moverArchivos({ rutaIn: rutaIn, rutaOut: rutaOut, filename: filename + '.txt' })
                                    .then((resultado) => {
                                        console.log('>>>>>>>>>>>>>>> #2 OK, archivo: ' + filename + '.txt movido (MacroPro no pudo moverlo)')
                                    })
                                    .catch((error) => {
                                        console.error('>>>>>>>>>>>>>>> #3 NOK, archivo: ' + filename + '.txt (MacroPro lo pudo mover)')
                                    });
                            }

                            //funcion para crear una copia para analisis y pruebas
                            // local.crearCopiaTXT(objeto);
                            console.log('COPIA: ' + result.Documento.Venta[0].Folio)
                            return resolve({
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
                    console.log('***** (COPIA) Intento ' + contador)
                    if (contador == 50) {
                        clearInterval(this);
                        //Archivo no procesado                            
                        console.error('>>>>>>>>>>>>>>> (COPIA) Error buscando archivo: ' + filename + '.xml')
                        return resolve({
                            error: codigo.mensaje('503.1', 'MP: Servicio no disponible (BA)'),
                            rutaIn: rutaIn,
                            rutaOut: rutaIn + 'errores/',
                            filename: filename + '.txt'
                        });
                    }
                })

            }, 200);

        });
    },

    //Mover los archivos segun la respuesta o error
    moverCopiaArchivos: (archivo) => {
        // console.log(JSON.stringify(archivo, undefined, 2))
        return new Promise((resolve, reject) => {
          fs.exists(archivo.rutaIn + archivo.filename, (exists) => {
                if (exists) {
               // if(existsSync(archivo.rutaIn + archivo.filename)) {
                    fs.move(archivo.rutaIn + archivo.filename,
                        archivo.rutaOut + archivo.filename, (error) => {
                            if (error) {
                                console.error('>>>>>>>>>>>>>>> (COPIA) Error moviendo archivo: ' + archivo.filename)
                                //Acceso denegado
                                return reject(codigo.mensaje('503.0', 'MP: Acceso denegado (MA)'));
                            }
                            // console.log('Archivo movido: ' + archivo.filename)                            
                            return resolve(archivo);
                        });
                }
                else {
                    console.error('>>>>>>>>>>>>>>> (COPIA) Archivo no encontrado, no se movio: ' + archivo.filename)
                    return reject(codigo.mensaje('503.0', 'MP: Acceso denegado (MA)'));
                }
            });
        });
    },

    log(data){
        let fs = require('fs-extra')
        let file = __dirname + '/../../../API_Privada_Pedidos_log.json'
        console.log(file)
        if(!fs.existsSync(file)){
            fs.writeFileSync(file, '')
        }
        fs.appendFileSync(file, JSON.stringify(data, null, 2) + ',\n')
    }
};