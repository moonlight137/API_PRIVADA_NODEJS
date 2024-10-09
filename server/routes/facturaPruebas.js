const express = require('express');
const router = express.Router();

const login = require('../middleware/authenticate');
const factura = require('../modules/facturaPruebas');
const funcion = require('../utils/funciones');

//POST /factura/bajoDemanda 
router.post('/bajoDemanda', login.authenticate, (req, res) => {
    let pedido = req.body.facturar;
    let folioPedido = pedido.encabezado.folio;
    let cliente = pedido.encabezado.cliente;
    let productos = pedido.productos
    let resultadoFinal;
    pedido.errorRemision = false;

    // console.log(pedido)
    factura.crearOrdenes(pedido)
        .then((ordenesCreadas) => {
            // console.log(10);
            return factura.crearArchivos({ documentos: ordenesCreadas })
        })
        .then((documentos) => {
            // console.log(11);
            return factura.buscarXML(documentos);
        })
        .then((archivos) => {
            // console.log(12);
            return factura.moverArchivos(archivos);
        })
        .then((resultadoRemision) => {

            resultadoRemision.forEach((remision) => {
                if (remision.errorRemision) {
                    pedido.errorRemision = remision.errorRemision;
                }
            })

            resultadoFinal = resultadoRemision;
            resultadoFinal.folioPedido = folioPedido;

            // console.log('Final REMISION ', JSON.stringify(resultadoFinal, undefined, 2));

            if (!pedido.errorRemision) {
                return factura.crearFactura(pedido)
                    .then((facturaCreada) => {
                        // console.log(facturaCreada);
                        return factura.crearArchivos({ documentos: [facturaCreada] })
                    })
                    .then((documento) => {
                        return factura.buscarXML(documento);
                    })
                    .then((archivo) => {
                        return factura.moverArchivos(archivo);
                    })
                    .then((resultadoFactura) => {
                        resultadoFinal.push(resultadoFactura[0]);
                        // console.log('Final FACTURA: ', JSON.stringify(resultadoFinal, undefined, 2));
                        return factura.ordenarRespuestas(resultadoFinal)
                    })
            } else {
                return factura.crearFactura(pedido)
                    .then((facturaCreada) => {
                        return factura.crearArchivos({ documentos: [facturaCreada] })
                    })
                    .then((documento) => {
                        documento = documento[0];
                        // console.log(documento)                      
                        resultadoFinal.push({
                            error: true,
                            // errorMensaje: `NO SE ENCONTRO EL ARCHIVO: ${documento.filename}.xml`,
                            errorMensaje: (documento.filename.substring(0, 4) == 'Fact') ? `PROCESAR FACTURA MANUALMENTE ARCHIVO: ${documento.filename}.xml` : `RE-PROCESAR REMISION ARCHIVO: ${documento.filename}.xml`,
                            rutaIn: documento.rutaIn,
                            rutaOut: documento.rutaOut,
                            filename: documento.filename + '.txt'
                        })
                        return factura.ordenarRespuestas(resultadoFinal);
                    })
            }
        })
        .then((respuesta) => {
            delete respuesta.facturacion.jsonDoc;
            // console.log('RESPUESTA:\n', JSON.stringify(respuesta, undefined, 2));
            res.status(200).send(respuesta)
        })
        .catch((error) => {
            console.log('ERROR CATCH (RF): ' + JSON.stringify(error, undefined, 2))
            funcion.guardarLog(error)
            res.status(503).send({
                errorCode: 503,
                errorMensaje: 'Error general en el proceso de facturacion'
            });
        })


});

router.post('/refacturar', login.authenticate, (req, res) => {
    let fileNames = req.body.archivos;
    let pedido = req.body.pedido;
    let filesCompras;
    let filesFactura;
    pedido.errorRemision = false;
    let resultadoFinal;

    factura.reestructuraCompras(fileNames)
        .then((archivos) => {
            filesCompras = archivos;
            return factura.mueveArchivo(archivos);
        }).then((respuestas) => {
            return factura.buscarXML(filesCompras);
        }).then((archivos) => {
            return factura.moverArchivos(archivos);
        }).then((remisiones) => {

            remisiones.forEach((remision) => {
                if (remision.errorRemision) {
                    pedido.errorRemision = remision.errorRemision;
                }
            });

            resultadoFinal = resultadoRemision;
            resultadoFinal.folioPedido = pedido;

            if (!pedido.errorRemision) {
                return factura.reestructuraFacturas(fileNames)
                    .then((resultado) => {
                        filesFactura = resultado;
                        return factura.mueveArchivo(filesFactura);
                    }).then((resultado) => {
                        return factura.buscarXML(filesFactura);
                    }).then((archivo) => {
                        return factura.moverArchivos(archivo);
                    }).then((resultadoFactura) => {
                        resultadoFinal.push(resultadoFactura[0]);
                        return factura.ordenarRespuestas(resultadoFinal);
                    });
            } else {
                return factura.ordenarRespuestas(resultadoFinal);
            }
        }).then((result) => {
            delete result.facturacion.jsonDoc;
            res.status(200).send(result)
        }).catch((error) => {
            // console.log('ERROR CATCH (RF): ' + JSON.stringify(error, undefined, 2))
            funcion.guardarLog(error)
            res.status(503).send({
                'errorCode': 503,
                'errorMensaje': 'Error general en el proceso de facturacion'
            });
        });
});

router.post('/timbrado', login.authenticate, (req, res) => {
    let objArchivo = (req.body.txt && req.body.nombre) ? { txt: req.body.txt, filename: req.body.nombre } : null;

    factura.crearFacturaTimbrar(objArchivo)
        .then((respuesta) => {
            res.status(200).send(req.body)
        }).catch((error) => {
            res.status(503).send({
                'errorCode': 503,
                'errorMensaje': 'Error general en el proceso de timbrado'
            });
        });
});

module.exports = router;
