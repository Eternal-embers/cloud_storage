package servlet;

import database.DatabaseConfig;

import javax.mail.*;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.*;
import java.sql.*;
import java.util.Date;
import java.util.Properties;
import java.util.Random;

@WebServlet("/pages/verify")
public class Verify extends HttpServlet {
    private static final String USERNAME = "laiqw6537@qq.com"; // 发送者邮箱
    private static final String PASSWORD = "yzfblwjlrnsvdbdh"; // 授权码

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

    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        // GET请求直接交由POST处理
        this.doPost(request, response);
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        //用户的session
        HttpSession SignUpSession = request.getSession();

        //判断账号是否已经存在
        String email = request.getParameter("email");
        String type = request.getParameter("type");
        if (type != null && type.equals("register")) {
            // 注册模式，检查邮箱是否已注册
            try {
                ps = conn.prepareStatement("SELECT user_id FROM user WHERE identifier = ?");
                ps.setString(1, email);
                ResultSet rs = ps.executeQuery();
                if (rs.next()) {
                    System.out.println("Email already exists: " + email);
                    response.setStatus(HttpServletResponse.SC_CONFLICT);
                    return;
                }
            } catch (SQLException ex) {
                ex.printStackTrace();
            }
        }

        if (type != null && type.equals("reset")) {
            // 重置密码模式，检查邮箱是否已注册
            try {
                ps = conn.prepareStatement("SELECT user_id FROM user WHERE identifier = ?");
                ps.setString(1, email);
                ResultSet rs = ps.executeQuery();
                if (!rs.next()) {
                    System.out.println("Email not exists: " + email);
                    response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    response.getWriter().println("Email not exists.");
                    return;
                }
            } catch (SQLException ex) {
                ex.printStackTrace();
            }
        }

        /* 将验证码添加到session中，并设置session为HttpOnly，防止通过js获取验证码 */

        //生成验证码
        String captchaCode = generateCaptchaCode(6);

        // 将验证码存储到session中
        SignUpSession.setAttribute("captcha", captchaCode);
        // 设置验证码过期时间
        SignUpSession.setAttribute("captcha_expires", new Date(System.currentTimeMillis() + 60 * 1000)); // 60秒后过期

        // 设置 session 的 HttpOnly 标志
        Cookie cookie = null;
        for (Cookie c : request.getCookies()) {
            if ("JSESSIONID".equals(c.getName())) {
                cookie = c;
                break;
            }
        }

        if (cookie != null) {
            cookie.setHttpOnly(true);// 设置 HttpOnly 标志
            response.addCookie(cookie);
        }

        // 设置邮件服务器
        String host = "smtp.qq.com"; // QQ邮箱的SMTP服务器
        int port = 587; // 使用TLS加密的端口号，端口号465或587

        // 配置邮件会话的属性
        Properties properties = new Properties();
        properties.put("mail.smtp.host", host);
        properties.put("mail.smtp.port", port);
        properties.put("mail.smtp.auth", "true"); // 需要验证
        properties.put("mail.smtp.starttls.enable", "true"); // 使用TLS加密

        try {
            // 创建邮件会话
            Session session = Session.getInstance(properties, new Authenticator() {
                @Override
                protected PasswordAuthentication getPasswordAuthentication() {
                    return new PasswordAuthentication(USERNAME, PASSWORD);
                }
            });

            // 创建一个MimeMessage对象, MIME（Multipurpose Internet Mail Extensions）
            MimeMessage message = new MimeMessage(session);

            // 设置发件人
            message.setFrom(new InternetAddress(USERNAME));

            InternetAddress to = new InternetAddress(email);

            //设置抄送方式
            message.setRecipient(Message.RecipientType.BCC, to);//Message.RecipientType可以是TO、CC(抄送)或BCC(密送)

            // 设置邮件主题
            message.setSubject("请输入验证码 " + captchaCode + " 完成注册");

            // 设置HTML格式的邮件正文
            String htmlContent = "<html>" +
                    "<head>" +
                    "<title>验证码</title>" +
                    "<style>" +
                    "  body { font-family: Arial, sans-serif; }" +
                    "  .captcha-container { text-align: center; padding: 20px; background-color: #f7f7f7; }" +
                    "  .captcha-code { font-size: 24px; color: #333; }" +
                    "</style>" +
                    "</head>" +
                    "<body>" +
                    "<div class=\"captcha-container\">" +
                    "<p>请在 Cloud Storage 注册页面填写下面的验证码完成注册：</p>" +
                    "<div class=\"captcha-code\">" + captchaCode + "</div>" +
                    "<p>验证码有效期为 1 分钟，请尽快完成注册。</p>" +
                    "<p>如果您未申请 Cloud Storage 账号，请忽略此邮件。</p>" +
                    "<p>此为系统自动发送的邮件，请勿回复。</p>" +
                    "  </div>" +
                    "</body>" +
                    "</html>";

            message.setContent(htmlContent, "text/html;charset=UTF-8");

            // 发送邮件
            Transport.send(message);

            System.out.println("Send captchaCode '" + captchaCode + "' to email: " + email);

            response.getWriter().println("Send captchaCode successfully.");
        } catch (MessagingException e) {
            e.printStackTrace();
            response.getWriter().println("Error sending email.");
        }
    }

    //生成验证码
    private String generateCaptchaCode(int length) {
        StringBuilder captchaCode = new StringBuilder();
        Random random = new Random();
        for (int i = 0; i < length; i++) {
            // 随机选择数字或大写字母
            String charOrDigit = random.nextBoolean() ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ" : "0123456789";
            // 从选择的字符集中随机选择一个字符
            char randomChar = charOrDigit.charAt(random.nextInt(charOrDigit.length()));
            // 将选择的字符添加到验证码字符串
            captchaCode.append(randomChar);
        }
        return captchaCode.toString();
    }
}
