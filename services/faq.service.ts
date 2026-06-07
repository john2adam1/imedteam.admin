
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
        const params: any = { page, limit };
        if (filters?.question) params.question = filters.question;

        const response = await api.get<any>(RESOURCE_URL, { params });
        const raw = response.data;
        const data = raw.data || raw.faqs || raw.items || [];

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
