package servlet;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

@WebServlet("/pages/test")
public class Test extends HttpServlet {
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // 设置字符集和内容类型
        response.setCharacterEncoding("UTF-8");
        response.setContentType("text/html;charset=UTF-8");

        // 设置状态码为临时重定向（302）
        response.setStatus(HttpServletResponse.SC_FOUND);

        PrintWriter out = response.getWriter();
        out.println("<script>");
        out.println("localStorage.setItem('captcha_overtime', 'true');");
        out.println("</script>");

        // 设置Location头来告诉浏览器重定向到的URL
        response.setHeader("Location", "login.html");
    }

    public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

    }
}
