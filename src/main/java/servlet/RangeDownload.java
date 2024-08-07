package servlet;

import javax.servlet.*;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.*;

@WebServlet(name = "RangeDownload", urlPatterns = {"/pages/RangeDownload"})
public class RangeDownload extends HttpServlet {
    private static final long serialVersionUID = 1L;

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {
            String path = request.getParameter("path");
            if (path == null || path.trim().isEmpty()) {
                response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Invalid path parameter");
                return;
            }

            String filePath = getServletContext().getRealPath(path);
            File file = new File(filePath);

            if (!file.exists() || file.isDirectory()) {
                response.sendError(HttpServletResponse.SC_NOT_FOUND, "File not found or is a directory");
                return;
            }

            if (!file.canRead()) {
                response.sendError(HttpServletResponse.SC_FORBIDDEN, "File cannot be read");
                return;
            }

            long fileSize = file.length();

            response.setContentType("application/octet-stream");
            response.setHeader("Content-Disposition", "attachment;filename=\"" + file.getName() + "\"");

            // 检查请求中是否包含Range头
            String range = request.getHeader("Range");
            if (range != null && range.startsWith("bytes=")) {
                range = range.substring(6);
                int index = range.indexOf('-');
                if (index > 0) {
                    long start = Long.parseLong(range.substring(0, index));
                    long end = Long.parseLong(range.substring(index + 1, range.length()));

                    if (end >= fileSize) {
                        end = fileSize - 1;
                    }

                    response.setStatus(HttpServletResponse.SC_PARTIAL_CONTENT);
                    response.setHeader("Content-Range", "bytes " + start + "-" + end + "/" + fileSize);
                    response.setContentLength((int) (end - start + 1));

                    // 设置输入流读取文件的指定部分
                    FileInputStream fis = new FileInputStream(file);
                    fis.skip(start);

                    OutputStream os = response.getOutputStream();
                    byte[] buffer = new byte[4096];
                    int bytesRead;
                    while ((bytesRead = fis.read(buffer)) != -1) {
                        os.write(buffer, 0, bytesRead);
                    }

                    fis.close();
                    os.close();
                }
            } else {
                // 没有Range头，发送整个文件
                response.setHeader("Content-Length", String.valueOf(fileSize));
                FileInputStream fis = new FileInputStream(file);
                OutputStream os = response.getOutputStream();
                byte[] buffer = new byte[4096];
                int bytesRead;
                while ((bytesRead = fis.read(buffer)) != -1) {
                    os.write(buffer, 0, bytesRead);
                }
                fis.close();
                os.close();
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Internal server error"); // 服务器内部错误时返回500错误
        }
    }
}