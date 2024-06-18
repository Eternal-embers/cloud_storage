package secure;

import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Arrays;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;

public interface Secure {
    /**
     * 生成salt,使用VARBINARY(43)存储,每三个字节转换为4个字节Base64字符
     *
     * @return 16字节的字节数组
     */
    default byte[] generateSalt() {
        SecureRandom random = new SecureRandom();
        byte[] salt = new byte[16];
        random.nextBytes(salt);
        return salt;
    }

    /**
     * 使用PBKDF2散列密码
     *
     * @param password   需要被散列的原始密码字符串
     * @param salt       密码散列过程的盐值salt
     * @param iterations 散列算法迭代的次数
     * @param keyLength  生成密钥的位数长度
     * @return 32字节序列
     */

    default byte[] hashPassword(String password, byte[] salt, int iterations, int keyLength) {
        try {
            PBEKeySpec spec = new PBEKeySpec(password.toCharArray(), salt, iterations, keyLength);
            Arrays.fill(password.toCharArray(), '0'); // 清除密码字符串，避免内存泄露
            SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
            byte[] hash = factory.generateSecret(spec).getEncoded();
            return hash;
        } catch (Exception e) {
            throw new RuntimeException("Error while hashing password", e);
        }
    }

    default boolean verifyPassword(String inputPassword, byte[] storedHashBytes, byte[] storedSaltBytes) {
        try {
            byte[] inputHash = hashPassword(inputPassword, storedSaltBytes, 10000, 256);
            return MessageDigest.isEqual(inputHash, storedHashBytes);
        } catch (Exception e) {
            throw new RuntimeException("Error while verifying password", e);
        }
    }
}