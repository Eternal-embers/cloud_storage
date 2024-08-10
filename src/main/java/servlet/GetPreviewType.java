package servlet;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@WebServlet("/pages/getPreviewType")
public class GetPreviewType extends HttpServlet {
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String path = request.getParameter("path");
        if (path == null || path.trim().isEmpty()) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Invalid path parameter");
            return;
        }

        String extension = getFileExtension(path);
        String previewType = getPreviewType(extension);

        response.getWriter().write(previewType);
    }

    // 工具方法：获取文件扩展名
    private String getFileExtension(String fileName) {
        int lastIndexOf = fileName.lastIndexOf('.');
        return (lastIndexOf == -1) ? "" : fileName.substring(lastIndexOf + 1);
    }

    // 定义一个方法来获取预览类型
    public static String getPreviewType(String extension) {
        Map<String, String> previewTypeMap = new HashMap<>();

        // 初始化映射关系
        previewTypeMap.put("txt", "text");

        previewTypeMap.put("jpg", "image");
        previewTypeMap.put("jpeg", "image");
        previewTypeMap.put("png", "image");
        previewTypeMap.put("gif", "image");
        previewTypeMap.put("bmp", "image");
        previewTypeMap.put("tiff", "image");
        previewTypeMap.put("svg", "image");

        previewTypeMap.put("mp4", "video");
        previewTypeMap.put("avi", "video");
        previewTypeMap.put("mov", "video");
        previewTypeMap.put("wmv", "video");
        previewTypeMap.put("mkv", "video");

        previewTypeMap.put("js", "code");
        previewTypeMap.put("html", "code");
        previewTypeMap.put("css", "code");
        previewTypeMap.put("xml", "code");
        previewTypeMap.put("json", "code");
        previewTypeMap.put("c", "code");
        previewTypeMap.put("cpp", "code");
        previewTypeMap.put("java", "code");
        previewTypeMap.put("py", "code");
        // 可以根据需要添加更多的扩展名和预览类型

        return previewTypeMap.getOrDefault(extension, "other");
    }
}
