const express = require('express');
const router = express.Router();

const login = require('../middleware/authenticate');
const funcion = require('../utils/funciones');
const archivos = require('../utils/archivo');

const Client = require('ssh2').Client;
let conn = new Client();
let pathFileSSH = '/../archivos/ssh/timer.txt';
let pathFileRDP = '/../archivos/rdp/timer.txt';
let timeSSH = 15000; //15 segs.
let timeRDP = 300000;  // 300 segs. => 5 min.

router.get('/cerrarInterface', login.authenticate, (req, res) => {
    let newTime = new Date().getTime();

    archivos.leer_archivo(pathFileSSH)
        .then((lastTime) => {
            let diff = Number(newTime) - Number(lastTime);
            // console.log(diff)
            if (diff > timeSSH) {
                return true
            }
            else {
                return reject()
            }
        })
        .then((ok_lectura) => {

            // return true;
            // verificamos si cumple el tiempo para mandar abrir el RDP 
            return archivos.leer_archivo(pathFileRDP)
                .then((lastTime) => {
                    let diff = Number(newTime) - Number(lastTime);
                    // console.log(diff)                    
                    if (diff > timeRDP) {
                        let servRDP = {
                            ruta: 'http://192.168.0.20:1982/pruebas/rdp',
                            metodo: 'GET',
                            datos: {},
                            headers: {
                                "Content-Type": "application/json"
                            }
                        }
                        funcion.servicioRest(servRDP)
                        archivos.escribir_archivo(pathFileRDP)
                        console.log("SE ABRIO EL RDP")
                    }
                    diff = Number(((timeRDP - diff) / 60000).toFixed(2));
                    console.log(`NO SE ABRIO EL RDP, FALTAN ${diff} MINUTOS`)
                    return true
                })
                .catch((error) => {
                    console.log("NO SE ABRIO EL RDP, ERROR:\n", error)
                    return true
                })
        })
        .then((ok_lectura) => {
            //escribimos nuevo time para el proximo intento
            return archivos.escribir_archivo(pathFileSSH)
        })
        .then((ok_escritura) => {
            // let conn = new Client();
            conn.on('ready', () => {
                console.log("CERRANDO APP REMOTE")
                conn.exec('powershell -Command "stop-process -name acuthin"', (error, proceso) => {
                    if (error) throw error;                    
                    proceso.end();
                });
            }).connect({
                host: '192.168.0.210',
                port: 2227,
                username: 'api',
                password: 'Passw0rd'
            })

        })
        .catch((error) => {
            console.log(`OTRO INTENTO DE CIERRE EN MENOS DE ${timeSSH / 1000} SEGUNDOS`)
            res.status(200).send()
        })

    console.log('Cliente SSH :: listo, cerrando Interface MacroPro');
    res.status(200).send()
});

module.exports = router;