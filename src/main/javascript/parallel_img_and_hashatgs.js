var openwhisk = require('openwhisk');
var options = { api_key: '23bc46b1-71f6-4ed5-8c54-816aa4f8c502:123zO3xZCLrMN6v2BKK1dXYFpXlPkccOFqm12CdAsMgRU4VrNZ9lyGVCGuMDGIwP', ignore_certs: true};
var mysql = require('mysql2');

function pipeline(args) {

  const params = args;
  const blocking = true;
  const blocking_par = false;
  const result = true;
  var ow = openwhisk(options);
  

 return ow.actions.invoke( {name: "DELETE_LOG", blocking, result, params} ).then(result => {

   //in parallelo processazione filtro descrizione e compressione immagine
			   return ow.actions.invoke([
					{name: "FILTER_DESC", blocking_par, result, params}, 
					{name: "COMP_IMG", blocking_par, result, params}
				]).then(response => { return ow.actions.invoke( {name: "CHECK_LOAD_STATE", blocking, result, params} ).then(answer => {return answer});})//chiusura then
				  .catch(error => console.log(error.message))
	  
 });
}
exports.main = pipeline