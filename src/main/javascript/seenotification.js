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
	
	var values = [params.profile, params.pid]
	
	//aggiornamento della notifica in visualizzata
    var sql = "update sys.users_post_actions set seen = 'Y' where action_user = ? and action_type = 'L' and post_id = ?";
	
    con.query(sql,values, function (err, result, fields) {
								if (err) throw err;
								//console.log(result);
									
								var timelinePage = "https://localhost:31001/api/v1/web/guest/default/TIMELINE?username=" + params.username + "&pid=" + params.pid;
							
							    //risultato promise
								resolve
								({
									headers: { location: timelinePage },
									statusCode: 302
								})
					})
	})
}					

