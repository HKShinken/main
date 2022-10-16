var mysql = require('mysql2');

function main(params)
{
	return new Promise((resolve, reject) => {
	var con = mysql.createConnection({
				  host: "172.1.0.8",
				  port: "3306",
				  user: "home",
				  password: "locale",
				  database: "sys"
				});
	
	//parametri per query
	var values = [params.username];
	
    var sql = "delete from sys.user_session where username = ?;";
	
    con.query(sql,values, function (err, result, fields) {
								if (err) throw err;
								//console.log(result);
																
								resolve
								({
									headers: { location: 'FORM_LOGIN' },
									statusCode: 302
								})
					})
	})
}					

