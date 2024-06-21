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
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
        } catch(SQLException ex){
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
    private static final int MEMORY_THRESHOLD   = 1024 * 1024 * 10;  // 最大内存 10M
    private static final int MAX_FILE_SIZE      = 1024 * 1024 * 100; // 最大文件大小为100MB
    private static final int MAX_REQUEST_SIZE   = 1024 * 1024 * 500; // 最大请求大小为500MB

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
        if(request.getParameter("user_id") == null)
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
        String uploadPath = request.getServletContext().getRealPath("./") + File.separator + UPLOAD_DIRECTORY;

        // 如果目录不存在则创建
        File uploadDir = new File(uploadPath);
        if (!uploadDir.exists()) {
            uploadDir.mkdir();
        }

        try {
            // 解析请求的内容提取文件数据
            @SuppressWarnings("unchecked")
            List<FileItem> formItems = upload.parseRequest(request);

            if (formItems != null && formItems.size() > 0) {
                // 迭代表单数据
                for (FileItem item : formItems) {
                    // 处理不在表单中的字段
                    if (!item.isFormField()) {
                        //获取上传的文件对象
                        String fileName = new File(item.getName()).getName();

                        //处理过长的文件名
                        if(fileName.lastIndexOf('.') >= 255){
                            fileName = fileName.substring(0, 255) + fileName.substring(fileName.lastIndexOf('.'));
                        }

                        String filePath = uploadPath + File.separator + fileName;
                        File storeFile = new File(filePath);
                        item.write(storeFile);// 保存文件到硬盘

                        insert(storeFile, userID);

                        // 在控制台输出文件的上传路径
                        System.out.println("user_id：" + userID + ", 上传文件：" + storeFile.getAbsolutePath());
                    }
                }
            }

            response.sendRedirect("main.jsp?message=upload file success");
        }  catch (FileUploadException ex) {
            // 捕获文件上传异常，可能包括文件大小超限
            // 使用sendError发送错误信息，同时设置状态码
            System.out.println("文件大小超过限制");
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
            if(fileName.lastIndexOf('.') >= 255)
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

    public void showUpload(){
        try {
            Map<String, Integer> fileTypeMap = new HashMap<>();

            /*
                文档类型：doc, docx, pdf, txt, odt, rtf, wpd, epub, xlsx, xls, xlsm, pptx, ppt, pps
                图片类型：jpg, jpeg, png, gif, bmp, tiff, svg, webp
                视频类型: mp4, avi mov wmv mkv flv mpg mpeg
                音频类型：mp3 ogg wma aac flac m4a
                其他类型：zip, rar, 7z, tar, gz, exe等等
             */

            // 文档类型
            fileTypeMap.put("doc", 1);
            fileTypeMap.put("docx", 1);
            fileTypeMap.put("pdf", 1);
            fileTypeMap.put("txt", 1);
            fileTypeMap.put("odt", 1);
            fileTypeMap.put("rtf", 1);
            fileTypeMap.put("wpd", 1);
            fileTypeMap.put("epub", 1);
            fileTypeMap.put("xlsx", 1); // 表格文档
            fileTypeMap.put("xls", 1);
            fileTypeMap.put("xlsm", 1);
            fileTypeMap.put("pptx", 1); // 演示文档
            fileTypeMap.put("ppt", 1);
            fileTypeMap.put("pps", 1);

            // 图片类型
            fileTypeMap.put("jpg", 2);
            fileTypeMap.put("jpeg", 2);
            fileTypeMap.put("png", 2);
            fileTypeMap.put("gif", 2);
            fileTypeMap.put("bmp", 2);
            fileTypeMap.put("tiff", 2);
            fileTypeMap.put("svg", 2);
            fileTypeMap.put("webp", 2);

            // 视频类型
            fileTypeMap.put("mp4", 3);
            fileTypeMap.put("avi", 3);
            fileTypeMap.put("mov", 3);
            fileTypeMap.put("wmv", 3);
            fileTypeMap.put("mkv", 3);
            fileTypeMap.put("flv", 3);
            fileTypeMap.put("mpg", 3);
            fileTypeMap.put("mpeg", 3);


            // 音乐类型
            fileTypeMap.put("mp3", 4);
            fileTypeMap.put("wav", 4);
            fileTypeMap.put("aac", 4);
            fileTypeMap.put("ogg", 4);
            fileTypeMap.put("flac", 4);
            fileTypeMap.put("m4a", 4);

            String documentSvg = """
                    <svg t="1718905281923" class="icon" viewBox="0 0 1024 1024" version="1.1"
                    xmlns="http://www.w3.org/2000/svg" p-id="143777">
                    <path
                        d="M576 742.4H324.267c-12.8 0-21.334 8.533-21.334 21.333s8.534 21.334 21.334 21.334H576c12.8 0 21.333-8.534 21.333-21.334S584.533 742.4 576 742.4zM699.733 576H324.267c-12.8 0-21.334 8.533-21.334 21.333 0 12.8 8.534 21.334 21.334 21.334h375.466c12.8 0 21.334-8.534 21.334-21.334 0-12.8-8.534-21.333-21.334-21.333zM324.267 281.6h102.4c12.8 0 21.333-8.533 21.333-21.333 0-12.8-8.533-21.334-21.333-21.334h-102.4c-12.8 0-21.334 8.534-21.334 21.334 0 12.8 8.534 21.333 21.334 21.333zM678.4 55.467H221.867c-46.934 0-85.334 38.4-85.334 85.333v750.933c0 46.934 38.4 85.334 85.334 85.334H806.4c46.933 0 85.333-38.4 85.333-85.334V281.6L678.4 55.467z m166.4 832c0 21.333-17.067 42.666-42.667 42.666H221.867c-21.334 0-42.667-17.066-42.667-42.666V136.533c0-21.333 17.067-42.666 42.667-42.666h375.466v209.066c0 21.334 17.067 42.667 42.667 42.667h209.067v541.867zM635.733 302.933V93.867h21.334L844.8 302.933H635.733z m-332.8 123.734c0 12.8 8.534 21.333 21.334 21.333h375.466c12.8 0 21.334-8.533 21.334-21.333 0-12.8-8.534-21.334-21.334-21.334H324.267c-12.8 4.267-21.334 12.8-21.334 21.334z"
                        p-id="143778"></path>
                </svg>""";
            String imageSvg = """
                <svg t="1718903817564" class="file-icon" viewBox="0 0 1024 1024" version="1.1"
                    xmlns="http://www.w3.org/2000/svg" p-id="47653" width="256" height="256">
                    <path
                        d="M841.71335 65.290005 182.285626 65.290005c-64.511269 0-116.995621 52.484352-116.995621 116.995621L65.290005 841.71335c0 64.511269 52.484352 116.995621 116.995621 116.995621l659.427724 0c64.511269 0 116.995621-52.484352 116.995621-116.995621L958.708971 182.285626C958.708971 117.774357 906.225643 65.290005 841.71335 65.290005zM182.285626 107.833961l659.427724 0c41.051975 0 74.451666 33.398668 74.451666 74.451666l0 136.557142c-150.09446 5.26184-290.370297 66.084091-396.978337 172.692131-49.960879 49.961902-89.841168 107.331517-118.694309 169.625282-83.496669-70.835302-204.372667-75.376735-292.65841-13.617136L107.833961 182.285626C107.833961 141.232628 141.232628 107.833961 182.285626 107.833961zM107.833961 841.71335 107.833961 702.627618c76.54228-74.311473 198.833511-74.234725 275.272437 0.24457-24.303522 65.298192-37.026288 135.112234-37.026288 206.91149 0 2.223644 0.343831 4.366448 0.977257 6.381337L182.285626 916.165016C141.232628 916.165016 107.833961 882.766348 107.833961 841.71335zM841.71335 916.165016 387.646807 916.165016c0.633427-2.01489 0.977257-4.157693 0.977257-6.381337 0-146.71755 57.053414-284.572244 160.647817-388.166647 98.570993-98.570993 228.166583-154.963351 366.894158-160.204725L916.166039 841.71335C916.165016 882.766348 882.766348 916.165016 841.71335 916.165016z"
                        p-id="47654"></path>
                    <path
                        d="M312.397986 413.458683c60.8376 0 110.332874-49.494251 110.332874-110.332874s-49.494251-110.332874-110.332874-110.332874-110.332874 49.494251-110.332874 110.332874S251.559363 413.458683 312.397986 413.458683zM312.397986 235.337913c37.378306 0 67.788919 30.40959 67.788919 67.788919s-30.40959 67.788919-67.788919 67.788919-67.788919-30.40959-67.788919-67.788919S275.018657 235.337913 312.397986 235.337913z"
                        p-id="47655"></path>
               </svg>""";

            String musicSvg = """
                <svg t="1718905130493" class="icon" viewBox="0 0 1024 1024" version="1.1"
                    xmlns="http://www.w3.org/2000/svg" p-id="132370">
                    <path
                        d="M809.6 960H214.4c-35.2 0-64-28.8-64-64V128c0-35.2 28.8-64 64-64H640c12.8 0 22.4 9.6 22.4 22.4v192h192c12.8 0 22.4 9.6 22.4 22.4V896c-3.2 35.2-32 64-67.2 64zM214.4 105.6c-12.8 0-22.4 9.6-22.4 22.4v768c0 12.8 9.6 22.4 22.4 22.4h598.4c12.8 0 22.4-9.6 22.4-22.4V320h-192c-12.8 0-22.4-9.6-22.4-22.4v-192H214.4z"
                        p-id="132371"></path>
                    <path
                        d="M854.4 320c-6.4 0-9.6-3.2-16-6.4l-214.4-214.4c-9.6-9.6-9.6-22.4 0-28.8 9.6-9.6 22.4-9.6 28.8 0l214.4 214.4c9.6 9.6 9.6 22.4 0 28.8-3.2 3.2-9.6 6.4-12.8 6.4zM534.4 736c-12.8 0-22.4-9.6-22.4-22.4v-224c0-9.6 3.2-16 12.8-19.2l128-64c9.6-6.4 22.4 0 28.8 9.6s0 22.4-9.6 28.8l-115.2 57.6v211.2c-3.2 12.8-12.8 22.4-22.4 22.4z"
                        p-id="132372"></path>
                    <path
                        d="M448 809.6c-57.6 0-105.6-48-105.6-105.6s48-105.6 105.6-105.6 105.6 48 105.6 105.6-48 105.6-105.6 105.6z m0-169.6c-35.2 0-64 28.8-64 64s28.8 64 64 64 64-28.8 64-64-28.8-64-64-64z"
                        p-id="132373"></path>
                </svg>""";

            String videoSvg = """
                <svg t="1718904669744" class="icon" viewBox="0 0 1024 1024" version="1.1"
                    xmlns="http://www.w3.org/2000/svg" p-id="105650" fill="#00">
                    <path
                        d="M864.711111 136.533333 159.288889 136.533333C121.582933 136.533333 91.022222 167.094044 91.022222 204.8l0 614.4c0 37.705956 30.560711 68.266667 68.266667 68.266667l705.422222 0c37.705956 0 68.266667-30.560711 68.266667-68.266667L932.977778 204.8C932.977778 167.094044 902.417067 136.533333 864.711111 136.533333zM887.466667 796.444444c0 25.122133-20.388978 45.511111-45.511111 45.511111L182.044444 841.955556c-25.122133 0-45.511111-20.388978-45.511111-45.511111L136.533333 227.555556c0-25.122133 20.388978-45.511111 45.511111-45.511111l659.911111 0c25.122133 0 45.511111 20.388978 45.511111 45.511111L887.466667 796.444444z"
                        p-id="105651"></path>
                    <path
                        d="M688.378311 501.486933l3.777422 1.388089c0 0-263.554844-150.550756-263.554844-150.573511L386.844444 374.9888l-0.500622-3.731911c-1.4336 4.164267-1.592889 313.7536-0.386844 318.327467 3.2768 12.151467 15.724089 19.364978 27.898311 16.088178l3.003733-1.729422c2.844444-0.955733 5.370311-2.412089 7.5776-4.323556l263.964444-151.552c10.604089-2.844444 16.9984-12.765867 16.384-23.278933C705.376711 514.2528 698.9824 504.331378 688.378311 501.486933zM432.355556 644.323556 432.355556 405.208178l208.258844 119.580444L432.355556 644.323556z"
                        p-id="105652"></path>
                    <path d="M386.343822 371.256889a1.113 1.126 0 1 0 50.653867 0 1.113 1.126 0 1 0-50.653867 0Z"
                        p-id="105653"></path>
                </svg>""";

            String otherSvg = """
                <svg t="1718905838739" class="icon" viewBox="0 0 1024 1024" version="1.1"
                    xmlns="http://www.w3.org/2000/svg" p-id="160886">
                    <path
                        d="M539.592 88c3.491 0 6.892 0.389 10.16 1.125a29.813 29.813 0 0 1 19.4 7.769l0.574 0.535 299.147 286.514a30.11 30.11 0 0 1 3.384 3.841c7.895 8.26 12.743 19.457 12.743 31.784v420.874C885 910.338 828.326 967 758.415 967h-494.83C193.674 967 137 910.338 137 840.442V214.558C137 144.662 193.674 88 263.585 88h276.007z m-13.81 59.827H263.586c-36.494 0-66.147 29.282-66.736 65.627l-0.009 1.104v625.884c0 36.486 29.288 66.133 65.64 66.722l1.105 0.009h494.83c36.494 0 66.147-29.282 66.736-65.627l0.009-1.104V433.373l-205.014 0.002c-51.594 0-93.517-41.399-94.35-92.783l-0.013-1.56V147.827z m-35.625 623.584c10.029 0 18.625 2.864 25.311 9.546 6.687 6.204 10.03 14.318 10.03 24.34 0 10.024-3.821 18.137-10.507 24.82-6.686 6.204-15.283 9.545-24.834 9.545-9.552 0-18.149-3.341-24.835-10.023-6.686-6.682-10.029-14.796-10.029-24.341 0-10.023 3.343-18.137 10.03-24.341 6.685-6.682 15.282-9.546 24.834-9.546z m8.596-310.641c30.565 0 55.4 8.113 74.503 25.295 19.103 16.705 28.655 39.614 28.655 68.251 0 23.387-6.209 42.955-18.148 58.228-4.299 5.25-17.67 17.66-40.117 37.228-9.074 7.636-15.76 16.227-20.059 24.818-5.253 9.546-7.641 20.046-7.641 31.5v14.613c0 14.111-11.44 25.55-25.55 25.55-14.112 0-25.551-11.439-25.551-25.55V706.09c0-17.659 2.865-32.932 9.551-45.341 6.209-13.364 24.357-32.932 53.967-59.182l8.119-9.069c8.597-10.977 13.372-22.432 13.372-34.841 0-16.705-4.775-29.591-13.85-39.137-9.551-9.545-23.401-14.318-40.594-14.318-21.491 0-37.251 6.682-46.803 20.523-7.755 10.333-12.012 24.55-12.771 42.65-0.012 0.278-0.023 0.897-0.033 1.859-0.15 13.791-11.372 24.892-25.164 24.892-13.808 0-25.002-11.194-25.002-25.002l0.001-0.26c0.006-0.534 0.011-0.895 0.017-1.082 1.033-32.158 11.033-57.513 29.999-76.467 20.058-20.523 47.758-30.545 83.1-30.545z m86.869-265.266l0.001 143.528c0 19.062 15.456 34.515 34.523 34.515h151.37L585.622 195.504z"
                        p-id="160887"></path>
                </svg>""";

            String sql = "SELECT * FROM files where user_id = ?";
            ps = conn.prepareStatement(sql);
            ps.setLong(1, 1);
            ps.execute();
            ResultSet rs = ps.getResultSet();
            while(rs.next()) {
                String fileName = rs.getString("file_name");

                long bytes = rs.getLong("file_size");
                String fileSize = "";
                if(bytes < 1024)
                    fileSize = bytes + "B";
                else if(bytes < 1024 * 1024)
                    fileSize = (bytes / 1024) + "KB";
                else if(bytes < 1024 * 1024 * 1024)
                    fileSize = (bytes / (1024 * 1024)) + "MB";
                else
                    fileSize = (bytes / (1024 * 1024 * 1024)) + "GB";

                String fileType = rs.getString("file_type");
                java.sql.Timestamp modifyTime = rs.getTimestamp("modify_time");

                StringBuilder sb = new StringBuilder();
                sb.append("<div class=\"file\">");

                //添加svg
                switch(fileTypeMap.get(fileType)){
                    case 1:{
                        sb.append(documentSvg);
                        break;
                    }
                    case 2:{
                        sb.append(imageSvg);
                        break;
                    }
                    case 3:{
                        sb.append(videoSvg);
                        break;
                    }
                    case 4:{
                        sb.append(musicSvg);
                        break;
                    }
                    default:{
                        sb.append(otherSvg);
                        break;
                    }
                }

                //添加文件名
                sb.append(String.format("<div class=\"name\">%s</div>", fileName));

                //添加文件修改时间
                sb.append(String.format("<div class=\"modify-date\">%s</div>", DateFormat.getDateTimeInstance().format(modifyTime)));

                //添加文件类型
                sb.append(String.format("<div class=\"type\">%s</div>", fileType));

                //添加文件大小
                sb.append(String.format("<div class=\"size\">%s</div>", fileSize));

                sb.append("</div>");
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
