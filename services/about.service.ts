
import api from '@/lib/api/axios';
import {
    About,
    AboutCreateBody,
    AboutUpdateBody,
    PaginatedResponse
} from '@/types';

const RESOURCE_URL = 'about';

export const aboutService = {
    // Get all (paginated)
    getAll: async (page = 1, limit = 10, filters?: { title?: string }): Promise<PaginatedResponse<About>> => {
        const response = await api.get<PaginatedResponse<About>>(RESOURCE_URL, {
            params: { page, limit, ...filters }
        });
        return response.data;
    },

    // Get by ID
    getById: async (id: string): Promise<About> => {
        const response = await api.get<About>(`${RESOURCE_URL}/${id}`);
        return response.data;
    },

    // Create
    create: async (data: AboutCreateBody): Promise<About> => {
        const response = await api.post<About>(RESOURCE_URL, data);
        return response.data;
    },

    // Update
    update: async (id: string, data: AboutUpdateBody): Promise<About> => {
        const response = await api.put<About>(`${RESOURCE_URL}/${id}/update`, data);
        return response.data;
    },

    // Delete
    delete: async (id: string): Promise<void> => {
        await api.delete(`${RESOURCE_URL}/${id}/delete`);
    }
};
