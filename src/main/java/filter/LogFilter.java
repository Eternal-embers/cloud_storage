package filter;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Date;

public class LogFilter implements Filter {

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        // 获取初始化参数
        String site = filterConfig.getInitParameter("Site");
        // 输出初始化参数
        System.out.println("Site：" + site);
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        // 记录请求处理开始的时间
        long startTime = new Date().getTime();

        /* =========== IP地址 =========== */
        try {
            // 获取本机的主机名
            String hostName = InetAddress.getLocalHost().getHostName();

            // 获取本机的IP地址
            InetAddress localAddress = InetAddress.getByName(hostName);
            String localAddr = localAddress.getHostAddress();

            // 输出本机的IP地址
            System.out.println("Local IP Address: " + localAddr);
        } catch (UnknownHostException e) {
            // 如果主机名无法解析为IP地址，将抛出异常
            System.out.println("Hostname could not be resolved to an IP address.");
            e.printStackTrace();
        }

        // 确保请求是HttpServletRequest类型
        if (request instanceof HttpServletRequest) {
            /* =========== 网址记录 =========== */
            HttpServletRequest httpRequest = (HttpServletRequest) request;

            // 获取请求的方案（http 或 https）
            String scheme = httpRequest.getScheme();

            // 获取服务器的主机名（或IP地址）
            String serverName = httpRequest.getServerName();

            // 获取服务器的端口号
            int serverPort = httpRequest.getServerPort();

            // 获取请求的URI（不包括服务器地址和端口）
            String uri = httpRequest.getRequestURI();

            // 获取查询字符串（如果有的话）
            String queryString = httpRequest.getQueryString();

            // 构建完整的请求URL
            StringBuilder url = new StringBuilder();
            url.append(scheme).append("://").append(serverName);
            if ((serverPort != 80 && serverPort != 443) || "https".equals(scheme)) {
                url.append(":").append(serverPort);
            }
            url.append(uri);
            if (queryString != null && !queryString.isEmpty()) {
                url.append("?").append(queryString);
            }

            // 打印当前访问的网址到控制台
            System.out.println("Current URL: " + url.toString());

            /* =========== 时间记录 =========== */
            // 使用 FilterChain 的 doFilter 方法将请求传递给下一个过滤器或Servlet
            try {
                // 原始响应对象的引用，用于后面获取状态码
                HttpServletResponse originalResponse = (HttpServletResponse) response;

                chain.doFilter(request, response);

                // 此时，响应可能已经提交，获取状态码
                int statusCode = originalResponse.getStatus();

                // 打印状态码
                System.out.println("Response Status Code: " + statusCode);
            } catch(ServletException ex){
                ex.printStackTrace();
            } finally {
                // 记录请求处理结束的时间
                long endTime = new Date().getTime();

                // 计算请求处理的总时间
                long processingTime = endTime - startTime;

                // 在控制台输出请求信息和处理时间
                System.out.println("Request processing time for " + httpRequest.getRequestURI() + ": " + processingTime + " ms");
            }
        }

        System.out.println("");//换行
    }

    @Override
    public void destroy() {
        // 在 Filter 实例被 Web 容器从服务器移除之前调用
    }
}