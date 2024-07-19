<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ page import="java.sql.*" %>
<%@ page import="user.User" %>
<%@ page import="java.util.*" %>
<%@ page import="java.io.*" %>
<%@ page import="java.text.DateFormat" %>

<%!
    Connection conn = null;
    PreparedStatement pstmt = null;
    User user = null;
    double usedStorage = 0.0;
    Long userID = null;
%>

<%
    try {
        Class.forName("com.mysql.cj.jdbc.Driver");
        conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/cloudstorage", "root", "kv");
        System.out.println("Connected to database: CloudStorage");
    } catch(SQLException ex){
        ex.printStackTrace();
    } catch (ClassNotFoundException ex) {
        ex.printStackTrace();
    }
%>

<%
    userID = (Long) session.getAttribute("userID");
    if(userID == null){
        response.sendRedirect("login.html");
        return;
    }
    Cookie userIDCookie = new Cookie("userID", userID.toString());
    userIDCookie.setMaxAge(60*60*24); // Cookie 1 天后过期
    response.addCookie(new Cookie("userID", userID.toString()));
    response.getWriter().println(String.format("<div id='userID' user-id='%s' display='none'></div>", userID));

    //计算已使用存储
    pstmt = conn.prepareStatement("select sum(file_size) as used_storage from files where user_id = ?");
    pstmt.setLong(1, userID);
    pstmt.executeQuery();
    ResultSet usedStorageRs = pstmt.getResultSet();
    if(usedStorageRs.next()){
        usedStorage = usedStorageRs.getDouble("used_storage");
        usedStorageRs.close();
    }

    try{
        usedStorageRs.close();
    } catch (Exception e) {
        e.printStackTrace();
    }

    //更新数据库中的已用存储
    pstmt = conn.prepareStatement("update user set used_storage = ? where user_id = ?");
    pstmt.setDouble(1, usedStorage);
    pstmt.setLong(2, userID);
    pstmt.execute();


    double usedStorageValue;
    String usedStorageStr;
    if(usedStorage < 1024){
        usedStorageValue = usedStorage;
        usedStorageStr = String.format("%.2f", usedStorageValue) + " B";
    } else if(usedStorage < 1024*1024){
        usedStorageValue = usedStorage / 1024;
        usedStorageStr = String.format("%.2f", usedStorageValue) + " KB";
    } else if(usedStorage < 1024*1024*1024){
        usedStorageValue = usedStorage / 1024 / 1024;
        usedStorageStr = String.format("%.2f", usedStorageValue) + " MB";
    } else {
        usedStorageValue = usedStorage / 1024 / 1024 / 1024;
        usedStorageStr = String.format("%.2f", usedStorageValue)+ " GB";
    }

    request.setAttribute("usedStorage", usedStorage);
    request.setAttribute("usedStorageStr", usedStorageStr);
%>

<%
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

            Cookie cookie = new Cookie("userID", String.valueOf(user.getUserID()));
            cookie.setMaxAge(60*60*24*30); // Cookie 30 天后过期
            cookie.setPath("/"); // Cookie 对整个网站有效

            response.addCookie(cookie);
       } catch (Exception e) {
           e.printStackTrace();
       }
    }

    request.setAttribute("user", user);
%>

<%
    String message = request.getParameter("message");
    if(message!= null){
        out.print("<script>alert('" + message + "')</script>");
    }
%>

<!DOCTYPE html>

<html>

<head>
    <title>首页</title>
    <meta charset="UTF-8">
    <link rel="icon" type="image/png" href="../image/home.png">
    <link rel="stylesheet" type="text/css" href="../css/main.css">
    <script defer src="../js/main.js"></script>
</head>

<body>
    <a href="main.jsp" target="_self">
        <div class="logo">
            <svg t="1718698075558" class="logo-icon" viewBox="0 0 1474 1024" version="1.1"
                xmlns="http://www.w3.org/2000/svg" p-id="10809" width="1.5vw" height="1.5vw">
                <path
                    d="M233.450777 244.062176C297.119171 95.502591 440.373057 0 604.849741 0c106.11399 0 206.92228 42.445596 286.507772 116.725389 26.528497-10.611399 53.056995-15.917098 84.891192-15.917099 95.502591 0 175.088083 53.056995 212.227979 137.948187 159.170984 0 286.507772 127.336788 286.507772 286.507772s-127.336788 286.507772-286.507772 286.507772h-148.559586v-79.585493h148.559586c116.725389 0 206.92228-95.502591 206.92228-206.922279s-90.196891-201.61658-206.92228-201.616581c-21.222798 0-42.445596 0-63.668394 5.3057 0-79.585492-68.974093-148.559585-148.559585-148.559586-42.445596 0-79.585492 15.917098-106.11399 37.139897-58.362694-79.585492-153.865285-137.948187-265.284974-137.948187-148.559585 0-275.896373 106.11399-313.036269 244.062176h-5.3057c-111.419689 0-206.92228 90.196891-206.92228 201.616581s90.196891 206.92228 196.310881 206.922279h153.865285v79.585493H275.896373c-153.865285 0-275.896373-132.642487-275.896373-286.507772 0-137.948187 100.80829-254.673575 233.450777-281.202073z"
                    fill="" p-id="10810"></path>
                <path
                    d="M832.994819 663.212435h95.50259l-191.005181 222.839378V376.704663h95.502591zM684.435233 673.823834v350.176166h-100.80829v-286.507772H493.430052l191.005181-222.839378z"
                    fill="" p-id="10811"></path>
            </svg>
            <div class="logo-info">云存储</div>
        </div>
    </a>

    <div class="forum" onclick="window.open('forum.jsp','_blank');">
            <svg t="1718892500327" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
                p-id="15391" width="1vw" height="1vw">
                <path
                    d="M256.426667 213.333333C257.493333 164.992 305.749333 128.469333 362.709333 128.426667L875.008 128.213333a106.453333 106.453333 0 0 1 106.410667 106.752v383.829334c0 53.973333-43.52 106.794667-84.864 106.794666a21.76 21.76 0 0 1-0.64 0 127.914667 127.914667 0 0 1-127.658667 123.562667h-276.650667c-33.493333 0-81.28 24.234667-101.162666 51.413333l-21.034667 28.629334c-34.176 46.634667-94.890667 38.272-114.517333-16.341334l-7.765334-21.546666c-9.472-26.410667-43.434667-48.725333-71.808-47.146667l-2.005333 0.128A122.368 122.368 0 0 1 42.666667 721.066667V341.418667A127.914667 127.914667 0 0 1 170.453333 213.333333H256.426667zM896 682.88a21.76 21.76 0 0 1 0.554667 0c15.786667 0 42.197333-32.085333 42.197333-64.128V234.922667c0-35.498667-28.501333-64.085333-63.701333-64.085334l-512.298667 0.298667c-35.242667 0-62.293333 20.053333-63.658667 42.197333h469.12A127.658667 127.658667 0 0 1 896 341.418667v341.461333zM85.333333 341.418667V721.066667c0 47.573333 38.314667 83.2 85.546667 80.554666l2.048-0.085333c47.146667-2.688 98.474667 31.018667 114.346667 75.264l7.765333 21.546667c8.021333 22.357333 25.898667 24.746667 39.978667 5.546666l20.992-28.586666C384 837.12 444.586667 806.4 491.605333 806.4h276.650667A85.248 85.248 0 0 0 853.333333 721.066667V341.418667A84.992 84.992 0 0 0 768.213333 256H170.453333A85.248 85.248 0 0 0 85.333333 341.418667z"
                    p-id="15392"></path>
                <path
                    d="M298.666667 554.666667m-42.666667 0a42.666667 42.666667 0 1 0 85.333333 0 42.666667 42.666667 0 1 0-85.333333 0Z"
                    p-id="15393"></path>
                <path
                    d="M469.333333 554.666667m-42.666666 0a42.666667 42.666667 0 1 0 85.333333 0 42.666667 42.666667 0 1 0-85.333333 0Z"
                    p-id="15394"></path>
                <path
                    d="M640 554.666667m-42.666667 0a42.666667 42.666667 0 1 0 85.333334 0 42.666667 42.666667 0 1 0-85.333334 0Z"
                    p-id="15395"></path>
            </svg>
        </div>

    <div class="setting">
        <svg t="1718719737080" class="setting-icon" viewBox="0 0 1024 1024" version="1.1"
            xmlns="http://www.w3.org/2000/svg" p-id="13146">
            <path
                d="M960.620725 848.835765H279.118607a127.096471 127.096471 0 0 0-122.88-94.750118c-70.113882 0-127.036235 56.621176-127.036235 126.313412s56.922353 126.373647 126.976 126.373647c59.030588 0 108.845176-40.357647 122.940235-94.750118h681.502118a31.683765 31.683765 0 1 0 0-63.247059zM156.178372 943.585882c-34.996706 0-63.488-28.310588-63.488-63.186823 0-34.816 28.491294-63.186824 63.488-63.186824 35.056941 0 63.488 28.310588 63.488 63.186824 0 34.816-28.431059 63.186824-63.488 63.186823zM961.223078 493.327059h-97.882353a127.096471 127.096471 0 0 0-245.880471 0H65.102607a31.683765 31.683765 0 0 0-31.804235 31.563294c0 17.468235 14.215529 31.563294 31.744 31.563294h552.357647a127.096471 127.096471 0 0 0 245.940706 0h97.882353a31.623529 31.623529 0 1 0 0-63.126588z m-220.822589 94.750117c-34.996706 0-63.488-28.310588-63.488-63.247058 0-34.816 28.491294-63.126588 63.488-63.126589 34.996706 0 63.488 28.310588 63.488 63.186824 0 34.816-28.491294 63.186824-63.488 63.186823zM156.178372 295.695059c59.030588 0 108.845176-40.357647 122.940235-94.750118h681.502118a31.623529 31.623529 0 1 0 0-63.186823H279.118607A127.096471 127.096471 0 0 0 29.202372 169.381647c0 69.632 56.922353 126.313412 126.976 126.313412z m0-189.500235c35.056941 0 63.488 28.310588 63.488 63.186823 0 34.816-28.431059 63.126588-63.488 63.126588-34.996706 0-63.488-28.310588-63.488-63.126588 0-34.936471 28.491294-63.247059 63.488-63.247059z"
                p-id="13147"></path>
        </svg>
    </div>

    <div class="mode">
        <input type="checkbox" id="light-mode" checked>
        <input type="checkbox" id="dark-mode">
        <label class="light-mode" for="light-mode" onclick="document.getElementById('dark-mode').checked = true;">
            <svg t="1718705555436" class="mode-icon light-icon" viewBox="0 0 1024 1024" version="1.1"
                xmlns="http://www.w3.org/2000/svg" p-id="17373">
                <path
                    d="M512.000213 733.353497c-122.06857 0-221.353283-99.284713-221.353283-221.353284S389.931643 290.64693 512.000213 290.64693 733.353497 389.931643 733.353497 512.000213 634.026117 733.353497 512.000213 733.353497z m0-357.373767A136.148482 136.148482 0 0 0 375.97973 512.000213 136.148482 136.148482 0 0 0 512.000213 648.020697 136.148482 136.148482 0 0 0 648.020697 512.000213 136.148482 136.148482 0 0 0 512.000213 375.97973zM554.666613 171.735673A42.154403 42.154403 0 0 1 512.000213 213.335413c-23.551853 0-42.6664-18.645217-42.6664-41.59974V41.603153A42.154403 42.154403 0 0 1 512.000213 0.003413c23.551853 0 42.6664 18.645217 42.6664 41.59974v130.13252zM554.666613 982.397273A42.154403 42.154403 0 0 1 512.000213 1023.997013c-23.594519 0-42.6664-18.687883-42.6664-41.59974v-130.175186A42.111737 42.111737 0 0 1 512.000213 810.665013c23.551853 0 42.6664 18.60255 42.6664 41.59974v130.13252zM171.735673 469.333813c22.954523 0 41.59974 19.114547 41.59974 42.6664 0 23.594519-18.645217 42.6664-41.59974 42.6664H41.603153A42.154403 42.154403 0 0 1 0.003413 512.000213c0-23.551853 18.645217-42.6664 41.59974-42.6664h130.13252zM982.397273 469.333813c22.954523 0 41.59974 19.114547 41.59974 42.6664 0 23.594519-18.687883 42.6664-41.59974 42.6664h-130.175186A42.111737 42.111737 0 0 1 810.665013 512.000213c0-23.551853 18.60255-42.6664 41.59974-42.6664h130.13252zM241.239239 722.430898a42.06907 42.06907 0 0 1 59.562294 0.767995 42.111737 42.111737 0 0 1 0.767996 59.562295l-92.031425 92.074091a42.154403 42.154403 0 0 1-59.562295-0.853328 42.154403 42.154403 0 0 1-0.767995-59.562294l92.031425-91.988759zM814.462323 149.207814a42.154403 42.154403 0 0 1 59.562294 0.767995 42.154403 42.154403 0 0 1 0.767996 59.562295l-92.031425 92.031425a42.06907 42.06907 0 0 1-59.562295-0.767996 42.111737 42.111737 0 0 1-0.810661-59.562294l92.074091-92.031425zM241.239239 301.526862a42.19707 42.19707 0 0 0 59.604961-0.725329 42.111737 42.111737 0 0 0 0.767995-59.562294L209.538104 149.122481a42.154403 42.154403 0 0 0-59.562295 0.853328 42.111737 42.111737 0 0 0-0.767995 59.562295l92.031425 91.988758zM814.462323 874.792613a42.111737 42.111737 0 0 0 59.562294-0.810662 42.154403 42.154403 0 0 0 0.767996-59.562294l-92.031425-92.031425a42.06907 42.06907 0 0 0-59.562295 0.767995 42.111737 42.111737 0 0 0-0.810661 59.562294l92.074091 92.074092z"
                    p-id="17374"></path>
            </svg>
        </label>
        <label class="dark-mode" for="dark-mode" onclick="document.getElementById('light-mode').checked = true;">
            <svg t="1718705895470" class="mode-icon dark-icon" viewBox="0 0 1024 1024" version="1.1"
                xmlns="http://www.w3.org/2000/svg" p-id="55938">
                <path
                    d="M272.5 379.4c0-108.9 37.1-209.1 99.2-288.8-148 74.5-249.5 227.6-249.5 404.5 0 250 202.7 452.7 452.7 452.7 117.3 0 224.2-44.6 304.6-117.8-43.2 13-88.9 20.1-136.3 20.1-260 0-470.7-210.7-470.7-470.7z"
                    p-id="55939"></path>
                <path
                    d="M574.9 955.5c-253.8 0-460.4-206.5-460.4-460.4 0-175 97.2-332.6 253.7-411.3l30.2-15.2-20.8 26.7c-63.8 82-97.5 180.2-97.5 284.1 0 255.4 207.8 463.1 463.1 463.1 45.5 0 90.6-6.7 134.1-19.8l32.2-9.7-24.9 22.7c-84.9 77.2-194.9 119.8-309.7 119.8zM345.5 113.6c-133.9 80.3-215.8 223.6-215.8 381.5 0 245.4 199.7 445.1 445.1 445.1 99.8 0 195.9-33.3 273.9-94.3-34.6 7.8-70 11.8-105.6 11.8-263.8 0-478.4-214.6-478.4-478.4 0.1-95.8 27.9-187 80.8-265.7z"
                    p-id="55940"></path>
            </svg>
        </label>
    </div>

    <div class="user">
        <img class="user-avatar" src="../avatar/<%= user.getAvatar() %>" alt="头像" />
    </div>

    <div class="mask"></div>

    <div class="user-profile">
        <div class="avatar">
            <input type="file" id="avatar-input" name="avatar" accept="image/*" />
            <img class="user-avatar" src="../avatar/<%= user.getAvatar() %>" alt="头像" />
        </div>
        <div class="user_name"><%= user.getUserName() %></div>

        <div class="line"></div>

        <div class="main-profile">
            <div class="account">账号：<%= user.getIdentifier() %></div>
            <div class="storage">
                <%! private double storageUsedPercentage; %>
                <%
                    storageUsedPercentage = user.getUsedStorage() / 1024 / 1024 / user.getStorageQuota() * 100;
                    System.out.println("storageUsedPercentage: " + String.format("%.2f", storageUsedPercentage) + "%");
                %>
                <div class="info">存储使用情况：</div>
                <div class="storage-bar">
                    <div class="storage-used" style="width:<%= String.format("%.2f", storageUsedPercentage) %>%;" ></div>
                </div>
                <div class="used-percentage">已用存储空间占比： <%= String.format("%.2f", storageUsedPercentage) %>%</div>
                <div class="quota">总存储空间：<%= user.getStorageQuota() %> MB</div>
                <div class="used">已使用存储空间：<%= request.getAttribute("usedStorageStr") %></div>
            </div>
        </div>

        <div class="change-password">
                <svg t="1718812699806" class="password-icon" viewBox="0 0 1024 1024" version="1.1"
                    xmlns="http://www.w3.org/2000/svg" p-id="17348">
                    <path
                        d="M819.2 1004.8H204.8c-64 0-108.8-57.6-108.8-121.6V576c0-70.4 44.8-128 108.8-128V358.4C204.8 172.8 339.2 19.2 512 19.2c172.8 0 307.2 153.6 307.2 339.2 0 19.2-12.8 32-25.6 32s-25.6-12.8-25.6-32c0-153.6-115.2-275.2-249.6-275.2-140.8 0-249.6 121.6-249.6 275.2V448h556.8c64 0 108.8 57.6 108.8 121.6v307.2c-6.4 76.8-51.2 128-115.2 128z m57.6-428.8c0-32-25.6-64-57.6-64H204.8c-32 0-57.6 25.6-57.6 64v307.2c0 32 25.6 64 57.6 64h614.4c32 0 57.6-25.6 57.6-64V576z m-339.2 179.2v96c0 19.2-12.8 32-25.6 32s-25.6-12.8-25.6-32v-96c-32-12.8-57.6-44.8-57.6-83.2C428.8 614.4 467.2 576 512 576c44.8 0 83.2 38.4 83.2 89.6 0 38.4-25.6 76.8-57.6 89.6zM512 633.6c-12.8 0-25.6 12.8-25.6 32s12.8 32 25.6 32 25.6-12.8 25.6-32-12.8-32-25.6-32z m0 0"
                        p-id="17349"></path>
                </svg>
                <span>修改密码</span>
         </div>

        <div id="logout" onclick="window.location.href='login.html'">
            <span class="info">退出登录</span>
            <svg t="1718765094141" class="logout-icon" viewBox="0 0 1024 1024" version="1.1"
                xmlns="http://www.w3.org/2000/svg" p-id="11407">
                <path d="M510 492.4m20 0l410 0q20 0 20 20l0 0q0 20-20 20l-410 0q-20 0-20-20l0 0q0-20 20-20Z"
                    p-id="11408"></path>
                <path
                    d="M763.572395 660.579162m14.142136-14.142136l148.492424-148.492424q14.142136-14.142136 28.284271 0l0 0q14.142136 14.142136 0 28.284271l-148.492424 148.492424q-14.142136 14.142136-28.284271 0l0 0q-14.142136-14.142136 0-28.284271Z"
                    p-id="11409"></path>
                <path
                    d="M791.856374 335.297274m14.142135 14.142136l148.492424 148.492424q14.142136 14.142136 0 28.284271l0 0q-14.142136 14.142136-28.284271 0l-148.492424-148.492424q-14.142136-14.142136 0-28.284271l0 0q14.142136-14.142136 28.284271 0Z"
                    p-id="11410"></path>
                <path
                    d="M804 762.08a20 20 0 0 0-20 20v78a60.3 60.3 0 0 1-60 60H164a60.3 60.3 0 0 1-60-60v-696a60.3 60.3 0 0 1 60-60h560a60.3 60.3 0 0 1 60 60v78a20 20 0 0 0 20 20 20 20 0 0 0 20-20v-78c0-55-45-100-100-100H164c-55 0-100 45-100 100v696c0 55 45 100 100 100h560c55 0 100-45 100-100v-78a20 20 0 0 0-20-20z"
                    p-id="11411"></path>
            </svg>
        </div>
    </div>

    <div class="search">
        <input id="search-input" type="search" placeholder="请输入搜索内容">
        <div class="search-clear">
            <svg t="1718728777905" class="clear-icon" viewBox="0 0 1024 1024" version="1.1"
                xmlns="http://www.w3.org/2000/svg" p-id="12335">
                <path
                    d="M512 883.2A371.2 371.2 0 1 0 140.8 512 371.2 371.2 0 0 0 512 883.2z m0 64a435.2 435.2 0 1 1 435.2-435.2 435.2 435.2 0 0 1-435.2 435.2z"
                    p-id="12336"></path>
                <path
                    d="M557.056 512l122.368 122.368a31.744 31.744 0 1 1-45.056 45.056L512 557.056l-122.368 122.368a31.744 31.744 0 1 1-45.056-45.056L466.944 512 344.576 389.632a31.744 31.744 0 1 1 45.056-45.056L512 466.944l122.368-122.368a31.744 31.744 0 1 1 45.056 45.056z"
                    p-id="12337"></path>
            </svg>
        </div>
        <svg t="1718725637490" class="search-icon" viewBox="0 0 1024 1024" version="1.1"
            xmlns="http://www.w3.org/2000/svg" p-id="10869">
            <path
                d="M945.066667 898.133333l-189.866667-189.866666c55.466667-64 87.466667-149.333333 87.466667-241.066667 0-204.8-168.533333-373.333333-373.333334-373.333333S96 264.533333 96 469.333333 264.533333 842.666667 469.333333 842.666667c91.733333 0 174.933333-34.133333 241.066667-87.466667l189.866667 189.866667c6.4 6.4 14.933333 8.533333 23.466666 8.533333s17.066667-2.133333 23.466667-8.533333c8.533333-12.8 8.533333-34.133333-2.133333-46.933334zM469.333333 778.666667C298.666667 778.666667 160 640 160 469.333333S298.666667 160 469.333333 160 778.666667 298.666667 778.666667 469.333333 640 778.666667 469.333333 778.666667z"
                p-id="10870"></path>
        </svg>
    </div>

    <div class="storage-content">
        <div class="property">
            <div class="name">名称</div>
            <div class="modify-date">修改日期</div>
            <div class="type">类型</div>
            <div class="size">大小</div>
        </div>
        <div class="dir">
            <div class="folder document" type="system-folder">
                <svg t="1718768286042" class="folder-icon" viewBox="0 0 1024 1024" version="1.1"
                    xmlns="http://www.w3.org/2000/svg" p-id="22970">
                    <path
                        d="M81.16 412.073333L0 709.653333V138.666667a53.393333 53.393333 0 0 1 53.333333-53.333334h253.413334a52.986667 52.986667 0 0 1 37.713333 15.62l109.253333 109.253334a10.573333 10.573333 0 0 0 7.54 3.126666H842.666667a53.393333 53.393333 0 0 1 53.333333 53.333334v74.666666H173.773333a96.2 96.2 0 0 0-92.613333 70.74z m922-7.113333a52.933333 52.933333 0 0 0-42.386667-20.96H173.773333a53.453333 53.453333 0 0 0-51.453333 39.333333L11.773333 828.666667a53.333333 53.333333 0 0 0 51.453334 67.333333h787a53.453333 53.453333 0 0 0 51.453333-39.333333l110.546667-405.333334a52.953333 52.953333 0 0 0-9.073334-46.373333z"
                        p-id="22971"></path>
                </svg>
                <div class="name">文档</div>
                <div class="modify-date">2024年6月19日 12:06</div>
                <div class="type">系统文件夹</div>
                <div class="size"> 0&nbsp;B</div>
            </div>
            <div class="folder image" type="system-folder">
                <svg t="1718768286042" class="folder-icon" viewBox="0 0 1024 1024" version="1.1"
                    xmlns="http://www.w3.org/2000/svg" p-id="22970">
                    <path
                        d="M81.16 412.073333L0 709.653333V138.666667a53.393333 53.393333 0 0 1 53.333333-53.333334h253.413334a52.986667 52.986667 0 0 1 37.713333 15.62l109.253333 109.253334a10.573333 10.573333 0 0 0 7.54 3.126666H842.666667a53.393333 53.393333 0 0 1 53.333333 53.333334v74.666666H173.773333a96.2 96.2 0 0 0-92.613333 70.74z m922-7.113333a52.933333 52.933333 0 0 0-42.386667-20.96H173.773333a53.453333 53.453333 0 0 0-51.453333 39.333333L11.773333 828.666667a53.333333 53.333333 0 0 0 51.453334 67.333333h787a53.453333 53.453333 0 0 0 51.453333-39.333333l110.546667-405.333334a52.953333 52.953333 0 0 0-9.073334-46.373333z"
                        p-id="22971"></path>
                </svg>
                <div class="name" type="system-folder">图片</div>
                <div class="modify-date">2024年6月19日 12:06</div>
                <div class="type">系统文件夹</div>
                <div class="size"> 0&nbsp;B</div>
            </div>
            <div class="folder music" type="system-folder">
                <svg t="1718768286042" class="folder-icon" viewBox="0 0 1024 1024" version="1.1"
                    xmlns="http://www.w3.org/2000/svg" p-id="22970">
                    <path
                        d="M81.16 412.073333L0 709.653333V138.666667a53.393333 53.393333 0 0 1 53.333333-53.333334h253.413334a52.986667 52.986667 0 0 1 37.713333 15.62l109.253333 109.253334a10.573333 10.573333 0 0 0 7.54 3.126666H842.666667a53.393333 53.393333 0 0 1 53.333333 53.333334v74.666666H173.773333a96.2 96.2 0 0 0-92.613333 70.74z m922-7.113333a52.933333 52.933333 0 0 0-42.386667-20.96H173.773333a53.453333 53.453333 0 0 0-51.453333 39.333333L11.773333 828.666667a53.333333 53.333333 0 0 0 51.453334 67.333333h787a53.453333 53.453333 0 0 0 51.453333-39.333333l110.546667-405.333334a52.953333 52.953333 0 0 0-9.073334-46.373333z"
                        p-id="22971"></path>
                </svg>
                <div class="name">音乐</div>
                <div class="modify-date">2024年6月19日 12:06</div>
                <div class="type">系统文件夹</div>
                <div class="size"> 0&nbsp;B</div>
            </div>
            <div class="folder video" type="system-folder">
                <svg t="1718768286042" class="folder-icon" viewBox="0 0 1024 1024" version="1.1"
                    xmlns="http://www.w3.org/2000/svg" p-id="22970">
                    <path
                        d="M81.16 412.073333L0 709.653333V138.666667a53.393333 53.393333 0 0 1 53.333333-53.333334h253.413334a52.986667 52.986667 0 0 1 37.713333 15.62l109.253333 109.253334a10.573333 10.573333 0 0 0 7.54 3.126666H842.666667a53.393333 53.393333 0 0 1 53.333333 53.333334v74.666666H173.773333a96.2 96.2 0 0 0-92.613333 70.74z m922-7.113333a52.933333 52.933333 0 0 0-42.386667-20.96H173.773333a53.453333 53.453333 0 0 0-51.453333 39.333333L11.773333 828.666667a53.333333 53.333333 0 0 0 51.453334 67.333333h787a53.453333 53.453333 0 0 0 51.453333-39.333333l110.546667-405.333334a52.953333 52.953333 0 0 0-9.073334-46.373333z"
                        p-id="22971"></path>
                </svg>
                <div class="name">视频</div>
                <div class="modify-date">2024年6月19日 12:06</div>
                <div class="type">系统文件夹</div>
                <div class="size">0&nbsp;B</div>
            </div>
            <div class="folder other" type="system-folder">
                <svg t="1718768286042" class="folder-icon" viewBox="0 0 1024 1024" version="1.1"
                    xmlns="http://www.w3.org/2000/svg" p-id="22970">
                    <path
                        d="M81.16 412.073333L0 709.653333V138.666667a53.393333 53.393333 0 0 1 53.333333-53.333334h253.413334a52.986667 52.986667 0 0 1 37.713333 15.62l109.253333 109.253334a10.573333 10.573333 0 0 0 7.54 3.126666H842.666667a53.393333 53.393333 0 0 1 53.333333 53.333334v74.666666H173.773333a96.2 96.2 0 0 0-92.613333 70.74z m922-7.113333a52.933333 52.933333 0 0 0-42.386667-20.96H173.773333a53.453333 53.453333 0 0 0-51.453333 39.333333L11.773333 828.666667a53.333333 53.333333 0 0 0 51.453334 67.333333h787a53.453333 53.453333 0 0 0 51.453333-39.333333l110.546667-405.333334a52.953333 52.953333 0 0 0-9.073334-46.373333z"
                        p-id="22971"></path>
                </svg>
                <div class="name">其他</div>
                <div class="modify-date">2024年6月19日 12:06</div>
                <div class="type">系统文件夹</div>
                <div class="size">0&nbsp;B</div>
            </div>

            <%
                try {
                    Map<String, Integer> fileTypeMap = new HashMap<>();

                    /*
                        文档类型：doc, docx, pdf, txt, odt, rtf, wpd, epub, xlsx, xls, xlsm, pptx, ppt, pps...
                        图片类型：jpg, jpeg, png, gif, bmp, tiff, svg, webp...
                        视频类型: mp4, avi mov wmv mkv flv mpg mpeg...
                        音频类型：mp3 ogg wma aac flac m4a...
                        压缩文件类型：zip, rar, 7z, tar, gz, bz2, xz...
                     */

                    // 文档类型
                    fileTypeMap.put(".md", 1);    // Markdown
                    fileTypeMap.put(".doc", 1);   // Microsoft Word
                    fileTypeMap.put(".docx", 1);  // Microsoft Word
                    fileTypeMap.put(".pdf", 1);   // Portable Document Format
                    fileTypeMap.put(".txt", 1);   // Text File
                    fileTypeMap.put(".odt", 1);   // OpenDocument Text
                    fileTypeMap.put(".rtf", 1);   // Rich Text Format
                    fileTypeMap.put(".wpd", 1);   // WordPerfect Document
                    fileTypeMap.put(".epub", 1);  // Electronic Publication
                    fileTypeMap.put(".xlsx", 1);  // Microsoft Excel
                    fileTypeMap.put(".xls", 1);   // Microsoft Excel
                    fileTypeMap.put(".xlsm", 1);   // Microsoft Excel
                    fileTypeMap.put(".pptx", 1);  // Microsoft PowerPoint
                    fileTypeMap.put(".ppt", 1);   // Microsoft PowerPoint
                    fileTypeMap.put(".pps", 1);   // Microsoft PowerPoint
                    fileTypeMap.put(".json", 1);  // JSON
                    fileTypeMap.put(".xml", 1);   // XML
                    fileTypeMap.put(".csv", 1);   // Comma-Separated Values
                    fileTypeMap.put(".ini", 1);   // Initialization File
                    fileTypeMap.put(".yaml", 1);  // YAML
                    fileTypeMap.put(".log", 1);   // Log File

                    // 图片类型
                    fileTypeMap.put(".jpg", 2);   // Joint Photographic Experts Group
                    fileTypeMap.put(".jpeg", 2);   // Joint Photographic Experts Group
                    fileTypeMap.put(".png", 2);   // Portable Network Graphics
                    fileTypeMap.put(".gif", 2);   // Graphics Interchange Format
                    fileTypeMap.put(".bmp", 2);   // Windows Bitmap
                    fileTypeMap.put(".tiff", 2);   // Tagged Image File Format
                    fileTypeMap.put(".svg", 2);   // Scalable Vector Graphics
                    fileTypeMap.put(".webp", 2);   // WebP image format
                    fileTypeMap.put(".psd", 2);    // Photoshop Document
                    fileTypeMap.put(".ai", 2);     // Adobe Illustrator
                    fileTypeMap.put(".eps", 2);    // Encapsulated PostScript
                    fileTypeMap.put(".raw", 2);    // Raw image format
                    fileTypeMap.put(".cr2", 2);    // Canon RAW
                    fileTypeMap.put(".nef", 2);    // Nikon RAW
                    fileTypeMap.put(".orf", 2);    // Olympus RAW
                    fileTypeMap.put(".raf", 2);    // Fujifilm RAW
                    fileTypeMap.put(".dng", 2);    // Adobe DNG
                    fileTypeMap.put(".heic", 2);   // High Efficiency Image Format
                    fileTypeMap.put(".hdr", 2);    // High Dynamic Range
                    fileTypeMap.put(".xcf", 2);    // GIMP image
                    fileTypeMap.put(".pdn", 2);    // Paint.NET image
                    fileTypeMap.put(".kra", 2);    // Krita image
                    fileTypeMap.put(".xbm", 2);    // X Bitmap image
                    fileTypeMap.put(".jp2", 2);    // JPEG 2000

                    // 视频类型
                    fileTypeMap.put(".mp4", 3);   // MPEG-4 Part 14 Video
                    fileTypeMap.put(".avi", 3);   // Audio Video Interleave
                    fileTypeMap.put(".mov", 3);   // Apple QuickTime Movie
                    fileTypeMap.put(".wmv", 3);   // Windows Media Video
                    fileTypeMap.put(".mkv", 3);   // Matroska Video
                    fileTypeMap.put(".flv", 3);    // Flash Video
                    fileTypeMap.put(".mpg", 3);    // MPEG Video
                    fileTypeMap.put(".mpeg", 3);   // MPEG Video
                    fileTypeMap.put(".3gp", 3);    // 3GPP multimedia container format
                    fileTypeMap.put(".3g2", 3);    // 3GPP2 multimedia container format
                    fileTypeMap.put(".asf", 3);    // Advanced Systems Format
                    fileTypeMap.put(".divx", 3);   // DivX Media Format
                    fileTypeMap.put(".f4v", 3);    // Flash Video
                    fileTypeMap.put(".m2ts", 3);   // MPEG-2 Transport Stream
                    fileTypeMap.put(".m4v", 3);    // MPEG-4 Video
                    fileTypeMap.put(".mk3d", 3);   // MKV 3D video
                    fileTypeMap.put(".mod", 3);    // JVC MOD file format
                    fileTypeMap.put(".mts", 3);    // AVCHD video
                    fileTypeMap.put(".nut", 3);    // NUT multimedia container format
                    fileTypeMap.put(".ogv", 3);    // Ogg Vorbis Video
                    fileTypeMap.put(".rm", 3);     // RealMedia
                    fileTypeMap.put(".rmvb", 3);   // RealMedia Variable Bitrate
                    fileTypeMap.put(".ts", 3);     // MPEG Transport Stream
                    fileTypeMap.put(".vob", 3);    // DVD Video Object
                    fileTypeMap.put(".webm", 3);   // WebM video format
                    fileTypeMap.put(".xvid", 3);   // Xvid codec

                    // 音乐类型
                    fileTypeMap.put(".mp3", 4);   // MPEG-1 Audio Layer 3
                    fileTypeMap.put(".wav", 4);   // Waveform Audio File Format
                    fileTypeMap.put(".aac", 4);    // Advanced Audio Coding
                    fileTypeMap.put(".ogg", 4);    // Ogg Vorbis audio codec
                    fileTypeMap.put(".flac", 4);   // Free Lossless Audio Codec
                    fileTypeMap.put(".m4a", 4);    // MPEG-4 audio
                    fileTypeMap.put(".aiff", 4);  // Audio Interchange File Format
                    fileTypeMap.put(".alac", 4);  // Apple Lossless Audio Codec
                    fileTypeMap.put(".amr", 4);   // Adaptive Multi-Rate Audio
                    fileTypeMap.put(".ape", 4);   // Monkey's Audio
                    fileTypeMap.put(".au", 4);    // Sun Microsystems audio file format
                    fileTypeMap.put(".dff", 4);   // DSDIFF (Digital Stream)
                    fileTypeMap.put(".dsf", 4);   // DSF (DSD Stream File)
                    fileTypeMap.put(".iff", 4);   // Interchange File Format
                    fileTypeMap.put(".kar", 4);   // MIDI Karaoke file
                    fileTypeMap.put(".mka", 4);   // Matroska Audio
                    fileTypeMap.put(".opus", 4);  // Opus audio codec
                    fileTypeMap.put(".qcp", 4);   // Qualcomm PureVoice
                    fileTypeMap.put(".spx", 4);   // Speex audio codec
                    fileTypeMap.put(".tta", 4);   // TTA (True Audio)
                    fileTypeMap.put(".voc", 4);   // Creative Voice
                    fileTypeMap.put(".vqf", 4);   // TwinVQ (Variable-Rate Multi-Channel)
                    fileTypeMap.put(".wma", 4);   // Windows Media Audio
                    fileTypeMap.put(".wv", 4);    // WavPack

                    //压缩文件类型
                    fileTypeMap.put(".zip", 5);   // ZIP archive format
                    fileTypeMap.put(".rar", 5);   // RAR archive format
                    fileTypeMap.put(".7z", 5);    // 7-Zip compressed file format
                    fileTypeMap.put(".tar", 5);   // Tape Archive
                    fileTypeMap.put(".gz", 5);    // GZip compressed file format
                    fileTypeMap.put(".bz2", 5);   // BZip2 compressed file format
                    fileTypeMap.put(".xz", 5);    // XZ Utils compressed file format
                    fileTypeMap.put(".z", 5);     // Z-standard compressed file format
                    fileTypeMap.put(".lzma", 5);  // LZMA compressed file format
                    fileTypeMap.put(".cab", 5);   // Microsoft Cabinet file format
                    fileTypeMap.put(".arj", 5);   // ARJ archive format
                    fileTypeMap.put(".lzh", 5);   // LZMA compressed file format
                    fileTypeMap.put(".iso", 5);   // ISO 9660 CD-ROM image file format
                    fileTypeMap.put(".dmg", 5);   // Apple Disk Image
                    fileTypeMap.put(".pkg", 5);    // Mac OS X Installer Package
                    fileTypeMap.put(".rpm", 5);    // Red Hat Package Manager
                    fileTypeMap.put(".deb", 5);    // Debian package format
                    fileTypeMap.put(".zst", 5);   // Zstandard compressed file format
                    fileTypeMap.put(".ace", 5);    // ACE archive
                    fileTypeMap.put(".afa", 5);    // AFA (Advanced Forensic Analysis)
                    fileTypeMap.put(".alz", 5);    // ALZip archive format
                    fileTypeMap.put(".arc", 5);    // Archive file format
                    fileTypeMap.put(".b1", 5);     // B1 archive format
                    fileTypeMap.put(".b6z", 5);    // B6ZIP archive format
                    fileTypeMap.put(".cab", 5);    // Microsoft Cabinet file format
                    fileTypeMap.put(".cfs", 5);    // CFS (Compressed File System)
                    fileTypeMap.put(".cpio", 5);   // CPIO archive format
                    fileTypeMap.put(".dar", 5);    // Dar archive format
                    fileTypeMap.put(".dd", 5);     // Data Domain
                    fileTypeMap.put(".dgc", 5);    // DGC archive format
                    fileTypeMap.put(".dmg", 5);    // Apple Disk Image
                    fileTypeMap.put(".ha", 5);     // HA archive format
                    fileTypeMap.put(".hki", 5);    // HK Installer
                    fileTypeMap.put(".ice", 5);    // ICE archive format
                    fileTypeMap.put(".jar", 5);    // Java Archive
                    fileTypeMap.put(".lha", 5);    // LHA archive format
                    fileTypeMap.put(".lzh", 5);    // LZMA compressed file format
                    fileTypeMap.put(".mar", 5);    // MAR archive format
                    fileTypeMap.put(".pea", 5);    // PEA archive format
                    fileTypeMap.put(".pim", 5);    // PIM archive format
                    fileTypeMap.put(".qda", 5);    // QDA archive format
                    fileTypeMap.put(".war", 5);    // WAR archive format

                    //C或C++源文件类型
                    fileTypeMap.put(".c", 6);     // C source file
                    fileTypeMap.put(".cpp", 6);   // C++ source file
                    fileTypeMap.put(".h", 6);     // C/C++ header file
                    fileTypeMap.put(".hpp", 6);   // C++ header file

                    //Java源文件类型
                    fileTypeMap.put(".java", 7);  // Java source file
                    fileTypeMap.put(".class", 7); // Java class file

                    //Python源文件类型
                    fileTypeMap.put(".py", 8);    // Python source file
                    fileTypeMap.put(".pyc", 8);   // Python byte-compiled file
                    fileTypeMap.put(".pyo", 8);   // Python optimized file

                    //网页文件类型
                    fileTypeMap.put(".html", 9);  // HTML document
                    fileTypeMap.put(".htm", 9);   // HTML document
                    fileTypeMap.put(".xhtml", 9); // XHTML document
                    fileTypeMap.put(".css", 9);   // Cascading Style Sheets (CSS)
                    fileTypeMap.put(".jsp", 9);   // Java Server Pages (JSP)
                    fileTypeMap.put(".asp", 9);   // Active Server Pages (ASP)
                    fileTypeMap.put(".aspx", 9);  // Active Server Pages (ASP.NET)
                    fileTypeMap.put(".php", 9);   // Hypertext Preprocessor (PHP)

                    //javaScript文件类型
                    fileTypeMap.put(".js", 10);   // JavaScript source file
                    fileTypeMap.put(".ts", 10);   // TypeScript source file

                    //C#源文件类型
                    fileTypeMap.put(".cs", 11);   // C# source file
                    fileTypeMap.put(".csproj", 11); // C# project file

                    //sql文件类型
                    fileTypeMap.put(".sql", 12);  // SQL script file

                    //其他源代码文件类型
                    fileTypeMap.put(".go", 13);  // Go source file
                    fileTypeMap.put(".lua", 13); // Lua source file
                    fileTypeMap.put(".pl", 13);  // Perl source file
                    fileTypeMap.put(".rb", 13);  // Ruby source file
                    fileTypeMap.put(".swift", 13); // Swift source file
                    fileTypeMap.put(".vb", 13);  // Visual Basic source file
                    fileTypeMap.put(".vba", 13); // Visual Basic for Applications (VBA) source file
                    fileTypeMap.put(".f", 13);  // Fortran source file
                    fileTypeMap.put(".m", 13);  // Matlab source file
                    fileTypeMap.put(".kt", 13);  // Kotlin source file
                    fileTypeMap.put(".rs", 13);  // Rust source file
                    fileTypeMap.put(".dpr", 13);  // Delphi source file

                    //可执行程序或脚本或软件
                    fileTypeMap.put(".exe", 14);  // Windows executable file
                    fileTypeMap.put(".bat", 14);  // Windows batch file
                    fileTypeMap.put(".sh", 14);   // Unix shell script
                    fileTypeMap.put(".apk", 14);  // Android application package
                    fileTypeMap.put(".ipa", 14);  // iOS application package
                    fileTypeMap.put(".app", 14);  // macOS application bundle
                    fileTypeMap.put(".vbs", 14);  // Windows script file

                    StringBuilder sb = new StringBuilder();

                    // 读取documentSvg
                    String documentSvg = "";
                    String documentSvgPath = application.getRealPath("/include/documentSvg.html");
                    try (BufferedReader br = new BufferedReader(new FileReader(documentSvgPath))) {
                        String line;
                        while ((line = br.readLine()) != null) {
                            sb.append(line);
                            sb.append("\n");
                        }
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                    documentSvg = sb.toString();

                    // 读取imageSvg
                    String imageSvg = "";
                    String imageSvgPath = application.getRealPath("/include/imageSvg.html");
                    sb.setLength(0);
                    try (BufferedReader br = new BufferedReader(new FileReader(imageSvgPath))) {
                        String line;
                        while ((line = br.readLine()) != null) {
                            sb.append(line);
                            sb.append("\n");
                        }
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                    imageSvg = sb.toString();

                    String musicSvg = "";
                    String musicSvgPath = application.getRealPath("/include/musicSvg.html");
                    sb.setLength(0);
                    try (BufferedReader br = new BufferedReader(new FileReader(musicSvgPath))) {
                        String line;
                        while ((line = br.readLine()) != null) {
                            sb.append(line);
                            sb.append("\n");
                        }
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                    musicSvg = sb.toString();

                    String videoSvg = "";
                    String videoSvgPath = application.getRealPath("/include/videoSvg.html");
                    sb.setLength(0);
                    try (BufferedReader br = new BufferedReader(new FileReader(videoSvgPath))) {
                        String line;
                        while ((line = br.readLine()) != null) {
                            sb.append(line);
                            sb.append("\n");
                        }
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                    videoSvg = sb.toString();

                    String zipSvg = "";
                    String zipSvgPath = application.getRealPath("/include/zipSvg.html");
                    sb.setLength(0);
                    try (BufferedReader br = new BufferedReader(new FileReader(zipSvgPath))) {
                        String line;
                        while ((line = br.readLine()) != null) {
                            sb.append(line);
                            sb.append("\n");
                        }
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                    zipSvg = sb.toString();

                    String cSvg = "";
                    String cSvgPath = application.getRealPath("/include/cSvg.html");
                    sb.setLength(0);
                    try (BufferedReader br = new BufferedReader(new FileReader(cSvgPath))) {
                        String line;
                        while ((line = br.readLine()) != null) {
                            sb.append(line);
                            sb.append("\n");
                        }
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                    cSvg = sb.toString();

                    String javaSvg = "";
                    String javaSvgPath = application.getRealPath("/include/javaSvg.html");
                    sb.setLength(0);
                    try (BufferedReader br = new BufferedReader(new FileReader(javaSvgPath))) {
                        String line;
                        while ((line = br.readLine()) != null) {
                            sb.append(line);
                            sb.append("\n");
                        }
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                    javaSvg = sb.toString();

                    String pythonSvg = "";
                    String pythonSvgPath = application.getRealPath("/include/pythonSvg.html");
                    sb.setLength(0);
                    try (BufferedReader br = new BufferedReader(new FileReader(pythonSvgPath))) {
                        String line;
                        while ((line = br.readLine()) != null) {
                            sb.append(line);
                            sb.append("\n");
                        }
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                    pythonSvg = sb.toString();

                    String htmlSvg = "";
                    String htmlSvgPath = application.getRealPath("/include/htmlSvg.html");
                    sb.setLength(0);
                    try (BufferedReader br = new BufferedReader(new FileReader(htmlSvgPath))) {
                        String line;
                        while ((line = br.readLine()) != null) {
                            sb.append(line);
                            sb.append("\n");
                        }
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                    htmlSvg = sb.toString();

                    String jsSvg = "";
                    String jsSvgPath = application.getRealPath("/include/jsSvg.html");
                    sb.setLength(0);
                    try (BufferedReader br = new BufferedReader(new FileReader(jsSvgPath))) {
                        String line;
                        while ((line = br.readLine()) != null) {
                            sb.append(line);
                            sb.append("\n");
                        }
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                    jsSvg = sb.toString();

                    String cSharpSvg = "";
                    String cSharpSvgPath = application.getRealPath("/include/C#Svg.html");
                    sb.setLength(0);
                    try (BufferedReader br = new BufferedReader(new FileReader(cSharpSvgPath))) {
                        String line;
                        while ((line = br.readLine()) != null) {
                            sb.append(line);
                            sb.append("\n");
                        }
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                    cSharpSvg = sb.toString();

                    String sqlSvg = "";
                    String sqlSvgPath = application.getRealPath("/include/sqlSvg.html");
                    sb.setLength(0);
                    try (BufferedReader br = new BufferedReader(new FileReader(sqlSvgPath))) {
                        String line;
                        while ((line = br.readLine()) != null) {
                            sb.append(line);
                            sb.append("\n");
                        }
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                    sqlSvg = sb.toString();

                    String srcSvg = "";
                    String srcSvgPath = application.getRealPath("/include/srcSvg.html");
                    sb.setLength(0);
                    try (BufferedReader br = new BufferedReader(new FileReader(srcSvgPath))) {
                        String line;
                        while ((line = br.readLine()) != null) {
                            sb.append(line);
                            sb.append("\n");
                        }
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                    srcSvg = sb.toString();

                    String exeSvg = "";
                    String exeSvgPath = application.getRealPath("/include/exeSvg.html");
                    sb.setLength(0);
                    try (BufferedReader br = new BufferedReader(new FileReader(exeSvgPath))) {
                        String line;
                        while ((line = br.readLine()) != null) {
                            sb.append(line);
                            sb.append("\n");
                        }
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                    exeSvg = sb.toString();

                    String otherSvg = "";
                    String otherSvgPath = application.getRealPath("/include/otherSvg.html");
                    sb.setLength(0);
                    try (BufferedReader br = new BufferedReader(new FileReader(otherSvgPath))) {
                        String line;
                        while ((line = br.readLine()) != null) {
                            sb.append(line);
                            sb.append("\n");
                        }
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                    otherSvg = sb.toString();

                    String downloadDiv = "";
                    String downloadDivPath = application.getRealPath("/include/downloadDiv.html");
                    sb.setLength(0);
                    try (BufferedReader br = new BufferedReader(new FileReader(downloadDivPath))) {
                        String line;
                        while ((line = br.readLine()) != null) {
                            sb.append(line);
                            sb.append("\n");
                        }
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                    downloadDiv = sb.toString();

                    String deleteDiv = "";
                    String deleteDivPath = application.getRealPath("/include/deleteDiv.html");
                    sb.setLength(0);
                    try (BufferedReader br = new BufferedReader(new FileReader(deleteDivPath))) {
                        String line;
                        while ((line = br.readLine()) != null) {
                            sb.append(line);
                            sb.append("\n");
                        }
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                    deleteDiv = sb.toString();

                    String sql = "SELECT * FROM files where user_id = ?";
                    pstmt = conn.prepareStatement(sql);
                    pstmt.setLong(1, userID);
                    pstmt.execute();
                    ResultSet rs = pstmt.getResultSet();
                    while(rs.next()) {
                        String fileName = rs.getString("file_name");

                        long bytes = rs.getLong("file_size");
                        String fileSize = "";
                        if(bytes < 1024)
                            fileSize = bytes + " B";
                        else if(bytes < 1024 * 1024)
                            fileSize = (bytes / 1024) + " KB";
                        else if(bytes < 1024 * 1024 * 1024)
                            fileSize = (bytes / (1024 * 1024)) + " MB";
                        else
                            fileSize = (bytes / (1024 * 1024 * 1024)) + " GB";

                        String fileType = rs.getString("file_type");
                        java.sql.Timestamp modifyTime = rs.getTimestamp("modify_time");

                        sb.setLength(0);
                        sb.append(String.format("<div class=\"file\" file-name=\"%s\" file-id=\"%s\">", fileName, rs.getLong("file_id")));

                        //添加svg
                        if(fileTypeMap.get(fileType) == null){
                            sb.append(otherSvg);
                        } else {
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

                                case 5:{
                                    sb.append(zipSvg);
                                    break;
                                }

                                case 6:{
                                    sb.append(cSvg);
                                    break;
                                }

                                case 7:{
                                    sb.append(javaSvg);
                                    break;
                                }

                                case 8:{
                                    sb.append(pythonSvg);
                                    break;
                                }

                                case 9:{
                                    sb.append(htmlSvg);
                                    break;
                                }

                                case 10:{
                                    sb.append(jsSvg);
                                    break;
                                }

                                case 11:{
                                    sb.append(cSharpSvg);
                                    break;
                                }

                                case 12:{
                                    sb.append(sqlSvg);
                                    break;
                                }

                                case 13:{
                                    sb.append(srcSvg);
                                    break;
                                }

                                case 14:{
                                    sb.append(exeSvg);
                                    break;
                                }

                                default:{
                                    sb.append(otherSvg);
                                    break;
                                }
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

                        //添加下载按钮
                        sb.append(downloadDiv);

                        //添加删除按钮
                        sb.append(deleteDiv);

                        sb.append("</div>");

                        out.println(sb.toString());
                        out.flush();
                    }
                } catch (SQLException e) {
                    e.printStackTrace();
                }
            %>

            <div class="create-dir">
                <svg t="1718779867985" class="create-icon" viewBox="0 0 1024 1024" version="1.1"
                    xmlns="http://www.w3.org/2000/svg" p-id="10695">
                    <path
                        d="M871.872 958.976H152.064c-48 0-87.104-39.04-87.104-87.104V152.064c0-48 39.04-87.104 87.104-87.104h719.808c48.064 0 87.104 39.04 87.104 87.104v719.808c0 48.064-39.04 87.104-87.104 87.104zM152.064 113.024a39.168 39.168 0 0 0-39.104 39.104v719.808c0 21.568 17.536 39.104 39.104 39.104h719.808a39.168 39.168 0 0 0 39.104-39.104V152.064a39.168 39.168 0 0 0-39.104-39.104H152.064z"
                        p-id="10696"></path>
                    <path
                        d="M809.984 512a24 24 0 0 1-24 24H238.016a24 24 0 0 1 0-48h548.032c13.184 0 23.936 10.752 23.936 24z"
                        p-id="10697"></path>
                    <path d="M512 809.984a24 24 0 0 1-24-24V238.016a24 24 0 0 1 48 0v548.032a24 24 0 0 1-24 23.936z"
                        p-id="10698">
                    </path>
                </svg>
            </div>
        </div>
    </div>

    <ul id="context-menu">
        <li>
            <div class="download-selected" onclick="downloadSelected()">
                <svg t="1720235394453" class="download-icon" viewBox="0 0 1024 1024" version="1.1"
                    xmlns="http://www.w3.org/2000/svg" p-id="15013">
                    <path
                        d="M734.2 500.3L528.1 758.7c-8.1 10.1-23.5 10.1-31.6 0L290.4 500.3c-10.5-13.2-1.1-32.8 15.8-32.8h121.4V182.4c0-13.5 11-24.5 24.5-24.5h123.8c13.5 0 24.5 11 24.5 24.5v285.1h118c16.9 0.1 26.3 19.6 15.8 32.8zM807 866H217c-13.8 0-25-11.2-25-25s11.2-25 25-25h590c13.8 0 25 11.2 25 25s-11.2 25-25 25z"
                        p-id="15014"></path>
                </svg>
                <span>下载</span>
            </div>
        </li>
        <li>
            <div class="delete-selected" onclick="deleteSelected()">
                <svg t="1718968929463" class="delete-icon" viewBox="0 0 1024 1024" version="1.1"
                    xmlns="http://www.w3.org/2000/svg" p-id="35984">
                    <path
                        d="M938.666667 149.333333h-209.066667V70.4C729.6 46.933333 706.133333 21.333333 682.666667 21.333333H341.333333c-23.466667 0-38.4 25.6-38.4 49.066667V149.333333H85.333333c-12.8 0-21.333333 8.533333-21.333333 21.333334s8.533333 21.333333 21.333333 21.333333h853.333334c12.8 0 21.333333-8.533333 21.333333-21.333333s-8.533333-21.333333-21.333333-21.333334zM153.6 945.066667C153.6 981.333333 177.066667 1002.666667 213.333333 1002.666667h597.333334c36.266667 0 68.266667-21.333333 68.266666-57.6V234.666667h-725.333333v710.4z m512-512c0-12.8 8.533333-21.333333 21.333333-21.333334s21.333333 8.533333 21.333334 21.333334v384c0 12.8-8.533333 21.333333-21.333334 21.333333s-21.333333-8.533333-21.333333-21.333333v-384z m-170.666667 0c0-12.8 8.533333-21.333333 21.333334-21.333334s21.333333 8.533333 21.333333 21.333334v384c0 12.8-8.533333 21.333333-21.333333 21.333333s-21.333333-8.533333-21.333334-21.333333v-384z m-170.666666 0c0-12.8 8.533333-21.333333 21.333333-21.333334s21.333333 8.533333 21.333333 21.333334v384c0 12.8-8.533333 21.333333-21.333333 21.333333s-21.333333-8.533333-21.333333-21.333333v-384z"
                        p-id="35985"></path>
                </svg>
                <span>删除</span>
            </div>
        </li>
    </ul>

    <div class="upload">
        <form method="post" action="upload?user_id=<%= userID.toString() %>" enctype="multipart/form-data" id="uploadForm">
            <div id="select">
                <div class="upload-info">
                    <svg t="1718873544506" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
                        p-id="10646" width="1vw" height="1vw">
                        <path
                            d="M322.43 349a31.9 31.9 0 0 0 22.69-9.44L479.5 204.42l0.87 530.71a32 32 0 0 0 32 31.95h0.05A32 32 0 0 0 544.38 735l-0.87-531.1 136.9 135.8a32 32 0 0 0 45.07-45.44l-191.56-190-0.35-0.33c-0.25-0.24-0.5-0.49-0.76-0.72l-0.07-0.07-0.5-0.43-0.61-0.52-0.13-0.11-0.58-0.45-0.51-0.39-0.18-0.14-0.62-0.43-0.47-0.32-0.23-0.16-0.62-0.38-0.47-0.29-0.27-0.16L527 99l-0.51-0.28-0.28-0.15-0.56-0.28L525 98l-0.27-0.13-0.52-0.22-0.66-0.28-0.25-0.11-0.48-0.18-0.76-0.28-0.23-0.08-0.44-0.14-0.84-0.27-0.2-0.06-0.42-0.11-0.9-0.24h-0.18l-0.43-0.09-0.92-0.2h-0.16l-0.47-0.08-0.9-0.15h-0.15l-0.57-0.07-0.82-0.1h-0.14l-0.73-0.05H508.87l-0.69 0.05h-0.07l-0.87 0.11-0.59 0.07h-0.08l-1 0.17-0.48 0.08h-0.1l-1 0.21-0.44 0.1h-0.12l-0.92 0.25-0.45 0.12h-0.14l-0.84 0.27-0.49 0.16-0.17 0.06-0.73 0.28-0.55 0.21-0.2 0.09-0.62 0.27-0.62 0.27-0.22 0.11-0.51 0.25-0.68 0.34-0.23 0.13-0.42 0.24-0.73 0.41-0.21 0.13-0.35 0.22h-0.06l-0.72 0.45-0.19 0.13-0.33 0.23-0.08 0.06-0.72 0.5-0.14 0.11-0.36 0.28-0.73 0.57-0.09 0.07-0.5 0.43-0.65 0.56q-0.57 0.52-1.12 1.07l-188.95 190A32 32 0 0 0 322.43 349z"
                            p-id="10647"></path>
                        <path
                            d="M928.75 605a32 32 0 0 0-32 32v224h-767.5V637a32 32 0 0 0-64 0v256a32 32 0 0 0 32 32h831.5a32 32 0 0 0 32-32V637a32 32 0 0 0-32-32z"
                            p-id="10648"></path>
                    </svg>
                    <span>上传文件至云盘，请选择文件或文件夹</span>
                </div>
                <input type="file" id="upload-input" name="file[]" multiple="multiple" />
                <input type="text" id="ignore-files" name="ignore-files" value="" style="display: none;" />
            </div>

            <div id="submit" style="display: none;">
                <div class="submit-info">
                    <svg t="1718873220138" class="submit-icon" viewBox="0 0 1024 1024" version="1.1"
                        xmlns="http://www.w3.org/2000/svg" p-id="9621" width="1vw" height="1vw">
                        <path
                            d="M414.273133 1024a19.76097 19.76097 0 0 1-19.741211-20.488101l8.762126-237.513979a19.749115 19.749115 0 0 1 4.202738-11.471084l503.439415-641.372015-822.359463 475.187017 249.409882 129.274208c9.688823 5.021748 13.47267 16.947289 8.450922 26.635125-5.023724 9.687835-16.946301 13.471682-26.635125 8.449934L38.362218 606.82539a19.758006 19.758006 0 1 1-0.793324-34.650361l932.344942-538.738859a19.759982 19.759982 0 0 1 29.505118 19.454706l-109.172395 912.697585a19.758994 19.758994 0 0 1-28.848132 15.124522L609.347756 847.568976l-181.518965 171.052626a19.754055 19.754055 0 0 1-13.555658 5.378398z m28.276109-250.126145l-6.748685 182.935685 156.731307-147.692555a19.76097 19.76097 0 0 1 22.780144-3.091294l239.112482 126.310359L950.834551 126.32913 442.549242 773.873855z"
                            p-id="9622"></path>
                    </svg>
                    <span>发送到云盘</span>
                </div>
                <input type="submit" id="files-submit">
            </div>
        </form>
   </div>

    <div id="files-list" style="display: none;">
        <div class="title">已选择以下文件：</div>
        <div class="files-content"></div>
        <div id="clear">
            <svg t="1718886096515" class="clear-icon" viewBox="0 0 1024 1024" version="1.1"
                xmlns="http://www.w3.org/2000/svg" p-id="13515">
                <path
                    d="M197.7088 478.72l39.68-39.168a19.2 19.2 0 1 1 26.9824 27.2896l-73.344 72.448a19.2 19.2 0 0 1-26.9824 0l-75.136-74.24A19.2 19.2 0 1 1 115.8912 437.76l43.0592 42.5472C175.616 300.6464 326.7328 160 510.72 160c195.1232 0 353.28 158.1568 353.28 353.28 0 195.1232-158.1568 353.28-353.28 353.28a352.0512 352.0512 0 0 1-242.0224-95.9232 19.2 19.2 0 1 1 26.2912-27.9808 313.6768 313.6768 0 0 0 215.7312 85.504c173.9008 0 314.88-140.9792 314.88-314.88 0-173.9008-140.9792-314.88-314.88-314.88-162.2272 0-295.808 122.6752-313.0112 280.32z"
                    p-id="13516"></path>
            </svg>
            <span>重新上传</span>
        </div>
    </div>

</body>

</html>