const xml2js = require('xml2js');
const fs = require('fs-extra');
const exists = require('fs-exists-sync');

const _EmptySpace = process.vars.espacioVacio;
const _RellenoNombre = process.vars.espacioRelleno;
const archivo = require('../utils/archivo');

const parser = new xml2js.Parser({ ignoreAttrs: false, mergeAttrs: true });

const objRutas = {
    errores: {
        in: process.vars.rutas.CT.factura.error,
    },
    factura: {
        in: process.vars.rutas.CT.factura.in,
        out: process.vars.rutas.CT.factura.out
    },
    compras: {
        in: process.vars.rutas.CT.remision.in,
        out: process.vars.rutas.CT.remision.out
    },
    timbrar: {
        in: process.vars.rutas.CT.timbre.in,
        out: process.vars.rutas.CT.timbre.out
    }

}

var rutaError = objRutas.errores.in

let local = module.exports = {

    //Metodo para separar y las ordenes de compra para el intercambio de documentos
    crearOrdenes: (pedidoData) => {
        // console.log(pedidoData)
        let cliente = pedidoData.encabezado.cliente;
        let pedido = pedidoData.encabezado.folio;
        let tipodeCambio = pedidoData.encabezado.tipodecambio;
        let almacen = pedidoData.encabezado.almacen;
        let plazo = pedidoData.encabezado.plazo;
        let productos = pedidoData.productos;
        let fecha = Date.now();
        let empresasImportacion = ['MSF001']

        var rutaIn = objRutas.compras.in //RUTAS DE ARCHIVOS IN
        var rutaOut = objRutas.compras.out //RUTAS DE ARCHIVOS OUT

        return new Promise((resolve, reject) => {
            let grupos = {};
            for (let i = 0; i < productos.length; i++) {
                //EXCLUIMOS LOS PRODUCTOS INVENTARIABLES O DE CT
                let nombreGrupo = (!productos[i].empresa || productos[i].empresa == 'CT') ? undefined : productos[i].empresa;
                if (!grupos[nombreGrupo] && nombreGrupo) {
                    grupos[nombreGrupo] = [];
                }
                if (nombreGrupo) {
                    grupos[nombreGrupo].push(
                        {
                            clave: productos[i].clave,
                            cantidad: productos[i].cantidad,
                            costo: productos[i].costo,
                            moneda: productos[i].costoMoneda
                        });
                }
            }

            let ordenes = [];
            let ordenTXT;
            let filenameComp = 'Comp' + almacen + '_' + cliente + fecha;


            for (let nombreGrupo in grupos) {
                // console.log(grupos[nombreGrupo][0].precio)
                // Cabecera del archivo para Orde de Compra
                ordenTXT = _EmptySpace.substring(0, 21) +
                    (nombreGrupo + _EmptySpace).substring(0, 15) + " " +
                    (almacen + _EmptySpace).substring(0, 3) + " " + plazo + "  2                    @\r\n";

                grupos[nombreGrupo].forEach((art) => {                    
                    let iva = (empresasImportacion.indexOf(nombreGrupo) >= 0) ? '00' : '16'
                    let tc = (art.moneda == "USD") ? tipodeCambio : " 1.00";
                    ordenTXT += (art.cantidad + _EmptySpace).substring(0, 10) + " " +
                        (art.clave + _EmptySpace).substring(0, 15) + "  " +
                        (art.costo + _EmptySpace).substring(0, 15) + (iva + '.00' + _EmptySpace).substring(0, 5) + "  0.00  " + (tc + _EmptySpace).substring(0, 5) + "@\r\n";
                });
                
                // grupos[nombreGrupo].forEach((art) => {
                //     let tc = (art.moneda == "USD") ? tipodeCambio : " 1.00";
                //     ordenTXT += (art.cantidad + _EmptySpace).substring(0, 10) + " " +
                //         (art.clave + _EmptySpace).substring(0, 15) + "  " +
                //         (art.costo + _EmptySpace).substring(0, 15) + "16.00  0.00  " + (tc + _EmptySpace).substring(0, 5) + "@\r\n";
                // });

                //Rellenamos el nombre para conservar una longitud estandar en el nombre de l archivo                
                ordenes.push(
                    {
                        // cliente: cliente,
                        // pedido: pedido,
                        // empresa: nombreGrupo,
                        // productos: grupos[nombreGrupo],
                        rutaIn: rutaIn,
                        rutaOut: rutaOut,
                        filename: (filenameComp + '_' + nombreGrupo + _RellenoNombre).substring(0, 38),
                        txt: ordenTXT
                    });
            }

            //PRODUCTOS YA FILTRADOS SOLO NO INVENTARIABLES   
            // console.log(ordenes)         
            return resolve(ordenes)
            
        });
    },

    //Metodo para crear la factura para el intercambio de documentos
    crearFactura: (pedidoData) => {
        // let documentos = [];
        let cliente = pedidoData.encabezado.cliente;
        let pedido = pedidoData.encabezado.folio;
        let tipodeCambio = pedidoData.encabezado.tipodecambio;
        let tipoPago = pedidoData.encabezado.tipoPago;
        let t = (Number(tipoPago) == 99) ? "N" : "S";
        let almacen = pedidoData.encabezado.almacen;
        let plazo = pedidoData.encabezado.plazo;
        let iva = pedidoData.encabezado.iva;
        let productos = pedidoData.productos;
        let fecha = Math.floor((Math.random() * Date.now()) + 1);
        let cfdi = pedidoData.cfdi ? pedidoData.cfdi : 'G01';// Campo para la modificacion del CFDI

        var errorIn = objRutas.errores.in //RUTA DE ERRORES
        var rutaIn = objRutas.factura.in; //RUTAS DE ARCHIVOS IN
        var rutaOut = objRutas.factura.out; //RUTAS DE ARCHIVOS IN

        return new Promise((resolve, reject) => {
            let filenameFact = 'Fact' + almacen + '_' + cliente + fecha;
            //Cabecera del archivo para Factura1
            let factura = _EmptySpace.substring(0, 21) +
                (cliente + _EmptySpace).substring(0, 15) + " " +
                // (almacen + _EmptySpace).substring(0, 3) + " " + plazo + "  4                    @\r\n";                                    
                // (almacen + _EmptySpace).substring(0, 3) + " " + plazo + "  4 " + (pedido + _EmptySpace).substring(0, 11) + " " + (tipoPago + _EmptySpace).substring(0, 2) + " " + t + "   @\r\n";
                // Detalles de los nuevos cambios de CFDI
                (almacen + _EmptySpace).substring(0, 3) + " " + plazo + "  4 " + (pedido + _EmptySpace).substring(0, 11) + " " + (tipoPago + _EmptySpace).substring(0, 2) + " " + t + " " + cfdi + "@\r\n";

            productos.forEach((art) => {
                let tc = (art.moneda == "USD") ? tipodeCambio : " 1.00";
                factura += (art.cantidad + _EmptySpace).substring(0, 10) + " " +
                    (art.clave + _EmptySpace).substring(0, 15) + "   " +
                    // (art.precioFinal + _EmptySpace).substring(0, 14) + "16.00  0.00  " + (tc + _EmptySpace).substring(0, 5) + "     @\r\n";
                    (art.precioFinal + _EmptySpace).substring(0, 14) + (iva + '.00' + _EmptySpace).substring(0, 5) + "  0.00  " + (tc + _EmptySpace).substring(0, 5) + "     @\r\n";
            });

            facturaCreada = {
                folioPedido: pedido,
                rutaIn: (pedidoData.errorRemision) ? errorIn : rutaIn,
                rutaOut: (pedidoData.errorRemision) ? errorIn : rutaOut,
                filename: (filenameFact + _RellenoNombre).substring(0, 38),
                txt: factura
            }

            return resolve(facturaCreada)
        });
    },

    //crear el archivo TXT para colacarla en ruta 192.168.0.253/webpage/facturas/in/ para que MacroPro retorne una XML Folio Factura
    crearArchivos: (pedidoData) => {
         console.log(JSON.stringify(pedidoData, undefined, 2))
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
                            console.log('ARCHIVO CREADO: ' + archivo.filename + '.txt')
                            return resolve(archivo)
                        }
                    });
                });
                archivosWrite.push(promesa);
            });
            return resolve(Promise.all(archivosWrite))
        });
    },

    //Funcion para buscar la respuesta de Facturacion y Compra de MacroPro, mover los archivos XML(respuesta OK) o TXT(si hay error)
    buscarXML: (documentos) => {

        let encontrados = [];
        documentos.forEach((objeto) => {
            let rutaIn = objeto.rutaIn;
            let rutaOut = objeto.rutaOut;
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
                                console.log('=============== Archivo encontrado: ' + filename + '.xml')

                                console.log(JSON.stringify(result, null, 2))
                           

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
                        if (contador >= 150) {
                            clearInterval(this);
                            
                            return resolve({
                                folioPedido: (folioPedido) ? folioPedido : undefined,
                                errorRemision: true,
                                error: true,
                                errorMensaje: (filename.substring(0, 4) == 'Fact') ? `PROCESAR FACTURA MANUALMENTE ARCHIVO: ${filename}.txt` : `RE-PROCESAR REMISION ARCHIVO: ${filename}.txt`,
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

    },

    //Mover los archivos segun la respuesta o error
    moverArchivos: (archivos) => {
        console.log(archivos)
        let movimientos = [];
        if(archivos.length>0){
        archivos.forEach((archivo) => {
            let promesa = new Promise((resolve, reject) => {
                fs.exists(archivo.rutaIn + archivo.filename, (exists) => {
                    if (exists) {
                        let action = 'move';
                        fs[action](archivo.rutaIn + archivo.filename,
                            archivo.rutaOut + archivo.filename, (error) => {
                                if (error) {
                                    console.log('================= ERROR MOVIENDO ARCHIVO: ' + archivo.filename)
                                    return resolve();
                                }
                                // console.log('Archivo movido: ' + archivo.filename)
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
    }
        return Promise.all(movimientos);
    },

    //Orden de las respuestas del proceso de facturacion
    ordenarRespuestas: (respuestas) => {
        console.log("Estructura proceso facturacion")
        return new Promise((resolve, reject) => {
            let jsonRespuesta = {
                pedido: respuestas.folioPedido,
                facturacion: {
                    folios: {
                        factura: "",
                        remisiones: []
                    },
                    errores: [],
                    jsonDoc: respuestas
                }
            }

            // console.log(12)
            respuestas.forEach((respuesta) => {
                if (respuesta.error) {
                    jsonRespuesta.facturacion.errores.push({ mensaje: respuesta.errorMensaje })
                } else {
                    if (respuesta.file.Documento.Venta && respuesta.file.Documento.Venta[0].Tipo[0] == 'F') {
                        jsonRespuesta.facturacion.folios.factura = respuesta.file.Documento.Venta[0].Folio[0];
                    } else if (respuesta.file.Documento.Compra && respuesta.file.Documento.Compra[0].Tipo[0] == 'R') {
                        idEmpresa = respuesta.filename.split('_');
                        idEmpresa = idEmpresa[2];
                        jsonRespuesta.facturacion.folios.remisiones.push({ idEmpresa: idEmpresa, remision: respuesta.file.Documento.Compra[0].Folio[0] })
                    }
                }
            });
            return resolve(jsonRespuesta)
        });
    },

    reestructuracionArchivos: (archivos) => {
        return new Promise((resolve, reject) => {
            try {

                let rutaInFac = objRutas.factura.in; //RURA FACTURAS IN
                let rutaOutFac = objRutas.factura.out; //RURA FACTURAS OUT

                let rutaInCom = objRutas.compras.in; //RURA COMPRAS IN
                let rutaOutCom = objRutas.compras.out; //RURA COMPRAS OUT

                lstArchivos = [];

                archivos.forEach(nombreArchivo => {
                    let bolFactura = nombreArchivo.includes("Fact");
                    let bolCompra = nombreArchivo.includes("Comp");
                    let objArchivo = {}

                    if (bolFactura) {
                        objArchivo = {
                            tipo: 'FAC',
                            rutaIn: rutaInFac,
                            rutaOut: rutaOutFac,
                            filename: nombreArchivo.substring(0, nombreArchivo.length - 4),
                            rutaError: rutaError
                        }
                    } else if (bolCompra) {
                        objArchivo = {
                            tipo: 'REM',
                            rutaIn: rutaInCom,
                            rutaOut: rutaOutCom,
                            filename: nombreArchivo.substring(0, nombreArchivo.length - 4),
                            rutaError: rutaError
                        }
                    }
                    lstArchivos.push(objArchivo);
                });

                return resolve(lstArchivos);

            } catch (error) {
                return reject(error);
            }
        });
    },

    mueveArchivo: (archivos) => {
        return new Promise((resolve, reject) => {
            let promesas = [];

            archivos.forEach(objArchivo => {
                let promesa = new Promise((resolve, reject) => {
                    archivo.mover_archivo(objArchivo.rutaError + objArchivo.filename + '.txt', objArchivo.rutaIn + objArchivo.filename + '.txt')
                        .then((resultado) => {
                            return resolve(resultado)
                        })
                        .catch((error) => {
                            return resolve(error)
                        });
                });

                promesas.push(promesa);
            });

            return resolve(Promise.all(promesas));
        });
    },

    //crear el archivo TXT para colacarla en ruta 192.168.0.253/masfactura/ para que MacroPro timbre la factura TXT
    crearFacturaTimbrar: (objArchivo) => {
        // console.log(JSON.stringify(objArchivo, undefined, 2))
        return new Promise((resolve, reject) => {

            fs.writeFile(objRutas.timbrar.in + objArchivo.filename + ".txt", objArchivo.txt, (error) => {
                if (error) {
                    console.log('================= ERROR CREACION ARCHIVO: ' + error);
                    return reject('Error en la creacion de archivo: ' + objArchivo.filename)
                } else {
                    console.log('ARCHIVO CREADO: ' + objArchivo.filename + '.txt')
                    return resolve(objArchivo)
                }
            });

        });
    },

    formarTxt: (pedidoData) => {
        console.log("Esta es mi pedidoData ", pedidoData)
        return new Promise((resolve, reject) => {
            let pedido = pedidoData.encabezado.folio;
            let tipoPago = pedidoData.encabezado.tipoPago;
            let t = (Number(tipoPago) == 99) ? "N" : "S";

            let adicionales = (pedidoData.adicionales) ? pedidoData.adicionales : undefined;
            let clienteMs = (pedidoData.clienteMs) ? pedidoData.clienteMs : undefined;
            let cliente = pedidoData.encabezado.cliente;
            let tipodeCambio = pedidoData.encabezado.tipodecambio;
            let almacen = pedidoData.encabezado.almacen;
            let plazo = pedidoData.encabezado.plazo;
            let productos = pedidoData.productos;
            let cfdi = pedidoData.cfdi ? pedidoData.cfdi : 'G01';// Campo para la modificacion del CFDI

            let fecha = Math.floor((Math.random() * Date.now()) + 1);
            let rutaIn, rutaOut, filename;

            if (Object.keys(process.vars.rutas).indexOf(clienteMs) >= 0) {
                rutaIn = process.vars.rutas[clienteMs].factura.in
                rutaOut = process.vars.rutas[clienteMs].factura.out
                rutaError = process.vars.rutas[clienteMs].factura.error
                filename = process.vars.rutas[clienteMs].factura.prefijo + almacen + '_' + cliente + fecha;
            } else {
                rutaIn = process.vars.rutas.CT.factura.in
                rutaOut = process.vars.rutas.CT.factura.out
                rutaError = process.vars.rutas.CT.factura.error
                filename = process.vars.rutas.CT.factura.prefijo + almacen + '_' + cliente + fecha;
            }

            //Cabecera del archivo para Factura
            let factura = _EmptySpace.substring(0, 21) +
                (cliente + _EmptySpace).substring(0, 15) + " " +
                // (almacen + _EmptySpace).substring(0, 3) + " " + plazo + "  4 " + (pedido + _EmptySpace).substring(0, 11) + "        @\r\n";             
                (almacen + _EmptySpace).substring(0, 3) + " " + plazo + "  4 " + (pedido + _EmptySpace).substring(0, 11) + " " + (tipoPago + _EmptySpace).substring(0, 2) + " " + t + " " + cfdi + "@\r\n";

            productos.forEach((art) => {
                let tc = (art.moneda == "USD") ? tipodeCambio : " 1.00";
                factura += (art.cantidad + _EmptySpace).substring(0, 10) + " " +
                    (art.clave + _EmptySpace).substring(0, 15) + "   " +
                    (art.precioFinal + _EmptySpace).substring(0, 14) + "16.00  0.00  " + (tc + _EmptySpace).substring(0, 5) + "     @\r\n";
            });

            if (adicionales) {
                Object.keys(adicionales).forEach((item) => {
                    factura += _EmptySpace.substring(0, 11) + adicionales[item] + "\r\n";
                })
            }

            filenameFact = (filename + _RellenoNombre).substring(0, 38);

            facturaCreada = {
                folioPedido: pedido,
                rutaIn: rutaIn,
                rutaOut: rutaOut,
                rutaError: rutaError,
                filename: filenameFact,
                txt: factura
            }

            return resolve(facturaCreada)
        });
    },

    ordenarFactura: (objDatos) => {
        // console.log(objDatos)
        objDatos = objDatos[0]
        objDatos = {
            folioPedido: objDatos.folioPedido,
            folioFactura: (!objDatos.error) ? objDatos.file.Documento.Venta[0].Folio[0] : undefined,
            error: (objDatos.error) ? true : undefined,
        }
        return objDatos;
    },

    //Ordenamos la respuesta del proceso de remision 
    ordenarFacturaProveedor: (objDatos) => {
        console.log(JSON.stringify(objDatos, undefined, 2))
        objDatos = objDatos[0]
        objDatos = {
            folioPedido: objDatos.folioPedido,
            folioFacturaProveedor: (!objDatos.error) ? objDatos.file.Documento.Compra[0].Folio[0] : undefined,
            error: (objDatos.error) ? true : undefined,
        }
        return objDatos;
    }
};

