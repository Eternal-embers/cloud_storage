package servlet;

import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.annotation.*;
import java.io.*;

@WebServlet("/pages/chunk")
public class SplitDownload extends HttpServlet {
    private static final long serialVersionUID = 1L;

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {
            String path = request.getParameter("path");
            if (path == null || path.trim().isEmpty()) {
                response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Invalid path parameter");
                return;
            }

            long start = Long.parseLong(request.getParameter("start"));
            long end = Long.parseLong(request.getParameter("end"));
            if (start < 0 || end < 0 || start > end) {
                response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Invalid start or end parameter");
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
            response.setHeader("Transfer-Encoding", "chunked");
            response.setHeader("Content-Disposition", "attachment; filename=\"" + file.getName() + "\"");

            //读取start~end字节的内容并输出到response
            try (RandomAccessFile raf = new RandomAccessFile(file, "r");
                 ServletOutputStream out = response.getOutputStream()) {
                raf.seek(start);
                byte[] buffer = new byte[4096];
                int bytesRead = 0;
                long bytesToRead = end - start + 1;
                while (bytesRead < bytesToRead) {
                    int length = (int) Math.min(buffer.length, bytesToRead - bytesRead);
                    raf.readFully(buffer, 0, length);
                    out.write(buffer, 0, length);
                    bytesRead += length;
                }
            }
        } catch (NumberFormatException e) {
            System.err.println("Invalid start or end parameter");
            e.printStackTrace();
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Invalid start or end parameter");
        } catch (Exception e) {
            System.err.println("Error processing file chunk");
            e.printStackTrace();
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Internal server error");
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        doGet(request, response);
    }
}