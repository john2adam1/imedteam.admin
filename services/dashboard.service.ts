import api from '@/lib/api/axios';
import { GetDashboardReq, DashboardRes, GetUserActivityReq, UserActivityResponse } from '@/types';

export const dashboardService = {
    getStats: async (params: GetDashboardReq): Promise<DashboardRes> => {
        try {
            const response = await api.get<DashboardRes>('dashboard', {
                params: {
                    type: params.type,
                    day: params.day,
                    from: params.from,
                    to: params.to,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            throw error;
        }
    },

    getUserActivity: async (params: GetUserActivityReq): Promise<UserActivityResponse> => {
        try {
            const response = await api.get<UserActivityResponse>('user/activity', {
                params,
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching user activity stats:', error);
            throw error;
        }
    },
};
