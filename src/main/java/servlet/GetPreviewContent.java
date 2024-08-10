package servlet;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

@WebServlet("/pages/getPreviewContent")
public class GetPreviewContent extends HttpServlet {
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String path = request.getParameter("path");
        String type = request.getParameter("type");
        if (path == null || path.trim().isEmpty()) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Invalid path parameter");
            return;
        }

        if(type == null || type.trim().isEmpty()){
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Invalid type parameter");
            return;
        }

        String filePath = getServletContext().getRealPath(path); // 获取文件的绝对路径
        File file = new File(filePath); // 获取文件对象
        if (!file.exists() || file.isDirectory()) {
            response.sendError(HttpServletResponse.SC_NOT_FOUND, "File not found or is a directory");
            return;
        }

        if (!file.canRead()) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "File cannot be read");
            return;
        }

        String content = "";
        if(type.equals("text")){
            try {
                String text = new String(java.nio.file.Files.readAllBytes(file.toPath()), StandardCharsets.UTF_8);
                content = String.format(" <pre class=\"preview-area\">%s</pre>", text);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }


        response.getWriter().write(content);
    }
}
