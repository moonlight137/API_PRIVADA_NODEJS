const _EmptySpace = process.vars.espacioVacio;
const _RellenoNombre = process.vars.espacioRelleno;

module.exports = {
    //Metodo para separar y las ordenes de compra para el intercambio de documentos
    formarTxt: (pedidoData) => {
        console.log("Este es mi pedidoData formar txt ", pedidoData)
        return new Promise((resolve, reject) => {
            let clienteMs = (pedidoData.clienteMs) ? pedidoData.clienteMs : undefined;
            let pedido = pedidoData.encabezado.folio;
            let cliente = pedidoData.encabezado.cliente;
            let tipodeCambio = pedidoData.encabezado.tipodecambio;
            let almacen = pedidoData.encabezado.almacen;
            let plazo = pedidoData.encabezado.plazo;
            let productos = pedidoData.productos;
            let fecha = Math.floor((Math.random() * Date.now()) + 1);
            let rutaIn, rutaOut, filename;

            if (Object.keys(process.vars.rutas).indexOf(clienteMs) >= 0) {
                rutaIn = process.vars.rutas[clienteMs].remision.in
                rutaOut = process.vars.rutas[clienteMs].remision.out
                rutaError = process.vars.rutas[clienteMs].remision.error
                filename = process.vars.rutas[clienteMs].remision.prefijo + almacen + '_' + cliente + fecha;

                if (pedidoData.facturaProveedor) {
                    rutaIn = process.vars.rutas[clienteMs].facturaProveedor.in
                    rutaOut = process.vars.rutas[clienteMs].facturaProveedor.out
                    rutaError = process.vars.rutas[clienteMs].facturaProveedor.error
                    filename = process.vars.rutas[clienteMs].facturaProveedor.prefijo + '_' + process.vars.rutas[clienteMs].factura.prefijo + almacen + '_' + cliente + fecha;
                }

            } else {
                rutaIn = process.vars.rutas.CT.remision.in
                rutaOut = process.vars.rutas.CT.remision.out
                rutaError = process.vars.rutas.CT.remision.error
                filename = process.vars.rutas.CT.remision.prefijo + almacen + '_' + cliente + fecha;
            }

            let grupos = {};
            for (let i = 0; i < productos.length; i++) {
                //AGRUPAMOS POR EL ID EMPRESA DEL PROVEEDOR DE CADA PRODUCTO O TODO EN IDCT
                console.log("Empresa ", productos[i].empresa)
              //  console.log("idCT ",process.vars.idCT)
                let nombreGrupo = productos[i].empresa ? productos[i].empresa: null;

                if(nombreGrupo == null)
                {
                    return reject("Error: Empresa invalida", nombreGrupo)
                }else
                {
                    if (!grupos[nombreGrupo] && nombreGrupo) {
                        grupos[nombreGrupo] = [];
                    }
                    if (nombreGrupo) {
                        grupos[nombreGrupo].push(
                            {
                                clave: productos[i].clave,
                                cantidad: productos[i].cantidad,
                                costo: productos[i].precioFinal,
                                moneda: productos[i].moneda
                            });
                    }
                }
            }

            let ordenes = [];
            let ordenTXT;

            for (let nombreGrupo in grupos) {
                // Cabecera del archivo para la Remision u Orden de Compra
                console.log("Este es mi pedidoData con todos los datos  ", pedidoData)

                if (pedidoData.facturaProveedor) {

                    ordenTXT = _EmptySpace.substr(0, 21) +
                        (nombreGrupo + _EmptySpace).substring(0, 15) + " " +
                        (almacen + _EmptySpace).substring(0, 3) + " " + plazo + "  4            " + pedidoData.remision + "@\r\n";

                    grupos[nombreGrupo].forEach((art) => {
                        let tc = (art.moneda == "USD") ? tipodeCambio : " 1.00";
                        ordenTXT += (art.cantidad + _EmptySpace).substring(0, 10) + " " +
                            (art.clave + _EmptySpace).substring(0, 15) + "  " +
                            (art.costo + _EmptySpace).substring(0, 15) + "16.00  0.00  " + (tc + _EmptySpace).substring(0, 5) + "@\r\n";
                    });
                } else {
                    ordenTXT = _EmptySpace.substr(0, 21) +
                        (nombreGrupo + _EmptySpace).substring(0, 15) + " " +
                        (almacen + _EmptySpace).substring(0, 3) + " " + plazo + "  2                    @\r\n";

                    grupos[nombreGrupo].forEach((art) => {
                        let tc = (art.moneda == "USD") ? tipodeCambio : " 1.00";
                        ordenTXT += (art.cantidad + _EmptySpace).substring(0, 10) + " " +
                            (art.clave + _EmptySpace).substring(0, 15) + "  " +
                            (art.costo + _EmptySpace).substring(0, 15) + "16.00  0.00  " + (tc + _EmptySpace).substring(0, 5) + "@\r\n";
                    });
                }

                //Rellenamos el nombre para conservar una longitud estandar en el nombre de l archivo
                filenameComp = (filename + '_' + nombreGrupo +'_'+pedido+  _RellenoNombre).substring(0, 49)

                ordenes.push(
                    {
                        folioPedido: pedido,
                        rutaIn: rutaIn,
                        rutaOut: rutaOut,
                        rutaError: rutaError,
                        filename: filenameComp,
                        txt: ordenTXT
                    });
            }
            return resolve(ordenes)
        });
    },

    //Ordenamos la respuesta del proceso de remision 
    ordenarRemision: (objDatos) => {    
        let remisiones = []
        let idEmpresa; 
        let filename;
        console.log("Este es mi objDatos para ordenarRemision ", JSON.stringify(objDatos))    
        objDatos.forEach(remision => {
            
            let error = remision ? remision.error: null

            console.log("Este es mi error ", error)
            if(error)
            {

            }else
            {
                if(remision.file.Documento.Compra && remision.file.Documento.Compra[0].Tipo[0] == 'R')
            {
                    idEmpresa = remision.filename.split('_');
                    idEmpresa = idEmpresa[2];
                    filename = remision.filename
                    remisiones.push({ idEmpresa: idEmpresa ? idEmpresa: null, remision: remision.file ? (remision.file.Documento ? (remision.file.Documento.Compra ? (remision.file.Documento.Compra[0] ? (remision.file.Documento.Compra[0].Folio ? (remision.file.Documento.Compra[0].Folio[0] ? remision.file.Documento.Compra[0].Folio[0]: null):null):null):null):null):null, filename: filename })
            }
            }
            
        })
        
        objDatos = objDatos[0]
         objDatos = {
            folioPedido: objDatos.folioPedido,
            remisiones: remisiones,
            error: (objDatos.error) ? true : null,
            errorMensaje: (objDatos.errorMensaje) ? objDatos.errorMensaje : null
        }
        
        return objDatos;
    }

};

