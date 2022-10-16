var mysql = require('mysql2');

function main(params)
{
	return new Promise((resolve, reject) => {
	var con = mysql.createConnection({
				  host: "172.1.0.8",
				  port: "3306",
				  user: "home",
				  password: "locale",
				  database: "sys",
				  multipleStatements: true
				});
	
	//parametri per query
	var values = [params.pid, params.pid, params.pid];
	
	//cancellazione di tutti i riferimenti al post
    var sql = "delete from sys.users_post_actions where post_id = ?;"+
              "delete from sys.users_posts where post_id = ?;"
              "delete from sys.users_logs where post_id = ?";
	
    con.query(sql,values, function (err, result, fields) {
								if (err) throw err;
								//console.log(result);
								 resolve ({
											 headers: { location: 'TIMELINE?username=' + params.username + '&b=0'},
											 statusCode: 302
										 })
					})
	})
}					

