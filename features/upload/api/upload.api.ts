import api from '@/lib/api';

export interface UploadResponse {
  url: string;
  filename: string;
}

export const uploadApi = {
  uploadImage: (file: File): Promise<UploadResponse> => {
    const form = new FormData();
    form.append('file', file);
    return api
      .post<UploadResponse>('/upload/image', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },

  uploadFile: (file: File): Promise<UploadResponse> => {
    const form = new FormData();
    form.append('file', file);
    return api
      .post<UploadResponse>('/upload/file', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },

  uploadFiles: (files: File[]): Promise<UploadResponse[]> => {
    const form = new FormData();
    files.forEach((f) => form.append('files', f));
    return api
      .post<UploadResponse[]>('/upload/files', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },
};
