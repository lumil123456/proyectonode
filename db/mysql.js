/*
Este Modulo de NODE.JS es software libre: Tu puedes redistribuir o modificar, bajo los terminos
de la Licencia GNU Affero General Public License V3.
Este programa es distribuido con la esperanza de que te sea util, pero sin ningún tipo de garantia.
Fue desarrollo por Ing. Ditmar David Castro Angulo.
Puede ser considerado como un ORM Ligero para desarrollo.
DEPENDENCIA
	Este modulo depende del modulo MYSQL de node.js

	=========================================================
	Limites
	No soporta consultas anidadas frente a tablas de muchos a muchos
*/


var mysql=require("mysql")

var db=function(conf)
{
	
	this.configuration=function()
	{
		var obj={
			host:"localhost",
			user:"root",
			password:"",
			database:""
		}
		return obj;
	}
	this.config=conf||this.configuration();
	this.informationconnect=function()
	{
		var connection=mysql.createConnection({
			host:"localhost",
			user:"root",
			password:"",
			database:"information_schema"
		});
		return connection;
	}
	
	this.connect=function()
	{

		var connection=mysql.createConnection(this.config);
		return connection;
	}
	this.update=function(tabla,data)
	{
		var stack=Array();
		stack["where_and"]=false;
		stack["where_or"]=false;
		stack["orderby"]=false;
		sql="UPDATE  "+tabla+" SET "
		var fiels=Object.keys(data);
		ql="";
		c=""
		for(var i in fiels)
		{
			ql+=c+" "+fiels[i]+"='"+data[fiels[i]]+"'";
			c=',';
		}
		sql+=ql;
		this.execute=function(callback)
		{
			var connection=this.connect();
			connection.connect(function(err){
			if(err)
				throw err
			});
			connection.query(sql,data,function(err,result){
			if(err)
				throw err;
			callback(result)
		});

		}
		this.where=function(restric,t)
		{
			stack["where_and"]=true;
			if(stack["where_or"])
			{
				ql=" and";
			}else
			{
				ql=" where";	
			}
			
			
			var token=""
			var items=Object.keys(restric)
			var token="";
			for(var i in items)
			{
				if(t==undefined)
					t="="
				ql+=" "+token+" "+items[i]+t+"'"+restric[items[i]]+"'";
				token="and";

			}
			sql+=ql;
			return this;
		}
		this.where_or=function(restric,t)
		{
			stack["where_or"]=true;
			if(stack["where_and"])
			{
				ql=" or";
			}else{
				ql=" where";
			}
			var token=""
			var items=Object.keys(restric)
			var token="";
			for(var i in items)
			{
				if(t==undefined)
					t="="
				ql+=" "+token+" "+items[i]+t+"'"+restric[items[i]]+"'";
				token="or";
			}
			sql+=ql;
			return this;
		}
		return this;
	}
	this.save=function(tabla,data,callback)
	{
		var connection=this.connect();
		connection.connect(function(err){
			if(err)
				throw err
		});
		connection.query("INSERT INTO "+tabla+" SET ?",data,function(err,result){
			if(err)
				throw err;
			callback(result)
		});

		connection.end();
	}
	this.get=function(table)
	{
		var stack=Array();
		stack["where_and"]=false;
		stack["where_or"]=false;
		stack["orderby"]=false;
		var orderby=undefined;
		var sql="select "+table+".* from "+table;
		var TABLE=table;
		var parent=this;
		var limitnumber="";
		var order_by="";
		this.between=function(id,init,final,token)
		{
			if(stack["where_and"]||stack["where_or"])
			{
				if(token==undefined)
					token="and";	
			}else{
				if(token==undefined)
					token=" where ";
			}
			ql=" "+token+" "+id+" between "+init+" and "+final;
			sql+=ql;
			console.log(sql);
			return this;
		}
		this.limit=function(number)
		{
			limitnumber=" limit "+number;
			return this;
		}
		this.select=function(filter) {
			if(!filter.length){
				console.log("El parametro debe ser un Arreglo");
				return this
			}
			var ql=sql.split("from");
			var SQL=" from "+ql[1];
			var query="select ";
			var coma="";
			for(var i in filter)
			{
				query+=coma+" "+table+"."+filter[i];
				coma=",";
			}
			query+=SQL;
			sql=query;
			return this;
		};
		this.contains=function(key,token){
			if(stack["where_and"]||stack["where_or"]){
				if(token==undefined)
					token="and";
			}else{
				if(token==undefined)
					token="where";
			}
			var items=Object.keys(key)
			ql=" "+token+" "+items+"  like '%"+key[items]+"%'";
			sql+=ql;
			console.log(sql);
			return this;
		}
		this.all=function(table,callback){
			var obj=Object();
			obj[this.idRel]=this[this.idRef]
			var p=this;
			parent.get(table).where(obj).execute(function(rows){
				
				p[table]=rows;
				if(callback!=undefined)
					callback(p);
			});
		}
		this.execute=function(callback)
		{
			var connection=this.connect();
			connection.connect(function(err){
				if(err)
					throw err;
			});
			sql+=order_by+limitnumber;
			var parent=this;
			connection.query(sql,[],function(err,main_rows,fields){
				var schema_connect=parent.informationconnect();
				schema_connect.connect(function(err){
					if(err)
						throw err;
				});
				schema_connect.query("select * from INNODB_SYS_FOREIGN as s, INNODB_SYS_FOREIGN_COLS as c where REF_NAME='"+parent.config.database+"/"+TABLE+"' and s.id=c.id",[],function(err,rows,fields){
					//console.log("select * from INNODB_SYS_FOREIGN where REF_NAME='"+parent.config().database+"/"+TABLE+"'");
					//select * from INNODB_SYS_FOREIGN as s, INNODB_SYS_FOREIGN_COLS as c where REF_NAME='chat/usuario' and s.id=c.id
					for(var j in main_rows)
					{
						for(var i in rows)
						{
							var table_rel=rows[i]["FOR_NAME"].split("/")[1];
							var id_rel=rows[i]["FOR_COL_NAME"];
							var id_ref=rows[i]["REF_COL_NAME"];
							main_rows[j]["all"]=parent.all;
							main_rows[j][table_rel]=Array();
							main_rows[j][table_rel+"_table"]=table_rel;
							main_rows[j]['idRel']=id_rel;
							main_rows[j]['idRef']=id_ref;
						}
					}
					callback(main_rows);
						
				});
				schema_connect.end();
				/*this["prueba"]=function()
				{
					console.log("PRUEBAAAA")
				}
				if(err)
					throw err;
				for(var i in rows)
				{

				}
				rows[0]["ejecutar"]=this["prueba"];
				
				callback(rows);*/
			});
			connection.end();
		}
		this.orderby=function(name){
			stack["orderby"]=true;
			var id=name.substr(0,1);
			if(id=="-")
			{
				ql=" order by "+name.substr(1)+" desc ";
			}else{
				ql=" order by "+name;	
			}
			
			order_by=ql;
			return this;
		}
		this.where=function(restric,t)
		{
			stack["where_and"]=true;
			if(stack["where_or"])
			{
				ql=" and";
			}else
			{
				ql=" where";	
			}
			
			
			var token=""
			var items=Object.keys(restric)
			var token="";
			for(var i in items)
			{
				if(t==undefined)
					t="="
				ql+=" "+token+" "+items[i]+t+"'"+restric[items[i]]+"'";
				token="and";

			}
			sql+=ql;
			//console.log(sql);
			return this;
		}
		this.where_or=function(restric,t)
		{
			stack["where_or"]=true;
			if(stack["where_and"])
			{
				ql=" or";
			}else{
				ql=" where";
			}
			var token=""
			var items=Object.keys(restric)
			var token="";
			for(var i in items)
			{
				if(t==undefined)
					t="="
				ql+=" "+token+" "+items[i]+t+"'"+restric[items[i]]+"'";
				token="or";
			}
			sql+=ql;
			return this;
		}
		//console.log(sql);
		return this;
	}
	return this;
}
module.exports=db;