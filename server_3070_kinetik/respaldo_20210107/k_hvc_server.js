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

app.get('/ping',
    function(req, res) {
        res.json({ resultado: "PONG" });
    });

app.post('/usr',
    function(req, res) {
        //
        console.log(req.body);
        servicios.validaUsuario(sql, req.body)
            .then(function(data) {
                console.log('/usr', data);
                try {
                    if (data[0].resultado === true) {
                        res.json({ resultado: "ok", datos: data });
                    } else {
                        res.json({ resultado: "nodata", datos: '' });
                    }
                } catch (error) {
                    res.json({ resultado: 'error', datos: 'Usuario no existe. Corrija o verifique, luego reintente.' });
                }
            })
            .catch(function(error) {
                res.status(500).json({ resultado: 'error', datos: error });
            });
    });

app.get('/usuarios',
    function(req, res) {
        //
        console.log(req.body);
        servicios.todos(sql, req.body)
            .then(function(data) {
                try {
                    res.json({ resultado: "ok", datos: data });
                } catch (error) {
                    res.status(500).json({ resultado: 'error', datos: 'Usuario no existe. Corrija o verifique, luego reintente.' });
                }
            })
            .catch(function(error) {
                res.status(500).json({ resultado: 'error', datos: error });
            });
    });

app.post('/grabarUsuario',
    function(req, res) {
        //
        console.log(req.body);
        servicios.grabarUsuario(sql, req.body)
            .then(function(data) {
                try {
                    res.json({ resultado: "ok", datos: data });
                } catch (error) {
                    res.status(500).json({ resultado: 'error', datos: error });
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
        if (req.body.todos !== undefined) {
            // servicios.pickeoPendienteWeb(sql, req.body)
            servicios.sinTransportar(sql, req.body)
                .then(function(data) {
                    // console.log("/pickpend ", data);
                    try {
                        if (data.length > 0 && data[0].resultado === true) {
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
        } else {
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
        }
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

app.post('/imgUpload', type,
    function(req, res) {
        //
        var nombre_completo = CARPETA_IMG + req.body.name;
        /** A better way to copy the uploaded file. **/
        console.log('/imgUpload', req.body.foto);
        var data = req.body.foto.split(';base64,').pop();
        console.log('/imgUpload', data);
        fs.writeFile(nombre_completo, data, { encoding: 'base64' }, function(err) {
            if (err) {
                return res.status(500).json({ resultado: 'error', mensaje: err });
            } else {
                servicios.saveIMG(sql, req.body.name, req.body.extension, req.body.id_pqt);
                return res.status(200).json({ resultado: 'ok', mensaje: 'Imagen fue grabada.' });
            }
        }).catch(err => {
            console.log('/imgUpload ERROR-> ', err);
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

app.post('/getimages',
    function(req, res) {
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
        console.log('/acopiar', req.body);
        if (req.body.todos !== undefined) {
            servicios.enAcopioPendienteWeb(sql, req.body)
                .then(function(data) {
                    // console.log("/acopios ", data);
                    try {
                        if (data.length === 0 || data[0].resultado === false) {
                            res.json({ resultado: "nodata", datos: '' });
                        } else if (data[0].resultado === true) {
                            res.json({ resultado: "ok", datos: data });
                        }
                    } catch (error) {
                        res.status(500).json({ resultado: 'error', datos: error });
                    }
                })
                .catch(function(error) {
                    res.status(500).json({ resultado: 'error', datos: error });
                });
        } else {
            servicios.acopioPendiente(sql, req.body)
                .then(function(data) {
                    console.log("/acopios ", data);
                    try {
                        if (data.length === 0 || data[0].resultado === false) {
                            res.json({ resultado: "nodata", datos: '' });
                        } else if (data[0].resultado === true) {
                            res.json({ resultado: "ok", datos: data });
                        }
                    } catch (error) {
                        res.status(500).json({ resultado: 'error', datos: error });
                    }
                })
                .catch(function(error) {
                    res.status(500).json({ resultado: 'error', datos: error });
                });
        }
    });

app.post('/poracopiar',
    function(req, res) {
        //
        console.log(req.body);
        servicios.porAcopiarPendienteWeb(sql)
            .then(function(data) {
                // console.log("/acopios ", data);
                try {
                    if (data.length === 0) {
                        res.json({ resultado: "nodata", datos: '' });
                    } else if (data[0].resultado === true) {
                        res.json({ resultado: "ok", datos: data });
                    }
                } catch (error) {
                    res.status(500).json({ resultado: 'error', datos: error });
                }
            })
            .catch(function(error) {
                res.status(500).json({ resultado: 'error', datos: error });
            });
    });

app.get('/tipopago',
    function(req, res) {
        //
        console.log(req.body);
        servicios.tiposDePago(sql, req.body)
            .then(function(data) {
                try {
                    res.json({ resultado: "ok", datos: data });
                } catch (error) {
                    res.status(500).json({ resultado: 'error', datos: 'No existen tipos de pago' });
                }
            })
            .catch(function(error) {
                res.status(500).json({ resultado: 'error', datos: error });
            });
    });
app.get('/ciudades',
    function(req, res) {
        //
        console.log(req.body);
        servicios.ciudades(sql, req.body)
            .then(function(data) {
                try {
                    res.json({ resultado: "ok", datos: data });
                } catch (error) {
                    res.status(500).json({ resultado: 'error', datos: 'No existen ciudades' });
                }
            })
            .catch(function(error) {
                res.status(500).json({ resultado: 'error', datos: error });
            });
    });

app.post('/clientes',
    function(req, res) {
        //
        servicios.clientes(sql, req.body)
            .then(function(data) {
                try {
                    res.json({ resultado: "ok", datos: data });
                } catch (error) {
                    res.status(500).json({ resultado: 'error', datos: 'No existen clientes' });
                }
            })
            .catch(function(error) {
                res.status(500).json({ resultado: 'error', datos: error });
            });
    });

app.post('/upClientes',
    function(req, res) {
        //
        console.log(req.body);
        servicios.upClientes(sql, req.body)
            .then(function(data) {
                try {
                    res.json({ resultado: "ok", datos: data });
                } catch (error) {
                    res.status(500).json({ resultado: 'error', datos: error });
                }
            })
            .catch(function(error) {
                res.status(500).json({ resultado: 'error', datos: error });
            });
    });

app.post('/grabarEncomienda',
    function(req, res) {
        //
        console.log(req.body);
        servicios.newEncomienda(sql, req.body)
            .then(function(data) {
                try {
                    res.json({ resultado: "ok", datos: data });
                } catch (error) {
                    res.status(500).json({ resultado: 'error', datos: error });
                }
            })
            .catch(function(error) {
                res.status(500).json({ resultado: 'error', datos: error });
            });
    });

app.post('/borrar_pqt',
    function(req, res) {
        //
        console.log(req.body);
        servicios.borrarEncomienda(sql, req.body)
            .then(function(data) {
                try {
                    res.json({ resultado: "ok", datos: data });
                } catch (error) {
                    res.status(500).json({ resultado: 'error', datos: error });
                }
            })
            .catch(function(error) {
                res.status(500).json({ resultado: 'error', datos: error });
            });
    });

app.get('/estados',
    function(req, res) {
        //
        console.log('/estados ', req.body);
        servicios.Estados(sql, req.body)
            .then(function(data) {
                try {
                    res.json({ resultado: "ok", datos: data });
                } catch (error) {
                    res.status(500).json({ resultado: 'error', datos: error });
                }
            })
            .catch(function(error) {
                res.status(500).json({ resultado: 'error', datos: error });
            });
    });

app.post('/estado_pqt',
    function(req, res) {
        //
        servicios.dondeEstas(sql, req.body)
            .then(function(data) {
                try {
                    res.json({ resultado: "ok", datos: data });
                } catch (error) {
                    res.status(500).json({ resultado: 'error', datos: error });
                }
            })
            .catch(function(error) {
                res.status(500).json({ resultado: 'error', datos: error });
            });
    });

app.post('/grabarEstados',
    function(req, res) {
        //
        // console.log(req.body);
        //
        servicios.updateEstados(sql, req.body)
            .then(function(data) {
                try {
                    res.json({ resultado: "ok", datos: data });
                } catch (error) {
                    res.status(500).json({ resultado: 'error', datos: error });
                }
            })
            .catch(function(error) {
                res.status(500).json({ resultado: 'error', datos: error });
            });
    });

app.post('/dameMasivo',
    function(req, res) {
        //
        console.log(req.body);
        //
        servicios.dameMasivos(sql, req.body)
            .then(function(data) {
                try {
                    res.json({ resultado: "ok", datos: data });
                } catch (error) {
                    res.status(500).json({ resultado: 'error', datos: error });
                }
            })
            .catch(function(error) {
                res.status(500).json({ resultado: 'error', datos: error });
            });
    });

app.post('/dameEncomiendas',
    function(req, res) {
        //
        console.log(req.body);
        //
        servicios.dameEncomiendas(sql, req.body)
            .then(function(data) {
                try {
                    res.json({ resultado: "ok", datos: data });
                } catch (error) {
                    res.status(500).json({ resultado: 'error', datos: error });
                }
            })
            .catch(function(error) {
                res.status(500).json({ resultado: 'error', datos: error });
            });
    });

app.post('/dameEncomiendasbyID',
    function(req, res) {
        //
        console.log(req.body);
        //
        servicios.dameEncomiendasbyID(sql, req.body)
            .then(function(data) {
                try {
                    res.json({ resultado: "ok", datos: data });
                } catch (error) {
                    res.status(500).json({ resultado: 'error', datos: error });
                }
            })
            .catch(function(error) {
                res.status(500).json({ resultado: 'error', datos: error });
            });
    });