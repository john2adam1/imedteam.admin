
import api from '@/lib/api/axios';
import {
    Source,
    SourceCreateBody,
    SourceUpdateBody,
    PaginatedResponse
} from '@/types';

const RESOURCE_URL = 'source';

export const sourceService = {
    getAll: async (lessonId?: string, page = 1, limit = 10, filters?: { name?: string; type?: string }): Promise<PaginatedResponse<Source>> => {
        const params: any = { page, limit };
        if (lessonId) params.lesson_id = lessonId;
        if (filters?.name) params.name = filters.name;
        if (filters?.type) params.type = filters.type;

        const response = await api.get<any>(RESOURCE_URL, { params });
        const raw = response.data;
        const data = raw.data || raw.source || raw.items || [];

        return {
            data,
            total: raw.total || raw.count || (raw.meta?.total_items) || data.length,
            page: raw.page || page,
            limit: raw.limit || limit,
            total_page: raw.total_page || raw.total_pages || (raw.meta?.total_pages) || Math.ceil((raw.total || data.length) / limit),
            has_next: raw.has_next ?? false,
            has_previous: raw.has_previous ?? false,
        };
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
