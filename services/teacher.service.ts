
import api from '@/lib/api/axios';
import {
    Teacher,
    TeacherCreateBody,
    TeacherUpdateBody,
    PaginatedResponse
} from '@/types';

const RESOURCE_URL = '/teacher';

export const teacherService = {
    getAll: async (page = 1, limit = 10): Promise<PaginatedResponse<Teacher>> => {
        const response = await api.get<PaginatedResponse<Teacher>>(RESOURCE_URL, {
            params: { page, limit }
        });
        return response.data;
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
    }
};
