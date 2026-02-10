
import api from '@/lib/api/axios';
import {
    Banner,
    BannerCreateBody,
    BannerUpdateBody,
    PaginatedResponse
} from '@/types';

const RESOURCE_URL = 'banner';

export const bannerService = {
    // Get all
    getAll: async (page = 1, limit = 10, filters?: { title?: string }): Promise<PaginatedResponse<Banner>> => {
        // Note: If backend doesn't support pagination for banners, adjust accordingly.
        // Assuming standard structure based on prompt "list with pagination & filtering" (implied for all list resources)
        const response = await api.get<PaginatedResponse<Banner>>(RESOURCE_URL, {
            params: { page, limit, ...filters }
        });
        return response.data;
    },

    getById: async (id: string): Promise<Banner> => {
        const response = await api.get<Banner>(`${RESOURCE_URL}/${id}`);
        return response.data;
    },

    create: async (data: BannerCreateBody): Promise<Banner> => {
        const response = await api.post<Banner>(RESOURCE_URL, data);
        return response.data;
    },

    update: async (id: string, data: BannerUpdateBody): Promise<Banner> => {
        const response = await api.put<Banner>(`${RESOURCE_URL}/${id}/update`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`${RESOURCE_URL}/${id}/delete`);
    }
};
