module.exports = {

    mensaje: (attr, op1, op2, op3, op4) => {
        let status = {
            '200': [{
                '0': {
                    errorCode: '2000',
                    errorMessage: 'Ok, peticion procesada'
                    //errorDescription: 'Se realizo una peticion que no fue econtrada'
                }
            }, {
                '1': {
                    errorCode: '2001',
                    errorMessage: 'Ok, estas registrado'
                    //errorDescription: 'Se realizo una peticion que no fue econtrada'
                }
            }],
            '400': [{
                '0': {
                    errorCode: '4000',
                    errorMessage: 'Solicitud erronea, verifique los datos enviados'
                    //errorDescription: 'Se realizo una peticion que no fue econtrada'
                }
            }, {
                '1': {
                    errorCode: '4001',
                    errorMessage: 'Solicitud erronea, archivo JSON no valido'
                    //errorDescription: 'Se realizo una peticion que no fue econtrada'
                }
            }, {
                '2': {
                    errorCode: '4002',
                    errorMessage: 'Solicitud erronea, email esta duplicado'
                    //errorDescription: 'Se realizo una peticion que no fue econtrada'
                }
            }, {
                '3': {
                    errorCode: '4003',
                    errorMessage: 'Solicitud erronea, las credenciales han expirado'
                    //errorDescription: 'Se realizo una peticion que no fue econtrada'
                }
            }, {
                '4': {
                    errorCode: '4004',
                    errorMessage: `Solicitud erronea, la cantidad de un producto ${op1} no puede ser menor o igual 0.`
                    //errorDescription: 'Se realizo una peticion y al validar se encontro esta inconcientencia'
                }
            }, {
                '5': {
                    errorCode: '4005',
                    errorMessage: `Solicitud erronea, el precio del producto ${op1} no puede ser menor o igual a $0.`
                    //errorDescription: 'Se realizo una peticion y al validar se encontro esta inconcientencia'
                }
            }, {
                '6': {
                    errorCode: '4006',
                    errorMessage: `Solicitud erronea, el precio enviado del producto con clave: ${op1} ($${op2} MX) no coincide con el precio de Almacen ${op3} ($${op4} MX).`,
                    errorReference: `${op3}`
                    //errorDescription: 'Se realizo una peticion y al validar se encontro esta inconcientencia'
                }
            }, {
                '7': {
                    errorCode: '4007',
                    errorMessage: `El pago ($${op1}} MX) no coincide con el total de las partidas ($${op2} MX).`,
                    // errorReference: `${op3}`
                    //errorDescription: 'Se realizo una peticion y al validar se encontro esta inconcientencia'
                }
            }, {
                '8': {
                    errorCode: '4008',
                    errorMessage: `No hay suficiente mercancia del producto con clave ${op1} en Almacen ${op2}`,
                    // errorReference: `${op3}`
                    //errorDescription: 'Se realizo una peticion y al validar se encontro esta inconcientencia'
                }
            }, {
                '9': {
                    errorCode: '4009',
                    errorMessage: `Solicitud erronea, codigo incorrecto!`,
                    errorReference: `${op1}`
                    //errorDescription: 'Se realizo una peticion a una ruta no configurada'
                }
            }, {
                '10': {
                    errorCode: '40010',
                    errorMessage: `Solicitud erronea, error: ${op1}`
                    //errorDescription: 'Se realizo una peticion a una ruta no configurada'
                }
            }],
            '401': [{
                '0': {
                    errorCode: '4010',
                    errorMessage: 'No autorizado'
                    //errorDescription: 'Se realizo una peticion sin autorizacion'
                }
            }, {
                '1': {
                    errorCode: '4011',
                    errorMessage: 'No autorizado, token invalido'
                    //errorDescription: 'Se realizo una peticion con un token invalido'
                }
            }, {
                '2': {
                    errorCode: '4012',
                    errorMessage: 'No autorizado, no te encuentras registrado',
                    errorReference: `${op1}`
                    //errorDescription: 'Se realizo una peticion con un token invalido'
                }
            }],
            '404': [{
                '0': {
                    errorCode: '4040',
                    errorMessage: 'Fallo la busqueda, no se encontraron resultados',
                    errorReference: `${op1}`
                    //errorDescription: 'Se realizo una peticion que no fue econtrada'
                }
            }, {
                '1': {
                    errorCode: '4041',
                    errorMessage: 'Fallo la busqueda, servicio inactivo y solicitud no procesada'
                    //errorDescription: 'Se realizo una peticion mientras el servicio MacroPro esta caido y no fue procesada la peticion'
                }
            }, {
                '2': {
                    errorCode: '4042',
                    errorMessage: `Fallo la busqueda, ruta invalida o no encontrada intentalo nuevamente`,
                    errorReference: `${op1}`
                    //errorDescription: 'Se realizo una peticion a una ruta no configurada'
                }
            }],
            '405': [{
                '0': {
                    errorCode: '4050',
                    errorMessage: 'MP, metodo no permitido',
                }
            }, {
                '8': {
                    errorCode: '4058',
                    errorMessage: 'MP, servicios no disponible'
                    //'errorDescription': 'Servicio MacroPro inactivo o no esta procesando las peticiones TXT'
                }
            }],
            '500': [{
                '0': {
                    errorCode: '5000',
                    errorMessage: 'Problema interno, el servidor no pudo procesar la peticion'
                    //'errorDescription': 'El servidor no puede procesar la peticion devido a un error interno'
                }
            }, {
                '1': {
                    errorCode: '5001',
                    errorMessage: `Problema interno, error de almacen: ${op1}`
                    //'errorDescription': 'No se tiene acceso al servidor'
                }
            }, {
                '2': {
                    errorCode: '5002',
                    errorMessage: `Problema interno, error en consulta de informacion`,
                    errorReference: `${op1}`
                    //'errorDescription': 'No se tiene acceso al servidor'
                }
            }, {
                '3': {
                    errorCode: '5003',
                    errorMessage: `Problema interno, error de pedido: ${op1}`
                    //'errorDescription': 'No se tiene acceso al servidor'
                }
            }],
            '501': [{
                '0': {
                    errorCode: '5010',
                    errorMessage: 'Fallo de autenticacion, error en credenciales'
                    //'errorDescription': 'No se tiene acceso al servidor'
                }
            }],
            '503': [{
                '0': {
                    errorCode: '5030',
                    errorMessage: 'Servicio no disponible, acceso denegado',
                    errorReference: `${op1}`
                    //'errorDescription': 'No se tiene acceso al servidor'
                }
            }, {
                '1': {
                    errorCode: '5031',
                    errorMessage: 'Servicio no disponible, archivo no procesado',
                    errorReference: `${op1}`
                    //'errorDescription': 'No se tiene acceso al servidor'
                }
            }, {
                '2': {
                    errorCode: '5032',
                    errorMessage: 'Servicio no disponible, error de conexion',
                    errorReference: `${op1}`
                    //'errorDescription': 'No se tiene acceso al servidor'
                }
            }, {
                '3': {
                    errorCode: '5033',
                    errorMessage: 'Se presento un error inesperado',
                    errorReference: `${op1}`
                    //'errorDescription': 'No se tiene acceso al servidor'
                }

            }]

        }

        attr = attr.split('.');
        attr[1] = (attr[1]) ? attr[1] : '0';
        // console.info('*************** ERROR ATRIBUTOS \n', attr);

        if (attr.length > 1) {
            // return (status[attr[0]][attr[1]][attr[1]]);
            return status[attr[0]].find(obj => obj[attr[1]])[attr[1]]
        } else {
            return (status[attr]);
        }

    }

}