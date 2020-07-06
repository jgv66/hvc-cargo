// console.log("hola mundo");
var express = require('express');
var app = express();
// 
var sql = require('mssql');
var nodemailer = require('nodemailer'); // email sender function 
var bodyParser = require('body-parser');
//
var servicios = require('./k_servicios.js');
var dbconex = require('./k_conexion_mssql.js');
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
// body parser
app.use(bodyParser.json({ limit: '50mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// carpeta de imagenes: desde donde se levanta el servidor es esta ruta -> /root/losrobles/public
app.use("/public", express.static('public'));
// servidor escuchando puerto 3055
var server = app.listen(3055, function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log("Escuchando http en el puerto: %s", port);
});

// dejare el server mssql siempre activo
var conex = sql.connect(dbconex);

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

app.post('/pickeado',
    function(req, res) {
        //
        const imagenes = (req.body.foto === undefined) ? undefined : JSON.parse(req.body.foto);
        //
        servicios.paqueteRecogido(sql, req.body)
            .then(function(data) {
                console.log("/pickeado ", data);
                try {
                    if (data[0].resultado === true) {
                        //
                        if (imagenes === undefined) {
                            res.json({ resultado: "ok", datos: data });
                        } else {
                            //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> grabacion de imagenes en b64
                            servicios.saveIMG(sql, imagenes, req.body.id_pqt)
                                .then(function(idata) {
                                    //
                                    console.log('idata', idata);
                                    if (idata.resultado === 'ok') {
                                        res.json({ resultado: 'ok', datos: data.datos }); // esta correcto IDATA es de las imagenes
                                    } else {
                                        res.json({ resultado: 'error', datos: idata.mensaje });
                                    }
                                })
                                .catch(function(err) {
                                    console.log("/cerrarid ", err);
                                    res.json({ resultado: 'error', datos: err });
                                });
                            //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> fin grabacion de imagenes en b64
                        }
                        //
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