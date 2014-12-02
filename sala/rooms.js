var rooms= function() {
	var room=new Array();
	this.convertir=function(variable){
		var endos=variable.split("/?");
		var envarios=endos[1].split("&");
		var cadena="{";
		var ind;
		for (var i = 0; i < envarios.length; i++) {
			ind=envarios[i].split("=");
			cadena+="\""+ind[0]+"\" : \""+ind[1]+"\"";
			if(i+1!=envarios.length)
				cadena+=",";
		};
		cadena+="}";
		var obj=JSON.parse(cadena);
		return obj;
	}
	this.save=function(object){
		room.push(object);
	}
	this.getRoom=function(){
		return room;
	}
	return this;
}
module.exports= rooms;