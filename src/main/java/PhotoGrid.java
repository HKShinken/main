import java.sql.*;
import com.google.gson.JsonObject;

public class PhotoGrid {

    private static Connection getConnection() throws SQLException {
        String url = "jdbc:mysql://172.1.0.8/sys";
        String username = "home";
        String password ="locale";
        return DriverManager.getConnection(url, username, password);
    }

    public static JsonObject main(JsonObject args) throws SQLException {

        //parametri action
        String appUser = args.getAsJsonPrimitive("username").getAsString();

        System.out.println("Connessione al database...");

        try {
            Connection connection = getConnection();
            System.out.println("Database conesso!");

            String imgB64 = null,
                   imgEncoded = null,
                   fileExt = null,
                   pid = null,
                   innerGrid="<table>";
            int counter=1;

            //recupero sessione
            PreparedStatement userSession = connection.prepareStatement("select count(*) as cnt from sys.user_session where username = ?");
            userSession.setString(1, appUser);
            ResultSet uss = userSession.executeQuery();
            uss.next();

            String htmlPage = "";

            if(uss.getString("cnt").equals("1")) {

                //elenco totale di post dell'utente
                PreparedStatement select = connection.prepareStatement("select * from sys.users_posts c where username = ? and update_date is not null order by update_date desc");
                select.setString(1, appUser);
                ResultSet rs = select.executeQuery();

                //elenco delle notifiche ricevuta dall'utente
                PreparedStatement actionList = connection.prepareStatement("select ( CURRENT_DATE - CAST(INSERT_DATE AS DATE) ) as elapsed, src.action_user ,src.post_id, substr(ifnull(slv.filtered_post_description,''),1,20) as filtered_post_description, case when ifnull(seen,'*') = 'N' then 1 else 0 end as newaction from sys.users_post_actions src join sys.users_posts slv on src.post_id = slv.post_id where slv.username = ? and action_user <> ? order by insert_date desc");
                actionList.setString(1, appUser);
                actionList.setString(2, appUser);
                ResultSet rsActionList = actionList.executeQuery();

                 htmlPage = "<html> <head> <style> div.ex1 { width: 400px; height: 100px; overflow: scroll;  background-color: #EEEEEE; } table, th, td { border: 1px solid black; } .center {color: rgba(140, 80, 80, 0.9); display: block; margin-left: auto; margin-right: auto; width: 50%; } .tinycircle { margin-left: 1; clip-path: circle(); } .spacing { margin: 8px 8px 0px 0px; } a { text-decoration: none; } </style></head>"
                        + "<script>function showNotifications(n) { el = document.getElementById(n); el.hidden = (el.hidden == false ? true : false);} </script>"
                        + "<body class=\"center\">"
                        + "<hr size=\"4\" width=\"75%\" align=\"left\" noshade/>"
                        + "<div> <h1> Ciao " + appUser + ", di seguito la tua bacheca </h1>"
                        + "<hr size=\"4\" width=\"75%\" align=\"left\" noshade/>"
                        + "<div style=\"position:absolute; right:200px\">"

                        //sezione div notifiche
                        + "PLACEHOLDER_ALERT_NOTIFY"
                        + "	<div style=\"width:400px\"><input type=\"button\" onClick = 'showNotifications(\"notifications\")' value=\"Mostra/Nascondi notifiche\" /></div>"
                        + "	<div id = \"notifications\" class=\"ex1\" hidden>";

                //sezione elenco notifiche
                String elencoNotifiche = "", elapsed;
                int newActionCounter = 0;

                String linkTmlHref = "href=\"PROFILE?username=" + appUser;
                String linkSeeNotHref = "href=\"SEE_NOTIFICATION?username=" + appUser + "&pid=";

                while (rsActionList.next()) {
                    elapsed = rsActionList.getString("elapsed");
                    elapsed = (elapsed.equals("0") ? "Oggi: " : elapsed + "g: ");

                    //se la notifica non è stata ancora letta viene evidenziata di rosso
                    if (rsActionList.getString("newaction").equals("1")) {
                        newActionCounter++;
                        elencoNotifiche += "<div> " + elapsed + " <a style=\"font-weight: bold;color:red;\"" + linkTmlHref + "&profile=" + rsActionList.getString("action_user") + "\"> " + rsActionList.getString("action_user") + "</a>" + "<a style=\"color:red;\"" + linkSeeNotHref + rsActionList.getString("post_id") + "&profile=" + rsActionList.getString("action_user") + "\" > ha messo like al tuo post '" + rsActionList.getString("filtered_post_description") + "'</a></div>";
                    } else //altrimenti nessuna formattazione
                        elencoNotifiche += "<div> " + elapsed + " <a style=\"font-weight: bold\"" + linkTmlHref + "&profile=" + rsActionList.getString("action_user") + "\"> " + rsActionList.getString("action_user") + "</a>" + "<a " + linkSeeNotHref + rsActionList.getString("post_id") + "&profile=" + rsActionList.getString("action_user") + "\" > ha messo like al tuo post '" + rsActionList.getString("filtered_post_description") + "'</a></div>";
                }

                //se c'è almeno una notifica nuova viene visualizzato un avviso su schermo
                if (newActionCounter > 0)
                    htmlPage = htmlPage.replace("PLACEHOLDER_ALERT_NOTIFY", "<h3>Hai " + newActionCounter + " nuove notifiche!</h3>");
                else
                    htmlPage = htmlPage.replace("PLACEHOLDER_ALERT_NOTIFY", "<h3>Nessuna nuova motifica</h3>");

                // System.out.println("stampo: "+elencoNotifiche);
                htmlPage += elencoNotifiche + "</div></div>"
                        //htmlPage +=  "</div></div>"
                        + "<table style=\"position:relative; text-align: center; font-weight: bold; \">"
                        + "<tr> <td> Totale post pubblicati: PLACEHOLDER_NPOSTS </td> </tr>"
                        + "</table>"
                        + "<h4><a href=\"ADD_POST?user=" + appUser + "\">AGGIUNGI POST</a></h4>"
                        + "<h4><a href=\"TIMELINE?username=" + appUser + "\">TIMELINE</a></h4>"
                        + "<h4><a href=\"FEED?username=" + appUser + "\">IL TUO FEED</a></h4>"
                        + "<input type=button value=\"LOGOUT\" onClick=\"window.location.href='LOGOUT?username=" + appUser + "'\">"
                        + "<hr size=\"3\" width=\"75%\" align=\"left\" noshade/>"
                        + "</div>"
                        + "<h3 style=\"position:relative; left: 20%\">ANTEPRIME DEI TUOI POSTS</h3>";

                int nPosts = 0;
                //thumbnail posizionate su griglia larga 3 blocchi
                while (rs.next()) {

                    nPosts++;

                    if ((counter - 1) % 3 == 0) innerGrid += "<tr>";

                    imgEncoded = rs.getString("thumbnail_imgb64");
                    fileExt = rs.getString("file_ext");
                    pid = rs.getString("post_id");

                    imgB64 = "data:image/" + fileExt + ";base64," + imgEncoded;

                    innerGrid += "<td><a href=\"TIMELINE?username=" + appUser + "&pid=" + pid + "\"><img src=\"" + imgB64 + "\" ></a></td>";

                    if (counter % 3 == 0) innerGrid += "</tr>";

                    counter++;

                }

                if (!innerGrid.endsWith("</td>")) innerGrid += "</td>";
                innerGrid += "</table>";

                htmlPage += innerGrid + "</body></html>";

                htmlPage = htmlPage.replace("PLACEHOLDER_NPOSTS", nPosts + "");
            }
            else htmlPage = "<html><body><h1>NOT LOGGED</h1></body></html>";

            JsonObject response = new JsonObject();
            response.addProperty("body", htmlPage);

            return response;

        } catch (Exception e) {
            e.printStackTrace();
            throw new IllegalStateException("Errore durante la compressione dell'immagine", e);
        }
    }
}
