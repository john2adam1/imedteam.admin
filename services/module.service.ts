
import api from '@/lib/api/axios';
import {
    Module,
    ModuleCreateBody,
    ModuleUpdateBody,
    PaginatedResponse
} from '@/types';

const RESOURCE_URL = 'module';

export const moduleService = {
    getAll: async (courseId?: string, page = 1, limit = 10, filters?: { name?: string }): Promise<PaginatedResponse<Module>> => {
        const params: any = { page, limit };
        if (courseId) params.course_id = courseId;
        if (filters?.name) params.name = filters.name;

        const response = await api.get<any>(RESOURCE_URL, { params });
        const raw = response.data;
        const data = raw.data || raw.modules || raw.items || [];

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
