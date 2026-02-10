
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
        const response = await api.get<PaginatedResponse<Subject>>(RESOURCE_URL, {
            params: { page, limit, ...filters }
        });
        return response.data;
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
