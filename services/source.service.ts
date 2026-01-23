
import api from '@/lib/api/axios';
import {
    Source,
    SourceCreateBody,
    SourceUpdateBody,
    PaginatedResponse
} from '@/types';

const RESOURCE_URL = '/source';

export const sourceService = {
    getAll: async (lessonId?: string, page = 1, limit = 10): Promise<PaginatedResponse<Source>> => {
        const params: any = { page, limit };
        if (lessonId) params.lesson_id = lessonId;

        const response = await api.get<PaginatedResponse<Source>>(RESOURCE_URL, { params });
        return response.data;
    },

    getById: async (id: string): Promise<Source> => {
        const response = await api.get<Source>(`${RESOURCE_URL}/${id}`);
        return response.data;
    },

    create: async (data: SourceCreateBody): Promise<Source> => {
        const response = await api.post<Source>(RESOURCE_URL, data);
        return response.data;
    },

    update: async (id: string, data: SourceUpdateBody): Promise<Source> => {
        const response = await api.put<Source>(`${RESOURCE_URL}/${id}/update`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`${RESOURCE_URL}/${id}/delete`);
    }
};
