const express = require('express');
const router = express.Router();

const login = require('../middleware/authenticate');
const funcion = require('../utils/funciones');
const pedido = require('../modules/pedido');
const printer = require('../modules/Printer');
const registerLog = require('../modules/LogPedidos');
const xml2js = require('xml2js');
const fs = require('fs-extra');
const exists = require('fs-exists-sync');

//POST /pedido
router.post('/', login.authenticate, (req, res) => {
    req.setTimeout(300000)
    let pedidoJSON = req.body.pedido;
    let idPedido  = pedidoJSON.encabezado ? (pedidoJSON.encabezado.idPedido ? pedidoJSON.encabezado.idPedido : false) : (pedidoJSON.idPedido ? pedidoJSON.idPedido : false)
    let setPedido = pedidoJSON 
    let Log = "CrearPedido"
    let traza = {};

    pedido.validarEstructura(pedidoJSON)
        .then((pedidoValido) => {
            return pedido.crearPedido(pedidoValido)
        })
        .then((pedidoCreado) => {
            traza.crearPedido = pedidoCreado;
            setPedido["Validate"] = "El pedido se creó exitosamente"
            setPedido["CrearPedido"] = pedidoCreado

             Log = "CrearPedido"
        
            
             registerLog.RegistrarLogPedido(idPedido, setPedido, Log, "Clave de Operación: 033 -", null, null, null, null, (success)=> {
                console.log(JSON.stringify(success))
                        }) 
            return pedido.crearArchivos(pedidoCreado);
        })
        .then((documento) => {
            traza.crearArchivos = documento;
            setPedido["Validate"] = "Creación de archivos del pedido "
            setPedido["CrearArchivos"] = documento
             Log = "crearArchivos"
        
            
             registerLog.RegistrarLogPedido(idPedido, setPedido, Log, "Clave de Operación: 033 -", null, null, null, null, (success)=> {
                console.log(JSON.stringify(success))
                        }) 
            return pedido.buscarXML(documento);
        })
        .then((archivo) => {
            traza.buscarXML = archivo;
            setPedido["Validate"] = "BuscarXML del pedido "
            setPedido["BuscarXML"] = archivo
            Log = "buscarXML"
       
           
          registerLog.RegistrarLogPedido(idPedido, setPedido, Log, "Clave de Operación: 033 -", null, null, null, null, (success)=> {
               console.log(JSON.stringify(success))
                       }) 
            return pedido.moverArchivos(archivo);
            
        })
        .then((resultado) => {
            traza.moverArchivos = resultado;
            setPedido["Validate"] = "Se movieron los archivos correctamente"
            setPedido["MoverArchivos"] = resultado
             Log = "moverArchivos"
        
            
           registerLog.RegistrarLogPedido(idPedido, setPedido, Log, "Clave de Operación: 033 -", null, null, null, null, (success)=> {
                console.log(JSON.stringify(success))
                        }) 
            return pedido.ordenarRespuesta(resultado);
        })
        .then((respuesta) => {
            setPedido["Validate"] = "El pedido se creó exitosamente"
            setPedido["pedidoGuardado"] = respuesta
             Log = "pedidoGuardado"
            
             
              let folioWeb = respuesta ? (respuesta.folio ? respuesta.folio : "") : ""
            
           registerLog.RegistrarLogPedido(idPedido, setPedido, Log, "Clave de Operación: 033 -", null, folioWeb, null, null, (success)=> {
                console.log(JSON.stringify(success))
                        }) 
            res.status(200).send(respuesta);
        })
        .catch((error) => {
            //se comenta porque no se usa
            /*
            let servSSH = {
                ruta: 'http://192.168.0.253:3000/ssh/cerrarInterface',
                metodo: 'GET',
                datos: {},
                headers: {
                    "Content-Type": "application/json",
                    "user": "ctonline.mx",
                    "pass": "pass@ct"
                }
            }
            */
            // funcion.servicioRest(servSSH)
            console.log(error)
            error = funcion.validarError(error, req, traza);
            res.status("400.0").send(error)
        });

});

//POST /pedido/traspaso
router.post('/traspaso', login.authenticate, (req, res) => {
    let pedidoJSON = req.body.pedido;
    let traza = {};

    pedido.crearTraspaso(pedidoJSON)
        .then((traspasoCreado) => {
            traza.crearTraspaso = traspasoCreado;
            return pedido.crearArchivos(traspasoCreado);
        })
        .then((documento) => {
            traza.crearArchivos = documento;
            return pedido.buscarXML(documento);
        })
        .then((archivo) => {
            traza.buscarXML = archivo;
            return pedido.moverArchivos(archivo);
        })
        .then((resultado) => {
            traza.moverArchivos = resultado;
            return pedido.ordenarRespuesta(resultado);
        })
        .then((respuesta) => {
            res.status(200).send(respuesta);
        })
        .catch((error) => {
            error = funcion.validarError(error, req, traza);
            res.status(error.errorCode.substring(0, 3)).send(error);
        });

});

//POST /pedido/credito
router.post('/credito', login.authenticate, (req, res) => {
    let pedidoJSON = req.body.pedido;
    let traza = {};

    pedido.crearCredito(pedidoJSON)
        .then((creditoCreado) => {
            traza.crearCredito = creditoCreado;
            return pedido.crearArchivos(creditoCreado);
        })
        .then((documento) => {
            traza.crearArchivos = documento;
            return pedido.buscarXML(documento);
        })
        .then((archivo) => {
            traza.buscarXML = archivo;
            return pedido.moverArchivos(archivo);
        })
        .then((resultado) => {
            traza.moverArchivos = resultado;
            return pedido.ordenarRespuesta(resultado);
        })
        .then((respuesta) => {
            res.status(200).send(respuesta);
        })
        .catch((error) => {
            error = funcion.validarError(error, req, traza);
            res.status(error.errorCode.substring(0, 3)).send(error);
        });

});

router.get('/pasardatos', (req, res) => {


    
            fs.exists("/datos/webpage/in/PedWD2_HMO45361659584055741.xml", (exists) => {
                if (exists) {
                    fs.move("/datos/webpage/in/PedWD2_HMO45361659584055741.xml",
                        "/datos/webpage/out/PedWD2_HMO45361659584055741.xml", (error) => {
                            if (error) {
                                //console.log('>>>>>>>>>>>>>>> Error moviendo archivo: ' + "PedWD2_HMO45361659573742866.xml")
                                console.log(error);
                                //Acceso denegado
                                res.status(300).send("error al subir if");
                            }else{
                                console.log('Archivo movido: PedWD2_HMO45361659581371601.xml')                            
                                res.status(200).send("archivo subido");
                            }
                            
                        });
                }
                else {
                    console.log('>>>>>>>>>>>>>>> Archivo no encontrado, no se movio: ' + "PedWD2_HMO45361659573742866.xml")
                    
                    res.status(300).send("error al subir else");
                }
            });
       

})

module.exports = router;