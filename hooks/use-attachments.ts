import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Attachment {
  id: string;
  filename: string;
  filepath: string;
  filesize: number;
  mimetype: string;
  projectId: string;
  uploadedBy: string | null;
  createdAt: string;
}

interface UseAttachmentsOptions {
  projectId?: string;
}

async function fetchAttachments(projectId: string): Promise<Attachment[]> {
  const params = new URLSearchParams({ projectId });
  const response = await fetch(`/api/attachments?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error('Fehler beim Laden der Dateien');
  }

  const data = await response.json();
  return data.data;
}

async function uploadAttachment(formData: FormData): Promise<Attachment> {
  const response = await fetch('/api/attachments', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Fehler beim Hochladen der Datei');
  }

  const data = await response.json();
  return data.data;
}

async function deleteAttachment(id: string): Promise<void> {
  const response = await fetch(`/api/attachments/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Fehler beim Löschen der Datei');
  }
}

export function useAttachments(options: UseAttachmentsOptions = {}) {
  return useQuery({
    queryKey: ['attachments', options.projectId],
    queryFn: () => fetchAttachments(options.projectId!),
    enabled: !!options.projectId,
  });
}

export function useUploadAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadAttachment,
    onSuccess: (data) => {
      // Invalidate attachments for this project
      queryClient.invalidateQueries({ 
        queryKey: ['attachments', data.projectId] 
      });
    },
  });
}

export function useDeleteAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAttachment,
    onSuccess: () => {
      // Invalidate all attachment queries
      queryClient.invalidateQueries({ 
        queryKey: ['attachments'] 
      });
    },
  });
}
