const express = require('express');
const router = express.Router();

const login = require('../middleware/authenticate');
const factura = require('../modules/factura');
const remision = require('../modules/remision');
const funcion = require('../utils/funciones');
const utils = require('../utils/archivo')
const printer = require('../modules/Printer');
const registerLog = require('../modules/LogPedidos');

router.post('/', login.authenticate, (req, res) => {
    let pedido = req.body.facturar;

    factura.formarTxt(pedido)
        .then((facturasCreadas) => {
            return utils.crearArchivos({ documentos: [facturasCreadas] })
        })
        .then((documentos) => {
            return utils.buscarXML(documentos);
        })
        .then((archivos) => {
            return utils.moverArchivos(archivos);
        })
        .then((respuestaFactura) => {
            return factura.ordenarFactura(respuestaFactura);
        })
        .then((resultadoRemision) => {
            res.status(200).send(resultadoRemision)
        })
        .catch((error) => {
            console.log('# # # # # ERROR FACTURA\n', error)
            res.status(503).send({
                errorCode: 503,
                errorMensaje: 'Error general en el proceso de facturas'
            });
        })
})

router.post('/proveedor', login.authenticate, (req, res) => {
    let pedido = req.body.facturar;

    remision.formarTxt(pedido)
        .then((facturasCreadas) => {
            // console.log(facturasCreadas)
            return utils.crearArchivos({ documentos: facturasCreadas })
        })
        .then((documentos) => {
            // console.log(documentos)
            return utils.buscarXML(documentos);
        })
        .then((archivos) => {            
            return utils.moverArchivos(archivos);
        })
        .then((respuestaFactura) => {            
            return factura.ordenarFacturaProveedor(respuestaFactura);
        })
        .then((resultadoRemision) => {
            res.status(200).send(resultadoRemision)
        })
        .catch((error) => {
            console.log('# # # # # ERROR FACTURA\n', error)
            res.status(503).send({
                errorCode: 503,
                errorMensaje: 'Error general en el proceso de facturas'
            });
        })
})

//POST /factura/bajoDemanda 
router.post('/bajoDemanda', login.authenticate, (req, res) => {
    let pedido = req.body.facturar;
    //let folioPedido = pedido.encabezado.folio;
    let cliente = pedido.encabezado.cliente;
    let productos = pedido.productos
    let resultadoFinal;
    pedido.errorRemision = false;

    let folioPedido  = pedido.encabezado ? (pedido.encabezado.folio ? pedido.encabezado.folio : false) : (pedido.folio ? pedido.folio : false)
   
    let setPedido = pedido
    let Log = "CrearOrdenes"

   

    factura.crearOrdenes(pedido)
        .then((ordenesCreadas) => {
            setPedido["Validate"] = "Creación de ordenes de compra"
             registerLog.RegistrarLogFacturacion(folioPedido, setPedido, Log, "Clave de Operación: 033 -", null, null, null, null, (success)=> {
                 console.log(JSON.stringify(success))
                         }) 

            return factura.crearArchivos({ documentos: ordenesCreadas })
        }) 
        .then((documentos) => {
             setPedido["Validate"] = "Creación de archivos ordenes/remisión "
             Log = "CrearArchivosRemision"
        
            
                registerLog.RegistrarLogFacturacion(folioPedido, setPedido, Log, "Clave de Operación: 033 -", null, null, null, null, (success)=> {

                console.log(JSON.stringify(success))
                        }) 

            return factura.buscarXML(documentos);
        })
        .then((archivos) => {
            setPedido["Validate"] = "BuscarXML de compra/remisión "
             Log = "buscarXMLRemision"
        
            
                registerLog.RegistrarLogFacturacion(folioPedido, setPedido, Log, "Clave de Operación: 033 -", null, null, null, null, (success)=> {

                console.log(JSON.stringify(success))
                        }) 
            return factura.moverArchivos(archivos);
        })
        .then((resultadoRemision) => {

            setPedido["Validate"] = "Mover Archivos de Compras/in al Compras/out" 
             Log = "MoverArchivosRemision"
        
            
                registerLog.RegistrarLogFacturacion(folioPedido, setPedido, Log, "Clave de Operación: 033 -", null, null, null, null, (success)=> {

                console.log(JSON.stringify(success))
                        }) 

            resultadoRemision.forEach((remision) => {
                if (remision.errorRemision) {
                    pedido.errorRemision = remision.errorRemision;
                }
            })

            resultadoFinal = resultadoRemision;
            resultadoFinal.folioPedido = folioPedido;

         
            setPedido["Validate"] = "Generación de ordenes de compra/remisión"
            setPedido["CompraRemision"] = resultadoFinal
             Log = "CompraRemision"
        
            
                registerLog.RegistrarLogFacturacion(folioPedido, setPedido, Log, "Clave de Operación: 033 -", null, null, null, null, (success)=> {

                console.log(JSON.stringify(success))
                        }) 

            if (!pedido.errorRemision) {
              
                let remision = resultadoRemision ? (resultadoRemision[0].file.Documento.Compra[0].Folio[0] ? resultadoRemision[0].file.Documento.Compra[0].Folio[0]: "") : ""
               
               
               setPedido["Validate"] = "Se creo remisión correctamente"
               setPedido["Remision"] = remision
                        Log = "GuardarRemision"
    
                registerLog.RegistrarLogFacturacion(folioPedido, setPedido, Log, "Clave de Operación: 033 -", null, remision, null, null, (success)=> {
                console.log(JSON.stringify(success))
            })

                return factura.crearFactura(pedido)
                    .then((facturaCreada) => {
                      
                        setPedido["Validate"] = "Creación de factura"
                        Log = "CrearFactura"
    
                            registerLog.RegistrarLogFacturacion(folioPedido, setPedido, Log, "Clave de Operación: 033 -", null, null, null, true, (success)=> {

                console.log(JSON.stringify(success))
              
                        }) 
                        return factura.crearArchivos({ documentos: [facturaCreada] })
                    })
                    .then((documento) => {
                       
                        setPedido["Validate"] = "Crear Archivos de facturación"
                        Log = "CrearArchivosFactura"
        
            
                                      registerLog.RegistrarLogFacturacion(folioPedido, setPedido, Log, "Clave de Operación: 033 -", null, null, null, null, (success)=> {

                        console.log(JSON.stringify(success))
                        }) 
                        return factura.buscarXML(documento);
                    })
                    .then((archivo) => {
                  
                        setPedido["Validate"] = "BuscarXML de compra/remisión "
             Log = "buscarXMLFactura"
        
            
                          registerLog.RegistrarLogFacturacion(folioPedido, setPedido, Log, "Clave de Operación: 033 -", null, null, null, null, (success)=> {

                console.log(JSON.stringify(success))
                        }) 
                        return factura.moverArchivos(archivo);
                    })
                    .then((resultadoFactura) => {
                        setPedido["Validate"] = "Mover Archivos de Compras/in al Compras/out "
                        setPedido["Facturacion"] = resultadoFactura
                Log = "MoverArchivosFactura"
        
            
                          registerLog.RegistrarLogFacturacion(folioPedido, setPedido, Log, "Clave de Operación: 033 -", null, null, null, null, (success)=> {

                console.log(JSON.stringify(success))
                        }) 
                       
                        resultadoFinal.push(resultadoFactura[0]);
                        // console.log('Final FACTURA: ', JSON.stringify(resultadoFinal, undefined, 2));
                        return factura.ordenarRespuestas(resultadoFinal)
                    })
            } else {
             

                setPedido["Validate"] = "Error en Remision"
                setPedido["ErrorRemision"] = pedido.errorRemision
                Log = "ErrorRemision"
               
                
               
                registerLog.RegistrarLogFacturacion(folioPedido, setPedido, Log, "Clave de Operación: 033R -", null, null, null, null,  (success)=> {                
                    console.log(JSON.stringify(success))

                            }) 
                return factura.crearFactura(pedido)
                    .then((facturaCreada) => { 
                        setPedido["Validate"] = "CrearFactura"
                        setPedido["CrearFactura"] = facturaCreada
                        Log = "CrearFactura"
               
                
               
                registerLog.RegistrarLogFacturacion(folioPedido, setPedido, Log, "Clave de Operación: 033R -", null, null, null, null,  (success)=> {                
                    console.log(JSON.stringify(success))

                            }) 

                    
                        return factura.crearArchivos({ documentos: [facturaCreada] })
                    })
                    .then((documento) => { 
                        setPedido["Validate"] = "Crear Archivos Factura"
                        Log = "CrearArchivosFactura"
               
                
               
                registerLog.RegistrarLogFacturacion(folioPedido, setPedido, Log, "Clave de Operación: 033R -", null, null, null, null,  (success)=> {                
                    console.log(JSON.stringify(success))

                            }) 
                     
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
        
        
          //  let respuestaError = respuesta ? (respuesta.facturacion ? (respuesta.facturacion.folios ? (respuesta.facturacion.folios.factura ? respuesta.facturacion.folios.factura : ""):  "") : "") : ""
          let respuestaError = respuesta ? (respuesta.facturacion ? (respuesta.facturacion.folios ? (respuesta.facturacion.folios.factura ? respuesta.facturacion.folios.factura : false): false) : false) : false
          //Reespuesta de facturacion
          
          let factura = respuesta

            if(respuestaError){
            setPedido["Validate"] = "Factura creada "
            setPedido["FacturaRemision"] = respuesta
            Log = "GuardarFactura"
           
            

            
            registerLog.RegistrarLogFacturacion(folioPedido, setPedido, Log, "Clave de Operación: 033 -", null, null, factura, null,  (success)=> {                
                console.log(JSON.stringify(success))
                        }) 
            }else{
                setPedido["Validate"] = "Error Factura"
            setPedido["FacturaRemision"] = respuesta
            setPedido["Error"] = true
            Log = "ErrorFactura"
           
            
         
           
            registerLog.RegistrarLogFacturacion(folioPedido, setPedido, Log, "Clave de Operación: 033 -", null, null, factura, null,  (success)=> {                
                console.log(JSON.stringify(success))
                        }) 
            }
            delete respuesta.facturacion.jsonDoc;
            // console.log('RESPUESTA:\n', JSON.stringify(respuesta, undefined, 2));          
            res.status(200).send(respuesta)
        })
        .catch((error) => {
            console.log('ERROR CATCH (/BajoDemanda): ' + JSON.stringify(error, undefined, 2))
            funcion.guardarLog(error)
            res.status(503).send({
                errorCode: 503,
                errorMensaje: 'Error general en el proceso de facturacion'
            });
        })

});

router.post('/refacturar', login.authenticate, (req, res) => {
    let filenames = req.body.archivos;
    let pedido = req.body.pedido;
    let remisiones = [];
    let facturas = [];
    let errorRemision = false;

    factura.reestructuracionArchivos(filenames)
        .then((archivos) => {
            archivos.forEach((archivo) => {
                if (archivo.tipo == 'REM') {
                    remisiones.push(archivo);
                } else {
                    facturas.push(archivo);
                }
            })

            return factura.mueveArchivo(remisiones);
        }).then((remisionesBuscar) => {
            return factura.buscarXML(remisiones);
        }).then((archivosRemision) => {
            return factura.moverArchivos(archivosRemision);
        }).then((resultadoRemision) => {

            resultadoRemision.forEach((remision) => {
                if (remision.errorRemision) {
                    errorRemision = remision.errorRemision;
                }
            })
            resultadoRemision.folioPedido = pedido;
            resultadoFinal = resultadoRemision;

            // console.log('FINAL RESMISION:\n', resultadoFinal)

            if (!errorRemision) {
                return factura.mueveArchivo(facturas)
                    .then((facturasBuscar) => {
                        return factura.buscarXML(facturas);
                    })
                    .then((archivosFactura) => {
                        return factura.moverArchivos(archivosFactura);
                    })
                    .then((resultadoFactura) => {
                        resultadoFinal.push(resultadoFactura[0]);
                        // console.log('RESULTADO: \n', JSON.stringify(resultadoFinal, undefined, 2))
                        return factura.ordenarRespuestas(resultadoFinal)
                    })
            } else {
                resultadoFinal.push({
                    error: true,
                    // errorMensaje: `NO SE ENCONTRO EL ARCHIVO: ${facturas[0].filename}.xml`
                    errorMensaje: (facturas[0].filename.substring(0, 4) == 'Fact') ? `PROCESAR FACTURA MANUALMENTE ARCHIVO: ${facturas[0].filename}.xml` : `RE-PROCESAR REMISION ARCHIVO: ${facturas[0].filename}.xml`,
                })

                return factura.ordenarRespuestas(resultadoFinal)
            }
        }).then((respuesta) => {
            delete respuesta.facturacion.jsonDoc;
            // console.log('RESULTADO: \n', JSON.stringify(respuesta, undefined, 2))
            res.status(200).send(respuesta)
        }).catch((error) => {
            console.log('ERROR CATCH (/refacturar): ' + JSON.stringify(error, undefined, 2))
            funcion.guardarLog(error)
            res.status(503).send({
                'errorCode': 503,
                'errorMensaje': 'Error general en el proceso de facturacion'
            });
        });
});

router.post('/facturarPedido', login.authenticate, (req, res) => {
    let pedidos = req.body;
    let resultadoFinal = [];

    let promesas = [];
    pedidos.forEach((pedido) => {
        let promesa = new Promise((resolve, reject) => {
            pedido.facturar.errorRemision = false;
            factura.crearFactura(pedido.facturar)
                .then((facturaCreada) => {
                    return resolve(facturaCreada)
                })
                .catch((error) => {
                    return reject(error)
                })
        })
        promesas.push(promesa)
    })

    Promise.all(promesas)
        .then((facturasCreadas) => {
            let facturasTxt = { documentos: facturasCreadas }

            // facturasTxt.documentos.forEach((facturaCreada) => {
            //     facturaCreada.rutaIn = '/datos/PruebasFacturas/in/';
            //     facturaCreada.rutaOut = '/datos/PruebasFacturas/out/';
            // })

            return factura.crearArchivos(facturasTxt)
        })
        .then((documento) => {
            return factura.buscarXML(documento);
        })
        .then((archivo) => {
            return factura.moverArchivos(archivo);
        })
        .then((resultadoFactura) => {
            return factura.ordenarRespuestas(resultadoFactura)
        })
        .then((resultadoFinal) => {
            resultadoFinal = resultadoFinal.facturacion.jsonDoc.map((obj) => {
                if (obj.file) {
                    obj.folioFactura = obj.file.Documento.Venta[0].Folio[0]
                    delete obj.file
                }

                return obj
            })
            res.status(200).send(resultadoFinal)
        })
        .catch((error) => {
            console.log('ERROR CATCH (/facturarPedido): ' + JSON.stringify(error, undefined, 2))
            res.status(503).send({
                errorCode: 503,
                errorMensaje: 'Error general en el proceso de facturacion de pedidos'
            });
        })
})

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