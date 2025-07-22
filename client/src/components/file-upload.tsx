import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  File, 
  Image, 
  Video, 
  Music, 
  FileText, 
  X, 
  Check, 
  AlertTriangle,
  Shield,
  Lock
} from "lucide-react";
import { fileEncryption, type FileMetadata } from "@/lib/file-encryption";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileSelect: (files: EncryptedFileUpload[]) => void;
  onUploadProgress?: (progress: number) => void;
  maxFiles?: number;
  maxSizeBytes?: number;
  allowedTypes?: string[];
  disabled?: boolean;
  className?: string;
}

interface EncryptedFileUpload {
  id: string;
  file: File;
  encryptedData: ArrayBuffer;
  keyData: string;
  iv: Uint8Array;
  metadata: FileMetadata;
  status: 'encrypting' | 'ready' | 'uploading' | 'completed' | 'error';
  progress: number;
  error?: string;
}

export function FileUpload({
  onFileSelect,
  onUploadProgress,
  maxFiles = 10,
  maxSizeBytes = 100 * 1024 * 1024, // 100MB
  allowedTypes = [],
  disabled = false,
  className
}: FileUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<EncryptedFileUpload[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
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

  const validateAndProcessFiles = useCallback(async (files: FileList) => {
    if (disabled) return;

    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const errors: string[] = [];

    // Validate each file
    for (const file of fileArray) {
      if (selectedFiles.length + validFiles.length >= maxFiles) {
        errors.push(`Maximum ${maxFiles} files allowed`);
        break;
      }

      if (!fileEncryption.validateFileSize(file, maxSizeBytes)) {
        errors.push(`${file.name}: File too large (max ${fileEncryption.formatFileSize(maxSizeBytes)})`);
        continue;
      }

      if (!fileEncryption.validateFileType(file, allowedTypes)) {
        errors.push(`${file.name}: File type not allowed`);
        continue;
      }

      validFiles.push(file);
    }

    if (errors.length > 0) {
      toast({
        title: "File Validation Errors",
        description: errors.join(", "),
        variant: "destructive"
      });
    }

    if (validFiles.length === 0) return;

    setIsProcessing(true);

    // Process files with encryption
    const processedFiles: EncryptedFileUpload[] = [];

    for (const file of validFiles) {
      const id = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const fileUpload: EncryptedFileUpload = {
        id,
        file,
        encryptedData: new ArrayBuffer(0),
        keyData: '',
        iv: new Uint8Array(0),
        metadata: {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
          checksum: ''
        },
        status: 'encrypting',
        progress: 0
      };

      processedFiles.push(fileUpload);
    }

    setSelectedFiles(prev => [...prev, ...processedFiles]);

    // Encrypt files
    for (let i = 0; i < processedFiles.length; i++) {
      const fileUpload = processedFiles[i];
      
      try {
        const encrypted = await fileEncryption.encryptFile(fileUpload.file);
        const keyData = await fileEncryption.exportKey(encrypted.key);

        fileUpload.encryptedData = encrypted.encryptedData;
        fileUpload.keyData = keyData;
        fileUpload.iv = encrypted.iv;
        fileUpload.metadata = encrypted.metadata;
        fileUpload.status = 'ready';
        fileUpload.progress = 100;

        setSelectedFiles(prev => 
          prev.map(f => f.id === fileUpload.id ? { ...fileUpload } : f)
        );

      } catch (error) {
        fileUpload.status = 'error';
        fileUpload.error = 'Encryption failed';
        
        setSelectedFiles(prev => 
          prev.map(f => f.id === fileUpload.id ? { ...fileUpload } : f)
        );

        toast({
          title: "Encryption Error",
          description: `Failed to encrypt ${fileUpload.file.name}`,
          variant: "destructive"
        });
      }
    }

    setIsProcessing(false);

    // Notify parent component
    const readyFiles = processedFiles.filter(f => f.status === 'ready');
    if (readyFiles.length > 0) {
      onFileSelect(readyFiles);
    }

  }, [disabled, maxFiles, maxSizeBytes, allowedTypes, selectedFiles.length, onFileSelect, toast]);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      validateAndProcessFiles(files);
    }
    // Reset input value to allow selecting the same file again
    event.target.value = '';
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    
    const files = event.dataTransfer.files;
    if (files) {
      validateAndProcessFiles(files);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeFile = (id: string) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== id));
  };

  const clearAllFiles = () => {
    setSelectedFiles([]);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop Zone */}
      <Card 
        className={cn(
          "border-2 border-dashed transition-colors cursor-pointer",
          isDragging ? "border-primary bg-primary/5" : "border-gray-300 dark:border-gray-600",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleFileSelect}
      >
        <CardContent className="p-6 text-center">
          <div className="space-y-3">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                Drop files here or click to browse
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Max {maxFiles} files, {fileEncryption.formatFileSize(maxSizeBytes)} each
              </p>
            </div>
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
              <Shield className="h-3 w-3" />
              <span>Files encrypted client-side with AES-256</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileInputChange}
        accept={allowedTypes.length > 0 ? allowedTypes.join(',') : undefined}
        disabled={disabled}
      />

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">
              Selected Files ({selectedFiles.length})
            </h4>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={clearAllFiles}
              disabled={isProcessing}
            >
              Clear All
            </Button>
          </div>

          <div className="space-y-2">
            {selectedFiles.map((fileUpload) => (
              <Card key={fileUpload.id} className="p-3">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {getFileIcon(fileUpload.file.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {fileUpload.file.name}
                      </p>
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs", getFileTypeColor(fileUpload.file.type))}
                      >
                        {fileEncryption.getFileCategory(fileUpload.file.type)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-1">
                      <p className="text-xs text-gray-500">
                        {fileEncryption.formatFileSize(fileUpload.file.size)}
                      </p>
                      
                      {fileUpload.status === 'encrypting' && (
                        <div className="flex items-center space-x-1">
                          <Lock className="h-3 w-3 text-blue-500 animate-pulse" />
                          <span className="text-xs text-blue-500">Encrypting...</span>
                        </div>
                      )}
                      
                      {fileUpload.status === 'ready' && (
                        <div className="flex items-center space-x-1">
                          <Check className="h-3 w-3 text-green-500" />
                          <span className="text-xs text-green-500">Encrypted</span>
                        </div>
                      )}
                      
                      {fileUpload.status === 'error' && (
                        <div className="flex items-center space-x-1">
                          <AlertTriangle className="h-3 w-3 text-red-500" />
                          <span className="text-xs text-red-500">{fileUpload.error}</span>
                        </div>
                      )}
                    </div>

                    {/* Progress bar for encryption */}
                    {fileUpload.status === 'encrypting' && (
                      <Progress value={fileUpload.progress} className="mt-2 h-1" />
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeFile(fileUpload.id)}
                    disabled={isProcessing}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}