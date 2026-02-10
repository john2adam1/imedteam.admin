
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
        const response = await api.get<PaginatedResponse<Contact>>(RESOURCE_URL, {
            params: { page, limit, ...filters }
        });
        return response.data;
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
