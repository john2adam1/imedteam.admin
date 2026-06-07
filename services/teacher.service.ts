
import api from '@/lib/api/axios';
import {
    Teacher,
    TeacherCreateBody,
    TeacherUpdateBody,
    PaginatedResponse
} from '@/types';

const RESOURCE_URL = 'teacher';

export const teacherService = {
    getAll: async (page = 1, limit = 10, filters?: { name?: string; phone_number?: string }): Promise<PaginatedResponse<Teacher>> => {
        const params: any = { page, limit };
        if (filters?.name) params.name = filters.name;
        if (filters?.phone_number) params.phone_number = filters.phone_number;

        const response = await api.get<any>(RESOURCE_URL, { params });
        const raw = response.data;
        const data = raw.data || raw.teachers || raw.items || [];

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

    getById: async (id: string): Promise<Teacher> => {
        const response = await api.get<Teacher>(`${RESOURCE_URL}/${id}`);
        return response.data;
    },

    create: async (data: TeacherCreateBody): Promise<Teacher> => {
        const response = await api.post<Teacher>(RESOURCE_URL, data);
        return response.data;
    },

    update: async (id: string, data: TeacherUpdateBody): Promise<Teacher> => {
        const response = await api.put<Teacher>(`${RESOURCE_URL}/${id}/update`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`${RESOURCE_URL}/${id}/delete`);
    },

};
