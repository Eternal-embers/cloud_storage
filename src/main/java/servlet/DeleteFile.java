package servlet;

import database.DatabaseConfig;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.IOException;
import java.sql.*;

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
        //验证用户是否登录
        String user_id = request.getSession().getAttribute("user_id").toString();
        if(user_id == null) {
            // 发送401 Unauthorized错误
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "User not logged in.");
            return;
        }

        //删除文件
        try {
            String file_id = request.getParameter("file_id");
            //查询文件
            ps = conn.prepareStatement("SELECT file_name FROM files WHERE file_id = ?");
            ps.setString(1, file_id);
            ResultSet rs = ps.executeQuery();

            if(!rs.next()){
                response.sendError(404, "File not found.");
                return;
            }

            String fileName = rs.getString("file_name");

            //删除数据库中的记录
            ps = conn.prepareStatement("DELETE FROM files WHERE user_id = ? AND file_id = ?");
            ps.setString(1, user_id);
            ps.setString(2, file_id);
            ps.executeUpdate();

            // 删除文件
            String uploadPath = request.getServletContext().getRealPath("./") + File.separator + UPLOAD_DIRECTORY + File.separator + user_id;
            File file = new File(uploadPath + File.separator + fileName);
            if(file.exists()) file.delete();

            System.out.println("delete file: " + fileName + ", from user: " + user_id);
        } catch (SQLException e) {
            e.printStackTrace();
            response.sendError(500, "Failed to delete file from database.");
            throw new RuntimeException(e);
        }
    }
}
