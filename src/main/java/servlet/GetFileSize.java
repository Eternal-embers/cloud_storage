package servlet;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.IOException;

@WebServlet("/pages/getFileSize")
public class GetFileSize extends HttpServlet {
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {
            String path = request.getParameter("path");

            if (path == null || path.trim().isEmpty()) {
                response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Invalid path parameter");
                return;
            }
            String filePath = getServletContext().getRealPath(path); // 获取文件的绝对路径

            System.out.println("File path: " + filePath);

            File file = new File(filePath);

            if (!file.exists() || file.isDirectory()) {
                response.sendError(HttpServletResponse.SC_NOT_FOUND, "File not found or is a directory");
                return;
            }

            if (!file.canRead()) {
                response.sendError(HttpServletResponse.SC_FORBIDDEN, "File cannot be read");
                return;
            }

            long fileSize = file.length(); // 获取文件大小
            response.setContentType("text/plain");
            response.getWriter().write(String.valueOf(fileSize)); // 将文件大小写入响应体
            response.getWriter().flush();
            response.getWriter().close();

        } catch (Exception e) {
            e.printStackTrace();
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Internal server error"); // 服务器内部错误时返回500错误
        }
    }
}
