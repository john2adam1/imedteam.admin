
import api from '@/lib/api/axios';
import {
    Subject,
    SubjectCreateBody,
    SubjectUpdateBody,
    PaginatedResponse
} from '@/types';

const RESOURCE_URL = 'subject';

export const subjectService = {
    getAll: async (page = 1, limit = 10, filters?: { name?: string }): Promise<PaginatedResponse<Subject>> => {
        const params: any = { page, limit };
        if (filters?.name) params.name = filters.name;

        const response = await api.get<any>(RESOURCE_URL, { params });
        const raw = response.data;
        const data = raw.data || raw.subjects || raw.items || [];

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

    getById: async (id: string): Promise<Subject> => {
        const response = await api.get<Subject>(`${RESOURCE_URL}/${id}`);
        return response.data;
    },

    create: async (data: SubjectCreateBody): Promise<Subject> => {
        const response = await api.post<Subject>(RESOURCE_URL, data);
        return response.data;
    },

    update: async (id: string, data: SubjectUpdateBody): Promise<Subject> => {
        const response = await api.put<Subject>(`${RESOURCE_URL}/${id}/update`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`${RESOURCE_URL}/${id}/delete`);
    }
};
