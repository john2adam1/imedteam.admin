
import api from '@/lib/api/axios';
import {
    AppConfig,
    AppConfigUpdateBody
} from '@/types';

const RESOURCE_URL = 'app-route';

export const appRouteService = {
    // Get app configuration
    get: async (): Promise<AppConfig> => {
        const response = await api.get<AppConfig>(RESOURCE_URL);
        return response.data;
    },

    // Update app configuration
    update: async (data: AppConfigUpdateBody): Promise<void> => {
        await api.put(`${RESOURCE_URL}/update`, data);
    }
};

