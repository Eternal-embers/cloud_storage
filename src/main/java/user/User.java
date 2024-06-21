package user;

import java.sql.Date;

public class User {
    private long userID;//用户ID
    private String userName;//用户名
    private String identifier;//邮箱/第三方唯一标识
    private String salt;//加密算法中的salt的Base64编码
    private String password_hash;//密码哈希的Base64编码
    private double storageQuota;//存储配额
    private double usedStorage;//已用存储
    private String userStatus;//用户状态
    private String sourceFrom;//用户来源
    private boolean bindStatus;//绑定状态
    private Date createTime;//绑定时间
    private String avatar;//用户头像

    public User(){
        //默认构造函数
    }

    //普通登录用户构造函数
    public User(String identifier, String password_hash){
        this.identifier = identifier;
        this.password_hash = password_hash;
    }

    //获取用户ID
    public long getUserID(){
        return userID;
    }

    //获取用户名
    public String getUserName(){
        return userName;
    }

    //获取邮箱/第三方唯一标识
    public String getIdentifier(){
        return identifier;
    }

    //获取加密算法中的salt的Base64编码
    public String getSalt(){
        return salt;
    }

    //获取密码哈希的Base64编码
    public String getPassword_hash(){
        return password_hash;
    }

    //获取存储配额
    public double getStorageQuota(){
        return storageQuota;
    }

    //获取已用存储
    public double getUsedStorage(){
        return usedStorage;
    }

    //获取用户状态
    public String getUserStatus(){
        return userStatus;
    }

    //获取用户来源
    public String getSourceFrom(){
        return sourceFrom;
    }

    //获取绑定状态
    public boolean getBindStatus(){
        return bindStatus;
    }

    //获取绑定时间
    public Date getCreateTime() {
        return createTime;
    }

    //获取用户头像
    public String getAvatar(){
        return avatar;
    }

    //设置用户ID
    public void setUserID(long userID){
        this.userID = userID;
    }

    //设置用户名
    public void setUserName(String userName){
        this.userName = userName;
    }

    //设置邮箱/第三方唯一标识
    public void setIdentifier(String identifier){
        this.identifier = identifier;
    }

    //设置加密算法中的salt的Base64编码
    public void setSalt(String salt){
        this.salt = salt;
    }

    //设置密码哈希的Base64编码
    public void setPassword_hash(String password_hash){
        this.password_hash = password_hash;
    }

    //设置存储配额
    public void setStorageQuota(double storageQuota){
        this.storageQuota = storageQuota;
    }

    //设置已用存储
    public void setUsedStorage(double usedStorage){
        this.usedStorage = usedStorage;
    }

    //设置用户状态
    public void setUserStatus(String userStatus){
        this.userStatus = userStatus;
    }

    //设置用户来源
    public void setSourceFrom(String sourceFrom){
        this.sourceFrom = sourceFrom;
    }

    //设置绑定状态
    public void setBindStatus(boolean bindStatus){
        this.bindStatus = bindStatus;
    }

    //设置绑定时间
    public void setCreateTime(Date createTime) {
        this.createTime = createTime;
    }

    //设置用户头像
    public void setAvatar(String avatar){
        this.avatar = avatar;
    }

}
