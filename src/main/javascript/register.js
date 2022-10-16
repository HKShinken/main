var str = require('string-to-stream');
var multipart = require('parted').multipart;
var openwhisk = require('openwhisk');
var optionsOW = { api_key: '23bc46b1-71f6-4ed5-8c54-816aa4f8c502:123zO3xZCLrMN6v2BKK1dXYFpXlPkccOFqm12CdAsMgRU4VrNZ9lyGVCGuMDGIwP', ignore_certs: true};
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
				
			   //PARAMETRI INVOCAZIONE COMPOSITION
				 const params = {username: parts.username, pwd: parts.pwd, pwdcheck: parts.pwdcheck , mail: parts.mail};
				 const blocking = true;
				 const resultComp = true;
				 var ow = openwhisk(optionsOW);
				 
				//invocazione azione composer che in base all'esito del login effettua un redirect  
				ow.actions.invoke( {name: "CHECK_REG", blocking, resultComp, params} ).then(jsonResult => {
		
				//console.log("Risultato: " + JSON.stringify(result));
				//risposta html a valle della query che ritorna il post id		  
				
					resolve
					({
						headers: { location: jsonResult.response.result.page },
							statusCode: 302
					})
				 })
		});
		newStream.pipe(parser); //esegue la pipeline sopra definita
	});		
}
