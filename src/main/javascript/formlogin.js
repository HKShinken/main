function main(args){
	
	var errMsg =""
	
	errMsg = (args.err == 1 ? "<hr size=\"3\" width=\"30%\" align=\"left\" noshade/><h3> CREDENZIALI ERRATE, RIPROVA</h3>" : "");
	
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
		+ "      <h2>LOGIN SU SIMPLE INSTAGRAM </h2>"
		+ "      <form action = \"LOGIN\" method = \"POST\" enctype=\"multipart/form-data\"> "
		+ "		 <table style=\"position:relative; text-align: left; font-weight: bold; left: 2%\">"
		+ "			<tr>"
		+ "			   <td>Digita nome utente</td>"
		+ "			   <td><input type=\"text\" placeholder=\"Utente\" size=15 place required name=\"username\"></td>"
		+ "			</tr>"
		+ "			<tr>"
		+ "			   <td>Digita la password</td>"
		+ "			   <td><input type=\"password\" placeholder=\"Password\" size=15 required name=\"pwd\"></td>"
		+ "			</tr>"
		+ "			<tr>"
		+ "			   <td><input type = \"submit\" value = \"            LOGIN            \"></td>"
		+ "			</tr>"
		+ "		 </table>"
		+ "      </form>"
		+ "      <hr size=\"5\" width=\"30%\" align=\"left\" noshade/>"
		+ "      </br><h3><a style=\"text-decoration: none; color: rgba(180, 80, 80, 0.9)\" href=\"FORM_REG\"> CLICCA QUI PER REGISTRARTI </a></h3>"
        + "      <hr size=\"5\" width=\"30%\" align=\"left\" noshade/>"
		+ "   </body>"
		+ "</html>" 
		}
}
