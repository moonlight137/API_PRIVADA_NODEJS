const codigo = require('../utils/errores');

let access = {
    user: 'ctonline.mx',
    pass: 'pass@ct'
};

local = module.exports = {

    authenticate: (req, res, next) => {
        let user = req.header('user');
        let pass = req.header('pass');
        //let user = access.user;
        //let pass = access.pass;

        if (access.user == user && access.pass == pass) {
            req.user = user;
            next();
        }
        else {
            res.status(401).send(codigo.mensaje("401.0"));
        }
    }

};
