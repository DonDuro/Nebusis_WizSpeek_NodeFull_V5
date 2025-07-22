import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Paperclip, 
  File, 
  Image, 
  Video, 
  Music, 
  FileText, 
  X, 
  Upload,
  Check,
  AlertTriangle,
  Shield
} from "lucide-react";
import { fileEncryption, type FileMetadata } from "@/lib/file-encryption";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface FileAttachmentProps {
  onFileSelected: (encryptedFile: {
    file: File;
    encryptedData: ArrayBuffer;
    keyData: string;
    iv: Uint8Array;
    metadata: FileMetadata;
  }) => void;
  maxSizeBytes?: number;
  disabled?: boolean;
  className?: string;
  conversationId?: number;
}

export function FileAttachment({
  onFileSelected,
  maxSizeBytes = 10 * 1024 * 1024, // 10MB
  disabled = false,
  className,
  conversationId
}: FileAttachmentProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [encryptionStatus, setEncryptionStatus] = useState<'idle' | 'encrypting' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const getFileIcon = (type: string) => {
    if (fileEncryption.isImageFile(type)) return <Image className="h-4 w-4" />;
    if (fileEncryption.isVideoFile(type)) return <Video className="h-4 w-4" />;
    if (fileEncryption.isAudioFile(type)) return <Music className="h-4 w-4" />;
    if (fileEncryption.isDocumentFile(type)) return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const getFileTypeColor = (type: string) => {
    if (fileEncryption.isImageFile(type)) return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    if (fileEncryption.isVideoFile(type)) return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    if (fileEncryption.isAudioFile(type)) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    if (fileEncryption.isDocumentFile(type)) return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  };

  const handleFileSelect = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!fileEncryption.validateFileSize(file, maxSizeBytes)) {
      toast({
        title: "File Too Large",
        description: `File must be smaller than ${fileEncryption.formatFileSize(maxSizeBytes)}`,
        variant: "destructive"
      });
      return;
    }

    if (!fileEncryption.validateFileType(file)) {
      toast({
        title: "File Type Not Allowed",
        description: "Please select a supported file type",
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
    setEncryptionStatus('encrypting');
    setIsEncrypting(true);

    try {
      // Encrypt the file
      const encrypted = await fileEncryption.encryptFile(file);
      const keyData = await fileEncryption.exportKey(encrypted.key);

      setEncryptionStatus('success');
      
      // Pass the encrypted file data to parent
      onFileSelected({
        file,
        encryptedData: encrypted.encryptedData,
        keyData,
        iv: encrypted.iv,
        metadata: encrypted.metadata
      });

      toast({
        title: "File Encrypted",
        description: `${file.name} has been encrypted and is ready to send`,
      });

    } catch (error) {
      console.error('File encryption failed:', error);
      setEncryptionStatus('error');
      toast({
        title: "Encryption Failed",
        description: "Unable to encrypt the file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsEncrypting(false);
    }

    // Reset input
    event.target.value = '';
  };

  const clearFile = () => {
    setSelectedFile(null);
    setEncryptionStatus('idle');
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* File Attach Button */}
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={handleFileSelect}
        disabled={disabled || isEncrypting}
        className="h-8 w-8 p-0"
      >
        <Paperclip className="h-4 w-4" />
      </Button>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled}
      />

      {/* Selected File Display */}
      {selectedFile && (
        <Card className="w-full max-w-sm">
          <CardContent className="p-3">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {getFileIcon(selectedFile.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {selectedFile.name}
                  </p>
                  <Badge 
                    variant="outline" 
                    className={cn("text-xs", getFileTypeColor(selectedFile.type))}
                  >
                    {fileEncryption.getFileCategory(selectedFile.type)}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-2 mt-1">
                  <p className="text-xs text-gray-500">
                    {fileEncryption.formatFileSize(selectedFile.size)}
                  </p>
                  
                  {encryptionStatus === 'encrypting' && (
                    <div className="flex items-center space-x-1">
                      <Shield className="h-3 w-3 text-blue-500 animate-pulse" />
                      <span className="text-xs text-blue-500">Encrypting...</span>
                    </div>
                  )}
                  
                  {encryptionStatus === 'success' && (
                    <div className="flex items-center space-x-1">
                      <Check className="h-3 w-3 text-green-500" />
                      <span className="text-xs text-green-500">Encrypted</span>
                    </div>
                  )}
                  
                  {encryptionStatus === 'error' && (
                    <div className="flex items-center space-x-1">
                      <AlertTriangle className="h-3 w-3 text-red-500" />
                      <span className="text-xs text-red-500">Failed</span>
                    </div>
                  )}
                </div>
              </div>

              <Button
                size="sm"
                variant="ghost"
                onClick={clearFile}
                disabled={isEncrypting}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>

            {encryptionStatus === 'success' && (
              <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-md">
                <div className="flex items-center space-x-1 text-xs text-green-600 dark:text-green-400">
                  <Shield className="h-3 w-3" />
                  <span>File encrypted with AES-256. Ready to send.</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}