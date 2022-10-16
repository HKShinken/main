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
	var values = [params.username, params.username, params.username, params.username];

	//cancellazione di tutti i riferimenti all'utente
    var sql = " DELETE from sys.users where username = ?;"
              +"DELETE from sys.users_posts where username = ?;"
              +"DELETE from sys.users_post_actions where action_user = ?;"
              +"DELETE from sys.users_logs where username = ?;"

    con.query(sql,values, function (err, result, fields) {
								if (err) throw err;
								//console.log(result);
								 resolve ({
											 headers: { location: 'FORM_LOGIN'},
											 statusCode: 302
										 })
					})
	})
}					

