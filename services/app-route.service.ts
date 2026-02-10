
import api from '@/lib/api/axios';
import {
    AppRoute,
    AppRouteCreateBody,
    AppRouteUpdateBody
} from '@/types';

const RESOURCE_URL = 'app-route';

export const appRouteService = {
    // Get all app routes with optional filtering
    getAll: async (page = 1, limit = 10, filters?: { key?: string }): Promise<{ app_routes: AppRoute[]; count: number }> => {
        const response = await api.get<{ app_routes: AppRoute[]; count: number }>(RESOURCE_URL, {
            params: { page, limit, ...filters }
        });
        return response.data;
    },

    // Get app route by ID
    getById: async (id: string): Promise<AppRoute> => {
        const response = await api.get<AppRoute>(`${RESOURCE_URL}/${id}`);
        return response.data;
    },

    // Create new app route
    create: async (data: AppRouteCreateBody): Promise<void> => {
        await api.post(RESOURCE_URL, data);
    },

    // Update app route
    update: async (id: string, data: AppRouteUpdateBody): Promise<void> => {
        await api.put(`${RESOURCE_URL}/${id}/update`, data);
    },

    // Delete app route
    delete: async (id: string): Promise<void> => {
        await api.delete(`${RESOURCE_URL}/${id}/delete`);
    }
};
