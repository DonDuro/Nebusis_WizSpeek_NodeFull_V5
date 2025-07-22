import { nanoid } from "nanoid";

export interface EncryptedFile {
  encryptedData: ArrayBuffer;
  key: CryptoKey;
  iv: Uint8Array;
  metadata: FileMetadata;
}

export interface FileMetadata {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  checksum: string;
}

export interface SecureFileShare {
  fileId: string;
  encryptedKey: string;
  metadata: FileMetadata;
  permissions: FilePermissions;
  uploadedAt: string;
  expiresAt?: string;
}

export interface FilePermissions {
  canView: boolean;
  canDownload: boolean;
  canShare: boolean;
  allowedUsers?: number[];
  maxViews?: number;
  requiresAuth: boolean;
}

class FileEncryptionService {
  private readonly ALGORITHM = 'AES-GCM';
  private readonly KEY_LENGTH = 256;
  private readonly IV_LENGTH = 12;

  async generateKey(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
      {
        name: this.ALGORITHM,
        length: this.KEY_LENGTH,
      },
      true, // extractable
      ['encrypt', 'decrypt']
    );
  }

  async encryptFile(file: File): Promise<EncryptedFile> {
    // Generate encryption key and IV
    const key = await this.generateKey();
    const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));
    
    // Read file as ArrayBuffer
    const fileData = await file.arrayBuffer();
    
    // Calculate checksum for integrity verification
    const checksum = await this.calculateChecksum(fileData);
    
    // Encrypt the file data
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: this.ALGORITHM,
        iv: iv,
      },
      key,
      fileData
    );

    const metadata: FileMetadata = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      checksum
    };

    return {
      encryptedData,
      key,
      iv,
      metadata
    };
  }

  async decryptFile(
    encryptedData: ArrayBuffer,
    key: CryptoKey,
    iv: Uint8Array,
    metadata: FileMetadata
  ): Promise<File> {
    // Decrypt the file data
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: this.ALGORITHM,
        iv: iv,
      },
      key,
      encryptedData
    );

    // Verify integrity
    const checksum = await this.calculateChecksum(decryptedData);
    if (checksum !== metadata.checksum) {
      throw new Error('File integrity check failed - file may be corrupted');
    }

    // Create and return the decrypted file
    return new File([decryptedData], metadata.name, {
      type: metadata.type,
      lastModified: metadata.lastModified
    });
  }

  async exportKey(key: CryptoKey): Promise<string> {
    const exportedKey = await crypto.subtle.exportKey('raw', key);
    return this.arrayBufferToBase64(exportedKey);
  }

  async importKey(keyData: string): Promise<CryptoKey> {
    const keyBuffer = this.base64ToArrayBuffer(keyData);
    return await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      {
        name: this.ALGORITHM,
        length: this.KEY_LENGTH,
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  async encryptKeyForUser(key: CryptoKey, userPublicKey: CryptoKey): Promise<string> {
    // Export the file encryption key
    const keyData = await crypto.subtle.exportKey('raw', key);
    
    // Encrypt the key with the user's public key
    const encryptedKey = await crypto.subtle.encrypt(
      {
        name: 'RSA-OAEP',
      },
      userPublicKey,
      keyData
    );

    return this.arrayBufferToBase64(encryptedKey);
  }

  async decryptKeyFromUser(
    encryptedKey: string,
    userPrivateKey: CryptoKey
  ): Promise<CryptoKey> {
    // Convert encrypted key from base64
    const encryptedKeyBuffer = this.base64ToArrayBuffer(encryptedKey);
    
    // Decrypt the key with the user's private key
    const keyData = await crypto.subtle.decrypt(
      {
        name: 'RSA-OAEP',
      },
      userPrivateKey,
      encryptedKeyBuffer
    );

    // Import the decrypted key
    return await crypto.subtle.importKey(
      'raw',
      keyData,
      {
        name: this.ALGORITHM,
        length: this.KEY_LENGTH,
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  private async calculateChecksum(data: ArrayBuffer): Promise<string> {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return this.arrayBufferToBase64(hashBuffer);
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  // File type validation
  isImageFile(type: string): boolean {
    return type.startsWith('image/');
  }

  isVideoFile(type: string): boolean {
    return type.startsWith('video/');
  }

  isAudioFile(type: string): boolean {
    return type.startsWith('audio/');
  }

  isDocumentFile(type: string): boolean {
    const documentTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv'
    ];
    return documentTypes.includes(type);
  }

  getFileCategory(type: string): string {
    if (this.isImageFile(type)) return 'image';
    if (this.isVideoFile(type)) return 'video';
    if (this.isAudioFile(type)) return 'audio';
    if (this.isDocumentFile(type)) return 'document';
    return 'other';
  }

  formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  // Security validation
  validateFileType(file: File, allowedTypes: string[] = []): boolean {
    if (allowedTypes.length === 0) {
      // Default allowed types
      const defaultAllowed = [
        'image/', 'video/', 'audio/', 'text/', 'application/pdf',
        'application/msword', 'application/vnd.openxml', 'application/zip'
      ];
      return defaultAllowed.some(type => file.type.startsWith(type));
    }
    return allowedTypes.includes(file.type);
  }

  validateFileSize(file: File, maxSizeBytes: number = 100 * 1024 * 1024): boolean {
    return file.size <= maxSizeBytes; // Default 100MB limit
  }
}

export const fileEncryption = new FileEncryptionService();