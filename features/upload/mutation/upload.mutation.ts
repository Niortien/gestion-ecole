import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { uploadApi } from '../api/upload.api';

export const useUploadImage = () =>
  useMutation({
    mutationFn: (file: File) => uploadApi.uploadImage(file),
    onError: () => toast.error("Erreur lors de l'upload de l'image"),
  });

export const useUploadFile = () =>
  useMutation({
    mutationFn: (file: File) => uploadApi.uploadFile(file),
    onError: () => toast.error("Erreur lors de l'upload du fichier"),
  });

export const useUploadFiles = () =>
  useMutation({
    mutationFn: (files: File[]) => uploadApi.uploadFiles(files),
    onError: () => toast.error("Erreur lors de l'upload des fichiers"),
  });
