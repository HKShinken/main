var str = require('string-to-stream');
var multipart = require('parted').multipart;
var fs = require('fs');
var mysql = require('mysql2');


function main(args) {

	return new Promise((resolve, reject) => {
			//codifica dell' input "raw" dell'action 
			let decoded = new Buffer(args.__ow_body,'base64');
			let newStream = str(decoded);

			var options = {
				limit: 30 * 1024,
				diskLimit: 30 * 1024 * 1024
			};

			console.log('Definizione Parser');
			var parser = new multipart( args.__ow_headers["content-type"], options ), parts = {}; //conterrà tutti gli elementi del submit\
				
			parser.on('error', function(err) {
				console.log('parser error', err);
			});

			//popola l'array parts con i valori dei fields contenuti nel form che ha provocato il submit
			parser.on('part', function(field, part) {
				// temporary path or string
				parts[field] = part;
			});

			parser.on('data', function() {
				console.log('%d bytes scritti.', this.written);
			});

			//al termine del parsing sono processati i valori del form e integrati in una pagina HTML ritornata dall'action
			parser.on('end', function() 
			{
				//console.log(parts);

				//parts contiene i parametri passati dal form con gli stessi nomi
				var file = fs.readFileSync(parts.filetoupload); //filetoupload è l'elemento del form contenente il path del file da caricare
				var base64File = new Buffer(file).toString('base64');
				var filext = parts.filetoupload.split('.').pop().toLowerCase();
				
				//id autoincrementante el post
				var postId = null;
				
				//connesione al db
				var con = mysql.createConnection({
				  host: "172.1.0.8",
				  port: "3306",
				  user: "home",
				  password: "locale",
				  database: "sys"
				});
	
				var valueSet = [ null, parts.username, base64File, parts.width, parts.height ,filext, parts.filetoupload , parts.description, null, null, null ];
				
				//connessione al db ed aggiornamento tabelle con risposta HTML
				con.connect(function(err) 
				{
					if (err) throw err;
					console.log("Connesso al db!");
					console.log(parts);
				
					//prepared statement
					sql = "insert into sys.users_posts VALUES (?,?,?,?,?,?,?,?,?,?,?)"; 
					con.query(sql, valueSet, function (err, result) 
					{
					   if (err){ console.log(err); throw err};
					 
					   //ultimo id inserito autogfenerato in tabella
					   postId = result.insertId;
					   console.log("Record inserito con successo!, pid: " + postId); 
				
						//risposta html a valle della query che ritorna il post id		  
						resolve
						({
							statusCode: 200,
							headers: { 'Content-Type': 'text/html' },
							
							body: "<html><head>"+
							      "<body style=\"color: rgba(140, 80, 80, 0.9)\">"+
								  "<hr size=\"5\" width=\"45%\" align=\"left\" noshade/>" +
								  "<h2>Ciao " + parts.username + ", ecco un'anteprima del tuo post:</h2> "+
								  "<hr size=\"5\" width=\"45%\" align=\"left\" noshade/>" +
								  "<div><img id=\"prev\" src=\"data:image/" + filext + ";base64," + base64File + "\" width=600 height=600 /> "+ 
								  "<hr size=\"3\" width=\"45%\" align=\"left\" noshade/>" +
								  "<div><h3>Didascalia:</h3> "+ parts.description + "</div> </div>"+
								  "<hr size=\"3\" width=\"45%\" align=\"left\" noshade/>" +
								  "<form action = \"PARALLEL_LOAD\" method = \"POST\"> "+
								  "<input type=\"text\" hidden value='" + parts.username + "' readonly name=\"username\">"+
								  "<input type=\"text\" hidden value='" + postId + "' readonly name=\"pid\">"+
								  "<input type=\"text\" hidden value='600' readonly name=\"height\">"+
								  "<input type=\"text\" hidden value='200' readonly name=\"thheight\">"+
								  "<input type=\"text\" hidden value='600' readonly name=\"width\">"+
								  "<input type=\"text\" hidden value='200' readonly name=\"thwidth\">"+
								  "<input type=\"submit\" value='Salva tutto e vai alla bacheca!' \>"+
								  "</form>"+
								  "</body> <html>"
						});
				
					});//scope query
				}); //scope connessione
		});
		newStream.pipe(parser); //esegue la pipeline sopra definita
	});		
}
