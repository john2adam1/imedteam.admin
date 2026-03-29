
import api from '@/lib/api/axios';
import { FileUploadRes } from '@/types';

export const uploadService = {
    upload: async (file: File): Promise<FileUploadRes> => {
        const formData = new FormData();
        formData.append('file', file);

        // Check if other fields are needed, e.g. type
        // formData.append('type', 'image'); 

        const response = await api.post<FileUploadRes | string>('/file-upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        const data = response.data as any;

        // Extract URL from various possible response structures
        // Note: Some backends return PascalCase 'Url'
        let url = '';
        if (typeof data === 'string') {
            url = data;
        } else if (data.url) {
            url = data.url;
        } else if (data.Url) {
            url = data.Url;
        } else if (data.data && typeof data.data === 'string') {
            url = data.data;
        } else if (data.data && data.data.url) {
            url = data.data.url;
        } else if (data.data && data.data.Url) {
            url = data.data.Url;
        }

        return {
            url,
            filename: file.name,
            size: file.size,
            mime_type: file.type,
            ...(typeof data === 'object' ? data : {})
        };
    },
};
