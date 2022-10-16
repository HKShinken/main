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
	var values = [params.username,params.pid];
	
	//pagina di redirezione in base allom stato
	switch(params.r)
	{
		case "0": 
		          page = 'https://localhost:31001/api/v1/web/guest/default/TIMELINE?username=' + values[0] + '&pid=' + values[1];
		break;
		
		case "1": 
		          page = 'https://localhost:31001/api/v1/web/guest/default/PROFILE?username=' + values[0] + '&pid=' + values[1] + '&profile=' + params.profile;
		break;
		
		case "2": 
		          page = 'https://localhost:31001/api/v1/web/guest/default/FEED?username=' + values[0] + '&pid=' + values[1];
		break;
		
		default: 
		          page ='https://localhost:31001/api/v1/web/guest/default/TIMELINE?username=' + values[0] + '&pid=' + values[1];
	}
	
    var sql = "select count(*) as cnt from sys.users_post_actions where action_user = ? and post_id = ?";
    var deleteLike = "delete from sys.users_post_actions where action_user = ? and post_id = ?";
    var addLike = "insert into sys.users_post_actions values(?, ?,'L',CURRENT_TIMESTAMP(),'N')";
	
    con.query(sql,values, function (err, result, fields) {
								if (err) throw err;
								//console.log(result);
								
								var liked = result[0].cnt;
								var actionSql = "";
								
								//se non ha mai messo like -> aggiungi like
								if( liked == 0)
									actionSql = addLike;
								else //else toglie il like
									actionSql = deleteLike
								
								con.query(actionSql,values, function (err, result, fields) { if (err) throw err; 
																								    resolve
																									({
																										headers: { location: page },
																										statusCode: 302
																									})
																								}); 
					})
	})
}					

