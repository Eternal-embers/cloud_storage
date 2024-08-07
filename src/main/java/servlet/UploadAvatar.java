package servlet;

import database.DatabaseConfig;

import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.*;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.UUID;

@MultipartConfig
@WebServlet("/pages/uploadAvatar")
public class UploadAvatar extends HttpServlet {
    private static final long serialVersionUID = 1L;

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
        } catch(SQLException ex){
            ex.printStackTrace();
        } catch (ClassNotFoundException ex) {
            ex.printStackTrace();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws  IOException {
        //身份验证
        HttpSession session = request.getSession();
        Long user_id = (Long)session.getAttribute("userID");
        if(user_id == null) {
            // 发送401 Unauthorized错误
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "User not logged in.");
            return;
        }

        try {
            // 获取图片文件的输入流
            Part filePart = request.getPart("avatar");

            String fileName = extractFileName(filePart); // 提取文件名
            String fileExtension = getFileExtension(fileName); // 获取文件拓展名
            if (!isImage(fileExtension)) {
                response.sendError(400, "Invalid file extension. please upload a valid image file.");
            }

            // 创建文件存储目录
            String contextPath = request.getServletContext().getRealPath("avatar");
            File uploadDir = new File(contextPath);
            String uploadPath = uploadDir.getAbsolutePath(); // 获取绝对路径
            if (!uploadDir.exists()) uploadDir.mkdir();

            // 构建文件存储路径
            String avatarPath = UUID.randomUUID() + "." + fileExtension;
            File uploadFile = new File(uploadPath + "\\" + avatarPath);
            System.out.println("upload avatar to: " + uploadFile.getAbsolutePath());//控制台测试

            // 写入文件
            InputStream inputSteam = filePart.getInputStream();
            try (OutputStream outputStream = new FileOutputStream(uploadFile)) {
                byte[] buffer = new byte[4096];
                int bytesRead;
                while ((bytesRead = inputSteam.read(buffer)) != -1) {
                    outputStream.write(buffer, 0, bytesRead);
                }
            } catch (IOException e) {
                e.printStackTrace();
                response.sendError(500, "Failed to write file to disk.");
                return;
            }

            //更新数据库中的头像路径
            try {
                ps = conn.prepareStatement("UPDATE user SET avatar = ? WHERE user_id =?");
                ps.setString(1, avatarPath);
                ps.setLong(2, user_id);
                ps.executeUpdate();
            } catch (SQLException e) {
                e.printStackTrace();
                response.sendError(500, "Failed to update database.");
            } finally {
                try {
                    ps.close();
                } catch (SQLException e) {
                    throw new RuntimeException(e);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.sendError(500, "internal server error.");
        }
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        doPost(request, response);
    }

    // 辅助方法，从Part对象中提取文件名
    private String extractFileName(Part part) {
        String contentDisp = part.getHeader("Content-Disposition");//Content-Disposition通常用于multipart/form-data类型的表单提交中
        String[] items = contentDisp.split(";");//将contentDisp字符串按照分号分割成数组item
        for (String item : items) {
            if (item.trim().startsWith("filename")) {
                return item.trim().split("=")[1].replace("\"", "");//获取"="后面的文件名，并去掉包围文件名的引号
            }
        }
        return "";
    }

    //获取文件拓展名
    public String getFileExtension(String fileName) {
        if (fileName.lastIndexOf('.') != -1 && fileName.lastIndexOf('.') != 0) {
            return fileName.substring(fileName.lastIndexOf('.') + 1);
        } else {
            return ""; // 没有找到文件后缀
        }
    }

    public boolean isImage(String extension) {
        // 定义一个包含有效图片扩展名的集合
        String[] validImageExtensions = {"jpg", "jpeg", "png", "gif", "bmp", "webp", "svg", "tiff", "tif"};

        // 检查扩展名是否在有效的扩展名集合中
        for (String validExtension : validImageExtensions) {
            if (validExtension.equalsIgnoreCase(extension)) {
                return true; // 是一个有效的图片扩展名
            }
        }
        return false; // 不是有效的图片扩展名
    }
}
