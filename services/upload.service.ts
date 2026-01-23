
import api from '@/lib/api/axios';
import { FileUploadRes } from '@/types';

export const uploadService = {
    upload: async (file: File): Promise<FileUploadRes> => {
        const formData = new FormData();
        formData.append('file', file);

        // Check if other fields are needed, e.g. type
        // formData.append('type', 'image'); 

        const response = await api.post<FileUploadRes>('/file-upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    },
};
