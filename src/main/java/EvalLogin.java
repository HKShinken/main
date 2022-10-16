import com.google.gson.JsonObject;

import java.sql.*;

public class EvalLogin {

    private static Connection getConnection() throws SQLException {
        String url = "jdbc:mysql://172.1.0.8/sys";
        String username = "home";
        String password ="locale";
        return DriverManager.getConnection(url, username, password);
    }

    public static JsonObject main(JsonObject args) throws SQLException {

        //parametri action
        String appUser = args.getAsJsonPrimitive("username").getAsString(),
                pwd = args.getAsJsonPrimitive("pwd").getAsString();

        System.out.println("Connessione al database...");

        try {
            Connection connection = getConnection();
            System.out.println("Database connesso!");

            PreparedStatement select = connection.prepareStatement("select count(*) as cnt from sys.users where username = ? and password = ?");
            select.setString(1, appUser);
            select.setString(2, pwd);
             ResultSet rsCnt= select.executeQuery();
            rsCnt.next();
            boolean res = (rsCnt.getString("cnt").equals("0") ? false : true);


            JsonObject response = new JsonObject();
            response.addProperty("value", res);
           return response;

        } catch (Exception e) {

            e.printStackTrace();
            throw new IllegalStateException("Errore durante l' interazione col DB!", e);
        }
    }

}
