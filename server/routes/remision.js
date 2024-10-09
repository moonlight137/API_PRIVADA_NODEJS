const express = require('express');
const router = express.Router();
const login = require('../middleware/authenticate');
const remision = require('../modules/remision');
const utils = require('../utils/archivo')

router.post('/', login.authenticate, (req, res) => {
    let pedido = req.body.remisionar; 
    remision.formarTxt(pedido)
        .then((ordenesCreadas) => {
            return utils.crearArchivos({ documentos: ordenesCreadas })
        })
        .then((documentos) => {
            return utils.buscarXML(documentos);
        })
        .then((archivos) => {
            return utils.moverArchivos(archivos);
        })
        .then((respuestaRemision) => {
            return remision.ordenarRemision(respuestaRemision);
        })
        .then((resultadoRemision) => {
            res.status(200).send(resultadoRemision)
        })
        .catch((error) => {
            console.log('# # # # # ERROR REMISION\n', error)
            res.status(503).send({
                errorCode: 503,
                errorMensaje: 'Error general en el proceso de remisiones'
            });
        })
})

router.post('/buscarRemisionXML', login.authenticate, (req, res) => {
    let pedido = req.body.remisionar; 
    utils.buscarXML(pedido)
        .then((remision) => {
            console.log("Esta es mi remisión buscarRemisionXML ", remision)
           
        }).catch((error) => {
            console.log('# # # # # ERROR REMISION\n', error)
            res.status(503).send({
                errorCode: 503,
                errorMensaje: 'Error general en la busqueda de la remisión'
            });
        })
})

router.get('/buscar?', (req, res) => {
    let fs = require('fs')
    let path = require('path')
    const base = process.vars.rutas.CT.remision.out
    let day = 1000 * 60 * 60 * 24
    let prefix = `Comp01A_`
    let remisiones = []
    let client = req.query.c
    let company = req.query.p
    let date = req.query.f
    client = client ? client : ''
    company = company ? company : ''
    let date1
    let date2
    if (date) {
        date = Date.parse(date)
        date1 = date
        date2 = date + day
    }
    let parse_file = (data, format) => {
        if (format == 'xml') {
            return data.substr(data.indexOf('<Folio>') + 7, 12)
        }
        if (format == 'txt') {
            let info ={}
            let products = data.toString().split('\r\n').filter((h, i) => h.trim().length).map((item,i) => {
                if(i == 0){
                    info.distributor = item.split(' ').filter(i => i).map(i => i.trim()).shift()
                    return null
                }
                let data = item.split(' ').filter(i => i).map(i => i.trim())
                return {
                    quantity: data[0],
                    product: data[1],
                    cost: data[2],
                    iva: data[3],
                    exchange: data[5]
                }
            }).filter(r => r)
            info.products = products
            return info
        }
    }
    let files = fs.readdirSync(base)
    for (let i = 0; i < files.length; i++) {
        let file = files[i]
        let file_path = path.join(base, file)
        let data = fs.statSync(file_path)
        if (file.includes(`${prefix}${client}`) && file.includes(`${company}_RR`)) {
            let file_date = new Date(data.ctime).getTime()
            if (date ? (file_date >= date1 && file_date < date2) : true) {
                let info_file = {
                    ext: file.substr(file.indexOf('.') + 1),
                    name: file.substr(0, file.indexOf('.')),
                    data: fs.readFileSync(path.join(base, file), { encoding: 'utf8' }),
                    client: file.substr(prefix.length, file.includes('LE') ? 6 : 7),
                    distributor: ''
                }
                let index_remision = remisiones.findIndex(remision => remision.name == info_file.name)
                let parsed_data = parse_file(info_file.data, info_file.ext)
                let remision = index_remision > -1 ? remisiones[index_remision] : {}
                remision.name = info_file.name
                remision.date = new Date(data.ctime)
                remision.client = info_file.client
                if (info_file.ext == 'txt'){
                    remision.products = parsed_data.products 
                    remision.distributor = parsed_data.distributor
                }
                if (info_file.ext == 'xml') remision.remision = parsed_data
                // console.log(remision)
                if (index_remision == -1) remisiones.push(remision)
            }
        }
    }
    return res.send(remisiones)

})


module.exports = router;
