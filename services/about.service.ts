
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
        const params: any = { page, limit };
        if (filters?.title) params.title = filters.title;

        const response = await api.get<any>(RESOURCE_URL, { params });
        const raw = response.data;
        const data = raw.data || raw.abouts || raw.items || [];

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
