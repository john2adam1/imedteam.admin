
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
    getAll: async (page = 1, limit = 10): Promise<PaginatedResponse<Tariff>> => {
        const response = await api.get<PaginatedResponse<Tariff>>(RESOURCE_URL, {
            params: { page, limit }
        });
        return response.data;
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
