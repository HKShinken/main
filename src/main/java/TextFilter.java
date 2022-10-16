import com.google.gson.JsonObject;

import java.sql.*;



public class TextFilter {

    private static Connection getConnection() throws SQLException {
        String url = "jdbc:mysql://172.1.0.8/sys";
        String username = "home";
        String password ="locale";
        return DriverManager.getConnection(url, username, password);
    }

    private static void logger(Connection c, String ... params) throws SQLException {
        PreparedStatement insErr = c.prepareStatement("insert into sys.users_logs values( ?,?,?,?,?,?)");
        insErr.setString(1, params[0]);
        insErr.setString(2, params[1]);
        insErr.setString(3, params[2]);
        insErr.setString(4, params[3]);
        insErr.setString(5, params[4]);
        insErr.setString(6, params[5]);
        insErr.executeUpdate();
    }

    public static JsonObject main(JsonObject args) throws SQLException {

        //parametri action
        String appUser = args.getAsJsonPrimitive("username").getAsString(),
                postId = args.getAsJsonPrimitive("pid").getAsString();

        System.out.println("Connessione al database...");

        try {
                Connection connection = getConnection();
                System.out.println("Database connesso!");

                //lettura descrizione originale caricata dall' utente
                PreparedStatement select = connection.prepareStatement("select original_post_description from sys.users_posts where username = ? and post_id = ?");
                select.setString(1, appUser);
                select.setString(2, postId);
                ResultSet rs = select.executeQuery();
                rs.next();

                //descrizione eventualmente filtrata
                String unfilteredDescription = rs.getString(1) ;

                //lettura descrizione originale caricata dall' utente
                PreparedStatement forbiddenWords = connection.prepareStatement("select word from sys.forbiddenwords order by word desc");
                ResultSet rsfb = forbiddenWords.executeQuery();
                String forbiddenWordsList = "\\#?(";

                //concatenazione parole vietate nella regexp
                while (rsfb.next()) forbiddenWordsList += rsfb.getString(1) + "|";

                forbiddenWordsList = forbiddenWordsList.substring(1, forbiddenWordsList.length()-1) + ")";

                System.out.println("Regexp: " + forbiddenWordsList);

                //rimozione stringhe vietate
                String resFiltered = unfilteredDescription.replaceAll(forbiddenWordsList,"");

                //aggiornamento del post con l'immagine ridimensionata
                PreparedStatement update = connection.prepareStatement("update sys.users_posts set filtered_post_description = ? where username = ? and post_id = ?");
                update.setString(1, resFiltered);
                update.setString(2, appUser);
                update.setString(3, postId);
                update.executeUpdate();

                logger(connection, postId, appUser, "DESC_FILTERING", null, null, "OK" );

                JsonObject response = new JsonObject();
                response.addProperty("Esito", "Descrizione filtrata con successo!");
                response.addProperty("post filtrato", resFiltered );

                return response;

        } catch (SQLException e) {

            Connection cerr = getConnection();
            logger(cerr, postId,appUser, "DESC_FILTERING",String.valueOf(e), "Errore durante il filtraggio del testo del post", "ERR" );
            cerr.close();

            e.printStackTrace();
            throw new IllegalStateException("Errore durante l' interazione col DB!", e);
        }
    }

}
