var mysql = require('mysql2');

function main(args){
	
	return new Promise((resolve, reject) => {
	var con = mysql.createConnection({
				  host: "172.1.0.8",
				  port: "3306",
				  user: "home",
				  password: "locale",
				  database: "sys"
				});
	
	var sqlSession = "select count(*) as cnt from sys.user_session where username = ?";
	var delIncompletePosts = "delete from sys.users_posts where username = ? and update_date is null";
	
	con.query(sqlSession,[args.user], function (err, resultSession, fields) {
										if (err) throw err;

				if(resultSession[0].cnt == 0)
				{
					resolve
					({
						headers: {
						  'Content-Type': 'text/html'
						},
						statusCode: 403,
						body : '<html><body><h1>NOT LOGGED</h1></body></html>'
					})
				}	
				else
				{
					//cancellazione preventiva di post incompleti 
					con.query(delIncompletePosts,[args.user], function (err, resultSession, fields) {
										if (err) throw err;
					   
							   htmlPage = "<html> <head> <script>"
								+ " var loadFile = function(event) {"
								+ "	var image = document.getElementById('outimg');"
								+ "	document.getElementById(\"preview\").hidden = false;"
								+ "	image.src = URL.createObjectURL(event.target.files[0]);"
								+ "  };"
								+ "  function imgSize() {"
								+ "    var myImg = document.querySelector('#outimg');"
								+ "    var realWidth = myImg.naturalWidth;"
								+ "    var realHeight = myImg.naturalHeight;"
								+ "	 document.getElementById(\"w\").hidden = false;"
								+ "	 document.getElementById(\"h\").hidden = false;"
								+ "	 document.getElementById(\"wl\").hidden = false;"
								+ "	 document.getElementById(\"hl\").hidden = false;"
								+ "	 document.getElementById(\"w\").value = realWidth;"
								+ "	 document.getElementById(\"h\").value = realHeight;"
								+ "	 if(realWidth > 600 || realHeight > 600)"
								+ "      alert(\"L' immagine scelta ha dimensioni: \" + realWidth + \"x\" + realHeight + \" pertanto verrà automaticamente ridimensionata a 600 x 600!\");"
								+ " }"
								+ "  function encodeImageFileAsURL(element) {"
								+ "	  var file = element.files[0];"
								+ "	  var reader = new FileReader(); " 
								+ "	  reader.readAsDataURL(file);"
								+ "	  reader.onloadend = function() { document.getElementById(\"encImg\").value = reader.result; }"
								+ "  }"
								+ "</script>"
								+ "</head>"
								+ "   <body style=\"color: rgba(140, 80, 80, 0.9); img { display: block; max-width:600; max-height:600; width: 600px; height: 600px; }\">"
								+ "      <h2> CIAO "+ args.user +", AGGIUNGI UN POST </h2>"
								+ "      <hr size=\"5\" width=\"75%\" align=\"left\" noshade/>"
								+ "      <form action = \"LOAD_IMAGE\" method = \"POST\" enctype=\"multipart/form-data\"> "
								+ "		 <table style=\"position:relative; text-align: left; font-weight: bold; left: 2%\">"
								+ "			<tr>"
								+ "				<td>Scegli un' Immagine</td>"
								+ "				<td><input type=\"file\" onchange=\"loadFile(event)\" required id=\"file\" name=\"filetoupload\"></td>"
								+ "			</tr>"
								+ "			<tr>"
								+ "				<td>Aggiungi una descrizione :</td>"
								+ "				<td><textarea style=\"resize:none;\" name=\"description\" rows=\"7\" cols=\"40\"></textarea></td>"
								+ "			</tr>"
								+ "			<tr>"
								+ "			   <td id=\"wl\" hidden>Larghezza originale:</td>"
								+ "			   <td><input type=\"text\" hidden size=3 readonly id=\"w\" name=\"width\"></td>"
								+ "			</tr>"
								+ "			<tr>"
								+ "			   <td id=\"hl\" hidden>Altezza Originale:</td>"
								+ "			   <td><input type=\"text\" hidden size=3 readonly id=\"h\" name=\"height\"></td>"
								+ "			   <td><input type=\"text\" hidden size=20 readonly name=\"username\" value=\"" + args.user + "\"></td>"
								+ "			</tr>"
								+ "			<tr>"
								+ "			   <td><input type = \"submit\" value = \"            CREA IL POST            \"></td>"
								+ "			</tr>"
								+ "		 </table>"
								+ "      </form>"
								+ "		<h4><a href=\"USER_GRID?username=" + args.user + "\">TORNA ALLA TUA BACHECA</a></h4>"
								+ "		<input type=button value=\"LOGOUT\" onClick=\"window.location.replace('LOGOUT?username=" + args.user + "')\">"
								+ "	  <div id=\"preview\" hidden>"
								+ "	    <hr size=\"5\" width=\"420\" align=\"left\" noshade/>"
								+ "		<h3>Anteprima immagine: </h3>"
								+ "		<img id=\"outimg\" width=\"600\" heigth=\"600\" onLoad=\"imgSize();\" src=\"\" />"
								+ "		<hr size=\"5\" width=\"420\" align=\"left\" noshade/>"
								+ "		<h4 >Nota: le immagini verrano automaticamente ridimensionate a una risoluzione pari a 600 x 600!</h4>"
								+ "	  </div>"
								+ "   </body>"
								+ "</html>";
								
								resolve
								({
									headers: {
									  'Content-Type': 'text/html'
									},
									statusCode: 200,
									body : htmlPage
								})
					})//query cancellazione post incompleti
				}
			})
		}) //chsiusura promise
}
