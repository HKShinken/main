import com.google.gson.JsonObject;

import java.sql.*;

public class EvalReg {

    private static Connection getConnection() throws SQLException {
        String url = "jdbc:mysql://172.1.0.8/sys";
        String username = "home";
        String password ="locale";
        return DriverManager.getConnection(url, username, password);
    }

    public static JsonObject main(JsonObject args) throws SQLException {

        //parametri action
        String appUser = args.getAsJsonPrimitive("username").getAsString(),
                pwd = args.getAsJsonPrimitive("pwd").getAsString(),
                mail = args.getAsJsonPrimitive("mail").getAsString(),
                pwdcheck = args.getAsJsonPrimitive("pwdcheck").getAsString();

        System.out.println("Connessione al database...");

        try {
            Connection connection = getConnection();
            System.out.println("Database connesso!");

            int state = -1;

            PreparedStatement checkReg = connection.prepareStatement("select count(*) as cnt from sys.users where username = ? or email = ?");
            checkReg.setString(1, appUser);
            checkReg.setString(2, mail);
             ResultSet rsCnt= checkReg.executeQuery();
            rsCnt.next();

            /*
                state 0 -> ok
                state 1 -> utente o email già registrati
                state 2 -> password non combaciano
                state -1 -> errore generico
             */

            if (rsCnt.getString("cnt").equals("0"))
            {
               if(!pwdcheck.equals(pwd)) state = 2; else state = 0;
            }
            else state = 1;

            JsonObject response = new JsonObject();
            response.addProperty("state", state);
            response.addProperty("username", appUser);
            response.addProperty("pwd", pwd);
            response.addProperty("mail", mail);
           return response;

        } catch (Exception e) {

            e.printStackTrace();
            throw new IllegalStateException("Errore durante l' interazione col DB!", e);
        }
    }

}
