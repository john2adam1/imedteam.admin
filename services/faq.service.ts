
import api from '@/lib/api/axios';
import {
    FAQ,
    FAQCreateBody,
    FAQUpdateBody,
    PaginatedResponse
} from '@/types';

const RESOURCE_URL = 'faq';

export const faqService = {
    getAll: async (page = 1, limit = 10, filters?: { question?: string }): Promise<PaginatedResponse<FAQ>> => {
        const response = await api.get<PaginatedResponse<FAQ>>(RESOURCE_URL, {
            params: { page, limit, ...filters }
        });
        return response.data;
    },

    getById: async (id: string): Promise<FAQ> => {
        const response = await api.get<FAQ>(`${RESOURCE_URL}/${id}`);
        return response.data;
    },

    create: async (data: FAQCreateBody): Promise<FAQ> => {
        const response = await api.post<FAQ>(RESOURCE_URL, data);
        return response.data;
    },

    update: async (id: string, data: FAQUpdateBody): Promise<FAQ> => {
        const response = await api.put<FAQ>(`${RESOURCE_URL}/${id}/update`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`${RESOURCE_URL}/${id}/delete`);
    }
};
