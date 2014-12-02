
var nombre,pswd,ip;
var arrayNames={};
var wesocket=io.connect();

$(document).on("ready",iniciar);

function iniciar()
{
	$("#body").css({height:screen.height,width:screen.width});
	var pantallas=[$("#setNombre")];

	$('#formNombre').on('submit',function(e){
		e.preventDefault();
		var bandera=0;
		var nombreAyuda=$('#name').val();
		for(var i=0;i<arrayNames.length;i++)
		{
			if(nombreAyuda==arrayNames[i])
				bandera=i;
		}
		if(bandera==0)
			sendNames();
		else
			alert("El nombre ya existe");
	});
	$("#formMsg").on("submit",function(e){
		e.preventDefault();
		sendMessage();
	});
	//manejar la funciones que vienen del servidor
	wesocket.on("mensaje",procesarUsuario);
	wesocket.on("newMessage",procesarMensaje);
	wesocket.on("usuarioDesconectado",procesarUsuarios);
	wesocket.on("errorName",repetirNombre);
}
function sendNames()
{
	nombre=$("#name").val();
	$('#formNombre').fadeOut();
	if(localStorage)
		localStorage.nombreChatUsuario=nombre;
	wesocket.emit('enviarNombre',nombre);
}
function sendMessage()
{
	var msg=$("#msg").val();
	//verificamos que no tenga scripts
	if((msg.indexOf("<")!=-1))
	{
		alert("Mensaje incorrecto");
	}
	else if((msg.indexOf(">")!=-1))
	{
		alert("Mensaje incorrecto");
	}
	else if((msg.indexOf(";")!=-1))
	{
		alert("Mensaje incorrecto");
	}
	else
	{
		$("#msg").val();
		wesocket.emit('enviarMensaje',msg);
	}
}
function procesarUsuario(mensaje)
{
	$('#users').html('');
	for(i in mensaje[1])
	{
		$('#users').append($('<p>').text(mensaje[1][i]));
		arrayNames[i]=mensaje[1][i];
	}
}
function procesarMensaje(data)
{
	$('#chatInsite').append($('<p>').html('<span>'+data[0]+"says:</span>"+data[1]));
	$('#chat').animate({scrollTop:$("#chatInsite").height()},800);
}
function procesarUsuarios(mensaje)
{
	$('#users').html('');
	for(i in mensaje[2])
	{
		$('#users').append($('<p>').text(mensaje[0][i]));
		arrayNames[i]=mensaje[0][i];	
	}
}
function repetirNombre()
{
	alert("el nombre ya esta ocupado");
	location.reload(true);
}