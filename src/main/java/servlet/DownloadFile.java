package servlet;

import database.DatabaseConfig;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.net.URLEncoder;
import java.sql.*;
import java.util.HashMap;
import java.util.Map;

@WebServlet("/pages/downloadFile")
public class DownloadFile extends HttpServlet {
    private static final long serialVersionUID = 1L;

    // 上传文件存储目录
    private static final String UPLOAD_DIRECTORY = "upload";

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
        } catch(SQLException | ClassNotFoundException ex){
            ex.printStackTrace();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        doGet(request, response);
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        //验证用户是否登录
        Long user_id = (Long)request.getSession().getAttribute("userID");
        if(user_id == null) {
            // 发送401 Unauthorized错误
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "User not logged in.");
            return;
        }

        try {
            String file_id = request.getParameter("file_id");
            ps = conn.prepareStatement("SELECT file_name FROM files WHERE user_id =? AND file_id =?");
            ps.setLong(1, user_id);
            ps.setString(2, file_id);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                String fileName = rs.getString("file_name");
                String extension = getFileExtension(fileName);

                response.setCharacterEncoding("UTF-8");

                // 根据文件扩展名设置Content-Type
                String mimeType = getMimeType(extension);
                response.setContentType(mimeType);

                String encodedFileName = URLEncoder.encode(fileName, "UTF-8");

                // 设置文件下载的头信息
                response.setHeader("Content-Disposition", "attachment; filename=\"" + encodedFileName + "\"");

                //获取文件
                String uploadPath = request.getServletContext().getRealPath("./") + File.separator + UPLOAD_DIRECTORY + File.separator + user_id;
                File file = new File(uploadPath + File.separator + fileName);

                // 获取文件的输入流
                InputStream inStream = new FileInputStream(file);

                // 创建输出流
                OutputStream outStream = response.getOutputStream();

                // 读取输入流并写入响应的输出流
                byte[] buffer = new byte[4096];
                int bytesRead;
                while ((bytesRead = inStream.read(buffer)) != -1) {
                    outStream.write(buffer, 0, bytesRead);
                }

                // 关闭流
                inStream.close();
                outStream.flush();
                outStream.close();
            } else{
                response.sendError(404, "File not found");
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    // 工具方法：获取文件扩展名
    private String getFileExtension(String fileName) {
        int lastIndexOf = fileName.lastIndexOf('.');
        return (lastIndexOf == -1) ? "" : fileName.substring(lastIndexOf + 1);
    }

    private String getMimeType(String extension) {
        // 定义一个Map来存储文件扩展名和对应的MIME类型
        Map<String, String> mimeTypes = new HashMap<>();
        //application
        mimeTypes.put("pdf", "application/pdf");
        mimeTypes.put("doc", "application/msword");
        mimeTypes.put("docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        mimeTypes.put("xls", "application/vnd.ms-excel");
        mimeTypes.put("xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        mimeTypes.put("ppt", "application/vnd.ms-powerpoint");
        mimeTypes.put("pptx", "application/vnd.openxmlformats-officedocument.presentationml.presentation");
        mimeTypes.put("zip", "application/zip");
        mimeTypes.put("gz", "application/gzip");
        mimeTypes.put("tar", "application/x-tar");
        mimeTypes.put("swf", "application/x-shockwave-flash");
        mimeTypes.put("json", "application/json");

        //image, .bmp .jpg .jpeg .png .gif .svg, .ico .webp
        mimeTypes.put("bmp", "image/bmp");
        mimeTypes.put("jpg", "image/jpeg");
        mimeTypes.put("jpeg", "image/jpeg");
        mimeTypes.put("png", "image/png");
        mimeTypes.put("gif", "image/gif");
        mimeTypes.put("svg", "image/svg+xml");
        mimeTypes.put("ico", "image/x-icon");
        mimeTypes.put("webp", "image/webp");
        mimeTypes.put("tiff", "image/tiff");
        mimeTypes.put("tif", "image/tiff");
        mimeTypes.put("psd", "image/vnd.adobe.photoshop");
        mimeTypes.put("raw", "image/x-raw");
        mimeTypes.put("cr2", "image/x-canon-cr2");
        mimeTypes.put("nef", "image/x-nikon-nef");
        mimeTypes.put("orf", "image/x-olympus-orf");
        mimeTypes.put("raf", "image/x-fuji-raf");
        mimeTypes.put("arw", "image/x-sony-arw");
        mimeTypes.put("dng", "image/x-adobe-dng");
        mimeTypes.put("heic", "image/heic");
        mimeTypes.put("heif", "image/heif");

        //audio, .mp3 .wav .ogg .flac .aac .m4a .wma .amr .alac .mid .midi .aiff .aif .mp2 .mka .voc
        mimeTypes.put("mp3", "audio/mpeg"); // 标准MPEG音频层III
        mimeTypes.put("wav", "audio/wav"); // wav
        mimeTypes.put("ogg", "audio/ogg"); // Ogg Vorbis音频
        mimeTypes.put("flac", "audio/flac"); // 无损音频格式
        mimeTypes.put("aac", "audio/aac"); // 高效高级音频编码
        mimeTypes.put("opus", "audio/opus"); // Opus音频编码
        mimeTypes.put("m4a", "audio/m4a"); // MPEG-4音频
        mimeTypes.put("wma", "audio/x-ms-wma"); // Windows Media音频
        mimeTypes.put("amr", "audio/amr"); // 适应性多速率音频
        mimeTypes.put("alac", "audio/x-alac"); // Apple无损音频编码
        mimeTypes.put("mid", "audio/midi"); // MIDI音频
        mimeTypes.put("midi", "audio/midi"); // MIDI音频
        mimeTypes.put("aiff", "audio/aiff"); // 音频交换文件格式
        mimeTypes.put("aif", "audio/aiff"); // 音频交换文件格式
        mimeTypes.put("mp2", "audio/mpeg"); // MPEG音频层II
        mimeTypes.put("mka", "audio/x-matroska"); // Matroska音频
        mimeTypes.put("voc", "audio/x-voc"); // Creative Voice文件

        //video, .mp4 .avi .wmv .flv .mov .mkv .webm .3gp .3gpp .m3u8 .ts .m4v .f4v .vob .asf .m2ts .rm .ogv .gifv .m3u8
        mimeTypes.put("mp4", "video/mp4"); // 通常用于HTML5视频
        mimeTypes.put("avi", "video/x-msvideo"); // 微软的视频格式
        mimeTypes.put("wmv", "video/x-ms-wmv"); // Windows Media Video
        mimeTypes.put("flv", "video/x-flv"); // Flash视频格式
        mimeTypes.put("mov", "video/quicktime"); // QuickTime视频
        mimeTypes.put("mkv", "video/x-matroska"); // Matroska视频
        mimeTypes.put("webm", "video/webm"); // WebM视频格式
        mimeTypes.put("3gp", "video/3gpp"); // 3G移动电话视频
        mimeTypes.put("3gpp", "video/3gpp"); // 3GPP视频
        mimeTypes.put("m3u8", "application/x-mpegURL"); // HLS (HTTP Live Streaming) 播放列表
        mimeTypes.put("ts", "video/MP2T"); // MPEG传输流
        mimeTypes.put("m4v", "video/x-m4v"); // MPEG-4视频
        mimeTypes.put("f4v", "video/mp4"); // Adobe Flash视频
        mimeTypes.put("vob", "video/x-ms-vob"); // DVD视频对象
        mimeTypes.put("asf", "video/x-ms-asf"); // 微软高级流格式
        mimeTypes.put("m2ts", "video/MP2T"); // 蓝光光盘视频
        mimeTypes.put("rm", "application/vnd.rn-realmedia"); // RealMedia视频
        mimeTypes.put("ogv", "video/ogg"); // Ogg视频
        mimeTypes.put("gifv", "video/gif"); // 视频GIF
        mimeTypes.put("m3u8", "application/x-mpegURL"); // HLS (HTTP Live Streaming) 播放列表

        //text, .txt .html .htm .css .js .xml .csv .java .c .cpp .cs .py .rb .php .pl .sh .sql .bat .ps1 .go .swift .kt .scala .groovy .h .hpp .yml .yaml .rs
        mimeTypes.put("md", "text/markdown"); // Markdown文件
        mimeTypes.put("txt", "text/plain");
        mimeTypes.put("html", "text/html");
        mimeTypes.put("htm", "text/html");
        mimeTypes.put("css", "text/css");
        mimeTypes.put("js", "text/javascript");
        mimeTypes.put("xml", "text/xml");
        mimeTypes.put("csv", "text/csv");
        mimeTypes.put("java", "text/x-java-source,java"); // Java源文件
        mimeTypes.put("c", "text/x-csrc"); // C语言源文件
        mimeTypes.put("cpp", "text/x-c++src"); // C++源文件
        mimeTypes.put("cs", "text/x-csharp"); // C#源文件
        mimeTypes.put("py", "text/x-python"); // Python源文件
        mimeTypes.put("rb", "text/x-ruby"); // Ruby源文件
        mimeTypes.put("php", "application/x-httpd-php"); // PHP源文件
        mimeTypes.put("pl", "text/x-perl"); // Perl脚本
        mimeTypes.put("sh", "text/x-shellscript"); // Shell脚本
        mimeTypes.put("sql", "text/x-sql"); // SQL脚本
        mimeTypes.put("bat", "text/x-msdos-batch"); // Windows批处理文件
        mimeTypes.put("ps1", "application/x-powershell"); // PowerShell脚本
        mimeTypes.put("go", "text/x-go"); // Go语言源文件
        mimeTypes.put("swift", "text/x-swift"); // Swift源文件
        mimeTypes.put("kt", "text/x-kotlin"); // Kotlin源文件
        mimeTypes.put("scala", "text/x-scala"); // Scala源文件
        mimeTypes.put("groovy", "text/x-groovy"); // Groovy源文件
        mimeTypes.put("h", "text/x-chdr"); // C/C++头文件
        mimeTypes.put("hpp", "text/x-c++hdr"); // C++头文件
        mimeTypes.put("yml", "text/x-yaml"); // YAML配置文件
        mimeTypes.put("yaml", "text/x-yaml"); // YAML配置文件
        mimeTypes.put("rs", "text/x-rustsrc"); // Rust源文件

        // 检查扩展名是否存在于Map中，如果存在则返回对应的MIME类型
        return mimeTypes.getOrDefault(extension.toLowerCase(), "application/octet-stream");
    }
}
