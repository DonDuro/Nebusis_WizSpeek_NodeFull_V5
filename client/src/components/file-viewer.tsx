import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Download, 
  Eye, 
  Share2, 
  Lock, 
  Unlock, 
  File, 
  Image, 
  Video, 
  Music, 
  FileText,
  X,
  MoreVertical,
  Calendar,
  User,
  Shield,
  AlertTriangle
} from "lucide-react";
import { fileEncryption, type FileMetadata, type SecureFileShare } from "@/lib/file-encryption";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface FileViewerProps {
  fileShare: SecureFileShare;
  encryptedData?: ArrayBuffer;
  decryptionKey?: string;
  onDownload?: (file: File) => void;
  onShare?: (fileId: string) => void;
  onDelete?: (fileId: string) => void;
  currentUserId?: number;
  className?: string;
}

export function FileViewer({
  fileShare,
  encryptedData,
  decryptionKey,
  onDownload,
  onShare,
  onDelete,
  currentUserId,
  className
}: FileViewerProps) {
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptedFile, setDecryptedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showActions, setShowActions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const canView = fileShare.permissions.canView;
  const canDownload = fileShare.permissions.canDownload;
  const canShare = fileShare.permissions.canShare;
  const isExpired = fileShare.expiresAt && new Date(fileShare.expiresAt) < new Date();

  useEffect(() => {
    if (encryptedData && decryptionKey && canView && !isExpired) {
      decryptFile();
    }
  }, [encryptedData, decryptionKey, canView, isExpired]);

  const decryptFile = async () => {
    if (!encryptedData || !decryptionKey) return;

    setIsDecrypting(true);
    setError(null);

    try {
      // Import the decryption key
      const key = await fileEncryption.importKey(decryptionKey);
      
      // For this example, we'll assume IV is stored separately or extract from data
      // In a real implementation, IV would be stored with the encrypted data
      const iv = new Uint8Array(12); // This should come from the actual encrypted data
      
      const file = await fileEncryption.decryptFile(
        encryptedData,
        key,
        iv,
        fileShare.metadata
      );

      setDecryptedFile(file);

      // Generate preview for supported file types
      if (fileEncryption.isImageFile(file.type) || fileEncryption.isVideoFile(file.type)) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }

    } catch (error) {
      console.error('File decryption failed:', error);
      setError('Failed to decrypt file. Please check your permissions.');
      toast({
        title: "Decryption Failed",
        description: "Unable to decrypt the file. It may be corrupted or you may not have the correct permissions.",
        variant: "destructive"
      });
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleDownload = () => {
    if (!decryptedFile || !canDownload) return;

    // Create download link
    const url = URL.createObjectURL(decryptedFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = decryptedFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (onDownload) {
      onDownload(decryptedFile);
    }

    toast({
      title: "Download Started",
      description: `${decryptedFile.name} is being downloaded securely`,
    });
  };

  const handleShare = () => {
    if (!canShare) return;
    
    if (onShare) {
      onShare(fileShare.fileId);
    }
    
    toast({
      title: "Share File",
      description: "Preparing secure file share link...",
    });
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(fileShare.fileId);
    }
  };

  const getFileIcon = (type: string, size = "h-8 w-8") => {
    if (fileEncryption.isImageFile(type)) return <Image className={size} />;
    if (fileEncryption.isVideoFile(type)) return <Video className={size} />;
    if (fileEncryption.isAudioFile(type)) return <Music className={size} />;
    if (fileEncryption.isDocumentFile(type)) return <FileText className={size} />;
    return <File className={size} />;
  };

  const getFileTypeColor = (type: string) => {
    if (fileEncryption.isImageFile(type)) return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    if (fileEncryption.isVideoFile(type)) return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    if (fileEncryption.isAudioFile(type)) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    if (fileEncryption.isDocumentFile(type)) return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {getFileIcon(fileShare.metadata.type)}
            </div>
            <div className="min-w-0">
              <CardTitle className="text-lg truncate">
                {fileShare.metadata.name}
              </CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Badge 
                  variant="outline" 
                  className={cn("text-xs", getFileTypeColor(fileShare.metadata.type))}
                >
                  {fileEncryption.getFileCategory(fileShare.metadata.type)}
                </Badge>
                <span className="text-sm text-gray-500">
                  {fileEncryption.formatFileSize(fileShare.metadata.size)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {isExpired && (
              <Badge variant="destructive" className="text-xs">
                Expired
              </Badge>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowActions(!showActions)}
              className="h-8 w-8 p-0"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* File Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div className="flex items-center space-x-2">
            {decryptedFile ? (
              <>
                <Unlock className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600 dark:text-green-400">
                  File decrypted and ready
                </span>
              </>
            ) : isDecrypting ? (
              <>
                <Lock className="h-4 w-4 text-blue-500 animate-pulse" />
                <span className="text-sm text-blue-600 dark:text-blue-400">
                  Decrypting file...
                </span>
              </>
            ) : error ? (
              <>
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </span>
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Encrypted file
                </span>
              </>
            )}
          </div>
          
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Shield className="h-3 w-3" />
            <span>AES-256</span>
          </div>
        </div>

        {/* File Preview */}
        {previewUrl && canView && !isExpired && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Preview</h4>
            <div className="border rounded-lg overflow-hidden">
              {fileEncryption.isImageFile(fileShare.metadata.type) && (
                <img 
                  src={previewUrl} 
                  alt={fileShare.metadata.name}
                  className="w-full max-h-64 object-contain bg-gray-50 dark:bg-gray-900"
                />
              )}
              {fileEncryption.isVideoFile(fileShare.metadata.type) && (
                <video 
                  src={previewUrl} 
                  controls
                  className="w-full max-h-64"
                >
                  Your browser does not support video playback.
                </video>
              )}
            </div>
          </div>
        )}

        {/* File Metadata */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">File Information</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center space-x-2">
              <Calendar className="h-3 w-3 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">Uploaded:</span>
              <span>{formatDate(fileShare.uploadedAt)}</span>
            </div>
            
            {fileShare.expiresAt && (
              <div className="flex items-center space-x-2">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">Expires:</span>
                <span className={isExpired ? "text-red-500" : ""}>
                  {formatDate(fileShare.expiresAt)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Permissions */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Permissions</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant={canView ? "default" : "outline"} className="text-xs">
              <Eye className="h-3 w-3 mr-1" />
              View
            </Badge>
            <Badge variant={canDownload ? "default" : "outline"} className="text-xs">
              <Download className="h-3 w-3 mr-1" />
              Download
            </Badge>
            <Badge variant={canShare ? "default" : "outline"} className="text-xs">
              <Share2 className="h-3 w-3 mr-1" />
              Share
            </Badge>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Button
            onClick={handleDownload}
            disabled={!decryptedFile || !canDownload || isExpired}
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          
          <Button
            variant="outline"
            onClick={handleShare}
            disabled={!canShare || isExpired}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          
          {onDelete && (
            <Button
              variant="outline"
              onClick={handleDelete}
              disabled={isExpired}
              className="text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Extended Actions Menu */}
        {showActions && (
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardContent className="p-3 space-y-2">
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <User className="h-4 w-4 mr-2" />
                View Share History
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Security Details
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Export Metadata
              </Button>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}