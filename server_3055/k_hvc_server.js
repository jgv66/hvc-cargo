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
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
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
            });
    });

app.post('/pickpend',
    function(req, res) {
        //
        console.log(req.body);
        servicios.pickeoPendiente(sql, req.body)
            .then(function(data) {
                console.log("/pickpend ", data);
                try {
                    if (data[0].resultado === true) {
                        res.json({ resultado: "ok", datos: data });
                    } else {
                        res.json({ resultado: "nodata", datos: '' });
                    }
                } catch (error) {
                    res.status(500).json({ resultado: 'error', datos: error });
                }
            });
    });