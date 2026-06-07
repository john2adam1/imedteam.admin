
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
        const params: any = { page, limit };
        if (filters?.title) params.title = filters.title;

        const response = await api.get<any>(RESOURCE_URL, { params });
        const raw = response.data;
        const data = raw.data || raw.banners || raw.items || [];

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
