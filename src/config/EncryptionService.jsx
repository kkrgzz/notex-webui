import CryptoJS from 'crypto-js';

class EncryptionService {
  constructor() {
    this.saltSize = 128 / 8; // 16 bytes
    this.ivSize = 128 / 8; // 16 bytes
    this.keySize = 256 / 32; // 32 bytes
    this.iterations = 10000; // Increase the number of iterations for PBKDF2
  }

  // Function to generate a random salt
  generateSalt() {
    return CryptoJS.lib.WordArray.random(this.saltSize).toString(CryptoJS.enc.Hex);
  }

  // Function to generate a random IV
  generateIV() {
    return CryptoJS.lib.WordArray.random(this.ivSize).toString(CryptoJS.enc.Hex);
  }

  // Function to derive a key from the password and salt
  deriveKey(password, salt) {
    return CryptoJS.PBKDF2(password, CryptoJS.enc.Hex.parse(salt), {
      keySize: this.keySize,
      iterations: this.iterations,
    }).toString(CryptoJS.enc.Hex);
  }

  // Function to encrypt a message
  encrypt(message, password) {
    const salt = this.generateSalt();
    const iv = this.generateIV();
    const key = this.deriveKey(password, salt);
    const encrypted = CryptoJS.AES.encrypt(message, CryptoJS.enc.Hex.parse(key), {
      iv: CryptoJS.enc.Hex.parse(iv),
    }).toString();
    return JSON.stringify({ salt, iv, encrypted });
  }

  encryptWithSaltAndIV(message, password, salt, iv) {
    const key = this.deriveKey(password, salt);
    const encrypted = CryptoJS.AES.encrypt(message, CryptoJS.enc.Hex.parse(key), {
        iv: CryptoJS.enc.Hex.parse(iv),
    }).toString();
    return JSON.stringify({salt, iv, encrypted});
  }

  // Function to decrypt a message
  decrypt(encryptedMessage, password) {
    try {
      const { salt, iv, encrypted } = JSON.parse(encryptedMessage);
      const key = this.deriveKey(password, salt);
      const decrypted = CryptoJS.AES.decrypt(encrypted, CryptoJS.enc.Hex.parse(key), {
        iv: CryptoJS.enc.Hex.parse(iv),
      }).toString(CryptoJS.enc.Utf8);
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Invalid password or corrupted message');
    }
  }
}

export default EncryptionService;
