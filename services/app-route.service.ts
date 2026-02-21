import api from '@/lib/api/axios';
import {
    AppConfig,
    AppConfigList,
    AppConfigUpdateBody
} from '@/types';

const RESOURCE_URL = 'app-route';

export const appRouteService = {
    // Get all app configurations
    getAll: async (): Promise<AppConfigList> => {
        try {
            // First try web endpoint (admin/management)
            const response = await api.get<any>(RESOURCE_URL);
            const routes = response.data?.app_routes || response.data?.data;

            if (routes && routes.length > 0) {
                return {
                    app_routes: routes,
                    count: response.data?.total || response.data?.count || routes.length
                };
            }

            // If empty, try mobile endpoint (sometimes shared/populated there)
            console.log('Web app-route empty, trying mobile endpoint...');
            const mobileResponse = await api.get<any>('../mobile/app-route');
            const mobileRoutes = mobileResponse.data?.app_routes || mobileResponse.data?.data;

            return {
                app_routes: mobileRoutes || [],
                count: mobileResponse.data?.total || mobileResponse.data?.count || mobileRoutes?.length || 0
            };
        } catch (error) {
            console.error('Failed to fetch from web endpoint, trying mobile...', error);
            // Fallback to mobile on error as well
            const mobileResponse = await api.get<any>('../mobile/app-route');
            const mobileRoutes = mobileResponse.data?.app_routes || mobileResponse.data?.data;

            return {
                app_routes: mobileRoutes || [],
                count: mobileResponse.data?.total || mobileResponse.data?.count || mobileRoutes?.length || 0
            };
        }
    },

    // Update app configuration
    update: async (id: string, data: AppConfigUpdateBody): Promise<void> => {
        await api.put(`${RESOURCE_URL}/${id}/update`, data);
    }
};

