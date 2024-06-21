package servlet;

import database.DatabaseConfig;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;

@WebServlet("/pages/deleteFile")
public class DeleteFile extends HttpServlet {
    private static final long serialVersionUID = 1L;

    // 上传文件存储目录
    private static final String UPLOAD_DIRECTORY = "upload";

    static Connection conn;
    static PreparedStatement ps;


    //连接数据库
    static {
        try {
            DatabaseConfig config = new DatabaseConfig();
            String url = config.getDatabaseUrl();
            String user = config.getDatabaseUser();
            String password = config.getDatabasePassword();
            Class.forName("com.mysql.cj.jdbc.Driver");
            conn = DriverManager.getConnection(url, user, password);
        } catch(SQLException | ClassNotFoundException ex){
            ex.printStackTrace();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        doPost(request, response);
    }

    public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String userID = request.getParameter("user_id");
        String fileName = request.getParameter("file_name");

        // 获取上传的文件对象
        String uploadPath = request.getServletContext().getRealPath("./") + File.separator + UPLOAD_DIRECTORY;
        File file = new File(uploadPath + File.separator + fileName);

        //删除文件
        try {
            ps = conn.prepareStatement("DELETE FROM files WHERE user_id = ? AND file_name = ?");
            ps.setString(1, userID);
            ps.setString(2, fileName);
            ps.executeUpdate();
            if(file.exists()) file.delete();
            System.out.println("delete file: " + fileName + ", from user: " + userID);
        } catch (SQLException e) {
            e.printStackTrace();
            response.sendError(500, "Failed to delete file from database.");
            throw new RuntimeException(e);
        }
    }
}
