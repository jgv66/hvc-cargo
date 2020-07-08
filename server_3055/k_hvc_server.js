// console.log("hola mundo");
const express = require('express');
const sql = require('mssql');
const nodemailer = require('nodemailer'); // email sender function 
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const fs = require('fs'); //
//
var servicios = require('./k_servicios.js');
var dbconex = require('./k_conexion_mssql.js');
//
var app = express();
// 
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
// envio de correos 
exports.sendEmail = function(req, res) {
    console.log('enviando correo...');
};
// carpeta de imagenes: desde donde se levanta el servidor es esta ruta -> /root/losrobles/public
app.use("/public", express.static('public'));
publicpath = path.resolve(__dirname, 'public');
app.use('/static', express.static(publicpath));
CARPETA_IMG = publicpath + '/img/';

// body parser
app.use(bodyParser.json({ limit: '50mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// dejare el server mssql siempre activo
var conex = sql.connect(dbconex);

// servidor escuchando puerto 3055
var server = app.listen(3055, function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log("Escuchando en ", port);
});

app.post('/usr',
    function(req, res) {
        //
        console.log(req.body);
        servicios.validaUsuario(sql, req.body)
            .then(function(data) {
                try {
                    if (data[0].resultado === true) {
                        res.json({ resultado: "ok", datos: data });
                    } else {
                        res.json({ resultado: "nodata", datos: '' });
                    }
                } catch (error) {
                    res.status(500).json({ resultado: 'error', datos: 'Usuario no existe. Corrija o verifique, luego reintente.' });
                }
            })
            .catch(function(error) {
                res.status(500).json({ resultado: 'error', datos: error });
            });
    });

app.post('/pickpend',
    function(req, res) {
        //
        console.log(req.body);
        servicios.pickeoPendiente(sql, req.body)
            .then(function(data) {
                // console.log("/pickpend ", data);
                try {
                    if (data[0].resultado === true) {
                        res.json({ resultado: "ok", datos: data });
                    } else {
                        res.json({ resultado: "nodata", datos: '' });
                    }
                } catch (error) {
                    res.status(500).json({ resultado: 'error', datos: error });
                }
            })
            .catch(function(error) {
                res.status(500).json({ resultado: 'error', datos: error });
            });
    });

app.post('/misretiros',
    function(req, res) {
        //
        console.log(req.body);
        servicios.misPendientes(sql, req.body)
            .then(function(data) {
                // console.log("/misretiros ", data);
                try {
                    if (data[0].resultado === true) {
                        res.json({ resultado: "ok", datos: data });
                    } else {
                        res.json({ resultado: "nodata", datos: '' });
                    }
                } catch (error) {
                    res.status(500).json({ resultado: 'error', datos: error });
                }
            })
            .catch(function(error) {
                res.status(500).json({ resultado: 'error', datos: error });
            });
    });

app.post('/yoLoRetiro',
    function(req, res) {
        //
        console.log(req.body);
        servicios.pickeoEsMio(sql, req.body)
            .then(function(data) {
                console.log("/yoLoRetiro ", data);
                try {
                    if (data[0].resultado === true) {
                        res.json({ resultado: "ok", datos: data });
                    } else {
                        res.json({ resultado: "nodata", datos: 'Lo sentimos, paquete ya tiene un retirador asignado.' });
                    }
                } catch (error) {
                    res.status(500).json({ resultado: 'error', datos: error });
                }
            })
            .catch(function(error) {
                res.status(500).json({ resultado: 'error', datos: error });
            });
    });

app.post('/pickpreord',
    function(req, res) {
        //
        console.log(req.body);
        servicios.ordenarMiPickeo(sql, req.body)
            .then(function(data) {
                console.log("/pickpreord ", data);
                try {
                    if (data[0].resultado === true) {
                        res.json({ resultado: "ok", datos: data });
                    } else {
                        res.json({ resultado: "nodata", datos: 'Lo sentimos, paquete no se ordenó.' });
                    }
                } catch (error) {
                    res.status(500).json({ resultado: 'error', datos: error });
                }
            })
            .catch(function(error) {
                res.status(500).json({ resultado: 'error', datos: error });
            });
    });

//---------------------------------- pruebas multer
var upload = multer({ dest: CARPETA_IMG });
var type = upload.single('file');

app.post('/imgUpload', type, function(req, res) {
    //
    var nombre_completo = CARPETA_IMG + req.body.name;
    /** A better way to copy the uploaded file. **/
    var data = req.body.foto.split(';base64,').pop();
    fs.writeFile(nombre_completo, data, { encoding: 'base64' }, function(err) {
        if (err) {
            return res.status(500).json({ resultado: 'error', mensaje: err });
        } else {
            servicios.saveIMG(sql, req.body.name, req.body.extension, req.body.id_pqt);
            return res.status(200).json({ resultado: 'ok', mensaje: 'Imagen fue grabada.' });
        }
    });
});

app.post('/pickeado',
    function(req, res) {
        //
        const imgb64 = (req.body.foto === undefined) ? undefined : JSON.parse(req.body.foto);
        //
        servicios.paqueteRecogido(sql, req.body)
            .then(function(data) {
                console.log("/pickeado ", data);
                try {
                    if (data[0].resultado === true) {
                        res.json({ resultado: "ok", datos: data });
                    } else {
                        res.json({ resultado: "nodata", datos: 'Lo sentimos, paquete no se pudo cambiar de estado.' });
                    }
                } catch (error) {
                    res.status(500).json({ resultado: 'error', datos: error });
                }
            })
            .catch(function(error) {
                res.status(500).json({ resultado: 'error', datos: error });
            });
    });

app.post('/getimages', function(req, res) {
    //
    servicios.getImages(sql, req.body)
        .then(function(data) {
            //
            // console.log(data);
            if (data.resultado === 'ok') {
                //
                if (data.resultado === 'ok') {
                    res.json({ resultado: 'ok', datos: data.datos });
                } else {
                    res.json({ resultado: 'error', datos: data.mensaje });
                }
            }
        })
        .catch(function(err) {
            console.log("/getimages ", err);
            res.json({ resultado: 'error', datos: err });
        });
});

app.post('/acopiar',
    function(req, res) {
        //
        console.log(req.body);
        servicios.acopioPendiente(sql, req.body)
            .then(function(data) {
                // console.log("/acopios ", data);
                try {
                    if (data[0].resultado === true) {
                        res.json({ resultado: "ok", datos: data });
                    } else {
                        res.json({ resultado: "nodata", datos: '' });
                    }
                } catch (error) {
                    res.status(500).json({ resultado: 'error', datos: error });
                }
            })
            .catch(function(error) {
                res.status(500).json({ resultado: 'error', datos: error });
            });
    });