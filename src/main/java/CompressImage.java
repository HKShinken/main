import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.*;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.*;
import java.util.Base64;
import com.google.gson.JsonObject;
import org.apache.commons.io.FileUtils;

import javax.imageio.ImageIO;

public class CompressImage {

    public static BufferedImage convertToBufferedImage(Image img) {

        if (img instanceof BufferedImage) {
            return (BufferedImage) img;
        }

        BufferedImage bi = new BufferedImage(
                img.getWidth(null), img.getHeight(null),
                BufferedImage.SCALE_SMOOTH);

        Graphics2D graphics2D = bi.createGraphics();
        graphics2D.drawImage(img, 0, 0, null);
        graphics2D.dispose();

        return bi;
    }

    //ridimensiona bufferedimage
    private static String resizeImg(String imgEncoded, String pathTarget,
                               int width, int height) throws IOException {

        String fileExtension = (!pathTarget.contains(".") ? "jpg" : pathTarget.substring(pathTarget.lastIndexOf(".") + 1));
        Path targetResized = Paths.get(pathTarget);

        byte[] decodedBytes = Base64.getDecoder().decode(imgEncoded);
        //trsforma i byte in un input stream senza copiare un nuovo file fisico sul disco
        InputStream input = new ByteArrayInputStream(decodedBytes);

        //conversione immagine input in BufferedImage
        BufferedImage originalImage = ImageIO.read(input);

        //se l'immagine considerata supera le dimensioni massime efefttuo il ridimensionamento
        if(originalImage.getWidth() > width || originalImage.getHeight() > height)
        {
            //System.out.println("stampo: "+originalImage);
            System.out.println("L' immagine supera le dimensioni " + width +"x" + height + ", resize in corso..");

            Image newResizedImage = originalImage.getScaledInstance(width, height, Image.SCALE_SMOOTH);

            //scrittura su file dell'immagine
            ImageIO.write(convertToBufferedImage(newResizedImage), fileExtension, targetResized.toFile());

            //codifica nuova immagine in b64 letta da path temporaneo appena creato
            byte[] fileContent = FileUtils.readFileToByteArray(new File(pathTarget));
            return Base64.getEncoder().encodeToString(fileContent);
        }
        else
        {
            System.out.println("L' immagine considerata non supera le dimensioni " + width + "x" + height + ", resize non necessario");
            return imgEncoded;
        }
    }


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

        int targetW = args.getAsJsonPrimitive("width").getAsInt(),
            targetH = args.getAsJsonPrimitive("height").getAsInt(),
            thumbW = args.getAsJsonPrimitive("thwidth").getAsInt(),
            thumbH = args.getAsJsonPrimitive("thheight").getAsInt();

        System.out.println("Connessione al database...");

        try {
             Connection connection = getConnection();
             System.out.println("Database conesso!");

             //lettura del post raw pubblicato dall'utente
            PreparedStatement select = connection.prepareStatement("select * from sys.users_posts where username = ? and post_id = ?");
            select.setString(1, appUser);
            select.setString(2, postId);
            ResultSet rs = select.executeQuery();
            rs.next();

            //Immagine originale codificata in base 64
            String imgEncoded = rs.getString("post_imgb64");
            String fileExt = rs.getString("file_ext");

            //ridimensionamento immagine in un path temporaneo
            String encodedResizedImg = resizeImg(imgEncoded, "/tmp/resized600x600", targetW, targetH);

           String encodedResizedThumb = resizeImg(imgEncoded, "/tmp/thumbnail", thumbW, thumbH);

            //aggiornamento del post con l'immagine ridimensionata
            PreparedStatement update = connection.prepareStatement("update sys.users_posts set post_imgb64 = ?, thumbnail_imgb64 = ? where username = ? and post_id = ?");
            update.setString(1, encodedResizedImg);
            update.setString(2, encodedResizedThumb);
            update.setString(3, appUser);
            update.setString(4, postId);
            update.executeUpdate();

            logger(connection, postId, appUser, "IMG_COMPRESSION", null, null, "OK" );

            JsonObject response = new JsonObject();
            response.addProperty("Esito", "Immagine compressa con successo!");

            return response;

        } catch (Exception e) {

            Connection cerr = getConnection();
            logger(cerr, postId, appUser, "IMG_COMPRESSION", String.valueOf(e), "Errore durante la fase di compressione dell immagine", "ERR" );
            cerr.close();

            e.printStackTrace();
            throw new IllegalStateException("Errore durante la compressione dell'immagine", e);
          }
    }
}
