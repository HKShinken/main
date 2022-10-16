function main(args){
	
	var errMsg = null;
	
	switch(args.err)
	{
		case "1": errMsg = "<hr size=\"3\" width=\"30%\" align=\"left\" noshade/><h3> NOME UTENTE / EMAIL GIA' UTILIZZATI</h3>";
		break;
		
		case "2": errMsg = "<hr size=\"3\" width=\"30%\" align=\"left\" noshade/><h3> LE PASSWORD NON COINCIDONO, RIPROVA</h3>";
		break;
		
		case "-1": errMsg = "<hr size=\"3\" width=\"30%\" align=\"left\" noshade/><h3> ERRORE GENERICO DI SISTEMA, RIPROVARE PIU' TARDI</h3>";
		break;
		
		default: errMsg = "";
		
	}
	
	return {
    headers: {
      'Content-Type': 'text/html'
    },
    statusCode: 200,
    body: "<html> <head> "
		+ "</head>"
		+ "   <body style=\"color: rgba(140, 80, 80, 0.9)\">"
		+ errMsg
		+ "      <hr size=\"5\" width=\"30%\" align=\"left\" noshade/>"
		+ "      <h2> REGISTRATI SU SIMPLE INSTAGRAM </h2>"
		+ "      <form action = \"REGISTER\" method = \"POST\" enctype=\"multipart/form-data\"> "
		+ "		 <table style=\"position:relative; text-align: left; font-weight: bold; left: 2%\">"
		+ "			<tr>"
		+ "			   <td>Digita il nome utente</td>"
		+ "			   <td><input type=\"text\" placeholder=\"Utente\" size=15 place required name=\"username\"></td>"
		+ "			</tr>"
		+ "			<tr>"
		+ "			   <td>Digita l' email</td>"
		+ "			   <td><input type=\"email\" placeholder=\"Tua mail\" size=15 required name=\"mail\"></td>"
		+ "			</tr>"
        + "			<tr>"
		+ "			   <td>Digita la password</td>"
		+ "			   <td><input type=\"password\" placeholder=\"Password\" size=15 required name=\"pwd\"></td>"
		+ "			</tr>"
		+ "			<tr>"
		+ "			   <td>Digita nuovamente la password</td>"
		+ "			   <td><input type=\"password\" placeholder=\"Password\" size=15 required name=\"pwdcheck\"></td>"
		+ "			</tr>"
		+ "			<tr>"
		+ "			   <td><input type = \"submit\" value = \"            REGISTRATI AL SITO!            \"></td>"
		+ "			</tr>"
		+ "		 </table>"
		+ "      </form>"
		+ "      <hr size=\"5\" width=\"30%\" align=\"left\" noshade/>"
		+ "      </br><h3><a style=\"text-decoration: none; color: rgba(180, 80, 80, 0.9)\" href=\"FORM_LOGIN\"> CLICCA QUI PER IL LOGIN </a></h3>"
        + "      <hr size=\"5\" width=\"30%\" align=\"left\" noshade/>"
		+ "   </body>"
		+ "</html>" 
		}
}
