package filter;

import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;
import java.io.IOException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@WebFilter("/*")
public class XssFilter implements Filter {
    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        Filter.super.init(filterConfig);
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        // 检查请求是否为文件上传请求
        // 这里我们检查请求的Content-Type是否为multipart/form-data
        String contentType = request.getContentType();
        boolean isMultipartUpload = contentType != null && contentType.startsWith("multipart/form-data");

        if (isMultipartUpload) {
            // 如果是文件上传请求，绕过过滤器
            chain.doFilter(request, response);
            return;
        }

        //创建一个包装了请求的自定义请求对象，该对象转义了用户输入
        XssRequestWrapper xssRequest = new XssRequestWrapper((HttpServletRequest)request);

        // 将包装了的安全请求对象传递到 Filter 链
        chain.doFilter(xssRequest, response);
    }

    @Override
    public void destroy() {
        Filter.super.destroy();
    }

    //内部类，用于包整 HttpServletRequest 并转义参数
    protected class XssRequestWrapper extends HttpServletRequestWrapper {

        public XssRequestWrapper(HttpServletRequest request) {
            super(request);
        }

        @Override
        public String getParameter(String name){
            String value = super.getParameter(name);
            return stripXss(value);
        }

        @Override
        public String[] getParameterValues(String name){
            String[] values = super.getParameterValues(name);
            if(values == null)
                return null;

            String[] escapeValues = new String[values.length];
            for(int i = 0;i < values.length;i++)
                escapeValues[i] = stripXss(values[i]);

            return escapeValues;
        }

        private String stripXss(String value) {
            if (value != null) {
                // 移除字符串中所有的<script>脚本
                Pattern scriptPattern = Pattern.compile("<\\s*script.*?>.*?<\\s*/script>");
                value = stripXssValue(value, scriptPattern);

                // 移除HTML标签
                Pattern htmlTagPattern = Pattern.compile("<[^>]*>");
                value = stripXssValue(value, htmlTagPattern);

                // 移除CSS表达式
                Pattern cssExpressionPattern = Pattern.compile("expression\\(.*?\\)|\\bbehavior\\b\\s*:\\s*[\"']?\\burl\\b");
                value = stripXssValue(value, cssExpressionPattern);

                // 移除JavaScript URI
                Pattern javascriptUriPattern = Pattern.compile("javascript:.*");
                value = stripXssValue(value, javascriptUriPattern);

                // 移除VBScript事件
                Pattern vbsEventPattern = Pattern.compile("(onabort|onactivate|onafterprint|onafterupdate|onbeforeactivate|onbeforecopy|onbeforecut|onbeforedeactivate|onbeforeeditfocus|onbeforepaste|onbeforeprint|onbeforeunload|onbeforeupdate|onblur|onbounce|oncellchange|onchange|onclick|oncontextmenu|oncontrolselect|oncopy|oncut|ondataavailable|ondatasetchanged|ondatasetcomplete|ondblclick|ondeactivate|ondrag|ondragend|ondragenter|ondragleave|ondragover|ondragstart|ondrop|onerror|onerrorupdate|onfilterchange|onfinish|onfocus|onfocusin|onfocusout|onhelp|onkeydown|onkeypress|onkeyup|onlayoutcomplete|onload|onlosecapture|onmousedown|onmouseenter|onmouseleave|onmousemove|onmouseout|onmouseover|onmouseup|onmousewheel|onmove|onmoveend|onmovestart|onpaste|onpropertychange|onreadystatechange|onreset|onresize|onresizeend|onresizestart|onrowenter|onrowexit|onrowsdelete|onrowsinserted|onscroll|onselect|onselectionchange|onselectstart|onstart|onstop|onsubmit|onunload)\\s*=\\s*[\"\']?(\\S+)?[\"\']?");

                value = stripXssValue(value, vbsEventPattern);

                // 移除其他潜在的XSS攻击字符
                // 例如，可以添加更多的正则表达式来转义其他类型的XSS攻击字符
            }
            return value;
        }

        private String stripXssValue(String value, Pattern pattern) {
            Matcher matcher = pattern.matcher(value);
            return matcher.replaceAll("");
        }
    }
}
