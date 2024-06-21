<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ page import="java.sql.*" %>
<%@ page import="user.User" %>
<%@ page import="java.util.*" %>

<%
    Long userID = (Long) session.getAttribute("userID");
    Connection conn = null;
    PreparedStatement pstmt = null;

    try {
        Class.forName("com.mysql.cj.jdbc.Driver");
        conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/cloudstorage", "root", "kv");
        System.out.println("Connected to database: CloudStorage");
    } catch(SQLException ex){
        ex.printStackTrace();
    } catch (ClassNotFoundException ex) {
        ex.printStackTrace();
    }

    User user = null;
    if(userID!= null) {
        try{
            pstmt = conn.prepareStatement("select * from user where user_id = ?");
            pstmt.setLong(1, userID);
            pstmt.execute();

            ResultSet rs = pstmt.getResultSet();
            if(rs.next()){
                user = new User();
                user.setUserID(rs.getLong("user_id"));//用户ID
                user.setUserName(rs.getString("user_name"));//用户名
                user.setIdentifier(rs.getString("identifier"));//用户唯一标识，邮箱/微信等等
                user.setSalt(rs.getString("salt"));//盐
                user.setPassword_hash(rs.getString("password_hash"));//密码哈希
                user.setStorageQuota(rs.getDouble("storage_quota"));//存储配额
                user.setUsedStorage(rs.getDouble("used_storage"));//已用存储
                user.setUserStatus(rs.getString("user_status"));//用户状态
                user.setSourceFrom(rs.getString("source_from"));//用户来源
                user.setBindStatus(rs.getBoolean("bind_status"));//绑定状态
                user.setCreateTime(rs.getDate("create_time"));//创建时间
                user.setAvatar(rs.getString("avatar"));//用户头像
            }
       } catch (Exception e) {
           e.printStackTrace();
       }
    }

    request.setAttribute("user", user);
%>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>User Profile</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 80%;
            margin: auto;
            overflow: hidden;
        }
        .user-profile {
            background: #fff;
            padding: 20px;
            margin-top: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .user-profile h2 {
            margin-top: 0;
            color: #333;
        }
        .user-info {
            list-style: none;
            padding: 0;
        }
        .user-info li {
            padding: 8px 0;
            border-bottom: 1px solid #eee;
        }
        .user-info li:last-child {
            border-bottom: none;
        }
        .label {
            font-weight: bold;
            color: #555;
            margin-right: 10px;
        }
        .value {
            color: #777;
        }
    </style>
</head>
<body>
    <div class="container">
        <% if (user != null) { %>
            <div class="user-profile">
                <h2>用户信息</h2>
                <ul class="user-info">
                    <li><span class="label">用户ID:</span> <span class="value"><%= user.getUserID() %></span></li>
                    <li><span class="label">用户名:</span> <span class="value"><%= user.getUserName() %></span></li>
                    <li><span class="label">用户唯一标识:</span> <span class="value"><%= user.getIdentifier() %></span></li>
                    <li><span class="label">存储配额:</span> <span class="value"><%= user.getStorageQuota() %></span></li>
                    <%
                        double usedStorage = (double) user.getUsedStorage();
                        String usedStorageStr;
                        if(usedStorage < 1024){
                            usedStorageStr = String.format("%.2f", usedStorage) + " B";
                        } else if(usedStorage < 1024*1024){
                            usedStorage = usedStorage / 1024;
                            usedStorageStr = String.format("%.2f", usedStorage) + " KB";
                        } else if(usedStorage < 1024*1024*1024){
                            usedStorage = usedStorage / 1024 / 1024;
                            usedStorageStr = String.format("%.2f", usedStorage) + " MB";
                        } else {
                            usedStorage = usedStorage / 1024 / 1024 / 1024;
                            usedStorageStr = String.format("%.2f", usedStorage)+ " GB";
                        }
                    %>
                    <li><span class="label">已用存储:</span> <span class="value"><%= usedStorageStr %></span></li>
                    <li><span class="label">用户状态:</span> <span class="value"><%= user.getUserStatus() %></span></li>
                    <li><span class="label">用户来源:</span> <span class="value"><%= user.getSourceFrom() %></span></li>
                    <li><span class="label">绑定状态:</span> <span class="value"><%= user.getBindStatus() ? "已绑定" : "未绑定" %></span></li>
                    <li><span class="label">创建时间:</span> <span class="value"><%= new java.text.SimpleDateFormat("yyyy-MM-dd").format(user.getCreateTime()) %></span></li>
                    <li><span class="label">用户头像:</span> <span class="value"><%= user.getAvatar() %></span></li>
                    <li style="display: flex; align-items: center;"><span class="label">用户头像:</span> <span class="value"><img style="max-width: 10vw;" src="../avatar/<%= user.getAvatar() %>" alt="用户头像"></span></li>
                </ul>
            </div>
        <% } else { %>
            <p>用户信息未找到。</p>
        <% } %>
    </div>
</body>
</html>