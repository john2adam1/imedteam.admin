
import api from '@/lib/api/axios';
import {
    Tariff,
    TariffCreateBody,
    TariffUpdateBody,
    PaginatedResponse
} from '@/types';

const RESOURCE_URL = 'tariff';

export const tariffService = {
    // Get all tariffs with pagination
    getAll: async (page = 1, limit = 10, filters?: { name?: string }): Promise<PaginatedResponse<Tariff>> => {
        const params: any = { page, limit };
        if (filters?.name) params.name = filters.name;

        const response = await api.get<any>(RESOURCE_URL, { params });
        const raw = response.data;
        const data = raw.data || raw.tariffs || raw.items || [];

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

    // Get tariff by ID
    getById: async (id: string): Promise<Tariff> => {
        const response = await api.get<Tariff>(`${RESOURCE_URL}/${id}`);
        return response.data;
    },

    // Create new tariff
    create: async (data: TariffCreateBody): Promise<void> => {
        await api.post(RESOURCE_URL, data);
    },

    // Update tariff
    update: async (id: string, data: TariffUpdateBody): Promise<void> => {
        await api.put(`${RESOURCE_URL}/${id}/update`, data);
    },

    // Delete tariff
    delete: async (id: string): Promise<void> => {
        await api.delete(`${RESOURCE_URL}/${id}/delete`);
    }
};
