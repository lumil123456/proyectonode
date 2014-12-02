$(function($) {
	var socket=io();
	$("#crearpartida").click(function(event){
		if($("#titulo").val()!=""){
			socket.emit("NewGame",{"nameTitle":$("#titulo").val()});
		}
	});
	socket.on("NewGame",function(response){
		if(response.bool)
		{
			alert("creado "+response.nameTitle);
			//$("#Sala").append("<h1>"+response.nameTitle+"</h1>")
			//document.location.href="http://localhost:3001/espera/";
			loadhtml("/game/");
		}
		else{
			alert("es false");
		}
	})
	var loadhtml=function(url){
		$.ajax({
			url: 'url',
			type: 'GET',
			dataType: 'html',
			data: {},
		})
		.done(function(html) {
			$("#content").html(html);
			//habilitamos el envio de mensajes
			//Games();
		})
		.fail(function() {
			
		})
		.always(function() {
			
		});
	}
	var setlista=function(userlist)
	{
		html="";
		for(var i=0;i<userlist.length;i++)
		{
			html+="<li>"+userlist[i].nick+"</li>"
		}
		$("#usuarios").html(html);
	}
	var getUsers=function()
	{
		socket.emit("get_users",{});
	}
	var enabledchat=function()
	{
		$("#menvio").keydown(function(event) {
			if(event.keyCode==13)
			{
				socket.emit("mensajes",{"nick":$("#nickname").val(),"msn":$(this).val()})
				$(this).val("");
			}
		});	
	}
	socket.on("get_users",function(response){
		setlista(response.lista);
	});
	socket.on("mensajes",function(response){
		console.log(response);
		$("#mensajes").append("<li>"+response.nick+">"+response.msn+"</li>")
	});
});