
import api from '@/lib/api/axios';
import {
    Contact,
    ContactCreateBody,
    ContactUpdateBody,
    PaginatedResponse
} from '@/types';

const RESOURCE_URL = 'contact';

export const contactService = {
    // Get all
    getAll: async (page = 1, limit = 10, filters?: { name?: string; phone_number?: string }): Promise<PaginatedResponse<Contact>> => {
        const params: any = { page, limit };
        if (filters?.name) params.name = filters.name;
        if (filters?.phone_number) params.phone_number = filters.phone_number;

        const response = await api.get<any>(RESOURCE_URL, { params });
        const raw = response.data;
        const data = raw.data || raw.contacts || raw.items || [];

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
    getById: async (id: string): Promise<Contact> => {
        const response = await api.get<Contact>(`${RESOURCE_URL}/${id}`);
        return response.data;
    },

    // Create (Usually public usage, but if admin creates?)
    create: async (data: ContactCreateBody): Promise<Contact> => {
        const response = await api.post<Contact>(RESOURCE_URL, data);
        return response.data;
    },

    // Update (Maybe mark as read?)
    update: async (id: string, data: ContactUpdateBody): Promise<Contact> => {
        const response = await api.put<Contact>(`${RESOURCE_URL}/${id}/update`, data);
        return response.data;
    },

    // Delete
    delete: async (id: string): Promise<void> => {
        await api.delete(`${RESOURCE_URL}/${id}/delete`);
    }
};
