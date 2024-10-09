const express = require('express');
const router = express.Router();

const login = require('../middleware/authenticate');
const productos = require('../modules/productos');
const funcion = require('../utils/funciones');


router.post('/actualizacion', login.authenticate, (req, res) => {

    let archivo = req.body.archivo;
    let filename = req.body.filename;

    productos.actualizar_productos(filename, archivo)
        .then((resultado) => {
            return res.status(200).send(resultado);
        }).catch((error) => {
            console.log("ERROR ACTUALIZACION", error);
            return res.status(400).send(error);
        });
});

module.exports = router;