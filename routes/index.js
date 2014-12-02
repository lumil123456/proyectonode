var express = require('express');
var router = express.Router();
var rooms = new Array();
var app = express();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: '', room:rooms });
});

router.get('/chat/',function(req,res){
	res.render('chat',{title:'Chat'});
});
router.get('/saladechat/',function(req,res){
	res.render('saladechat',{title:'Sala'});
});
router.get('/registrate/',function(req,res){
	res.render('registrate',{title:'Express'});
});

router.get('/creaciondepartidas/',function(req,res){
	res.render('creaciondepartidas',{title:'Express'});
});
router.get('/partidasdejuego/',function(req,res){
	res.render('partidasdejuego',{title:'Express'});
});
router.get('/registro/', function(req, res) {
	res.render('registro', { title: 'Registrate' });
});

router.get('/crearsala/', function(req, res) {
	res.render('crearsala', { title: 'Crear sala' });
});
router.get("/espera/",function(req,res){
    var con=convertir(req._parsedOriginalUrl.href);
    rooms.push(con);
    console.log(rooms);
    res.render('saladeespera', { title: 'Esperando...',objeto:con});
});

router.get('/game/', function(req, res) {
	console.log("dentro de la vista de game...........")
	res.render('game', { title: 'juegos' });
});


module.exports = router;