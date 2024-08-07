package servlet;

import database.DatabaseConfig;
import secure.Secure;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.File;
import java.io.IOException;
import java.sql.*;
import java.util.Date;
import java.util.Random;

@WebServlet("/pages/signup")
public class SignUp extends HttpServlet implements Secure {
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
        } catch(SQLException ex){
            ex.printStackTrace();
        } catch (ClassNotFoundException ex) {
            ex.printStackTrace();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException{
        String email = request.getParameter("email");//邮箱
        String password = request.getParameter("password");//密码
        String code = request.getParameter("code");//验证码

        Cookie emailCookie = new Cookie("email", email);
        emailCookie.setMaxAge(1800); // 设置cookie有效期为30分钟
        response.addCookie(emailCookie);

        System.out.printf("Processing sign up request: Email: %s, Password: %s, Captcha: %s\n", email, password, code);

        // 获取HttpSession对象，如果session不存在则创建一个
        HttpSession session = request.getSession(false); // 使用false避免创建新的session

        if (session != null) {
            // 从session中获取存储的captcha值
            String captcha = (String) session.getAttribute("captcha");

            // 从session中获取过期时间
            Date captchaExpires = (Date) session.getAttribute("captcha_expires");

            if(captcha == null || captchaExpires == null){
                response.sendRedirect("login.html?captcha_error=true");
            }

            // 获取当前时间
            Date cur = new Date();

            // 检查当前时间是否超过了存储的过期时间
            if (cur.after(captchaExpires)) {
                //删除session中的验证码和过期时间
                session.removeAttribute("captcha");
                session.removeAttribute("captcha_expires");
                response.sendRedirect("login.html?captcha_overtime=true");
            } else if(captcha != null && captcha.equals(code)){
                //生成用户名
                String userName = "用户" + generateRandomUsername(10);

                //对密码进行加密
                byte[] salt = generateSalt();
                byte[] password_hash = hashPassword(password, salt, 10000, 256);

                try {
                    ps = conn.prepareStatement("insert into user(user_name, identifier, salt, password_hash, storage_quota) values(?,?,?,?,?)");
                    ps.setString(1, userName);
                    ps.setString(2, email);
                    ps.setBytes(3, salt);
                    ps.setBytes(4, password_hash);
                    ps.setDouble(5, 5120);//5120MB的存储控件
                    ps.executeUpdate();
                } catch (SQLException e) {
                    throw new RuntimeException(e);
                }

                Long userID = null;
                try {
                    ps = conn.prepareStatement("select user_id from user where identifier =?");
                    ps.setString(1, email);

                    ResultSet rs = ps.executeQuery();
                    if(rs.next()) userID = rs.getLong("user_id");
                } catch (SQLException e) {
                    throw new RuntimeException(e);
                }

                //在上传目录创建用户专属文件夹
                String uploadPath = request.getServletContext().getRealPath("./") + File.separator + UPLOAD_DIRECTORY;
                File userFolder = new File(uploadPath + File.separator + userID);
                if (!userFolder.exists()) {
                    boolean isCreated = userFolder.mkdir();
                    if (!isCreated) {
                        System.out.println("Failed to create user folder: " + userFolder.getAbsolutePath());
                    }
                }

                // 创建默认文件夹
                String[] folderNames = {"Documents", "Images", "Music", "Videos", "Others"};
                for (String folderName : folderNames) {
                    // 创建文件夹的完整路径
                    File folder = new File(userFolder, folderName);

                    // 创建文件夹
                    if (!folder.exists()) {
                        boolean isCreated = folder.mkdir();
                        if (!isCreated) {
                            System.out.println("Failed to create folder: " + folderName);
                        }
                    }
                }

                System.out.println("New user registration: " + email + ", UserName: " + userName);

                response.sendRedirect("login.html?signup_success=true");
            } else{ //验证码错误
                response.sendRedirect("login.html?captcha_error=true");
            }
        }
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse rspongs) throws ServletException, IOException{
        doPost(request, rspongs);
    }

    public String generateRandomUsername(int length) {
        Random random = new Random();
        StringBuilder sb = new StringBuilder(length);
        String characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (int i = 0; i < length; i++) {
            sb.append(characters.charAt(random.nextInt(characters.length())));
        }
        return sb.toString();
    }
}
