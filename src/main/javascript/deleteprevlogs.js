var mysql = require('mysql2');

function main(args) {
  
  var con = mysql.createConnection({
			  host: "172.1.0.8",
			  port: "3306",
			  user: "home",
			  password: "locale",
			  database: "sys"
			});
			
	//CANCELLAZIONE LOG PRECEDENTE 
	var valueSet = [ args.username, args.pid ];
	con.connect(function(err) {if (err) throw err;  
	                           console.log("Connesso al db!"); 
							   sql = "delete from sys.users_logs where username = ? and post_id = ? "; 
							   con.query(sql, valueSet, function (err, result) { if (err){ console.log(err); throw err}; })
							    
							  })
	  return { messaggio:"log precedenti cancellati per utente " + args.username + " su post: " + args.pid }
}   