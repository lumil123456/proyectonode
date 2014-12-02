var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var rooms=require("./sala/rooms");
var salas=rooms();

var io=require("socket.io");
var app = express();

var mysql=require("./db/mysql");
var query=mysql({host:"localhost",user:"root",password:"",database:"chat"});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
require('./routes/sockets.js');
// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;

var PORT=3001;
var server=app.listen(PORT,function(){
    console.log("Servidor corriendo en "+PORT);
});
var rooms=[];
var sockets=io(server);
sockets.on("connection",function(socket){
    socket.on("NewGame",function(cliente){
        rooms.push(cliente.nameTitle);
        socket.emit("NewGame",{"bool":true,"nameTitle":cliente.nameTitle});
    });
});

var sala=[];
var sockets=io(server);
sockets.on("connection",function(socket){
    sala=salas.getRoom();
    if(sala.length > 0){
        console.log("desde el servidor");
        for (var i = 0; i < sala.length; i++) {
            console.log(sala[i].titulo);
        };
    }
    socket.on("NewGame",function(cliente){
        socket.emit("NewGame",{"bool":true,"nameTitle":cliente.nameTitle});
    });
    socket.on("mensajes",function(clientedata){
        sockets.sockets.emit("mensajes",clientedata);
    });
});

var nicknames=[];
var sockets=io(server);
sockets.on("connection",function(socket){
    //el evento setnickname se ejecuta cuando el cliente a emitido sobre setnickname
    socket.on("mensajes",function(clientedata){
        if(clientedata.nick===socket.nickname)
        {
            console.log(clientedata)
            var comando=clientedata.msn.split(" ");
            if(comando[0]=="join")
            {
                var sala=comando[1];
                socket.emit("mensajes",{"nick":"SERVIDOR","msn":"Ahora estas en la sala "+sala});
                socket.leave(socket.salas);
                socket.salas=sala;

                socket.join(sala);
                crearSalaDb(sala,socket,function(){
                    console.log(socket.idSala);
                    query.get("mensaje").where({idSa:socket.idSala}).execute(function(rows){
                        socket.emit("getmensajes",rows);
                    });
                })

                return;
            }
            console.log(socket.idSala);
            query.save("mensaje",{mensaje:clientedata.msn,idUs:socket.idUs,idSa:socket.idSala},function(r){
                console.log(r);
                sockets.to(socket.salas).emit("mensajes",clientedata);
            });
            
            
            
            return;    
        }
        sockets.sockets.emit("mensajes",false);
        
    });
    socket.on("get_users",function(clientdata){
        sockets.sockets.emit("get_users",{"lista":nicknames})
    });
    socket.on("setnickname",function(clientedata){
        if(verificarCuenta(clientedata.nick,socket)){
            nicknames.push(clientedata);
            //seteamos el nick en el mismo socket del cliente
            
            crearSalaDb("seminario",socket,function(){
                socket.nickname=clientedata.nick;
                socket.salas="general";
                socket.join("general");
                socket.emit("setnickname",{"server":true});
            });

            
            return;
        }
        socket.emit("setnickname",{"server":"El nick no esta disponible"});
        return;
    });
});
var crearSalaDb=function(nombre_sala,socket,callback)
{
    query.get("sala").where({nombre:nombre_sala}).execute(function(rows){
        if(rows==0)
        {
            query.save("sala",{nombre:nombre_sala,idUs:socket.idUs},function(r){
                socket.idSala=r.insertId;
                callback();
            })
        }else{
            console.log(rows[0]);
            socket.idSala=rows[0].id;
            callback();
        }
    });
}
var verificarCuenta=function(ins,socket)
{
    query.get("usuario").where({nickname:ins}).execute(function(rows){
        if(rows.length==0)
        {
            query.save("usuario",{nickname:ins},function(response){
                console.log(response);
                socket.idUs=response.insertId;
                //nicknames.push(rows[0].nickname)
            });
        }else{
            console.log(rows);
            socket.idUs=rows[0].id;
            nicknames.push(rows[0].nickname);
        }
    });
    return true; 
}
