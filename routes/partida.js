var rooms = new Array();
function crear_sala(req, res){
   res.render('/espera/', {
      rooms: rooms
   });
}
exports.get_crear_sala = function(req, res){
   crear_sala(req, res);
}
exports.post_crear_sala = function(req, res){
   var titulo = req.body.titulo;
   var pregunta = req.body.pregunta;
   var tiempo = req.body.tiempo;
   rooms.push({
      titulo: titulo,
      pregunta: pregunta,
      tiempo: tiempo
   })
   crear_sala(req, res);
}
exports.get_sala = function(req, res){
   var indice = req.params.indice;
   var sala = (rooms[indice] != undefined) ? rooms[indice] : null;
   res.render('/game/', {
      sala: sala
   });
}