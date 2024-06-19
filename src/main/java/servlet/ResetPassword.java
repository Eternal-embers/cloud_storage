package servlet;

import database.DatabaseConfig;
import secure.Secure;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.Date;

@WebServlet("/pages/reset")
public class ResetPassword extends HttpServlet implements Secure {
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

    public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        doPost(request, response);
    }

    public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        HttpSession session = request.getSession();
        String captcha = (String) session.getAttribute("captcha");

        String identifier = request.getParameter("identifier");
        String verificationCode = request.getParameter("verificationCode");
        String newPassword = request.getParameter("newPassword");

        if (captcha == null || !captcha.equals(verificationCode)) {
            response.setStatus(404);
            response.getWriter().println("验证码错误");
            return;
        }

        // 从session中获取过期时间
        Date captchaExpires = (Date) session.getAttribute("captcha_expires");

        if(captcha == null || captchaExpires == null){
            response.setStatus(400);
            response.getWriter().println("验证码过期");
            return;
        }

        // 获取当前时间
        Date cur = new Date();

        //删除session中的验证码和过期时间
        session.removeAttribute("captcha");
        session.removeAttribute("captcha_expires");

        // 检查当前时间是否超过了存储的过期时间
        if (cur.after(captchaExpires)){
            response.setStatus(400);
            response.getWriter().println("验证码过期");
            return;
        }

        //对密码进行加密
        byte[] salt = generateSalt();
        byte[] password_hash = hashPassword(newPassword, salt, 10000, 256);

        try {
            ps = conn.prepareStatement("update user set salt=?, password_hash=? where identifier=?");
            ps.setBytes(1, salt);
            ps.setBytes(2, password_hash);
            ps.setString(3, identifier);
            ps.executeUpdate();

            System.out.println("reset password for user: " + identifier + ", new password: " + newPassword);

            response.sendRedirect("login.html?reset=true");
            response.getWriter().println("password reset successfully");
        } catch (SQLException e) {
            e.printStackTrace();

            response.sendRedirect("reset.html?reset=false");
            response.getWriter().println("password reset failed");
        } finally {
            try {
                ps.close();
            } catch (SQLException e) {
                throw new RuntimeException(e);
            }
        }
    }
}
