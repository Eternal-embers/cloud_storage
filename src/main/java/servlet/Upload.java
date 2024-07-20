package servlet;

import database.DatabaseConfig;
import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.*;
import java.text.DateFormat;
import java.util.*;

/**
 * Servlet implementation class UploadServlet
 */
@WebServlet("/pages/upload")
public class Upload extends HttpServlet {
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
        } catch (SQLException ex) {
            ex.printStackTrace();
        } catch (ClassNotFoundException ex) {
            ex.printStackTrace();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    // 上传文件存储目录
    private static final String UPLOAD_DIRECTORY = "upload";

    // 上传配置
    private static final int MEMORY_THRESHOLD = 1024 * 1024 * 512;  // 最大内存 512MB
    private static final long MAX_FILE_SIZE = 1024 * 1024 * 2048L; // 最大文件大小为1GB
    private static final long MAX_REQUEST_SIZE = 1024 * 1024 * 4096L; // 最大请求大小为4GB

    /**
     * 上传数据及保存文件，并将上传文件记录到数据库中
     */
    protected void doPost(HttpServletRequest request,
                          HttpServletResponse response) throws ServletException, IOException {
        // 检测是否为多媒体上传
        if (!ServletFileUpload.isMultipartContent(request)) {
            // 如果不是则停止
            PrintWriter writer = response.getWriter();
            writer.println("Error: 表单必须包含 enctype=multipart/form-data");
            writer.flush();
            return;
        }

        //获取user_id
        if (request.getParameter("user_id") == null)
            response.sendRedirect("main.jsp?message=user login required");
        Long userID = Long.valueOf(request.getParameter("user_id"));

        // 配置上传参数
        DiskFileItemFactory factory = new DiskFileItemFactory();
        // 设置内存临界值 - 超过后将产生临时文件并存储于临时目录中
        factory.setSizeThreshold(MEMORY_THRESHOLD);
        // 设置临时存储目录
        factory.setRepository(new File(System.getProperty("java.io.tmpdir")));

        //创建ServletFileUpload对象
        ServletFileUpload upload = new ServletFileUpload(factory);

        // 设置最大文件上传值
        upload.setFileSizeMax(MAX_FILE_SIZE);

        // 设置最大请求值 (包含文件和表单数据)
        upload.setSizeMax(MAX_REQUEST_SIZE);

        // 中文处理
        upload.setHeaderEncoding("UTF-8");

        // 构造临时路径来存储上传的文件
        // 这个路径相对当前应用的目录，File.separator为分隔目录的字符，自动适应不同操作系统的文件路径分隔符，getRealPath()返回虚拟路径的真实路径
        String uploadPath = request.getServletContext().getRealPath("./") + File.separator + UPLOAD_DIRECTORY + File.separator + userID.toString();

        // 如果目录不存在则创建
        File uploadDir = new File(uploadPath);
        if (!uploadDir.exists()) {
            uploadDir.mkdir();
        }

        try {
            // 获取忽略索引列表
            String ignoreFilesStr = "";
            List<Integer> ignoreFiles = new ArrayList<>();

            // 解析请求的内容提取文件数据
            @SuppressWarnings("unchecked")
            List<FileItem> formItems = upload.parseRequest(request);

            if (formItems != null && formItems.size() > 0) {
                int index = 0;

                //迭代在表单中的字段
                for (FileItem item : formItems) {
                    if(item.isFormField()){
                        //获取表单字段名为ignore-files的字段值
                        if(item.getFieldName().equals("ignore-files")) {
                            ignoreFilesStr = item.getString();

                            if (ignoreFilesStr != null && !ignoreFilesStr.trim().isEmpty()) {
                                String[] ignoreIndexes = ignoreFilesStr.split("\\s+");
                                for (String indexStr : ignoreIndexes) {
                                    try {
                                        ignoreFiles.add(Integer.parseInt(indexStr));
                                    } catch (NumberFormatException e) {
                                        // 忽略无效的索引
                                    }
                                }
                            }

                            System.out.println("忽略上传的索引列表：" + ignoreFiles.toString());
                        }
                    }
                }

                // 迭代表单数据
                for (FileItem item : formItems) {
                    // 处理不在表单中的字段
                    if (!item.isFormField()) {
                        if(ignoreFiles.contains(index)) {
                            index++;
                            continue;
                        }

                        //获取上传的文件对象
                        String fileName = new File(item.getName()).getName();

                        //处理过长的文件名
                        if (fileName.lastIndexOf('.') >= 255) {
                            fileName = fileName.substring(0, 255) + fileName.substring(fileName.lastIndexOf('.'));
                        }

                        String filePath = uploadPath + File.separator + fileName;
                        File storeFile = new File(filePath);
                        item.write(storeFile);// 保存文件到硬盘

                        insert(storeFile, userID);

                        // 在控制台输出文件的上传路径
                        System.out.println("user_id：" + userID + ", 上传文件：" + storeFile.getAbsolutePath());

                        index++;// 索引自增
                    }
                }
            }

            response.sendRedirect("main.jsp?message=upload file success");
        } catch (FileUploadException ex) {
            // 捕获文件上传异常，可能包括文件大小超限
            // 使用sendError发送错误信息，同时设置状态码
            System.out.println("文件大小超过限制, 最大允许上传文件大小为：" + MAX_FILE_SIZE / 1024 / 1024 + "MB");
            response.sendError(HttpServletResponse.SC_REQUEST_ENTITY_TOO_LARGE, "上传失败：文件大小超出限制");
            ex.printStackTrace();
        } catch (Exception ex) {
            // 使用sendError发送错误信息，同时设置状态码
            System.out.println("文件上传出现错误");
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "上传失败：服务器遇到了一个意外情况。");
            ex.printStackTrace();
        }

    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        doPost(request, response);
    }

    //向数据库中插入数据
    public static void insert(File file, Long userID) {


        try {
            String fileName = file.getName();
            String fileType = fileName.substring(fileName.lastIndexOf('.'));
            long fileSize = file.length();//字节数

            //处理过长的文件名
            if (fileName.lastIndexOf('.') >= 255)
                fileName = fileName.substring(0, 255) + fileType;

            String sql = "INSERT INTO files(user_id, file_name, file_size, file_type) VALUES(?,?,?,?)";

            ps = conn.prepareStatement(sql);
            ps = conn.prepareStatement(sql);
            ps.setLong(1, userID);
            ps.setString(2, fileName);
            ps.setLong(3, fileSize);
            ps.setString(4, fileType);
            ps.execute();
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }
}
