require('./config/ini');
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');

// Utilizacion de cluster del servidor
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

const funcion = require('./utils/funciones');
const codigo = require('./utils/errores');
const port = process.vars.port;

const EventEmitter = require('events');
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();
myEmitter.setMaxListeners(0);
for(let i = 0; i < 100; i++) {
//   myEmitter.on('event', _ => console.log(i));
}
myEmitter.emit('event');

/* Configuracion ExpressJS */
var app = express();
app.use(bodyParser.json());

/* Log request a consola */
app.use(morgan('dev'));
/*app.get('/', (req, res) => {
    res.status(200).send("Funcionando");
    console.log("Funcionando");
})*/
/* Importando y creando rutas */
app.use('/pedido', require('./routes/pedido'));
app.use('/factura', require('./routes/factura'));
app.use('/remision', require('./routes/remision'));
app.use('/ssh', require('./routes/ssh'));
app.use('/productos', require('./routes/productos'));

/* Importando y creando rutas (PRUEBAS)*/
app.use('/facturaPruebas', require('./routes/facturaPruebas'));

/* Error rutas invalidas GET */
app.get('*', (req, res) => {
    reference = req.url;
    metodo = req.method + ': ';
    res.status(404).send(funcion.guardarLog(codigo.mensaje('404.2', metodo + reference)));
});

/* Error rutas invalidas POST */
app.post('*', (req, res) => {
    reference = req.url;
    metodo = req.method + ': ';
    res.status(404).send(funcion.guardarLog(codigo.mensaje('404.2', metodo + reference)));
});


if (cluster.isMaster) {
    console.log(`# # # # # CLUSTER MAESTRO, PID ${process.pid} EJECUTANDOSE`);
    for (let i = 1; i <= numCPUs; i++) {
        cluster.fork();
    }
    cluster.on('exit', (worker, code, signal) => {
        console.log('# # # # # PID ' + worker.process.pid + ' FINALIZADO');
        cluster.fork();
    });
} else {
    app.listen(port, () => {
        console.log(`Servidor API PRIVADA <<< en puerto: ${port}, PID ${process.pid}  S`);
    });
}