var mysql=require("../db/mysql");
var django=function()
{
	var query=new mysql({host:"localhost",user:"root",password:"",database:"TriviadorNode"});
	this.getSession=function(key,callback)
	{
		query.get("django_session").where({session_key:key}).execute(function(rows){
		if(rows.length>0){
			
			var data=new Buffer(rows[0].session_data, 'base64').toString('ascii');
			//console.log(data);
			var objson=data.split(":{");
			var jsonObj="{"+objson[1]
			var jsonreal=JSON.parse(jsonObj)
			//console.log(jsonreal.estado)
			//res.render("saladechat",{title:"Sala"});
			callback(jsonreal);
		}else{
			callback(false);
		}
	});
	}
	return this;
}
module.exports=django;