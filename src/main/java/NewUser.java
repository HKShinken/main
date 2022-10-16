import com.google.gson.JsonObject;

import java.sql.*;

public class NewUser {

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
                state = args.getAsJsonPrimitive("state").getAsString();

        System.out.println("Connessione al database...");

        String result = "";

         /*
                state 0 -> ok
                state 1 -> utente o email già registrati
                state 2 -> password non combaciano
                state -1 -> errore generico
         */

        try {
            Connection connection = getConnection();
            System.out.println("Database connesso!");

            if(!state.equals("0"))
                result ="FORM_REG?err=" + state;
            else {
                PreparedStatement checkReg = connection.prepareStatement("insert into sys.users values(?,?,?,current_date);");
                checkReg.setString(1, appUser);
                checkReg.setString(2, pwd);
                checkReg.setString(3, mail);
                checkReg.executeUpdate();
                result = "USER_GRID?username=" + appUser;

                PreparedStatement delSession = connection.prepareStatement("delete from sys.user_session where username = ?");
                delSession.setString(1, appUser);
                delSession.executeUpdate();

                //inserimento sessione
                PreparedStatement userSession = connection.prepareStatement("insert into sys.user_session values(?, current_timestamp())");
                userSession.setString(1, appUser);
                userSession.executeUpdate();
            }

            JsonObject response = new JsonObject();
            response.addProperty("page", result);

           return response;

        } catch (Exception e) {

            e.printStackTrace();
            throw new IllegalStateException("Errore durante l' interazione col DB!", e);
        }
    }

}
