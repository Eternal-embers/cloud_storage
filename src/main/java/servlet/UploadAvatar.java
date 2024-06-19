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
        try {
            // 获取图片文件的输入流
            Part filePart = request.getPart("avatar");

            if (filePart == null) {
                response.sendError(400, "No file found.");
                return;
            }

            String fileName = extractFileName(filePart); // 提取文件名
            String fileExtension = getFileExtension(fileName); // 获取文件拓展名

            // 创建文件存储目录
            String contextPath = request.getServletContext().getRealPath("avatar");
            File uploadDir = new File(contextPath);
            String uploadPath = uploadDir.getAbsolutePath(); // 获取绝对路径
            if (!uploadDir.exists())
                uploadDir.mkdir();

            // 获取请求中的所有 Cookies
            Cookie[] cookies = request.getCookies();

            // 用于存储 userID 的变量
            String userID = null;

            // 遍历 Cookies 数组
            if (cookies != null) {
                for (Cookie cookie : cookies) {
                    // 检查 Cookie 的名称是否为 "userID"
                    if ("userID".equals(cookie.getName())) {
                        userID = cookie.getValue(); // 获取 userID 的值
                        break; // 找到后退出循环
                    }
                }
            }

            // 使用 userID，例如在响应中显示或进行逻辑处理
            if (userID == null) {
                response.getWriter().write("No userID cookie found.");
                return;
            }

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
            }

            //更新数据库中的头像路径
            ps = conn.prepareStatement("UPDATE user SET avatar = ? WHERE user_id =?");
            ps.setString(1, avatarPath);
            ps.setString(2, userID);
            ps.executeUpdate();

            // 上传成功后，构建 JSON 响应字符串
            String jsonResponse = "{";
            jsonResponse += "\"success\": true,";
            jsonResponse += "\"imageUrl\": \"" + "../" + uploadFile.getName() + "\"";// 使用正斜杠或双重转义反斜杠
            jsonResponse += "}";

            response.setCharacterEncoding("UTF-8");
            response.setContentType("application/json");
            PrintWriter out = response.getWriter();
            out.print(jsonResponse);
            out.flush();
        } catch (Exception e) {
            e.printStackTrace();
            // 构建错误响应的 JSON 字符串
            String errorResponse = "{";
            errorResponse += "\"success\": false,";
            errorResponse += "\"message\": \"" + e.getMessage() + "\"";
            errorResponse += "}";

            // 发送错误 JSON 响应
            response.getWriter().write(errorResponse);
        } finally {
            try {
                ps.close();
            } catch (SQLException e) {
                throw new RuntimeException(e);
            }
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
}
