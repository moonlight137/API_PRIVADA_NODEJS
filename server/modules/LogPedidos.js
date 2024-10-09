const printer = require('../modules/Printer');
const moment = require('moment');
const conexiones = require('../db/conexiones');
var conn = conexiones.mongoCon("mongodb://ct_api_privada:d885m91WBy3AClpx47UK@10.10.251.199:27017/CT_API_Publica?authSource=admin");
//var { mongoose } = require('../db/mongoose');
//const { reject } = require('lodash');
const pedido = require('./pedido');
const factura = require('./factura');


/**
 * Registrar log de Pedidos
 */
let RegistrarLogPedido = (_idPedido, _Pedido, _Log, OperationKey, _Status = null, folioWeb = null, remision = null, factura = null, callback) => {
    return new Promise((success, rejected) => {
       
   

        let Log      = _Log ? _Log : "NonLog";
        let Pedido   = Object(_Pedido)
        let idPedido = _idPedido != false ? String(_idPedido) : false
        let setJSON;
        let parameters;
        let Time     = moment(new Date())/*.add(-7, "hours")*/.add(-6, "minutes")
        let Time_At     = moment(new Date()).add(-7, "hours").add(-6, "minutes")

        if(idPedido == false || Log == false ){
            console.log(OperationKey +" Error: Datos Erróneos")
            //return callback({"Rejected": "Error: Datos Erróneos"})
            rejected("Datos Erróneos")
        }else{
            Pedido["Time"] = Time
            console.log("pedido")
            console.log(Pedido)
            let Logs     = `[{ "${Log}" : ${JSON.stringify(Pedido)}}]`
            setJSON = {

                "idPedido"  : idPedido,
                "Updated_At": new Date(Time_At)

            }
            folioWeb != null ? setJSON["folioWeb"]= folioWeb : ""
            _Status != null ? setJSON["Status"]= _Status : ""
            remision != null ? setJSON["Remision"]= remision : ""
            factura != null ? setJSON["Factura"]= factura : ""

            console.log("Este es mi folioWeb ", folioWeb)
            console.log("Este es setJSON ", setJSON)
            parameters         = Log == "CrearPedido" ?  {$set: setJSON, $inc : { "Intentos" : 1 } , $push: {"Logs": Logs}} :  {$set: setJSON, $push: {"Logs": Logs}}
          console.log("parametros ", parameters)
            try {


                
             conn.collection('tbl_pedidos_logs').findOneAndUpdate(
                { "idPedido" : idPedido  },
                parameters , //$set: setJSON, 
              { upsert:true, returnDocument : "before"/*, returnNewDocument : true */}

                ).then((response)=> {
                    console.log("respuesta Mongo")
                    console.log(JSON.stringify(response))
                    let existing = response ? (response.lastErrorObject ? response.lastErrorObject.updatedExisting : false) : false
                    let registro = {"Existing": existing, "Timer":false, "Intentos":0, "Log" : OperationKey + " Se ha registrado en Log"}
                    let Timming;
                    if(existing == true && Log == "CrearPedido"){
                        console.log(OperationKey + " Inside Timming")
                        let timming = response ? (response.value != null ? response.value.Logs : false) : false 
                        let cum = [];
                        timming.map((obj) => {
                            obj = JSON.parse(obj)
                            obj = obj[0].CrearPedido ? obj : false
                            obj != false ? cum.push(obj) : ""
                        })
                        console.log(cum.length)
                        registro.Intentos = cum.length + 1 
                        if(registro.Intentos > 1){
                            let timePedido    = cum[cum.length - 1]
                            timePedido        = moment(timePedido[0].CrearPedido.Time)
                            let newTime       = moment(new Date()).add(-8, "minutes")
                            console.log(timePedido)
                            console.log(newTime)
                            if (timePedido < newTime) {
                                registro.Timer = true
                            }else{
                                registro.Timer = false
                            }
                            
                        }
                        
                    }else{
                            registro.Timer = true
                            if(existing == false && Log == "CrearPedido"){
                            conn.collection('tbl_pedidos_logs').findOneAndUpdate(
                                { "idPedido" : idPedido },
                                { $set : { "Created_At": new Date(Time_At)}}, 
                             ).then((success)=>{
                                console.log(OperationKey +" Se registró Fecha")
                                
                             }).catch((er)=> {
                                console.log(OperationKey +" Error: En registro de Fechas")
    
                             })
                        }else{

                        }

                    }
                        
                    
                    console.log(JSON.stringify(registro))
                    return callback(registro)
                })
            }
            catch (e){
                Pedido["ErrorCatch"] = "Error al intentar registrar log"
                Logs                 = `[{ "${Log}" : ${JSON.stringify(Pedido)}}]`
                console.log(JSON.stringify({"Log": "Error al intentar guardar log de Pedido", "Error": e, "Line": "60"}));
                conn.collection('tbl_pedidos_logs').findOneAndUpdate(
                    { "idPedido" : idPedido },
                    { $set: { "idPedido" : idPedido, "Status": _Status, "folio": folioWeb}, $push: {"Logs": Logs} },
                    { upsert:true,  returnDocument : "before",  returnNewDocument : true }

                ).then((response)=> {
                     console.log("respuesta Mongo66")
                     console.log(JSON.stringify(response))
                     let existing = response ? (response.lastErrorObject ? response.lastErrorObject.updatedExisting : false) : false
                     let registro = {"Existing": existing, "Log" : OperationKey + " Se ha registrado en Log"}
                     console.log(JSON.stringify(registro))
                     return callback(registro)
                 }).catch((error) => {
                     
                    console.log(JSON.stringify({"LOG": "SASD", "ERROR": error}))
                    //return reject({"Existing": false, "Log" : OperationKey + " Error 2 al registrar logPedido"})
                 })
            }
        }
    })
    
    
}

let RegistrarLogFacturacion = (_folioWeb, _Pedido, _Log, _OperationKey,_Status = null, remision = null, _factura, facturacion = null) => {
    return new Promise((success, rejected) => {
        /*
        VerifyAutogestionExists(_Pedido).then((ok)=> {
            console.log("pasamos 138")
            console.log(ok)
        }).catch((error)=> {
            console.log("ocurrió un error 140")
        })
        */

        let Log         = _Log ? _Log : "NonLog";
        let Pedido   = Object(_Pedido)
        let folioWeb = _folioWeb != false ? String(_folioWeb) : false
        let FacturaRemision =_factura != false ? Object(_factura) : false
        let setJSON;
        let parameters;
        let Time        = moment(new Date())/*.add(-7, "hours")*/.add(-6, "minutes")
        let Time_At     = moment(new Date()).add(-7, "hours").add(-6, "minutes")
        if(folioWeb == false || Log == false ){

        }else{
        Pedido["Time"] = Time
        console.log("pedido")
        try {
           
            let Logs     = `[{ "${Log}" : ${JSON.stringify(Pedido)}}]`
            setJSON = {
                "Updated_At": new Date(Time_At)
            }
            /*
            _Status != null ? setJSON["Status"]= _Status : ""
            remision != null ? setJSON["Remision"]= remision : ""
            factura != null ? setJSON["Factura"]= factura : ""
            */

            let s = _Status ? _Status : null
            let r = remision ? remision : null
          //  let f = factura ? factura : null


            if(s){
            setJSON["Status"] = _Status
            }
            if(r){
            setJSON["Remision"] = remision
            }
            if(FacturaRemision){
            setJSON["FacturaRemision"] = _factura
            }


            if(facturacion){
                parameters         = Log == "CrearFactura" ?  {$set: setJSON, $inc : { "IntentosFacturacion" : 1 } , $push: {"Logs": Logs}} :  {$set: setJSON, $push: {"Logs": Logs}}

            }else{
                parameters         = Log == "CrearOrdenes" ?  {$set: setJSON, $inc : { "IntentosRemision" : 1 } , $push: {"Logs": Logs}} :  {$set: setJSON, $push: {"Logs": Logs}}
            }

            //parameters      = {$set: setJSON, $push: {"Logs": Logs, "GuiasAutogestion": paqueteria[0]}} 
            console.log(_OperationKey, parameters)
            conn.collection('tbl_pedidos_logs').findOneAndUpdate(
                { "folioWeb" : folioWeb },
                  parameters , //$set: setJSON, 
                { upsert:true, returnDocument : "before"}
            ).then((ready)=> {
                console.log(_OperationKey, "- Respuesta de log Mongo")
                return success(ready)
            }).catch((r)=>{
                
                console.log(_OperationKey, "- Error de consulta en Mongo")
                console.log(JSON.stringify({"Log":_OperationKey, "Status": "Error", "Error": r}))
                reject("Error en consulta de BD")
            })
        }catch(error){
            console.log(_OperationKey, " - error de consulta de Guias")
            console.log(error)
            reject("Error en el proceso")
        }
    }
    })
}

module.exports  = {
    RegistrarLogPedido, RegistrarLogFacturacion
}

