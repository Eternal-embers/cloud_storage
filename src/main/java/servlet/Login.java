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
import java.sql.*;

@WebServlet("/pages/login")
public class Login extends HttpServlet implements Secure {
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

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        doPost(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String email = request.getParameter("email");
        String password = request.getParameter("password");
        System.out.println("Processing login request for email: " + email + ", password: " + password);

        ResultSet res = null;
        try{
            ps = conn.prepareStatement("SELECT * FROM user WHERE identifier = ?");
            ps.setString(1,email);
            res = ps.executeQuery();
            if(res.next()){ //账号存在
                byte[] salt = res.getBytes("salt");
                byte[] password_hash = res.getBytes("password_hash");
                long userID = res.getLong("user_id");
                boolean loginSuccess = verifyPassword(password, password_hash , salt);
                if(!loginSuccess) {//登录失败，密码错误
                    response.sendRedirect("login.html?login_failed=true");
                } else{
                    HttpSession session = request.getSession();
                    session.setAttribute("userID", userID);
                    session.setMaxInactiveInterval(30 * 60); // 设置会话超时时间为30分钟
                    response.sendRedirect("login.html?login_success=true");
                    System.out.println("Login success for userID: " + userID);
                }
            } else{
                response.sendRedirect("login.html?unregistered=true");
            }
        } catch (SQLException ex) {
            ex.printStackTrace();
            response.sendRedirect("login.html?login_error=true");
        } finally {
            try {
                if (res!= null)res.close();
                if (ps!= null) ps.close();
            } catch (SQLException ex) {
                ex.printStackTrace();
            }
        }
    }
}
