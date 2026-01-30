
import api from '@/lib/api/axios';
import {
    Module,
    ModuleCreateBody,
    ModuleUpdateBody,
    PaginatedResponse
} from '@/types';

const RESOURCE_URL = 'module';

export const moduleService = {
    getAll: async (courseId?: string, page = 1, limit = 10): Promise<PaginatedResponse<Module>> => {
        const params: any = { page, limit };
        if (courseId) params.course_id = courseId; // Filter by course if needed

        const response = await api.get<PaginatedResponse<Module>>(RESOURCE_URL, { params });
        return response.data;
    },

    getById: async (id: string): Promise<Module> => {
        const response = await api.get<Module>(`${RESOURCE_URL}/${id}`);
        return response.data;
    },

    create: async (data: ModuleCreateBody): Promise<Module> => {
        const response = await api.post<Module>(RESOURCE_URL, data);
        return response.data;
    },

    update: async (id: string, data: ModuleUpdateBody): Promise<Module> => {
        const response = await api.put<Module>(`${RESOURCE_URL}/${id}/update`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`${RESOURCE_URL}/${id}/delete`);
    }
};
