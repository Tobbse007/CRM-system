'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useUploadAttachment, useDeleteAttachment, useAttachments } from '@/hooks/use-attachments';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Upload, 
  File, 
  FileText, 
  Image, 
  FileArchive,
  Trash2,
  Download,
  Loader2,
  X,
  Paperclip,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

interface FileUploadProps {
  projectId: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function getFileIcon(mimetype: string) {
  if (mimetype.startsWith('image/')) return Image;
  if (mimetype.includes('pdf')) return FileText;
  if (mimetype.includes('zip') || mimetype.includes('compressed')) return FileArchive;
  return File;
}

export function FileUpload({ projectId }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: attachments = [], isLoading } = useAttachments({ projectId });
  const uploadMutation = useUploadAttachment();
  const deleteMutation = useDeleteAttachment();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError(`Datei ist zu groß. Maximum: ${formatFileSize(MAX_FILE_SIZE)}`);
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('projectId', projectId);

      await uploadMutation.mutateAsync(formData);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Hochladen');
    } finally {
      setUploading(false);
    }
  }, [projectId, uploadMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
      'application/zip': ['.zip'],
    },
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Möchten Sie diese Datei wirklich löschen?')) return;
    
    try {
      await deleteMutation.mutateAsync(id);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Löschen');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Paperclip className="h-5 w-5" />
          <CardTitle>Dateien</CardTitle>
          {attachments.length > 0 && (
            <span className="text-sm text-muted-foreground">
              ({attachments.length})
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Zone */}
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-all duration-200
            ${isDragActive 
              ? 'border-primary bg-primary/5 scale-105' 
              : 'border-gray-300 hover:border-primary hover:bg-gray-50'
            }
            ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} disabled={uploading} />
          
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Datei wird hochgeladen...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="p-4 rounded-full bg-primary/10">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {isDragActive 
                    ? 'Datei hier ablegen...' 
                    : 'Datei hochladen'
                  }
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Klicken oder Drag & Drop • Max. {formatFileSize(MAX_FILE_SIZE)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, Bilder, Dokumente, Excel, ZIP
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            <X className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto hover:opacity-70"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Files List */}
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            <p className="text-sm">Lade Dateien...</p>
          </div>
        ) : attachments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <File className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Noch keine Dateien hochgeladen</p>
          </div>
        ) : (
          <div className="space-y-2">
            {attachments.map((attachment) => {
              const Icon = getFileIcon(attachment.mimetype);
              
              return (
                <div
                  key={attachment.id}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  {/* Icon */}
                  <div className="p-2 rounded bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  
                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {attachment.filename}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(attachment.filesize)} • 
                      {' '}hochgeladen {formatDistanceToNow(new Date(attachment.createdAt), {
                        addSuffix: true,
                        locale: de,
                      })}
                    </p>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a
                      href={attachment.filepath}
                      download={attachment.filename}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        size="sm"
                        variant="ghost"
                        title="Herunterladen"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </a>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(attachment.id)}
                      disabled={deleteMutation.isPending}
                      title="Löschen"
                    >
                      {deleteMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-red-600" />
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
