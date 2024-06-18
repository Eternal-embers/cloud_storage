package database;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

public class DatabaseConfig {
    private Properties properties;

    public DatabaseConfig() throws IOException {
        properties = new Properties();
        // 使用类加载器获取资源输入流
        InputStream inputStream = getClass().getClassLoader().getResourceAsStream("config/database.properties");
        if (inputStream != null) {
            try {
                properties.load(inputStream);
            } finally {
                inputStream.close();
            }
        } else {
            throw new IOException("Unable to find database.properties");
        }
    }

    public String getDatabaseUrl() {
        return properties.getProperty("database.url");
    }

    public String getDatabaseUser() {
        return properties.getProperty("database.user");
    }

    public String getDatabasePassword() {
        return properties.getProperty("database.password");
    }
}
